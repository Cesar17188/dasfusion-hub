-- ==============================================================================
-- Migration: Create Quotes (Cotizaciones) Table with RLS & Triggers
-- Target DB: Supabase (PostgreSQL)
-- ==============================================================================

-- 1. Create table 'quotes'
CREATE TABLE IF NOT EXISTS public.quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    client_phone TEXT,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    tech_stack TEXT[] DEFAULT '{}',
    budget NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'in_analysis', 'quoted', 'approved', 'rejected')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Indexes for fast retrieval
CREATE INDEX IF NOT EXISTS idx_quotes_user_id ON public.quotes(user_id);
CREATE INDEX IF NOT EXISTS idx_quotes_client_email ON public.quotes(client_email);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON public.quotes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON public.quotes(status);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies

-- Policy A: Clients can view their own quotes
CREATE POLICY "Users can view their own quotes"
    ON public.quotes
    FOR SELECT
    USING (
        auth.uid() = user_id 
        OR auth.jwt() ->> 'email' = client_email
    );

-- Policy B: Anyone (authenticated or guest leads) can create a quote
CREATE POLICY "Anyone can create a quote"
    ON public.quotes
    FOR INSERT
    WITH CHECK (true);

-- Policy C: Users can update their own quotes if needed
CREATE POLICY "Users can update their own quotes"
    ON public.quotes
    FOR UPDATE
    USING (auth.uid() = user_id);

-- 5. Auto-update updated_at timestamp trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_quotes_updated_at ON public.quotes;
CREATE TRIGGER set_quotes_updated_at
    BEFORE UPDATE ON public.quotes
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 6. Grant access to authenticated and anon roles
GRANT SELECT, INSERT ON public.quotes TO authenticated, anon;
GRANT UPDATE, DELETE ON public.quotes TO authenticated;
