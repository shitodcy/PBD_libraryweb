-- =====================================================
-- COMPREHENSIVE DATA SEEDING
-- Final Project - Database Programming
-- =====================================================

-- Insert Publishers (5+ records)
INSERT INTO publishers (name, address, phone, email, website, established_year) VALUES
('Gramedia Pustaka Utama', 'Jl. Palmerah Selatan 22-28, Jakarta 10270', '021-5365555', 'info@gramedia.com', 'https://www.gramedia.com', 1974),
('Mizan Pustaka', 'Jl. Cinambo No. 135, Bandung 40294', '022-7834310', 'mizan@mizan.com', 'https://www.mizan.com', 1983),
('Bentang Pustaka', 'Jl. Gajah Mada 144A, Yogyakarta 55112', '0274-561037', 'bentang@bentangpustaka.com', 'https://www.bentangpustaka.com', 1995),
('Erlangga', 'Jl. H. Baping Raya No. 100, Jakarta 13560', '021-8690-6969', 'info@erlangga.co.id', 'https://www.erlangga.co.id', 1952),
('Republika Penerbit', 'Jl. Warung Buncit Raya No. 37, Jakarta 12510', '021-7805555', 'penerbit@republika.co.id', 'https://penerbit.republika.co.id', 1993),
('Andi Publisher', 'Jl. Beo 38-40, Yogyakarta 55281', '0274-561881', 'info@andipublisher.com', 'https://www.andipublisher.com', 1991),
('Grasindo', 'Jl. Palmerah Barat 33-37, Jakarta 11480', '021-5483008', 'grasindo@gramedia.com', 'https://www.grasindo.co.id', 1985);

-- Insert Categories (5+ records with hierarchy)
INSERT INTO categories (name, description, parent_category_id) VALUES
('Fiksi', 'Karya sastra fiksi dan novel', NULL),
('Non-Fiksi', 'Buku-buku faktual dan edukatif', NULL),
('Teknologi', 'Buku tentang teknologi dan komputer', NULL),
('Sejarah', 'Buku sejarah dan biografi', NULL),
('Agama', 'Buku-buku keagamaan', NULL),
('Sains', 'Buku sains dan penelitian', NULL),
('Bisnis', 'Buku bisnis dan ekonomi', NULL);

-- Insert subcategories
INSERT INTO categories (name, description, parent_category_id) VALUES
('Novel Indonesia', 'Novel karya penulis Indonesia', (SELECT id FROM categories WHERE name = 'Fiksi')),
('Novel Terjemahan', 'Novel terjemahan dari luar negeri', (SELECT id FROM categories WHERE name = 'Fiksi')),
('Pemrograman', 'Buku tentang bahasa pemrograman', (SELECT id FROM categories WHERE name = 'Teknologi')),
('Database', 'Buku tentang basis data', (SELECT id FROM categories WHERE name = 'Teknologi')),
('Sejarah Indonesia', 'Sejarah bangsa Indonesia', (SELECT id FROM categories WHERE name = 'Sejarah'));

-- Insert Authors (10+ records)
INSERT INTO authors (first_name, last_name, birth_date, nationality, biography) VALUES
('Andrea', 'Hirata', '1967-10-24', 'Indonesia', 'Penulis novel Laskar Pelangi yang terkenal'),
('Pramoedya', 'Ananta Toer', '1925-02-06', 'Indonesia', 'Sastrawan besar Indonesia, penulis Tetralogi Buru'),
('Ahmad', 'Fuadi', '1972-12-30', 'Indonesia', 'Penulis novel Negeri 5 Menara'),
('Habiburrahman', 'El Shirazy', '1976-09-30', 'Indonesia', 'Penulis novel islami terkenal'),
('Dee', 'Lestari', '1976-01-20', 'Indonesia', 'Penulis novel Perahu Kertas dan Supernova'),
('Tere', 'Liye', '1979-05-21', 'Indonesia', 'Penulis produktif novel anak dan remaja'),
('Ahmad', 'Tohari', '1948-06-13', 'Indonesia', 'Penulis novel Ronggeng Dukuh Paruk'),
('Eka', 'Kurniawan', '1975-11-28', 'Indonesia', 'Penulis novel Cantik Itu Luka'),
('Leila', 'Chudori', '1962-12-12', 'Indonesia', 'Penulis novel Laut Bercerita'),
('Ayu', 'Utami', '1968-11-21', 'Indonesia', 'Penulis novel Saman'),
('Remy', 'Sylado', '1945-07-12', 'Indonesia', 'Penulis novel Ca-Bau-Kan'),
('Seno', 'Gumira Ajidarma', '1958-06-19', 'Indonesia', 'Penulis cerpen dan novel');

-- Insert sample user (this would normally be handled by Supabase Auth)
-- For demo purposes, we'll create a dummy user
INSERT INTO auth.users (id, email) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'demo@library.com')
ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, first_name, last_name, phone, date_of_birth, gender, address, membership_type) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Demo', 'User', '081234567890', '1990-01-01', 'male', 'Jakarta, Indonesia', 'premium');

-- Insert Books (20+ records)
INSERT INTO books (title, isbn, description, category_id, publisher_id, publication_year, pages, language, price, total_copies, available_copies, featured) VALUES
('Laskar Pelangi', '9789792248000', 'Novel yang mengisahkan tentang perjuangan anak-anak Belitung untuk mendapatkan pendidikan di sekolah Muhammadiyah yang hampir roboh.', 
 (SELECT id FROM categories WHERE name = 'Novel Indonesia'), (SELECT id FROM publishers WHERE name = 'Bentang Pustaka'), 2005, 529, 'Indonesian', 75000, 10, 8, true),

('Bumi Manusia', '9789799731240', 'Novel pertama dari Tetralogi Buru yang mengisahkan kehidupan di masa kolonial Belanda melalui tokoh Minke.',
 (SELECT id FROM categories WHERE name = 'Novel Indonesia'), (SELECT id FROM publishers WHERE name = 'Gramedia Pustaka Utama'), 1980, 535, 'Indonesian', 85000, 8, 6, true),

('Negeri 5 Menara', '9789792248017', 'Kisah inspiratif tentang perjuangan santri di Pondok Modern Darussalam Gontor dalam mengejar mimpi dan cita-cita.',
 (SELECT id FROM categories WHERE name = 'Novel Indonesia'), (SELECT id FROM publishers WHERE name = 'Gramedia Pustaka Utama'), 2009, 423, 'Indonesian', 70000, 12, 10, true),

('Ayat-Ayat Cinta', '9789792248024', 'Novel yang mengisahkan perjalanan spiritual seorang mahasiswa Indonesia di Mesir dalam mencari cinta sejati.',
 (SELECT id FROM categories WHERE name = 'Novel Indonesia'), (SELECT id FROM publishers WHERE name = 'Republika Penerbit'), 2004, 418, 'Indonesian', 65000, 15, 12, true),

('Perahu Kertas', '9789792248031', 'Novel tentang perjalanan cinta dan mimpi dua anak muda Jakarta yang bertemu dalam keadaan tak terduga.',
 (SELECT id FROM categories WHERE name = 'Novel Indonesia'), (SELECT id FROM publishers WHERE name = 'Bentang Pustaka'), 2009, 456, 'Indonesian', 68000, 8, 7, false),

('Sang Pemimpi', '9789792248048', 'Sekuel dari Laskar Pelangi yang mengisahkan perjuangan melanjutkan pendidikan ke jenjang yang lebih tinggi.',
 (SELECT id FROM categories WHERE name = 'Novel Indonesia'), (SELECT id FROM publishers WHERE name = 'Bentang Pustaka'), 2006, 292, 'Indonesian', 60000, 10, 9, false),

('Ronggeng Dukuh Paruk', '9789792248055', 'Novel yang mengisahkan kehidupan seorang ronggeng di desa Dukuh Paruk dan konflik sosial yang melingkupinya.',
 (SELECT id FROM categories WHERE name = 'Novel Indonesia'), (SELECT id FROM publishers WHERE name = 'Gramedia Pustaka Utama'), 1982, 320, 'Indonesian', 55000, 6, 5, false),

('Cantik Itu Luka', '9789792248062', 'Novel yang menggabungkan realisme magis dengan sejarah Indonesia, mengisahkan kehidupan keluarga Dewi Ayu.',
 (SELECT id FROM categories WHERE name = 'Novel Indonesia'), (SELECT id FROM publishers WHERE name = 'Gramedia Pustaka Utama'), 2002, 520, 'Indonesian', 80000, 7, 5, false),

('Laut Bercerita', '9789792248079', 'Novel yang mengisahkan tentang aktivis mahasiswa yang hilang pada masa Orde Baru dan dampaknya terhadap keluarga.',
 (SELECT id FROM categories WHERE name = 'Sejarah Indonesia'), (SELECT id FROM publishers WHERE name = 'Gramedia Pustaka Utama'), 2017, 394, 'Indonesian', 78000, 9, 7, false),

('Pulang', '9789792248086', 'Novel tentang eksil politik Indonesia di Paris dan perjuangan mereka mempertahankan identitas dan kenangan tanah air.',
 (SELECT id FROM categories WHERE name = 'Sejarah Indonesia'), (SELECT id FROM publishers WHERE name = 'Gramedia Pustaka Utama'), 2012, 462, 'Indonesian', 82000, 6, 4, false),

('Database Systems: Design, Implementation, and Management', '9781337627900', 'Comprehensive guide to database design and management.',
 (SELECT id FROM categories WHERE name = 'Database'), (SELECT id FROM publishers WHERE name = 'Andi Publisher'), 2019, 720, 'English', 450000, 5, 3, false),

('Introduction to Algorithms', '9780262033848', 'The definitive guide to algorithms and data structures.',
 (SELECT id FROM categories WHERE name = 'Pemrograman'), (SELECT id FROM publishers WHERE name = 'Andi Publisher'), 2009, 1312, 'English', 650000, 3, 2, false),

('Clean Code', '9780132350884', 'A handbook of agile software craftsmanship.',
 (SELECT id FROM categories WHERE name = 'Pemrograman'), (SELECT id FROM publishers WHERE name = 'Andi Publisher'), 2008, 464, 'English', 380000, 8, 6, false),

('The Pragmatic Programmer', '9780201616224', 'Your journey to mastery in software development.',
 (SELECT id FROM categories WHERE name = 'Pemrograman'), (SELECT id FROM publishers WHERE name = 'Andi Publisher'), 1999, 352, 'English', 420000, 4, 3, false),

('Sejarah Indonesia Modern', '9789792248093', 'Sejarah perkembangan Indonesia dari masa kolonial hingga reformasi.',
 (SELECT id FROM categories WHERE name = 'Sejarah Indonesia'), (SELECT id FROM publishers WHERE name = 'Gramedia Pustaka Utama'), 2015, 680, 'Indonesian', 95000, 12, 10, false),

('Filosofi Teras', '9786020633176', 'Buku yang membahas filosofi Stoikisme dan penerapannya dalam kehidupan sehari-hari.',
 (SELECT id FROM categories WHERE name = 'Non-Fiksi'), (SELECT id FROM publishers WHERE name = 'Gramedia Pustaka Utama'), 2018, 256, 'Indonesian', 58000, 20, 18, true),

('Atomic Habits', '9780735211292', 'Panduan praktis untuk membangun kebiasaan baik dan menghilangkan kebiasaan buruk.',
 (SELECT id FROM categories WHERE name = 'Non-Fiksi'), (SELECT id FROM publishers WHERE name = 'Gramedia Pustaka Utama'), 2018, 320, 'Indonesian', 75000, 25, 22, true),

('Sapiens: A Brief History of Humankind', '9780062316097', 'Sejarah singkat umat manusia dari zaman batu hingga era digital.',
 (SELECT id FROM categories WHERE name = 'Sejarah'), (SELECT id FROM publishers WHERE name = 'Gramedia Pustaka Utama'), 2014, 443, 'Indonesian', 85000, 15, 12, true),

('The Lean Startup', '9780307887894', 'Metodologi untuk membangun startup yang sukses.',
 (SELECT id FROM categories WHERE name = 'Bisnis'), (SELECT id FROM publishers WHERE name = 'Gramedia Pustaka Utama'), 2011, 336, 'Indonesian', 68000, 10, 8, false),

('Good to Great', '9780066620992', 'Mengapa beberapa perusahaan berhasil mencapai keunggulan.',
 (SELECT id FROM categories WHERE name = 'Bisnis'), (SELECT id FROM publishers WHERE name = 'Gramedia Pustaka Utama'), 2001, 300, 'Indonesian', 72000, 8, 6, false);

-- Insert Book-Author relationships (Many-to-Many)
INSERT INTO book_authors (book_id, author_id, role) VALUES
((SELECT id FROM books WHERE title = 'Laskar Pelangi'), (SELECT id FROM authors WHERE first_name = 'Andrea' AND last_name = 'Hirata'), 'author'),
((SELECT id FROM books WHERE title = 'Bumi Manusia'), (SELECT id FROM authors WHERE first_name = 'Pramoedya' AND last_name = 'Ananta Toer'), 'author'),
((SELECT id FROM books WHERE title = 'Negeri 5 Menara'), (SELECT id FROM authors WHERE first_name = 'Ahmad' AND last_name = 'Fuadi'), 'author'),
((SELECT id FROM books WHERE title = 'Ayat-Ayat Cinta'), (SELECT id FROM authors WHERE first_name = 'Habiburrahman' AND last_name = 'El Shirazy'), 'author'),
((SELECT id FROM books WHERE title = 'Perahu Kertas'), (SELECT id FROM authors WHERE first_name = 'Dee' AND last_name = 'Lestari'), 'author'),
((SELECT id FROM books WHERE title = 'Sang Pemimpi'), (SELECT id FROM authors WHERE first_name = 'Andrea' AND last_name = 'Hirata'), 'author'),
((SELECT id FROM books WHERE title = 'Ronggeng Dukuh Paruk'), (SELECT id FROM authors WHERE first_name = 'Ahmad' AND last_name = 'Tohari'), 'author'),
((SELECT id FROM books WHERE title = 'Cantik Itu Luka'), (SELECT id FROM authors WHERE first_name = 'Eka' AND last_name = 'Kurniawan'), 'author'),
((SELECT id FROM books WHERE title = 'Laut Bercerita'), (SELECT id FROM authors WHERE first_name = 'Leila' AND last_name = 'Chudori'), 'author'),
((SELECT id FROM books WHERE title = 'Pulang'), (SELECT id FROM authors WHERE first_name = 'Leila' AND last_name = 'Chudori'), 'author');

-- Insert sample borrowings
INSERT INTO borrowings (user_id, book_id, borrowed_at, due_date, status) VALUES
('550e8400-e29b-41d4-a716-446655440000', (SELECT id FROM books WHERE title = 'Laskar Pelangi'), NOW() - INTERVAL '10 days', NOW() + INTERVAL '4 days', 'active'),
('550e8400-e29b-41d4-a716-446655440000', (SELECT id FROM books WHERE title = 'Bumi Manusia'), NOW() - INTERVAL '20 days', NOW() - INTERVAL '6 days', 'overdue'),
('550e8400-e29b-41d4-a716-446655440000', (SELECT id FROM books WHERE title = 'Filosofi Teras'), NOW() - INTERVAL '30 days', NOW() - INTERVAL '16 days', 'returned');

-- Update returned_at for returned book
UPDATE borrowings SET returned_at = NOW() - INTERVAL '16 days' WHERE status = 'returned';

-- Insert sample reviews
INSERT INTO reviews (user_id, book_id, rating, title, comment) VALUES
('550e8400-e29b-41d4-a716-446655440000', (SELECT id FROM books WHERE title = 'Filosofi Teras'), 5, 'Buku yang Mengubah Hidup', 'Sangat membantu dalam menghadapi masalah sehari-hari dengan pendekatan stoik.'),
('550e8400-e29b-41d4-a716-446655440000', (SELECT id FROM books WHERE title = 'Laskar Pelangi'), 5, 'Masterpiece Indonesia', 'Novel yang sangat menginspirasi tentang pendidikan dan persahabatan.'),
('550e8400-e29b-41d4-a716-446655440000', (SELECT id FROM books WHERE title = 'Atomic Habits'), 4, 'Praktis dan Aplikatif', 'Metode yang dijelaskan mudah dipahami dan diterapkan.');

-- Insert favorites
INSERT INTO favorites (user_id, book_id) VALUES
('550e8400-e29b-41d4-a716-446655440000', (SELECT id FROM books WHERE title = 'Laskar Pelangi')),
('550e8400-e29b-41d4-a716-446655440000', (SELECT id FROM books WHERE title = 'Filosofi Teras')),
('550e8400-e29b-41d4-a716-446655440000', (SELECT id FROM books WHERE title = 'Atomic Habits'));

-- Insert reading progress
INSERT INTO reading_progress (user_id, book_id, progress_percentage, current_page, total_reading_time) VALUES
('550e8400-e29b-41d4-a716-446655440000', (SELECT id FROM books WHERE title = 'Laskar Pelangi'), 65, 344, 480),
('550e8400-e29b-41d4-a716-446655440000', (SELECT id FROM books WHERE title = 'Bumi Manusia'), 30, 160, 240),
('550e8400-e29b-41d4-a716-446655440000', (SELECT id FROM books WHERE title = 'Filosofi Teras'), 100, 256, 360);

-- Update book ratings based on reviews
UPDATE books SET 
    rating = (SELECT AVG(rating::numeric) FROM reviews WHERE book_id = books.id),
    total_ratings = (SELECT COUNT(*) FROM reviews WHERE book_id = books.id)
WHERE id IN (SELECT DISTINCT book_id FROM reviews);

-- Update user's total books borrowed
UPDATE users SET total_books_borrowed = (
    SELECT COUNT(*) FROM borrowings WHERE user_id = users.id
) WHERE id = '550e8400-e29b-41d4-a716-446655440000';

-- Display summary
SELECT 'Data seeding completed successfully!' as status;
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
SELECT 'Reading Progress', COUNT(*) FROM reading_progress;
