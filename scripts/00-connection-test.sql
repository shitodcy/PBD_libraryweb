-- =====================================================
-- CONNECTION TEST AND SETUP VERIFICATION
-- Final Project - Database Programming
-- =====================================================

-- Test basic connection
SELECT 
    current_database() as database_name,
    current_user as current_user,
    version() as postgresql_version,
    now() as current_timestamp;

-- Check if we can create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Verify extension is installed
SELECT 
    extname as extension_name,
    extversion as version
FROM pg_extension 
WHERE extname = 'uuid-ossp';

-- Test UUID generation
SELECT uuid_generate_v4() as test_uuid;

-- Check current schema
SELECT current_schema();

-- List existing tables (should be mostly empty for new database)
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check if auth schema exists (Supabase specific)
SELECT schema_name 
FROM information_schema.schemata 
WHERE schema_name = 'auth';

-- If auth schema exists, check auth.users table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'auth') THEN
        RAISE NOTICE 'Auth schema exists - Supabase is properly configured';
        
        -- Check if auth.users table exists
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
            RAISE NOTICE 'Auth.users table exists - ready for user management';
        ELSE
            RAISE NOTICE 'Auth.users table not found - may need Supabase setup';
        END IF;
    ELSE
        RAISE NOTICE 'Auth schema not found - this may not be a Supabase database';
    END IF;
END $$;

-- Display connection success message
SELECT 'Database connection successful! Ready to proceed with schema creation.' as status;
