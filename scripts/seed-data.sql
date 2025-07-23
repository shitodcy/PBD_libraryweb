-- Seed data for library system

-- Insert sample books
INSERT INTO books (title, author, description, category, isbn, publication_year, pages, cover_url, total_copies, available_copies, rating, featured) VALUES
('Laskar Pelangi', 'Andrea Hirata', 'Novel yang mengisahkan tentang perjuangan anak-anak Belitung untuk mendapatkan pendidikan di sekolah Muhammadiyah yang hampir roboh.', 'Fiksi', '9789792248000', 2005, 529, '/placeholder.svg?height=300&width=200&text=Laskar+Pelangi', 5, 4, 4.8, true),

('Bumi Manusia', 'Pramoedya Ananta Toer', 'Novel pertama dari Tetralogi Buru yang mengisahkan kehidupan di masa kolonial Belanda melalui tokoh Minke.', 'Sejarah', '9789799731240', 1980, 535, '/placeholder.svg?height=300&width=200&text=Bumi+Manusia', 3, 2, 4.9, true),

('Negeri 5 Menara', 'Ahmad Fuadi', 'Kisah inspiratif tentang perjuangan santri di Pondok Modern Darussalam Gontor dalam mengejar mimpi dan cita-cita.', 'Biografi', '9789792248017', 2009, 423, '/placeholder.svg?height=300&width=200&text=Negeri+5+Menara', 4, 0, 4.7, true),

('Ayat-Ayat Cinta', 'Habiburrahman El Shirazy', 'Novel yang mengisahkan perjalanan spiritual seorang mahasiswa Indonesia di Mesir dalam mencari cinta sejati.', 'Religi', '9789792248024', 2004, 418, '/placeholder.svg?height=300&width=200&text=Ayat+Ayat+Cinta', 6, 5, 4.6, true),

('Perahu Kertas', 'Dee Lestari', 'Novel tentang perjalanan cinta dan mimpi dua anak muda Jakarta yang bertemu dalam keadaan tak terduga.', 'Romance', '9789792248031', 2009, 456, '/placeholder.svg?height=300&width=200&text=Perahu+Kertas', 3, 3, 4.5, false),

('Sang Pemimpi', 'Andrea Hirata', 'Sekuel dari Laskar Pelangi yang mengisahkan perjuangan melanjutkan pendidikan ke jenjang yang lebih tinggi.', 'Fiksi', '9789792248048', 2006, 292, '/placeholder.svg?height=300&width=200&text=Sang+Pemimpi', 4, 4, 4.4, false),

('Ronggeng Dukuh Paruk', 'Ahmad Tohari', 'Novel yang mengisahkan kehidupan seorang ronggeng di desa Dukuh Paruk dan konflik sosial yang melingkupinya.', 'Fiksi', '9789792248055', 1982, 320, '/placeholder.svg?height=300&width=200&text=Ronggeng+Dukuh+Paruk', 2, 2, 4.3, false),

('Cantik Itu Luka', 'Eka Kurniawan', 'Novel yang menggabungkan realisme magis dengan sejarah Indonesia, mengisahkan kehidupan keluarga Dewi Ayu.', 'Fiksi', '9789792248062', 2002, 520, '/placeholder.svg?height=300&width=200&text=Cantik+Itu+Luka', 3, 1, 4.6, false),

('Laut Bercerita', 'Leila S. Chudori', 'Novel yang mengisahkan tentang aktivis mahasiswa yang hilang pada masa Orde Baru dan dampaknya terhadap keluarga.', 'Sejarah', '9789792248079', 2017, 394, '/placeholder.svg?height=300&width=200&text=Laut+Bercerita', 5, 3, 4.7, false),

('Pulang', 'Leila S. Chudori', 'Novel tentang eksil politik Indonesia di Paris dan perjuangan mereka mempertahankan identitas dan kenangan tanah air.', 'Sejarah', '9789792248086', 2012, 462, '/placeholder.svg?height=300&width=200&text=Pulang', 2, 2, 4.5, false),

('Filosofi Teras', 'Henry Manampiring', 'Buku yang membahas filosofi Stoikisme dan penerapannya dalam kehidupan sehari-hari untuk mencapai kebahagiaan.', 'Filosofi', '9789792248093', 2018, 256, '/placeholder.svg?height=300&width=200&text=Filosofi+Teras', 8, 6, 4.8, false),

('Atomic Habits', 'James Clear', 'Panduan praktis untuk membangun kebiasaan baik dan menghilangkan kebiasaan buruk melalui perubahan kecil yang konsisten.', 'Self-Help', '9789792248100', 2018, 320, '/placeholder.svg?height=300&width=200&text=Atomic+Habits', 10, 8, 4.9, false);

-- Insert sample user (this will be created automatically when users register through Supabase Auth)
-- The trigger will handle user profile creation

-- Insert sample reviews
INSERT INTO reviews (user_id, book_id, rating, comment) VALUES
-- Note: These will need actual user IDs from auth.users after users register
-- For now, we'll leave this empty and populate after user registration

-- Insert sample favorites
-- This will also be populated after users register and interact with the system

-- Insert sample reading progress
-- This will be populated as users read books

-- Update book ratings based on reviews (this would normally be done via triggers)
-- For now, we've set static ratings in the books insert above
