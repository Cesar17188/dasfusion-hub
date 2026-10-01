-- ==============================================================================
-- Migration: Ensure New Registrations Receive 'client' Role in Supabase
-- Target DB: Supabase (PostgreSQL)
-- ==============================================================================

-- 1. Ensure 'role' column exists in public.profiles with default 'client'
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'profiles' 
          AND column_name = 'role'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('admin', 'client', 'developer'));
    ELSE
        -- Ensure default value is set to 'client'
        ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'client';
    END IF;
END $$;

-- 2. Index on role for fast lookups and filtering
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 3. Automatic Trigger Function: Runs on auth.users AFTER INSERT
-- Automatically creates the profile with 'client' role when a customer signs up
CREATE OR REPLACE FUNCTION public.handle_new_user_registration()
RETURNS TRIGGER AS $$
DECLARE
    assigned_role TEXT;
    user_name TEXT;
    company_name TEXT;
BEGIN
    -- Determine role from user metadata, default to 'client'
    assigned_role := COALESCE(NEW.raw_user_meta_data->>'role', 'client');
    
    -- Extract name and company if present
    user_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        SPLIT_PART(NEW.email, '@', 1)
    );
    
    company_name := COALESCE(NEW.raw_user_meta_data->>'company', '');

    INSERT INTO public.profiles (
        id,
        full_name,
        professional_title,
        bio,
        avatar_url,
        role,
        created_at
    )
    VALUES (
        NEW.id,
        user_name,
        CASE 
            WHEN company_name <> '' THEN 'Cliente / ' || company_name 
            ELSE 'Cliente DASFusion' 
        END,
        'Cliente registrado en la plataforma',
        NEW.raw_user_meta_data->>'avatar_url',
        assigned_role,
        timezone('utc'::text, now())
    )
    ON CONFLICT (id) DO UPDATE SET
        role = EXCLUDED.role,
        full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Bind Trigger to auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created_assign_role ON auth.users;
CREATE TRIGGER on_auth_user_created_assign_role
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user_registration();

-- 5. RLS Policies for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to view all profiles or their own
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Public profiles are viewable by everyone'
    ) THEN
        CREATE POLICY "Public profiles are viewable by everyone" 
        ON public.profiles FOR SELECT 
        USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update their own profile'
    ) THEN
        CREATE POLICY "Users can update their own profile" 
        ON public.profiles FOR UPDATE 
        USING (auth.uid() = id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can insert their own profile'
    ) THEN
        CREATE POLICY "Users can insert their own profile" 
        ON public.profiles FOR INSERT 
        WITH CHECK (auth.uid() = id);
    END IF;
END $$;
