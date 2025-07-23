-- =====================================================
-- TRIGGERS
-- Final Project - Database Programming
-- =====================================================

-- =====================================================
-- TRIGGER 1: BEFORE INSERT - Auto-generate ISBN and validate book data
-- =====================================================

CREATE OR REPLACE FUNCTION validate_and_generate_book_data()
RETURNS TRIGGER AS $$
BEGIN
    -- Generate ISBN if not provided
    IF NEW.isbn IS NULL OR NEW.isbn = '' THEN
        NEW.isbn := '978' || LPAD((random() * 9999999999)::text, 10, '0');
    END IF;
    
    -- Validate publication year
    IF NEW.publication_year > EXTRACT(YEAR FROM NOW()) THEN
        RAISE EXCEPTION 'Publication year cannot be in the future: %', NEW.publication_year;
    END IF;
    
    -- Ensure available copies don't exceed total copies
    IF NEW.available_copies > NEW.total_copies THEN
        NEW.available_copies := NEW.total_copies;
    END IF;
    
    -- Set default values
    IF NEW.rating IS NULL THEN
        NEW.rating := 0;
    END IF;
    
    IF NEW.total_ratings IS NULL THEN
        NEW.total_ratings := 0;
    END IF;
    
    -- Log the validation
    INSERT INTO audit_logs (table_name, operation, new_values)
    VALUES ('books', 'BEFORE_INSERT_VALIDATION', 
            json_build_object(
                'title', NEW.title,
                'isbn', NEW.isbn,
                'generated_isbn', CASE WHEN OLD.isbn IS NULL THEN true ELSE false END
            ));
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_book_before_insert
    BEFORE INSERT ON books
    FOR EACH ROW
    EXECUTE FUNCTION validate_and_generate_book_data();

-- =====================================================
-- TRIGGER 2: AFTER INSERT - Update category book count and send notification
-- =====================================================

CREATE OR REPLACE FUNCTION update_category_stats_after_book_insert()
RETURNS TRIGGER AS $$
DECLARE
    v_category_name TEXT;
BEGIN
    -- Get category name
    SELECT name INTO v_category_name 
    FROM categories 
    WHERE id = NEW.category_id;
    
    -- Create notifications table if not exists
    CREATE TABLE IF NOT EXISTS notifications (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        type VARCHAR(50),
        title VARCHAR(255),
        message TEXT,
        data JSONB,
        created_at TIMESTAMP DEFAULT NOW()
    );
    
    -- Insert notification for new book
    INSERT INTO notifications (type, title, message, data)
    VALUES (
        'NEW_BOOK',
        'New Book Added',
        FORMAT('New book "%s" has been added to category "%s"', NEW.title, v_category_name),
        json_build_object(
            'book_id', NEW.id,
            'book_title', NEW.title,
            'category_name', v_category_name,
            'isbn', NEW.isbn
        )
    );
    
    -- Log the book addition
    INSERT INTO audit_logs (table_name, operation, record_id, new_values)
    VALUES ('books', 'INSERT', NEW.id,
            json_build_object(
                'title', NEW.title,
                'category_id', NEW.category_id,
                'total_copies', NEW.total_copies
            ));
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_book_after_insert
    AFTER INSERT ON books
    FOR EACH ROW
    EXECUTE FUNCTION update_category_stats_after_book_insert();

-- =====================================================
-- TRIGGER 3: BEFORE UPDATE - Track rating changes and recalculate averages
-- =====================================================

CREATE OR REPLACE FUNCTION track_book_rating_changes()
RETURNS TRIGGER AS $$
DECLARE
    v_rating_changed BOOLEAN := FALSE;
BEGIN
    -- Check if rating-related fields changed
    IF OLD.rating != NEW.rating OR OLD.total_ratings != NEW.total_ratings THEN
        v_rating_changed := TRUE;
    END IF;
    
    -- Validate rating bounds
    IF NEW.rating < 0 OR NEW.rating > 5 THEN
        RAISE EXCEPTION 'Rating must be between 0 and 5, got: %', NEW.rating;
    END IF;
    
    -- If this is a manual rating update, recalculate from reviews
    IF v_rating_changed AND TG_OP = 'UPDATE' THEN
        SELECT 
            COALESCE(AVG(rating), 0),
            COUNT(*)
        INTO NEW.rating, NEW.total_ratings
        FROM reviews 
        WHERE book_id = NEW.id;
    END IF;
    
    -- Log rating changes
    IF v_rating_changed THEN
        INSERT INTO audit_logs (table_name, operation, record_id, old_values, new_values)
        VALUES ('books', 'UPDATE_RATING', NEW.id,
                json_build_object(
                    'old_rating', OLD.rating,
                    'old_total_ratings', OLD.total_ratings
                ),
                json_build_object(
                    'new_rating', NEW.rating,
                    'new_total_ratings', NEW.total_ratings
                ));
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_book_rating_before_update
    BEFORE UPDATE ON books
    FOR EACH ROW
    EXECUTE FUNCTION track_book_rating_changes();

-- =====================================================
-- TRIGGER 4: AFTER UPDATE - Update book availability and send alerts
-- =====================================================

CREATE OR REPLACE FUNCTION monitor_book_availability()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if availability changed
    IF OLD.available_copies != NEW.available_copies THEN
        
        -- Send alert if book becomes unavailable
        IF OLD.available_copies > 0 AND NEW.available_copies = 0 THEN
            INSERT INTO notifications (type, title, message, data)
            VALUES (
                'BOOK_UNAVAILABLE',
                'Book Out of Stock',
                FORMAT('Book "%s" is now out of stock', NEW.title),
                json_build_object(
                    'book_id', NEW.id,
                    'book_title', NEW.title,
                    'previous_copies', OLD.available_copies
                )
            );
        END IF;
        
        -- Send alert if book becomes available again
        IF OLD.available_copies = 0 AND NEW.available_copies > 0 THEN
            INSERT INTO notifications (type, title, message, data)
            VALUES (
                'BOOK_AVAILABLE',
                'Book Back in Stock',
                FORMAT('Book "%s" is now available (%s copies)', NEW.title, NEW.available_copies),
                json_build_object(
                    'book_id', NEW.id,
                    'book_title', NEW.title,
                    'available_copies', NEW.available_copies
                )
            );
        END IF;
        
        -- Log availability change
        INSERT INTO audit_logs (table_name, operation, record_id, old_values, new_values)
        VALUES ('books', 'AVAILABILITY_UPDATE', NEW.id,
                json_build_object('available_copies', OLD.available_copies),
                json_build_object('available_copies', NEW.available_copies));
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_book_availability_after_update
    AFTER UPDATE ON books
    FOR EACH ROW
    EXECUTE FUNCTION monitor_book_availability();

-- =====================================================
-- TRIGGER 5: BEFORE DELETE - Prevent deletion of books with active borrowings
-- =====================================================

CREATE OR REPLACE FUNCTION prevent_book_deletion_with_active_borrowings()
RETURNS TRIGGER AS $$
DECLARE
    v_active_borrowings INTEGER;
BEGIN
    -- Check for active borrowings
    SELECT COUNT(*) INTO v_active_borrowings
    FROM borrowings
    WHERE book_id = OLD.id AND status IN ('active', 'overdue');
    
    -- Prevent deletion if there are active borrowings
    IF v_active_borrowings > 0 THEN
        RAISE EXCEPTION 'Cannot delete book "%" - it has % active borrowing(s)', 
                       OLD.title, v_active_borrowings;
    END IF;
    
    -- Log the deletion attempt
    INSERT INTO audit_logs (table_name, operation, record_id, old_values)
    VALUES ('books', 'DELETE', OLD.id,
            json_build_object(
                'title', OLD.title,
                'isbn', OLD.isbn,
                'total_copies', OLD.total_copies
            ));
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_prevent_book_deletion
    BEFORE DELETE ON books
    FOR EACH ROW
    EXECUTE FUNCTION prevent_book_deletion_with_active_borrowings();

-- =====================================================
-- TRIGGER 6: AFTER DELETE - Clean up related data and send notification
-- =====================================================

CREATE OR REPLACE FUNCTION cleanup_after_book_deletion()
RETURNS TRIGGER AS $$
BEGIN
    -- Send notification about book deletion
    INSERT INTO notifications (type, title, message, data)
    VALUES (
        'BOOK_DELETED',
        'Book Removed',
        FORMAT('Book "%s" has been removed from the library', OLD.title),
        json_build_object(
            'book_id', OLD.id,
            'book_title', OLD.title,
            'isbn', OLD.isbn,
            'deletion_time', NOW()
        )
    );
    
    -- Archive book data before complete removal
    CREATE TABLE IF NOT EXISTS deleted_books_archive (
        id UUID,
        title VARCHAR(255),
        isbn VARCHAR(20),
        deleted_at TIMESTAMP DEFAULT NOW(),
        original_data JSONB
    );
    
    INSERT INTO deleted_books_archive (id, title, isbn, original_data)
    VALUES (
        OLD.id,
        OLD.title,
        OLD.isbn,
        row_to_json(OLD)::jsonb
    );
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_cleanup_after_book_deletion
    AFTER DELETE ON books
    FOR EACH ROW
    EXECUTE FUNCTION cleanup_after_book_deletion();

-- =====================================================
-- TEST TRIGGERS
-- =====================================================

-- Test BEFORE INSERT trigger
INSERT INTO books (title, description, category_id, publisher_id, publication_year, pages, total_copies, available_copies)
VALUES (
    'Test Book for Trigger',
    'This book is created to test the BEFORE INSERT trigger',
    (SELECT id FROM categories LIMIT 1),
    (SELECT id FROM publishers LIMIT 1),
    2023,
    300,
    5,
    5
);

-- Test BEFORE UPDATE trigger (rating change)
UPDATE books 
SET rating = 4.5, total_ratings = 10
WHERE title = 'Test Book for Trigger';

-- Test AFTER UPDATE trigger (availability change)
UPDATE books 
SET available_copies = 0
WHERE title = 'Test Book for Trigger';

UPDATE books 
SET available_copies = 3
WHERE title = 'Test Book for Trigger';

-- Test BEFORE DELETE trigger (should fail if there are active borrowings)
-- First, let's try to delete without active borrowings
DELETE FROM books WHERE title = 'Test Book for Trigger';

-- =====================================================
-- DISPLAY TRIGGERS LIST
-- =====================================================

-- List all triggers
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND trigger_name LIKE 'trigger_%'
ORDER BY event_object_table, action_timing, event_manipulation;

-- Show trigger functions
SELECT 
    routine_name as trigger_function,
    routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_type = 'FUNCTION'
AND routine_name IN (
    'validate_and_generate_book_data',
    'update_category_stats_after_book_insert',
    'track_book_rating_changes',
    'monitor_book_availability',
    'prevent_book_deletion_with_active_borrowings',
    'cleanup_after_book_deletion'
)
ORDER BY routine_name;

-- Check notifications created by triggers
SELECT * FROM notifications ORDER BY created_at DESC LIMIT 10;

-- Check audit logs created by triggers
SELECT 
    table_name,
    operation,
    old_values,
    new_values,
    created_at
FROM audit_logs 
ORDER BY created_at DESC 
LIMIT 10;
