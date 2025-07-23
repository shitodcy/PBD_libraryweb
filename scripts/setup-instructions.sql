-- SETUP INSTRUCTIONS FOR SUPABASE DATABASE
-- 
-- Follow these steps to set up your Supabase database:
--
-- 1. Create a new project at https://supabase.com
-- 2. Go to SQL Editor in your Supabase dashboard
-- 3. Run the database-schema.sql script first
-- 4. Then run the seed-data.sql script
-- 5. Set up your environment variables in your project:
--    - NEXT_PUBLIC_SUPABASE_URL (from Settings > API)
--    - NEXT_PUBLIC_SUPABASE_ANON_KEY (from Settings > API)
--    - SUPABASE_SERVICE_ROLE_KEY (from Settings > API)
--
-- After completing these steps, restart your development server
-- and the website will automatically switch from demo mode to full functionality.

-- You can also check if your database is set up correctly by running:
SELECT 'Database setup complete!' as status;
SELECT COUNT(*) as book_count FROM books;
SELECT COUNT(*) as user_count FROM auth.users;
