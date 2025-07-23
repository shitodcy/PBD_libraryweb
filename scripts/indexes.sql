-- =====================================================
-- INDEXES
-- Final Project - Database Programming
-- =====================================================

-- =====================================================
-- INDEX 1: Create table with index (composite key)
-- =====================================================

-- Create a new table with composite index for book search optimization
CREATE TABLE book_search_cache (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    book_id UUID REFERENCES books(id),
    search_terms TEXT,
    category_name VARCHAR(100),
    author_names TEXT,
    popularity_score INTEGER DEFAULT 0,
    last_updated TIMESTAMP DEFAULT NOW(),
    
    -- Create composite index during table creation
    INDEX idx_book_search_composite (category_name, popularity_score DESC, search_terms)
);

-- Populate the search cache table
INSERT INTO book_search_cache (book_id, search_terms, category_name, author_names, popularity_score)
SELECT 
    b.id,
    LOWER(b.title || ' ' || COALESCE(b.description, '')),
    c.name,
    STRING_AGG(CONCAT(a.first_name, ' ', a.last_name), ', '),
    (b.rating * 10 + b.total_ratings)::INTEGER
FROM books b
LEFT JOIN categories c ON b.category_id = c.id
LEFT JOIN book_authors ba ON b.id = ba.book_id
LEFT JOIN authors a ON ba.author_id = a.id
GROUP BY b.id, b.title, b.description, c.name, b.rating, b.total_ratings;

-- =====================================================
-- INDEX 2: Create index with CREATE INDEX (composite key)
-- =====================================================

-- Create composite index for borrowing analysis
CREATE INDEX idx_borrowings_user_status_date 
ON borrowings (user_id, status, borrowed_at DESC);

-- Create composite index for book performance analysis
CREATE INDEX idx_books_category_rating_availability 
ON books (category_id, rating DESC, available_copies DESC)
WHERE available_copies > 0;

-- Create partial index for overdue books
CREATE INDEX idx_borrowings_overdue_analysis 
ON borrowings (due_date, fine_amount, user_id)
WHERE status IN ('overdue', 'active') AND due_date < NOW();

-- =====================================================
-- INDEX 3: Create index with ALTER TABLE (composite key)
-- =====================================================

-- Add composite index using ALTER TABLE for reviews analysis
ALTER TABLE reviews 
ADD INDEX idx_reviews_book_rating_helpful (book_id, rating DESC, helpful_votes DESC);

-- Add composite index for user activity analysis
ALTER TABLE reading_progress 
ADD INDEX idx_reading_user_progress_time (user_id, progress_percentage DESC, total_reading_time DESC);

-- Add composite index for audit log analysis
ALTER TABLE audit_logs 
ADD INDEX idx_audit_table_operation_date (table_name, operation, created_at DESC);

-- =====================================================
-- PERFORMANCE TESTING WITH EXPLAIN
-- =====================================================

-- Test 1: Query without index vs with index
-- First, let's create a temporary table without indexes for comparison
CREATE TABLE books_no_index AS SELECT * FROM books;

-- Query WITHOUT index (using temporary table)
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
SELECT * FROM books_no_index 
WHERE publication_year BETWEEN 2000 AND 2020 
AND rating > 4.0
ORDER BY rating DESC, title;

-- Query WITH index (using original table with indexes)
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
SELECT * FROM books 
WHERE publication_year BETWEEN 2000 AND 2020 
AND rating > 4.0
ORDER BY rating DESC, title;

-- Test 2: Complex join query without composite index
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
SELECT 
    b.title,
    c.name as category,
    AVG(r.rating) as avg_rating,
    COUNT(br.id) as total_borrowings
FROM books_no_index b
LEFT JOIN categories c ON b.category_id = c.id
LEFT JOIN reviews r ON b.id = r.book_id
LEFT JOIN borrowings br ON b.id = br.book_id
WHERE c.name IN ('Fiksi', 'Sejarah')
GROUP BY b.id, b.title, c.name
HAVING COUNT(br.id) > 2
ORDER BY avg_rating DESC;

-- Test 3: Same query WITH composite indexes
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
SELECT 
    b.title,
    c.name as category,
    AVG(r.rating) as avg_rating,
    COUNT(br.id) as total_borrowings
FROM books b
LEFT JOIN categories c ON b.category_id = c.id
LEFT JOIN reviews r ON b.id = r.book_id
LEFT JOIN borrowings br ON b.id = br.book_id
WHERE c.name IN ('Fiksi', 'Sejarah')
GROUP BY b.id, b.title, c.name
HAVING COUNT(br.id) > 2
ORDER BY avg_rating DESC;

-- Test 4: Search cache table with composite index
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
SELECT 
    bsc.book_id,
    bsc.search_terms,
    bsc.popularity_score
FROM book_search_cache bsc
WHERE bsc.category_name = 'Fiksi'
AND bsc.popularity_score > 40
ORDER BY bsc.popularity_score DESC, bsc.search_terms
LIMIT 20;

-- Test 5: Borrowing analysis with composite index
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
SELECT 
    u.first_name,
    u.last_name,
    COUNT(*) as total_borrowings,
    AVG(EXTRACT(DAY FROM (COALESCE(returned_at, NOW()) - borrowed_at))) as avg_days
FROM borrowings b
JOIN users u ON b.user_id = u.id
WHERE b.status IN ('returned', 'active')
AND b.borrowed_at >= NOW() - INTERVAL '1 year'
GROUP BY u.id, u.first_name, u.last_name
HAVING COUNT(*) > 3
ORDER BY total_borrowings DESC;

-- =====================================================
-- INDEX ANALYSIS AND STATISTICS
-- =====================================================

-- Show all indexes in the database
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Show index usage statistics
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_tup_read,
    idx_tup_fetch,
    idx_scan
FROM pg_stat_user_indexes 
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- Show table sizes and index sizes
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as index_size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Clean up temporary table
DROP TABLE books_no_index;

-- =====================================================
-- INDEX MAINTENANCE QUERIES
-- =====================================================

-- Reindex all indexes (maintenance)
-- REINDEX DATABASE library_db; -- Uncomment if needed

-- Analyze tables to update statistics
ANALYZE books;
ANALYZE borrowings;
ANALYZE reviews;
ANALYZE book_search_cache;

-- Show unused indexes (indexes that are never used)
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes 
WHERE schemaname = 'public'
AND idx_scan = 0
ORDER BY pg_relation_size(indexrelid) DESC;
