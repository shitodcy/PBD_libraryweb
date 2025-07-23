-- =====================================================
-- VIEWS
-- Final Project - Database Programming
-- =====================================================

-- =====================================================
-- VIEW 1: HORIZONTAL VIEW - Active Borrowings Summary
-- =====================================================

CREATE VIEW active_borrowings_summary AS
SELECT 
    b.id as borrowing_id,
    u.first_name || ' ' || u.last_name as borrower_name,
    u.email,
    bk.title as book_title,
    bk.isbn,
    c.name as category,
    b.borrowed_at,
    b.due_date,
    CASE 
        WHEN b.due_date < NOW() THEN 'OVERDUE'
        WHEN b.due_date - NOW() <= INTERVAL '3 days' THEN 'DUE_SOON'
        ELSE 'ACTIVE'
    END as status_detail,
    EXTRACT(DAY FROM (NOW() - b.due_date))::INTEGER as days_overdue,
    CASE 
        WHEN b.due_date < NOW() THEN 
            LEAST(EXTRACT(DAY FROM (NOW() - b.due_date))::INTEGER * 1000, 50000)
        ELSE 0
    END as potential_fine
FROM borrowings b
JOIN users u ON b.user_id = u.id
JOIN books bk ON b.book_id = bk.id
LEFT JOIN categories c ON bk.category_id = c.id
WHERE b.status = 'active';

-- =====================================================
-- VIEW 2: VERTICAL VIEW - Book Details Summary
-- =====================================================

CREATE VIEW book_details_summary AS
SELECT 
    b.id,
    b.title,
    b.isbn,
    b.publication_year,
    b.pages,
    b.language,
    b.total_copies,
    b.available_copies,
    ROUND(b.rating, 2) as rating,
    b.total_ratings,
    b.featured,
    b.price
FROM books b
WHERE b.available_copies > 0
AND b.rating >= 4.0;

-- =====================================================
-- VIEW 3: VIEW INSIDE VIEW with CHECK OPTION
-- =====================================================

-- Base view: Popular books
CREATE VIEW popular_books AS
SELECT 
    b.id,
    b.title,
    b.isbn,
    b.rating,
    b.total_ratings,
    b.available_copies,
    b.price,
    c.name as category_name,
    p.name as publisher_name,
    STRING_AGG(a.first_name || ' ' || a.last_name, ', ') as authors
FROM books b
LEFT JOIN categories c ON b.category_id = c.id
LEFT JOIN publishers p ON b.publisher_id = p.id
LEFT JOIN book_authors ba ON b.id = ba.book_id
LEFT JOIN authors a ON ba.author_id = a.id
WHERE b.rating >= 4.0
GROUP BY b.id, b.title, b.isbn, b.rating, b.total_ratings, 
         b.available_copies, b.price, c.name, p.name;

-- View inside view: Featured popular books with CHECK OPTION
CREATE VIEW featured_popular_books AS
SELECT 
    id,
    title,
    isbn,
    rating,
    total_ratings,
    available_copies,
    price,
    category_name,
    publisher_name,
    authors
FROM popular_books
WHERE rating >= 4.5
AND available_copies > 0
WITH CASCADED CHECK OPTION;

-- Another view inside view: Premium featured books
CREATE VIEW premium_featured_books AS
SELECT 
    id,
    title,
    isbn,
    rating,
    price,
    category_name,
    authors
FROM featured_popular_books
WHERE price >= 75000
WITH LOCAL CHECK OPTION;

-- =====================================================
-- TEST VIEW OPERATIONS (INSERT, UPDATE)
-- =====================================================

-- Test INSERT through view (this should work)
-- First, let's create a test scenario by inserting a book that meets criteria

-- Insert a new book that should appear in views
INSERT INTO books (title, isbn, description, category_id, publisher_id, publication_year, pages, rating, total_ratings, available_copies, total_copies, price, featured)
VALUES (
    'Advanced Database Programming',
    '9781234567890',
    'Comprehensive guide to advanced database programming techniques',
    (SELECT id FROM categories WHERE name = 'Database' LIMIT 1),
    (SELECT id FROM publishers LIMIT 1),
    2023,
    450,
    4.8,
    25,
    5,
    5,
    125000,
    true
);

-- Add author relationship
INSERT INTO book_authors (book_id, author_id, role)
VALUES (
    (SELECT id FROM books WHERE isbn = '9781234567890'),
    (SELECT id FROM authors LIMIT 1),
    'author'
);

-- Test UPDATE through view
-- Update a book through the view (should work if it maintains CHECK OPTION constraints)
UPDATE featured_popular_books 
SET price = 95000 
WHERE isbn = '9781234567890';

-- Test UPDATE that violates CHECK OPTION (should fail)
-- This should fail because it would make rating < 4.5
-- UPDATE featured_popular_books 
-- SET rating = 4.0 
-- WHERE isbn = '9781234567890';

-- Test INSERT through view with CHECK OPTION violation
-- This would fail because we can't directly insert into a view that joins multiple tables
-- But we can demonstrate the CHECK OPTION concept

-- =====================================================
-- COMPLEX VIEWS FOR REPORTING
-- =====================================================

-- User reading statistics view
CREATE VIEW user_reading_statistics AS
SELECT 
    u.id,
    u.first_name || ' ' || u.last_name as full_name,
    u.membership_type,
    COUNT(DISTINCT b.id) as total_books_borrowed,
    COUNT(DISTINCT CASE WHEN b.status = 'returned' THEN b.id END) as books_returned,
    COUNT(DISTINCT CASE WHEN b.status = 'active' THEN b.id END) as books_currently_borrowed,
    COUNT(DISTINCT CASE WHEN b.status = 'overdue' THEN b.id END) as books_overdue,
    COUNT(DISTINCT r.id) as total_reviews,
    ROUND(AVG(r.rating), 2) as average_rating_given,
    COUNT(DISTINCT f.id) as favorite_books,
    COALESCE(SUM(rp.total_reading_time), 0) as total_reading_minutes,
    ROUND(AVG(rp.progress_percentage), 2) as average_reading_progress
FROM users u
LEFT JOIN borrowings b ON u.id = b.user_id
LEFT JOIN reviews r ON u.id = r.user_id
LEFT JOIN favorites f ON u.id = f.user_id
LEFT JOIN reading_progress rp ON u.id = rp.user_id
GROUP BY u.id, u.first_name, u.last_name, u.membership_type;

-- Book performance analytics view
CREATE VIEW book_performance_analytics AS
SELECT 
    b.id,
    b.title,
    b.isbn,
    c.name as category,
    p.name as publisher,
    b.publication_year,
    b.rating,
    b.total_ratings,
    COUNT(DISTINCT br.id) as total_borrowings,
    COUNT(DISTINCT CASE WHEN br.status = 'active' THEN br.id END) as current_borrowings,
    COUNT(DISTINCT r.id) as total_reviews,
    COUNT(DISTINCT f.id) as total_favorites,
    ROUND(AVG(rp.progress_percentage), 2) as average_reading_progress,
    SUM(rp.total_reading_time) as total_reading_time,
    ROUND(
        (b.rating * 0.3 + 
         LEAST(COUNT(DISTINCT br.id), 50) * 0.2 + 
         LEAST(COUNT(DISTINCT f.id), 30) * 0.2 + 
         LEAST(COUNT(DISTINCT r.id), 20) * 0.3), 2
    ) as popularity_score
FROM books b
LEFT JOIN categories c ON b.category_id = c.id
LEFT JOIN publishers p ON b.publisher_id = p.id
LEFT JOIN borrowings br ON b.id = br.book_id
LEFT JOIN reviews r ON b.id = r.book_id
LEFT JOIN favorites f ON b.id = f.book_id
LEFT JOIN reading_progress rp ON b.id = rp.book_id
GROUP BY b.id, b.title, b.isbn, c.name, p.name, b.publication_year, b.rating, b.total_ratings;

-- =====================================================
-- TEST VIEW QUERIES
-- =====================================================

-- Test horizontal view
SELECT * FROM active_borrowings_summary 
WHERE status_detail = 'OVERDUE' 
ORDER BY days_overdue DESC;

-- Test vertical view
SELECT * FROM book_details_summary 
WHERE rating >= 4.5 
ORDER BY rating DESC, total_ratings DESC;

-- Test view inside view
SELECT * FROM featured_popular_books 
ORDER BY rating DESC, total_ratings DESC;

-- Test premium view
SELECT * FROM premium_featured_books 
ORDER BY price DESC;

-- Test complex reporting views
SELECT * FROM user_reading_statistics 
WHERE total_books_borrowed > 0 
ORDER BY total_books_borrowed DESC;

SELECT * FROM book_performance_analytics 
WHERE popularity_score > 10 
ORDER BY popularity_score DESC;

-- =====================================================
-- DISPLAY VIEWS LIST
-- =====================================================

-- List all views
SELECT 
    table_name as view_name,
    view_definition
FROM information_schema.views 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Show view dependencies
SELECT DISTINCT
    dependent_view.table_name as dependent_view,
    source_table.table_name as depends_on
FROM information_schema.view_table_usage source_table
JOIN information_schema.views dependent_view
ON source_table.view_name = dependent_view.table_name
WHERE source_table.table_schema = 'public'
ORDER BY dependent_view, depends_on;

-- Show view columns
SELECT 
    table_name as view_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public'
AND table_name IN (
    SELECT table_name 
    FROM information_schema.views 
    WHERE table_schema = 'public'
)
ORDER BY table_name, ordinal_position;
