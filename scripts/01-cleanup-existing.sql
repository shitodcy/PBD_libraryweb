-- =====================================================
-- CLEANUP EXISTING TABLES (IF ANY)
-- Final Project - Database Programming
-- =====================================================

-- This script safely removes existing tables if they exist
-- Run this only if you want to start fresh

-- Drop tables in correct order (reverse of creation due to foreign keys)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS book_search_cache CASCADE;
DROP TABLE IF EXISTS monthly_reports CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS deleted_books_archive CASCADE;
DROP TABLE IF EXISTS book_authors CASCADE;
DROP TABLE IF EXISTS reading_progress CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS borrowings CASCADE;
DROP TABLE IF EXISTS books CASCADE;
DROP TABLE IF EXISTS authors CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS publishers CASCADE;

-- Drop views if they exist
DROP VIEW IF EXISTS premium_featured_books CASCADE;
DROP VIEW IF EXISTS featured_popular_books CASCADE;
DROP VIEW IF EXISTS popular_books CASCADE;
DROP VIEW IF EXISTS book_performance_analytics CASCADE;
DROP VIEW IF EXISTS user_reading_statistics CASCADE;
DROP VIEW IF EXISTS book_details_summary CASCADE;
DROP VIEW IF EXISTS active_borrowings_summary CASCADE;

-- Drop functions if they exist
DROP FUNCTION IF EXISTS test_user_privileges(TEXT) CASCADE;
DROP FUNCTION IF EXISTS test_user3_access() CASCADE;
DROP FUNCTION IF EXISTS test_user2_access() CASCADE;
DROP FUNCTION IF EXISTS test_user1_access() CASCADE;
DROP FUNCTION IF EXISTS check_current_user_privileges() CASCADE;
DROP FUNCTION IF EXISTS calculate_user_reading_score(UUID, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS get_library_statistics() CASCADE;

-- Drop procedures if they exist
DROP PROCEDURE IF EXISTS process_book_return(UUID, TIMESTAMP, NUMERIC, TEXT) CASCADE;
DROP PROCEDURE IF EXISTS generate_monthly_report() CASCADE;

-- Drop trigger functions if they exist
DROP FUNCTION IF EXISTS cleanup_after_book_deletion() CASCADE;
DROP FUNCTION IF EXISTS prevent_book_deletion_with_active_borrowings() CASCADE;
DROP FUNCTION IF EXISTS monitor_book_availability() CASCADE;
DROP FUNCTION IF EXISTS track_book_rating_changes() CASCADE;
DROP FUNCTION IF EXISTS update_category_stats_after_book_insert() CASCADE;
DROP FUNCTION IF EXISTS validate_and_generate_book_data() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Drop roles if they exist (be careful with this in production)
DROP ROLE IF EXISTS user1;
DROP ROLE IF EXISTS user2;
DROP ROLE IF EXISTS user3;
DROP ROLE IF EXISTS finance;
DROP ROLE IF EXISTS human_dev;
DROP ROLE IF EXISTS warehouse;

-- Display cleanup completion message
SELECT 'Cleanup completed! Database is ready for fresh installation.' as status;
