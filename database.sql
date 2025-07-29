

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."create_book_with_authors"("title_arg" "text", "publication_year_arg" integer, "category_id_arg" "uuid", "publisher_id_arg" "uuid", "author_ids_arg" "uuid"[]) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    -- Variabel untuk menampung ID buku yang baru dibuat
    new_book_id UUID;
    author_id_item UUID;
BEGIN
    -- 1. Masukkan data buku baru ke tabel 'books' dan simpan ID-nya
    INSERT INTO public.books (title, publication_year, category_id, publisher_id)
    VALUES (title_arg, publication_year_arg, category_id_arg, publisher_id_arg)
    RETURNING id INTO new_book_id;

    -- 2. Loop melalui setiap ID penulis yang diberikan
    FOREACH author_id_item IN ARRAY author_ids_arg
    LOOP
        -- Masukkan hubungan antara buku baru dan penulis ke tabel penghubung
        INSERT INTO public.book_authors (book_id, author_id)
        VALUES (new_book_id, author_id_item);
    END LOOP;
END;
$$;


ALTER FUNCTION "public"."create_book_with_authors"("title_arg" "text", "publication_year_arg" integer, "category_id_arg" "uuid", "publisher_id_arg" "uuid", "author_ids_arg" "uuid"[]) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  insert into public.profiles (id, name, role)
  values (new.id, new.email, 'member');
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."audit_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "action" "text" NOT NULL,
    "table_name" "text" NOT NULL,
    "record_id" "uuid",
    "user_id" "uuid",
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."audit_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."authors" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text",
    "biography" "text",
    "nationality" character varying(100)
);


ALTER TABLE "public"."authors" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."book_authors" (
    "book_id" "uuid" NOT NULL,
    "author_id" "uuid" NOT NULL
);


ALTER TABLE "public"."book_authors" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."books" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text",
    "isbn" "text",
    "category_id" "uuid",
    "publisher_id" "uuid",
    "publication_year" integer DEFAULT 2000,
    "pages" integer DEFAULT 0,
    "stock_quantity" integer DEFAULT 0,
    "description" "text",
    "available_quantity" integer DEFAULT 1,
    "user_id" "uuid"
);


ALTER TABLE "public"."books" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."borrowings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "book_id" "uuid",
    "borrow_date" "date" NOT NULL,
    "return_date" "date",
    "status" "text" DEFAULT 'borrowed'::"text",
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."borrowings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "parent_id" "uuid",
    "created_at" timestamp without time zone DEFAULT "now"(),
    "description" "text",
    "category_description" "text"
);


ALTER TABLE "public"."categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."favorites" (
    "user_id" "uuid" NOT NULL,
    "book_id" "uuid" NOT NULL
);


ALTER TABLE "public"."favorites" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "name" "text",
    "role" "text" DEFAULT 'member'::"text",
    "created_at" timestamp without time zone DEFAULT "now"(),
    CONSTRAINT "profiles_role_check" CHECK (("role" = ANY (ARRAY['admin'::"text", 'member'::"text"])))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."publishers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"(),
    "address" "text",
    "email" character varying(100)
);


ALTER TABLE "public"."publishers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reading_progress" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "book_id" "uuid",
    "progress_percent" integer DEFAULT 0,
    "updated_at" timestamp without time zone DEFAULT "now"(),
    CONSTRAINT "reading_progress_progress_percent_check" CHECK ((("progress_percent" >= 0) AND ("progress_percent" <= 100)))
);


ALTER TABLE "public"."reading_progress" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reviews" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "book_id" "uuid",
    "rating" integer DEFAULT 1,
    "comment" "text",
    "created_at" timestamp without time zone DEFAULT "now"(),
    CONSTRAINT "reviews_rating_check" CHECK ((("rating" >= 1) AND ("rating" <= 5)))
);


ALTER TABLE "public"."reviews" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."users" OWNER TO "postgres";


ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."authors"
    ADD CONSTRAINT "authors_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."book_authors"
    ADD CONSTRAINT "book_authors_pkey" PRIMARY KEY ("book_id", "author_id");



ALTER TABLE ONLY "public"."books"
    ADD CONSTRAINT "books_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."borrowings"
    ADD CONSTRAINT "borrowings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."favorites"
    ADD CONSTRAINT "favorites_pkey" PRIMARY KEY ("user_id", "book_id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."publishers"
    ADD CONSTRAINT "publishers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reading_progress"
    ADD CONSTRAINT "reading_progress_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_favorites_user_id" ON "public"."favorites" USING "btree" ("user_id");



CREATE INDEX "idx_reading_progress_user_id" ON "public"."reading_progress" USING "btree" ("user_id");



ALTER TABLE ONLY "public"."books"
    ADD CONSTRAINT "books_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id");



ALTER TABLE ONLY "public"."books"
    ADD CONSTRAINT "books_publisher_id_fkey" FOREIGN KEY ("publisher_id") REFERENCES "public"."publishers"("id");



ALTER TABLE ONLY "public"."books"
    ADD CONSTRAINT "books_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."borrowings"
    ADD CONSTRAINT "borrowings_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."borrowings"
    ADD CONSTRAINT "borrowings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."favorites"
    ADD CONSTRAINT "favorites_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."favorites"
    ADD CONSTRAINT "favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."book_authors"
    ADD CONSTRAINT "fk_author" FOREIGN KEY ("author_id") REFERENCES "public"."authors"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."book_authors"
    ADD CONSTRAINT "fk_book" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reading_progress"
    ADD CONSTRAINT "reading_progress_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reading_progress"
    ADD CONSTRAINT "reading_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Deny all access by default" ON "public"."users" USING (false);



CREATE POLICY "No access by default" ON "public"."audit_logs" USING (false);



CREATE POLICY "No access by default" ON "public"."authors" USING (false);



CREATE POLICY "Publishers can be viewed by authenticated users" ON "public"."publishers" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "User can read their own profile" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can delete own books" ON "public"."books" FOR DELETE USING (true);



CREATE POLICY "Users can delete own reviews" ON "public"."reviews" FOR DELETE USING (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users can delete their own favorites" ON "public"."favorites" FOR DELETE USING (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users can insert books" ON "public"."books" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can insert own reviews" ON "public"."reviews" FOR INSERT WITH CHECK (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users can insert their own favorites" ON "public"."favorites" FOR INSERT WITH CHECK (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users can only delete their own borrowings" ON "public"."borrowings" FOR DELETE USING (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users can only insert their own borrowings" ON "public"."borrowings" FOR INSERT WITH CHECK (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users can only see their own borrowings" ON "public"."borrowings" FOR SELECT USING (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users can only see their own reading progress" ON "public"."reading_progress" USING (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users can only update their own borrowings" ON "public"."borrowings" FOR UPDATE USING (("user_id" = ( SELECT "auth"."uid"() AS "uid"))) WITH CHECK (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users can update own books" ON "public"."books" FOR UPDATE USING (true);



CREATE POLICY "Users can update own reviews" ON "public"."reviews" FOR UPDATE USING (("user_id" = ( SELECT "auth"."uid"() AS "uid"))) WITH CHECK (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users can view own books" ON "public"."books" FOR SELECT USING (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users can view own reviews" ON "public"."reviews" FOR SELECT USING (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users can view their own favorites" ON "public"."favorites" FOR SELECT USING (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."create_book_with_authors"("title_arg" "text", "publication_year_arg" integer, "category_id_arg" "uuid", "publisher_id_arg" "uuid", "author_ids_arg" "uuid"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."create_book_with_authors"("title_arg" "text", "publication_year_arg" integer, "category_id_arg" "uuid", "publisher_id_arg" "uuid", "author_ids_arg" "uuid"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_book_with_authors"("title_arg" "text", "publication_year_arg" integer, "category_id_arg" "uuid", "publisher_id_arg" "uuid", "author_ids_arg" "uuid"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";


















GRANT ALL ON TABLE "public"."audit_logs" TO "anon";
GRANT ALL ON TABLE "public"."audit_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."audit_logs" TO "service_role";



GRANT ALL ON TABLE "public"."authors" TO "anon";
GRANT ALL ON TABLE "public"."authors" TO "authenticated";
GRANT ALL ON TABLE "public"."authors" TO "service_role";



GRANT ALL ON TABLE "public"."book_authors" TO "anon";
GRANT ALL ON TABLE "public"."book_authors" TO "authenticated";
GRANT ALL ON TABLE "public"."book_authors" TO "service_role";



GRANT ALL ON TABLE "public"."books" TO "anon";
GRANT ALL ON TABLE "public"."books" TO "authenticated";
GRANT ALL ON TABLE "public"."books" TO "service_role";



GRANT ALL ON TABLE "public"."borrowings" TO "anon";
GRANT ALL ON TABLE "public"."borrowings" TO "authenticated";
GRANT ALL ON TABLE "public"."borrowings" TO "service_role";



GRANT ALL ON TABLE "public"."categories" TO "anon";
GRANT ALL ON TABLE "public"."categories" TO "authenticated";
GRANT ALL ON TABLE "public"."categories" TO "service_role";



GRANT ALL ON TABLE "public"."favorites" TO "anon";
GRANT ALL ON TABLE "public"."favorites" TO "authenticated";
GRANT ALL ON TABLE "public"."favorites" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."publishers" TO "anon";
GRANT ALL ON TABLE "public"."publishers" TO "authenticated";
GRANT ALL ON TABLE "public"."publishers" TO "service_role";



GRANT ALL ON TABLE "public"."reading_progress" TO "anon";
GRANT ALL ON TABLE "public"."reading_progress" TO "authenticated";
GRANT ALL ON TABLE "public"."reading_progress" TO "service_role";



GRANT ALL ON TABLE "public"."reviews" TO "anon";
GRANT ALL ON TABLE "public"."reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."reviews" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























RESET ALL;
