-- =====================================================
-- GENERATE LARGE DATASET FOR INDEX TESTING
-- Final Project - Database Programming
-- =====================================================

-- Function to generate random data for testing indexes
-- This will create 5000+ books and related data

-- Generate additional publishers
INSERT INTO publishers (name, address, phone, email, established_year)
SELECT 
    'Publisher ' || generate_series,
    'Address ' || generate_series || ', Indonesia',
    '021-' || LPAD((random() * 9999999)::text, 7, '0'),
    'publisher' || generate_series || '@email.com',
    1950 + (random() * 70)::int
FROM generate_series(8, 50);

-- Generate additional categories
INSERT INTO categories (name, description)
SELECT 
    'Category ' || generate_series,
    'Description for category ' || generate_series
FROM generate_series(14, 30);

-- Generate additional authors
INSERT INTO authors (first_name, last_name, birth_date, nationality, biography)
SELECT 
    'FirstName' || generate_series,
    'LastName' || generate_series,
    '1950-01-01'::date + (random() * 25550)::int,
    CASE (random() * 5)::int
        WHEN 0 THEN 'Indonesia'
        WHEN 1 THEN 'Malaysia'
        WHEN 2 THEN 'Singapore'
        WHEN 3 THEN 'Thailand'
        ELSE 'Philippines'
    END,
    'Biography for author ' || generate_series
FROM generate_series(13, 200);

-- Generate 5000 additional books
INSERT INTO books (
    title, 
    isbn, 
    description, 
    category_id, 
    publisher_id, 
    publication_year, 
    pages, 
    language, 
    price, 
    total_copies, 
    available_copies, 
    featured
)
SELECT 
    'Book Title ' || generate_series,
    '978' || LPAD((random() * 9999999999)::text, 10, '0'),
    'Description for book ' || generate_series || '. This is a comprehensive book about various topics.',
    (SELECT id FROM categories ORDER BY random() LIMIT 1),
    (SELECT id FROM publishers ORDER BY random() LIMIT 1),
    1980 + (random() * 44)::int,
    100 + (random() * 800)::int,
    CASE (random() * 3)::int
        WHEN 0 THEN 'Indonesian'
        WHEN 1 THEN 'English'
        ELSE 'Other'
    END,
    25000 + (random() * 500000)::int,
    1 + (random() * 20)::int,
    1 + (random() * 20)::int,
    random() < 0.1  -- 10% chance of being featured
FROM generate_series(21, 5020);

-- Generate book-author relationships for new books
INSERT INTO book_authors (book_id, author_id, role)
SELECT 
    b.id,
    (SELECT id FROM authors ORDER BY random() LIMIT 1),
    CASE (random() * 4)::int
        WHEN 0 THEN 'author'
        WHEN 1 THEN 'co-author'
        WHEN 2 THEN 'editor'
        ELSE 'translator'
    END
FROM books b
WHERE b.title LIKE 'Book Title %'
AND NOT EXISTS (SELECT 1 FROM book_authors ba WHERE ba.book_id = b.id);

-- Generate additional users (simulating auth.users entries)
DO $$
DECLARE
    i INTEGER;
    user_uuid UUID;
BEGIN
    FOR i IN 1..100 LOOP
        user_uuid := uuid_generate_v4();
        
        -- Insert into auth.users (simulated)
        INSERT INTO auth.users (id, email) 
        VALUES (user_uuid, 'user' || i || '@library.com')
        ON CONFLICT (id) DO NOTHING;
        
        -- Insert into users table
        INSERT INTO users (id, first_name, last_name, phone, date_of_birth, gender, membership_type)
        VALUES (
            user_uuid,
            'User' || i,
            'LastName' || i,
            '081' || LPAD((random() * 999999999)::text, 9, '0'),
            '1970-01-01'::date + (random() * 18250)::int,
            CASE (random() * 3)::int
                WHEN 0 THEN 'male'
                WHEN 1 THEN 'female'
                ELSE 'other'
            END,
            CASE (random() * 3)::int
                WHEN 0 THEN 'basic'
                WHEN 1 THEN 'premium'
                ELSE 'vip'
            END
        );
    END LOOP;
END $$;

-- Generate 10000 borrowing records
INSERT INTO borrowings (user_id, book_id, borrowed_at, due_date, returned_at, status, fine_amount)
SELECT 
    (SELECT id FROM users ORDER BY random() LIMIT 1),
    (SELECT id FROM books ORDER BY random() LIMIT 1),
    NOW() - (random() * 365)::int * INTERVAL '1 day',
    NOW() - (random() * 365)::int * INTERVAL '1 day' + INTERVAL '14 days',
    CASE 
        WHEN random() < 0.7 THEN NOW() - (random() * 300)::int * INTERVAL '1 day'
        ELSE NULL
    END,
    CASE (random() * 4)::int
        WHEN 0 THEN 'active'
        WHEN 1 THEN 'returned'
        WHEN 2 THEN 'overdue'
        ELSE 'lost'
    END,
    CASE 
        WHEN random() < 0.2 THEN (random() * 50000)::int
        ELSE 0
    END
FROM generate_series(1, 10000);

-- Generate 15000 review records
INSERT INTO reviews (user_id, book_id, rating, title, comment, helpful_votes)
SELECT DISTINCT ON (u.id, b.id)
    u.id,
    b.id,
    1 + (random() * 5)::int,
    'Review Title ' || (random() * 1000)::int,
    'This is a review comment for the book. ' || 
    CASE (random() * 3)::int
        WHEN 0 THEN 'I really enjoyed reading this book.'
        WHEN 1 THEN 'The book was okay, but could be better.'
        ELSE 'Excellent book, highly recommended!'
    END,
    (random() * 100)::int
FROM 
    (SELECT id FROM users ORDER BY random() LIMIT 3000) u
    CROSS JOIN
    (SELECT id FROM books ORDER BY random() LIMIT 5) b
LIMIT 15000;

-- Generate favorites
INSERT INTO favorites (user_id, book_id)
SELECT DISTINCT ON (u.id, b.id)
    u.id,
    b.id
FROM 
    (SELECT id FROM users ORDER BY random() LIMIT 2000) u
    CROSS JOIN
    (SELECT id FROM books ORDER BY random() LIMIT 10) b
WHERE random() < 0.3
LIMIT 8000;

-- Generate reading progress
INSERT INTO reading_progress (user_id, book_id, progress_percentage, current_page, total_reading_time)
SELECT DISTINCT ON (u.id, b.id)
    u.id,
    b.id,
    (random() * 100)::int,
    1 + (random() * 500)::int,
    (random() * 1000)::int
FROM 
    (SELECT id FROM users ORDER BY random() LIMIT 1500) u
    CROSS JOIN
    (SELECT id FROM books ORDER BY random() LIMIT 8) b
WHERE random() < 0.4
LIMIT 5000;

-- Update book ratings and available copies
UPDATE books SET 
    rating = COALESCE((SELECT AVG(rating::numeric) FROM reviews WHERE book_id = books.id), 0),
    total_ratings = COALESCE((SELECT COUNT(*) FROM reviews WHERE book_id = books.id), 0),
    available_copies = GREATEST(0, total_copies - COALESCE((SELECT COUNT(*) FROM borrowings WHERE book_id = books.id AND status = 'active'), 0));

-- Update user statistics
UPDATE users SET 
    total_books_borrowed = COALESCE((SELECT COUNT(*) FROM borrowings WHERE user_id = users.id), 0);

-- Display final statistics
SELECT 'Large dataset generation completed!' as status;

SELECT 
    'Publishers' as table_name, COUNT(*) as record_count FROM publishers
UNION ALL
SELECT 'Categories', COUNT(*) FROM categories
UNION ALL
SELECT 'Authors', COUNT(*) FROM authors
UNION ALL
SELECT 'Books', COUNT(*) FROM books
UNION ALL
SELECT 'Book-Authors', COUNT(*) FROM book_authors
UNION ALL
SELECT 'Users', COUNT(*) FROM users
UNION ALL
SELECT 'Borrowings', COUNT(*) FROM borrowings
UNION ALL
SELECT 'Reviews', COUNT(*) FROM reviews
UNION ALL
SELECT 'Favorites', COUNT(*) FROM favorites
UNION ALL
SELECT 'Reading Progress', COUNT(*) FROM reading_progress
ORDER BY record_count DESC;
