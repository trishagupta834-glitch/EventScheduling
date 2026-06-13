DO $$
BEGIN
    IF to_regclass('public.viewers') IS NOT NULL AND to_regclass('public.users') IS NULL THEN
        ALTER TABLE viewers RENAME TO users;
    ELSIF to_regclass('public.viewers') IS NOT NULL AND to_regclass('public.users') IS NOT NULL THEN
        INSERT INTO users (id, created_at, email, full_name, password, phone_no, role, status, username)
        SELECT id, created_at, email, full_name, password, phone_no, role, status, username
        FROM viewers
        ON CONFLICT (id) DO NOTHING;
    END IF;

    IF to_regclass('public.users') IS NOT NULL THEN
        IF EXISTS (
            SELECT 1
            FROM pg_constraint
            WHERE conname = 'viewers_pkey'
              AND conrelid = 'public.users'::regclass
        ) THEN
            ALTER TABLE users RENAME CONSTRAINT viewers_pkey TO users_pkey;
        END IF;

        -- Store roles as numeric codes: user=1, admin=2, manager=3.
        ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

        IF EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'users'
              AND column_name = 'role'
              AND data_type <> 'integer'
        ) THEN
            ALTER TABLE users
            ALTER COLUMN role TYPE integer
            USING CASE role
                WHEN 'ROLE_USER' THEN 1
                WHEN 'ROLE_ADMIN' THEN 2
                WHEN 'ROLE_MANAGER' THEN 3
                WHEN '1' THEN 1
                WHEN '2' THEN 2
                WHEN '3' THEN 3
                ELSE NULL
            END;
        END IF;

        IF NOT EXISTS (
            SELECT 1
            FROM pg_constraint
            WHERE conname = 'users_role_check'
              AND conrelid = 'public.users'::regclass
        ) THEN
            ALTER TABLE users
            ADD CONSTRAINT users_role_check CHECK (role IN (1, 2, 3));
        END IF;
    END IF;
EXCEPTION
    WHEN duplicate_table OR duplicate_object THEN
        NULL;
END $$;
