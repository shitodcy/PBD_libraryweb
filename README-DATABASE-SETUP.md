# 📊 Database Setup Guide - Final Project

## 🚀 Quick Setup Instructions

### 1. **Environment Configuration**

1. Copy your Supabase credentials:
   - Go to your Supabase project dashboard
   - Navigate to Settings > API
   - Copy the Project URL and anon/service_role keys

2. Update `.env.local` file:
   \`\`\`env
   NEXT_PUBLIC_SUPABASE_URL=https://rvufzybskxwtmbltcslb.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.rvufzybskxwtmbltcslb.supabase.co:5432/postgres
   \`\`\`

### 2. **Database Script Execution Order**

Execute these scripts in the **exact order** using Supabase SQL Editor:

\`\`\`sql
-- 1. Test connection
scripts/00-connection-test.sql

-- 2. Clean existing data (optional)
scripts/01-cleanup-existing.sql

-- 3. Create comprehensive schema
scripts/comprehensive-database-schema.sql

-- 4. Seed initial data
scripts/seed-comprehensive-data.sql

-- 5. Generate large dataset for testing
scripts/generate-large-dataset.sql

-- 6. Create functions and procedures
scripts/functions-procedures.sql

-- 7. Create triggers
scripts/triggers.sql

-- 8. Create indexes
scripts/indexes.sql

-- 9. Create views
scripts/views.sql

-- 10. Setup security
scripts/database-security.sql
\`\`\`

### 3. **Verification Steps**

After running all scripts, verify the setup:

\`\`\`sql
-- Check table count
SELECT 
    schemaname,
    COUNT(*) as table_count
FROM pg_tables 
WHERE schemaname = 'public'
GROUP BY schemaname;

-- Check data count
SELECT 
    'Books' as entity, COUNT(*) as count FROM books
UNION ALL
SELECT 'Categories', COUNT(*) FROM categories
UNION ALL
SELECT 'Authors', COUNT(*) FROM authors
UNION ALL
SELECT 'Publishers', COUNT(*) FROM publishers
UNION ALL
SELECT 'Users', COUNT(*) FROM users;

-- Test functions
SELECT * FROM get_library_statistics();

-- Test views
SELECT COUNT(*) FROM active_borrowings_summary;
\`\`\`

### 4. **Web Application Setup**

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Start development server:
   \`\`\`bash
   npm run dev
   \`\`\`

3. Access admin panel:
   \`\`\`
   http://localhost:3000/admin
   \`\`\`

## 📋 **Database Schema Overview**

### **Tables (11 total)**
- `publishers` - Publisher information
- `categories` - Book categories (hierarchical)
- `authors` - Author details
- `users` - Library users (extends Supabase auth)
- `books` - Main book catalog
- `book_authors` - Many-to-many book-author relationships
- `borrowings` - Book borrowing records
- `reviews` - Book reviews and ratings
- `favorites` - User favorite books
- `reading_progress` - Reading progress tracking
- `audit_logs` - System audit trail

### **Relationships**
- **One-to-One**: User ↔ Reading Progress (per book)
- **One-to-Many**: Publisher → Books, Category → Books, User → Borrowings
- **Many-to-Many**: Books ↔ Authors, Users ↔ Books (favorites)

### **Functions & Procedures**
- `get_library_statistics()` - Library statistics
- `calculate_user_reading_score(user_id, months)` - User reading score
- `generate_monthly_report()` - Monthly reporting
- `process_book_return(borrowing_id, return_date)` - Book return processing

### **Triggers**
- Book validation and auto-generation
- Category statistics updates
- Rating change tracking
- Availability monitoring
- Deletion protection
- Data cleanup and archiving

### **Views**
- `active_borrowings_summary` - Active borrowing overview
- `book_details_summary` - Available book details
- `popular_books` → `featured_popular_books` → `premium_featured_books` (nested views)
- `user_reading_statistics` - User reading analytics
- `book_performance_analytics` - Book performance metrics

### **Security**
- **Users**: user1, user2, user3 with different privileges
- **Roles**: finance, human_dev, warehouse
- **Privileges**: Table, view, and procedure access control

## 🔧 **Troubleshooting**

### Common Issues:

1. **Connection Failed**
   - Verify password in connection string
   - Check Supabase project status
   - Ensure IP is whitelisted

2. **Permission Denied**
   - Use service_role key for admin operations
   - Check RLS policies in Supabase

3. **Script Execution Errors**
   - Run scripts in exact order
   - Check for syntax errors
   - Verify dependencies exist

4. **Missing Data**
   - Ensure seed scripts completed successfully
   - Check foreign key constraints
   - Verify UUID extension is installed

## 📊 **Expected Results**

After successful setup:
- **5000+** books in database
- **200+** authors
- **50+** publishers
- **30+** categories
- **10000+** borrowing records
- **15000+** reviews
- **Full CRUD** operations via web interface
- **Complete audit trail** of all operations

## 🎯 **Final Project Requirements Met**

✅ **Database with 5+ tables** (11 tables created)  
✅ **Each table with 5+ rows** (Thousands of records)  
✅ **One-to-one relationships** (User ↔ Reading Progress)  
✅ **One-to-many relationships** (Publisher → Books, etc.)  
✅ **Many-to-many relationships** (Books ↔ Authors)  
✅ **Functions** (2 functions with different parameter types)  
✅ **Procedures** (2 procedures with IN/OUT parameters)  
✅ **Triggers** (6 triggers covering all event types)  
✅ **Indexes** (3 different creation methods)  
✅ **Views** (3 types including nested views)  
✅ **Database Security** (Users, roles, privileges)  
✅ **Web-based CRUD** (Full admin interface)  

## 🚀 **Next Steps**

1. Run all database scripts
2. Test web interface functionality
3. Verify all CRUD operations
4. Generate sample reports
5. Document any customizations needed

Your database is now ready for comprehensive testing and demonstration!
