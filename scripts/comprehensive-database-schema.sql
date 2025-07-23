-- =====================================================
-- COMPREHENSIVE LIBRARY DATABASE SCHEMA
-- Final Project - Database Programming
-- =====================================================

-- Drop existing tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS book_authors;
DROP TABLE IF EXISTS reading_progress;
DROP TABLE IF EXISTS favorites;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS borrowings;
DROP TABLE IF EXISTS books;
DROP TABLE IF EXISTS authors;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS publishers;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE CREATION
-- =====================================================

-- 1. PUBLISHERS TABLE (Independent table)
CREATE TABLE publishers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(100),
    website VARCHAR(255),
    established_year INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CATEGORIES TABLE (Independent table)
CREATE TABLE categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    parent_category_id UUID REFERENCES categories(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. AUTHORS TABLE (Independent table)
CREATE TABLE authors (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    birth_date DATE,
    nationality VARCHAR(50),
    biography TEXT,
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. USERS TABLE (extends Supabase auth.users)
CREATE TABLE users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(10),
    address TEXT,
    membership_type VARCHAR(20) DEFAULT 'basic' CHECK (membership_type IN ('basic', 'premium', 'vip')),
    membership_expires DATE,
    total_books_borrowed INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. BOOKS TABLE (References publishers and categories)
CREATE TABLE books (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    isbn VARCHAR(20) UNIQUE,
    description TEXT,
    category_id UUID REFERENCES categories(id),
    publisher_id UUID REFERENCES publishers(id),
    publication_year INTEGER,
    pages INTEGER,
    language VARCHAR(50) DEFAULT 'Indonesian',
    cover_url TEXT,
    pdf_url TEXT,
    total_copies INTEGER DEFAULT 1,
    available_copies INTEGER DEFAULT 1,
    rating DECIMAL(3,2) DEFAULT 0,
    total_ratings INTEGER DEFAULT 0,
    featured BOOLEAN DEFAULT FALSE,
    price DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT check_copies CHECK (available_copies <= total_copies),
    CONSTRAINT check_rating CHECK (rating >= 0 AND rating <= 5),
    CONSTRAINT check_pages CHECK (pages > 0),
    CONSTRAINT check_year CHECK (publication_year > 1000 AND publication_year <= EXTRACT(YEAR FROM NOW()))
);

-- 6. BOOK_AUTHORS TABLE (Many-to-Many relationship between books and authors)
CREATE TABLE book_authors (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    author_id UUID REFERENCES authors(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'author' CHECK (role IN ('author', 'co-author', 'editor', 'translator')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint to prevent duplicate book-author combinations
    UNIQUE(book_id, author_id, role)
);

-- 7. BORROWINGS TABLE (One-to-Many: User -> Borrowings, Book -> Borrowings)
CREATE TABLE borrowings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    borrowed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    returned_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'returned', 'overdue', 'lost')),
    fine_amount DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. REVIEWS TABLE (One-to-Many: User -> Reviews, Book -> Reviews)
CREATE TABLE reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    helpful_votes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- One review per user per book
    UNIQUE(user_id, book_id)
);

-- 9. FAVORITES TABLE (Many-to-Many relationship between users and books)
CREATE TABLE favorites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint to prevent duplicate favorites
    UNIQUE(user_id, book_id)
);

-- 10. READING_PROGRESS TABLE (One-to-One: User-Book combination)
CREATE TABLE reading_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    current_page INTEGER DEFAULT 1,
    total_reading_time INTEGER DEFAULT 0, -- in minutes
    last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- One progress record per user per book
    UNIQUE(user_id, book_id)
);

-- 11. AUDIT_LOGS TABLE (For tracking all database changes)
CREATE TABLE audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    table_name VARCHAR(50) NOT NULL,
    operation VARCHAR(10) NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    user_id UUID,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Primary indexes (automatically created for primary keys and unique constraints)

-- Secondary indexes for frequently queried columns
CREATE INDEX idx_books_title ON books(title);
CREATE INDEX idx_books_category_id ON books(category_id);
CREATE INDEX idx_books_publisher_id ON books(publisher_id);
CREATE INDEX idx_books_publication_year ON books(publication_year);
CREATE INDEX idx_books_rating ON books(rating DESC);
CREATE INDEX idx_books_featured ON books(featured) WHERE featured = true;

-- Composite indexes
CREATE INDEX idx_books_category_rating ON books(category_id, rating DESC);
CREATE INDEX idx_books_available_featured ON books(available_copies, featured) WHERE available_copies > 0;

-- Borrowings indexes
CREATE INDEX idx_borrowings_user_id ON borrowings(user_id);
CREATE INDEX idx_borrowings_book_id ON borrowings(book_id);
CREATE INDEX idx_borrowings_status ON borrowings(status);
CREATE INDEX idx_borrowings_due_date ON borrowings(due_date) WHERE status = 'active';

-- Reviews indexes
CREATE INDEX idx_reviews_book_id ON reviews(book_id);
CREATE INDEX idx_reviews_rating ON reviews(rating DESC);

-- Full-text search indexes
CREATE INDEX idx_books_title_search ON books USING gin(to_tsvector('indonesian', title));
CREATE INDEX idx_books_description_search ON books USING gin(to_tsvector('indonesian', description));

-- Audit logs indexes
CREATE INDEX idx_audit_logs_table_operation ON audit_logs(table_name, operation);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- =====================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_publishers_updated_at BEFORE UPDATE ON publishers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_authors_updated_at BEFORE UPDATE ON authors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON books
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_borrowings_updated_at BEFORE UPDATE ON borrowings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reading_progress_updated_at BEFORE UPDATE ON reading_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SUMMARY OF RELATIONSHIPS
-- =====================================================

/*
RELATIONSHIP SUMMARY:

1. ONE-TO-ONE:
   - users ↔ reading_progress (per book)
   - Each user can have one reading progress record per book

2. ONE-TO-MANY:
   - categories → categories (self-referencing for subcategories)
   - publishers → books
   - categories → books
   - users → borrowings
   - users → reviews
   - books → borrowings
   - books → reviews

3. MANY-TO-MANY:
   - books ↔ authors (through book_authors table)
   - users ↔ books (through favorites table)

TABLES COUNT: 11 tables
- publishers (independent)
- categories (self-referencing)
- authors (independent)
- users (references auth.users)
- books (references publishers, categories)
- book_authors (junction table)
- borrowings (references users, books)
- reviews (references users, books)
- favorites (junction table)
- reading_progress (references users, books)
- audit_logs (for auditing)
*/
