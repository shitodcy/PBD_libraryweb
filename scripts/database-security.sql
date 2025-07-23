-- =====================================================
-- DATABASE SECURITY
-- Final Project - Database Programming
-- =====================================================

-- =====================================================
-- CREATE USERS
-- =====================================================

-- Create three users
CREATE USER user1 WITH PASSWORD 'password123';
CREATE USER user2 WITH PASSWORD 'password456';
CREATE USER user3 WITH PASSWORD 'password789';

-- =====================================================
-- CREATE ROLES
-- =====================================================

-- Create three roles
CREATE ROLE finance;
CREATE ROLE human_dev;
CREATE ROLE warehouse;

-- =====================================================
-- GRANT TABLE PRIVILEGES TO USERS
-- =====================================================

-- Grant privileges to user1 for accessing books table
GRANT SELECT, INSERT, UPDATE ON books TO user1;
GRANT SELECT ON categories TO user1;
GRANT SELECT ON publishers TO user1;
GRANT SELECT ON authors TO user1;
GRANT SELECT ON book_authors TO user1;

-- Grant sequence privileges (needed for INSERT operations)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO user1;

-- =====================================================
-- GRANT VIEW PRIVILEGES TO USERS
-- =====================================================

-- Grant privileges to user2 for accessing book_performance_analytics view
GRANT SELECT ON book_performance_analytics TO user2;
GRANT SELECT ON user_reading_statistics TO user2;
GRANT SELECT ON active_borrowings_summary TO user2;

-- =====================================================
-- GRANT PROCEDURE PRIVILEGES TO ROLES
-- =====================================================

-- Grant execute privilege on procedure to finance role
GRANT EXECUTE ON PROCEDURE process_book_return(UUID, TIMESTAMP, NUMERIC, TEXT) TO finance;
GRANT EXECUTE ON PROCEDURE generate_monthly_report() TO finance;

-- Grant execute privilege on functions to finance role
GRANT EXECUTE ON FUNCTION get_library_statistics() TO finance;
GRANT EXECUTE ON FUNCTION calculate_user_reading_score(UUID, INTEGER) TO finance;

-- Grant table access needed by the procedures to finance role
GRANT SELECT, UPDATE ON borrowings TO finance;
GRANT SELECT, UPDATE ON books TO finance;
GRANT SELECT ON users TO finance;
GRANT INSERT ON audit_logs TO finance;
GRANT INSERT, SELECT ON monthly_reports TO finance;

-- =====================================================
-- ASSIGN ROLES TO USERS
-- =====================================================

-- Assign finance role to user3
GRANT finance TO user3;

-- Assign human_dev role to user2 (in addition to direct privileges)
GRANT human_dev TO user2;

-- Assign warehouse role to user1 (in addition to direct privileges)
GRANT warehouse TO user1;

-- =====================================================
-- ADDITIONAL ROLE PRIVILEGES
-- =====================================================

-- Grant privileges to human_dev role (for user management)
GRANT SELECT ON users TO human_dev;
GRANT SELECT ON user_reading_statistics TO human_dev;
GRANT SELECT ON borrowings TO human_dev;

-- Grant privileges to warehouse role (for inventory management)
GRANT SELECT, UPDATE ON books TO warehouse;
GRANT SELECT ON categories TO warehouse;
GRANT SELECT ON publishers TO warehouse;
GRANT SELECT ON book_search_cache TO warehouse;

-- =====================================================
-- CREATE TEST SCENARIOS
-- =====================================================

-- Create test functions to verify privileges
CREATE OR REPLACE FUNCTION test_user_privileges(username TEXT)
RETURNS TABLE(
    privilege_type TEXT,
    object_name TEXT,
    privilege TEXT,
    grantable BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'TABLE'::TEXT as privilege_type,
        table_name::TEXT as object_name,
        privilege_type::TEXT as privilege,
        is_grantable::BOOLEAN
    FROM information_schema.table_privileges 
    WHERE grantee = username
    
    UNION ALL
    
    SELECT 
        'ROUTINE'::TEXT as privilege_type,
        routine_name::TEXT as object_name,
        'EXECUTE'::TEXT as privilege,
        is_grantable::BOOLEAN
    FROM information_schema.routine_privileges 
    WHERE grantee = username;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PRIVILEGE TESTING SCRIPTS
-- =====================================================

-- Test script for user1 (should be run as user1)
-- This creates a script that can be executed to test user1's privileges

CREATE OR REPLACE FUNCTION test_user1_access()
RETURNS TEXT AS $$
DECLARE
    result TEXT := '';
    book_count INTEGER;
    test_book_id UUID;
BEGIN
    -- Test SELECT privilege on books
    BEGIN
        SELECT COUNT(*) INTO book_count FROM books;
        result := result || 'SUCCESS: Can read books table (' || book_count || ' records)' || E'\n';
    EXCEPTION WHEN OTHERS THEN
        result := result || 'FAILED: Cannot read books table - ' || SQLERRM || E'\n';
    END;
    
    -- Test INSERT privilege on books
    BEGIN
        INSERT INTO books (title, isbn, description, category_id, publisher_id, publication_year, pages, total_copies, available_copies)
        VALUES (
            'Test Book by User1',
            '9999999999999',
            'Test book inserted by user1',
            (SELECT id FROM categories LIMIT 1),
            (SELECT id FROM publishers LIMIT 1),
            2023,
            200,
            1,
            1
        ) RETURNING id INTO test_book_id;
        result := result || 'SUCCESS: Can insert into books table (ID: ' || test_book_id || ')' || E'\n';
    EXCEPTION WHEN OTHERS THEN
        result := result || 'FAILED: Cannot insert into books table - ' || SQLERRM || E'\n';
    END;
    
    -- Test UPDATE privilege on books
    BEGIN
        UPDATE books SET title = 'Updated Test Book by User1' WHERE id = test_book_id;
        result := result || 'SUCCESS: Can update books table' || E'\n';
    EXCEPTION WHEN OTHERS THEN
        result := result || 'FAILED: Cannot update books table - ' || SQLERRM || E'\n';
    END;
    
    -- Test access to restricted table (should fail)
    BEGIN
        SELECT COUNT(*) FROM borrowings;
        result := result || 'UNEXPECTED: Can access borrowings table (should be restricted)' || E'\n';
    EXCEPTION WHEN OTHERS THEN
        result := result || 'EXPECTED: Cannot access borrowings table - Access denied' || E'\n';
    END;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Test script for user2 (view access)
CREATE OR REPLACE FUNCTION test_user2_access()
RETURNS TEXT AS $$
DECLARE
    result TEXT := '';
    view_count INTEGER;
BEGIN
    -- Test SELECT privilege on book_performance_analytics view
    BEGIN
        SELECT COUNT(*) INTO view_count FROM book_performance_analytics;
        result := result || 'SUCCESS: Can read book_performance_analytics view (' || view_count || ' records)' || E'\n';
    EXCEPTION WHEN OTHERS THEN
        result := result || 'FAILED: Cannot read book_performance_analytics view - ' || SQLERRM || E'\n';
    END;
    
    -- Test SELECT privilege on user_reading_statistics view
    BEGIN
        SELECT COUNT(*) INTO view_count FROM user_reading_statistics;
        result := result || 'SUCCESS: Can read user_reading_statistics view (' || view_count || ' records)' || E'\n';
    EXCEPTION WHEN OTHERS THEN
        result := result || 'FAILED: Cannot read user_reading_statistics view - ' || SQLERRM || E'\n';
    END;
    
    -- Test access to base table (should fail)
    BEGIN
        SELECT COUNT(*) FROM books;
        result := result || 'UNEXPECTED: Can access books table directly (should be restricted)' || E'\n';
    EXCEPTION WHEN OTHERS THEN
        result := result || 'EXPECTED: Cannot access books table directly - Access denied' || E'\n';
    END;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Test script for user3 (procedure access through finance role)
CREATE OR REPLACE FUNCTION test_user3_access()
RETURNS TEXT AS $$
DECLARE
    result TEXT := '';
    stats_record RECORD;
    fine_amount NUMERIC(10,2);
    status_msg TEXT;
BEGIN
    -- Test function execution privilege
    BEGIN
        SELECT * INTO stats_record FROM get_library_statistics();
        result := result || 'SUCCESS: Can execute get_library_statistics function' || E'\n';
        result := result || '  - Total books: ' || stats_record.total_books || E'\n';
        result := result || '  - Total users: ' || stats_record.total_users || E'\n';
    EXCEPTION WHEN OTHERS THEN
        result := result || 'FAILED: Cannot execute get_library_statistics function - ' || SQLERRM || E'\n';
    END;
    
    -- Test procedure execution privilege
    BEGIN
        CALL generate_monthly_report();
        result := result || 'SUCCESS: Can execute generate_monthly_report procedure' || E'\n';
    EXCEPTION WHEN OTHERS THEN
        result := result || 'FAILED: Cannot execute generate_monthly_report procedure - ' || SQLERRM || E'\n';
    END;
    
    -- Test table access through role
    BEGIN
        SELECT COUNT(*) FROM borrowings WHERE status = 'active';
        result := result || 'SUCCESS: Can access borrowings table through finance role' || E'\n';
    EXCEPTION WHEN OTHERS THEN
        result := result || 'FAILED: Cannot access borrowings table - ' || SQLERRM || E'\n';
    END;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- EXECUTE PRIVILEGE TESTS
-- =====================================================

-- Test all users' privileges (run as superuser)
SELECT 'USER1 PRIVILEGES:' as test_section;
SELECT test_user1_access() as test_results;

SELECT 'USER2 PRIVILEGES:' as test_section;
SELECT test_user2_access() as test_results;

SELECT 'USER3 PRIVILEGES:' as test_section;
SELECT test_user3_access() as test_results;

-- =====================================================
-- DISPLAY SECURITY INFORMATION
-- =====================================================

-- Show all users
SELECT 
    usename as username,
    usesuper as is_superuser,
    usecreatedb as can_create_db,
    usebypassrls as can_bypass_rls,
    valuntil as password_expiry
FROM pg_user 
WHERE usename IN ('user1', 'user2', 'user3')
ORDER BY usename;

-- Show all roles
SELECT 
    rolname as role_name,
    rolsuper as is_superuser,
    rolinherit as can_inherit,
    rolcreaterole as can_create_role,
    rolcreatedb as can_create_db,
    rolcanlogin as can_login
FROM pg_roles 
WHERE rolname IN ('finance', 'human_dev', 'warehouse')
ORDER BY rolname;

-- Show role memberships
SELECT 
    r.rolname as role_name,
    m.rolname as member_name,
    grantor.rolname as granted_by
FROM pg_roles r
JOIN pg_auth_members am ON r.oid = am.roleid
JOIN pg_roles m ON am.member = m.oid
JOIN pg_roles grantor ON am.grantor = grantor.oid
WHERE r.rolname IN ('finance', 'human_dev', 'warehouse')
ORDER BY r.rolname, m.rolname;

-- Show table privileges
SELECT 
    grantee,
    table_schema,
    table_name,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE grantee IN ('user1', 'user2', 'user3', 'finance', 'human_dev', 'warehouse')
AND table_schema = 'public'
ORDER BY grantee, table_name, privilege_type;

-- Show routine privileges
SELECT 
    grantee,
    routine_schema,
    routine_name,
    privilege_type,
    is_grantable
FROM information_schema.routine_privileges 
WHERE grantee IN ('user1', 'user2', 'user3', 'finance', 'human_dev', 'warehouse')
AND routine_schema = 'public'
ORDER BY grantee, routine_name;

-- Show column privileges (if any)
SELECT 
    grantee,
    table_schema,
    table_name,
    column_name,
    privilege_type,
    is_grantable
FROM information_schema.column_privileges 
WHERE grantee IN ('user1', 'user2', 'user3', 'finance', 'human_dev', 'warehouse')
AND table_schema = 'public'
ORDER BY grantee, table_name, column_name;

-- =====================================================
-- SECURITY BEST PRACTICES DEMONSTRATION
-- =====================================================

-- Create a function to check current user privileges
CREATE OR REPLACE FUNCTION check_current_user_privileges()
RETURNS TABLE(
    current_user_name TEXT,
    current_role TEXT,
    session_user_name TEXT,
    has_superuser_privilege BOOLEAN,
    can_create_db BOOLEAN,
    can_create_role BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CURRENT_USER::TEXT,
        CURRENT_ROLE::TEXT,
        SESSION_USER::TEXT,
        (SELECT usesuper FROM pg_user WHERE usename = CURRENT_USER),
        (SELECT usecreatedb FROM pg_user WHERE usename = CURRENT_USER),
        (SELECT usecreaterole FROM pg_user WHERE usename = CURRENT_USER);
END;
$$ LANGUAGE plpgsql;

-- Show current session information
SELECT * FROM check_current_user_privileges();

-- =====================================================
-- CLEANUP AND SECURITY NOTES
-- =====================================================

/*
SECURITY IMPLEMENTATION SUMMARY:

1. USERS CREATED:
   - user1: Has table-level privileges on books and related tables
   - user2: Has view-level privileges on reporting views
   - user3: Has procedure execution privileges through finance role

2. ROLES CREATED:
   - finance: Can execute financial procedures and access related tables
   - human_dev: Can access user-related information and statistics
   - warehouse: Can manage inventory and book-related data

3. PRIVILEGE DISTRIBUTION:
   - Table privileges: user1 can SELECT, INSERT, UPDATE on books
   - View privileges: user2 can SELECT on analytical views
   - Procedure privileges: finance role can execute stored procedures
   - Role assignments: user3 has finance role privileges

4. SECURITY TESTING:
   - Created test functions to verify each user's access
   - Demonstrated both allowed and restricted operations
   - Showed privilege inheritance through roles

5. BEST PRACTICES IMPLEMENTED:
   - Principle of least privilege
   - Role-based access control
   - Separation of duties
   - Audit trail through privilege checking functions
*/
