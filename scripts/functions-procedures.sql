-- =====================================================
-- FUNCTIONS AND STORED PROCEDURES
-- Final Project - Database Programming
-- =====================================================

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function 1: Get library statistics (no parameters)
CREATE OR REPLACE FUNCTION get_library_statistics()
RETURNS TABLE(
    total_books INTEGER,
    total_users INTEGER,
    total_active_borrowings INTEGER,
    total_overdue_books INTEGER,
    average_rating NUMERIC(3,2),
    most_popular_category TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*)::INTEGER FROM books) as total_books,
        (SELECT COUNT(*)::INTEGER FROM users) as total_users,
        (SELECT COUNT(*)::INTEGER FROM borrowings WHERE status = 'active') as total_active_borrowings,
        (SELECT COUNT(*)::INTEGER FROM borrowings WHERE status = 'overdue') as total_overdue_books,
        (SELECT ROUND(AVG(rating), 2) FROM books WHERE rating > 0) as average_rating,
        (SELECT c.name 
         FROM categories c 
         JOIN books b ON c.id = b.category_id 
         GROUP BY c.name 
         ORDER BY COUNT(*) DESC 
         LIMIT 1) as most_popular_category;
END;
$$ LANGUAGE plpgsql;

-- Function 2: Calculate user reading score (with 2 parameters)
CREATE OR REPLACE FUNCTION calculate_user_reading_score(
    p_user_id UUID,
    p_months_back INTEGER DEFAULT 12
)
RETURNS TABLE(
    user_name TEXT,
    books_read INTEGER,
    average_rating NUMERIC(3,2),
    total_reading_time INTEGER,
    reading_score INTEGER
) AS $$
DECLARE
    v_books_read INTEGER;
    v_avg_rating NUMERIC(3,2);
    v_reading_time INTEGER;
    v_score INTEGER;
    v_user_name TEXT;
BEGIN
    -- Get user name
    SELECT CONCAT(first_name, ' ', last_name) INTO v_user_name
    FROM users WHERE id = p_user_id;
    
    -- Calculate books read in the specified period
    SELECT COUNT(*) INTO v_books_read
    FROM borrowings b
    WHERE b.user_id = p_user_id 
    AND b.status = 'returned'
    AND b.returned_at >= NOW() - (p_months_back || ' months')::INTERVAL;
    
    -- Calculate average rating given by user
    SELECT COALESCE(AVG(rating), 0) INTO v_avg_rating
    FROM reviews r
    WHERE r.user_id = p_user_id
    AND r.created_at >= NOW() - (p_months_back || ' months')::INTERVAL;
    
    -- Calculate total reading time
    SELECT COALESCE(SUM(total_reading_time), 0) INTO v_reading_time
    FROM reading_progress rp
    WHERE rp.user_id = p_user_id
    AND rp.last_read_at >= NOW() - (p_months_back || ' months')::INTERVAL;
    
    -- Calculate reading score (books_read * 10 + avg_rating * 5 + reading_time / 60)
    v_score := (v_books_read * 10) + (v_avg_rating * 5)::INTEGER + (v_reading_time / 60);
    
    RETURN QUERY
    SELECT 
        v_user_name,
        v_books_read,
        v_avg_rating,
        v_reading_time,
        v_score;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STORED PROCEDURES
-- =====================================================

-- Procedure 1: Generate monthly library report (no parameters)
CREATE OR REPLACE PROCEDURE generate_monthly_report()
LANGUAGE plpgsql AS $$
DECLARE
    v_report_date DATE := DATE_TRUNC('month', CURRENT_DATE);
    v_total_borrowings INTEGER;
    v_total_returns INTEGER;
    v_new_users INTEGER;
    v_overdue_count INTEGER;
    v_revenue NUMERIC(12,2);
    rec RECORD;
BEGIN
    -- Calculate monthly statistics
    SELECT COUNT(*) INTO v_total_borrowings
    FROM borrowings 
    WHERE DATE_TRUNC('month', borrowed_at) = v_report_date;
    
    SELECT COUNT(*) INTO v_total_returns
    FROM borrowings 
    WHERE DATE_TRUNC('month', returned_at) = v_report_date;
    
    SELECT COUNT(*) INTO v_new_users
    FROM users 
    WHERE DATE_TRUNC('month', created_at) = v_report_date;
    
    SELECT COUNT(*) INTO v_overdue_count
    FROM borrowings 
    WHERE status = 'overdue' 
    AND DATE_TRUNC('month', due_date) = v_report_date;
    
    SELECT COALESCE(SUM(fine_amount), 0) INTO v_revenue
    FROM borrowings 
    WHERE DATE_TRUNC('month', returned_at) = v_report_date;
    
    -- Create or update report table
    CREATE TABLE IF NOT EXISTS monthly_reports (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        report_month DATE,
        total_borrowings INTEGER,
        total_returns INTEGER,
        new_users INTEGER,
        overdue_books INTEGER,
        revenue NUMERIC(12,2),
        generated_at TIMESTAMP DEFAULT NOW()
    );
    
    -- Insert report
    INSERT INTO monthly_reports (
        report_month, total_borrowings, total_returns, 
        new_users, overdue_books, revenue
    ) VALUES (
        v_report_date, v_total_borrowings, v_total_returns,
        v_new_users, v_overdue_count, v_revenue
    );
    
    -- Log the report generation
    INSERT INTO audit_logs (table_name, operation, new_values)
    VALUES ('monthly_reports', 'INSERT', 
            json_build_object(
                'report_month', v_report_date,
                'total_borrowings', v_total_borrowings,
                'total_returns', v_total_returns,
                'new_users', v_new_users,
                'overdue_books', v_overdue_count,
                'revenue', v_revenue
            ));
    
    RAISE NOTICE 'Monthly report generated for %', v_report_date;
    RAISE NOTICE 'Borrowings: %, Returns: %, New Users: %', 
                 v_total_borrowings, v_total_returns, v_new_users;
END;
$$;

-- Procedure 2: Process book return with fine calculation (with parameters)
CREATE OR REPLACE PROCEDURE process_book_return(
    IN p_borrowing_id UUID,
    IN p_return_date TIMESTAMP DEFAULT NOW(),
    OUT p_fine_amount NUMERIC(10,2),
    OUT p_status TEXT
)
LANGUAGE plpgsql AS $$
DECLARE
    v_borrowing RECORD;
    v_days_overdue INTEGER;
    v_fine_per_day NUMERIC(10,2) := 1000.00; -- Rp 1000 per day
    v_max_fine NUMERIC(10,2) := 50000.00; -- Maximum fine Rp 50000
BEGIN
    -- Get borrowing details
    SELECT * INTO v_borrowing
    FROM borrowings b
    JOIN books bk ON b.book_id = bk.id
    WHERE b.id = p_borrowing_id AND b.status = 'active';
    
    IF NOT FOUND THEN
        p_status := 'ERROR: Borrowing not found or already returned';
        p_fine_amount := 0;
        RETURN;
    END IF;
    
    -- Calculate fine if overdue
    v_days_overdue := GREATEST(0, EXTRACT(DAY FROM p_return_date - v_borrowing.due_date)::INTEGER);
    
    IF v_days_overdue > 0 THEN
        p_fine_amount := LEAST(v_days_overdue * v_fine_per_day, v_max_fine);
    ELSE
        p_fine_amount := 0;
    END IF;
    
    -- Update borrowing record
    UPDATE borrowings 
    SET 
        returned_at = p_return_date,
        status = 'returned',
        fine_amount = p_fine_amount,
        updated_at = NOW()
    WHERE id = p_borrowing_id;
    
    -- Update book availability
    UPDATE books 
    SET available_copies = available_copies + 1
    WHERE id = v_borrowing.book_id;
    
    -- Log the return
    INSERT INTO audit_logs (table_name, operation, record_id, new_values)
    VALUES ('borrowings', 'UPDATE', p_borrowing_id,
            json_build_object(
                'returned_at', p_return_date,
                'fine_amount', p_fine_amount,
                'days_overdue', v_days_overdue
            ));
    
    -- Set success status
    IF v_days_overdue > 0 THEN
        p_status := FORMAT('Book returned successfully. Fine: Rp %s (%s days overdue)', 
                          p_fine_amount, v_days_overdue);
    ELSE
        p_status := 'Book returned successfully. No fine.';
    END IF;
    
    RAISE NOTICE 'Book "%" returned by user. Fine: Rp %', 
                 v_borrowing.title, p_fine_amount;
END;
$$;

-- =====================================================
-- EXECUTE FUNCTIONS AND PROCEDURES
-- =====================================================

-- Execute Function 1 (no parameters)
SELECT * FROM get_library_statistics();

-- Execute Function 2 (with parameters)
SELECT * FROM calculate_user_reading_score(
    '550e8400-e29b-41d4-a716-446655440000', 
    6  -- last 6 months
);

-- Execute Procedure 1 (no parameters)
CALL generate_monthly_report();

-- Execute Procedure 2 (with parameters)
DO $$
DECLARE
    v_fine NUMERIC(10,2);
    v_status TEXT;
    v_borrowing_id UUID;
BEGIN
    -- Get a sample active borrowing
    SELECT id INTO v_borrowing_id 
    FROM borrowings 
    WHERE status = 'active' 
    LIMIT 1;
    
    IF v_borrowing_id IS NOT NULL THEN
        CALL process_book_return(v_borrowing_id, NOW(), v_fine, v_status);
        RAISE NOTICE 'Return processed: %', v_status;
        RAISE NOTICE 'Fine amount: Rp %', v_fine;
    ELSE
        RAISE NOTICE 'No active borrowings found for testing';
    END IF;
END;
$$;

-- =====================================================
-- DISPLAY FUNCTIONS AND PROCEDURES LIST
-- =====================================================

-- List all functions
SELECT 
    routine_name as function_name,
    routine_type,
    data_type as return_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_type = 'FUNCTION'
AND routine_name IN ('get_library_statistics', 'calculate_user_reading_score')
ORDER BY routine_name;

-- List all procedures
SELECT 
    routine_name as procedure_name,
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_type = 'PROCEDURE'
AND routine_name IN ('generate_monthly_report', 'process_book_return')
ORDER BY routine_name;

-- Show function parameters
SELECT 
    r.routine_name,
    p.parameter_name,
    p.data_type,
    p.parameter_mode
FROM information_schema.routines r
JOIN information_schema.parameters p ON r.specific_name = p.specific_name
WHERE r.routine_schema = 'public'
AND r.routine_name IN ('get_library_statistics', 'calculate_user_reading_score', 
                       'generate_monthly_report', 'process_book_return')
ORDER BY r.routine_name, p.ordinal_position;
