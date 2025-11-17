-- ============================================
-- ALL-IN-ONE DATABASE SETUP SCRIPT
-- ============================================
-- This script combines cleanup + initialization
-- Run this ONCE to set up the entire database
--
-- WARNING: This will DELETE all existing data!
-- ============================================

-- ============================================
-- PART 1: CLEANUP (Delete Everything)
-- ============================================

DROP VIEW IF EXISTS public.brand_stats CASCADE;
DROP VIEW IF EXISTS public.daily_stats CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.purchase_requests CASCADE;
DROP TABLE IF EXISTS public.giftcard_brands CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

-- ============================================
-- PART 2: INITIALIZATION (Create Fresh)
-- ============================================

-- ============================================
-- STEP 1: Gift Card Brands Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.giftcard_brands (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    brand_code VARCHAR(50) UNIQUE NOT NULL,
    brand_name VARCHAR(100) NOT NULL,
    buy_rate DECIMAL(5,2) NOT NULL DEFAULT 96.5,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Initial brand data
INSERT INTO public.giftcard_brands (brand_code, brand_name, buy_rate) VALUES
    ('hyundai', 'Hyundai Department Store', 96.5),
    ('galleria', 'Galleria Department Store', 96.5),
    ('lotte', 'Lotte Department Store', 96.0),
    ('shinsegae', 'Shinsegae Department Store', 96.5),
    ('ak', 'AK Plaza', 95.5),
    ('hanwha', 'Hanwha Galleria', 96.0),
    ('emart', 'E-mart', 95.0),
    ('cultureland', 'Cultureland', 94.0)
ON CONFLICT (brand_code) DO NOTHING;

-- ============================================
-- STEP 2: Purchase Requests Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.purchase_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    brand_id UUID REFERENCES public.giftcard_brands(id) ON DELETE RESTRICT,
    brand_code VARCHAR(50) NOT NULL,
    amount BIGINT NOT NULL,
    pin_encrypted TEXT NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    account_info TEXT NOT NULL,
    buy_rate DECIMAL(5,2) NOT NULL,
    payment_amount BIGINT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
        'pending',
        'verifying',
        'verified',
        'processing',
        'completed',
        'failed',
        'cancelled'
    )),
    message TEXT,
    ip_address INET,
    user_agent TEXT,
    admin_note TEXT,
    verification_result JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    verified_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================
-- STEP 3: Transactions Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    purchase_request_id UUID REFERENCES public.purchase_requests(id) ON DELETE CASCADE,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN (
        'purchase',
        'refund',
        'adjustment'
    )),
    amount BIGINT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
        'pending',
        'completed',
        'failed'
    )),
    bank_name VARCHAR(50),
    account_number VARCHAR(100),
    account_holder VARCHAR(100),
    transaction_id VARCHAR(100) UNIQUE,
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    completed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================
-- STEP 4: Create Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_purchase_requests_brand_id ON public.purchase_requests(brand_id);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_status ON public.purchase_requests(status);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_created_at ON public.purchase_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_customer_phone ON public.purchase_requests(customer_phone);
CREATE INDEX IF NOT EXISTS idx_transactions_purchase_request_id ON public.transactions(purchase_request_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);

-- ============================================
-- STEP 5: Auto-update Triggers
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_purchase_requests_updated_at ON public.purchase_requests;
CREATE TRIGGER update_purchase_requests_updated_at
    BEFORE UPDATE ON public.purchase_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_giftcard_brands_updated_at ON public.giftcard_brands;
CREATE TRIGGER update_giftcard_brands_updated_at
    BEFORE UPDATE ON public.giftcard_brands
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_transactions_updated_at ON public.transactions;
CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON public.transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- STEP 6: Row Level Security
-- ============================================
ALTER TABLE public.giftcard_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access for giftcard_brands" ON public.giftcard_brands;
CREATE POLICY "Public read access for giftcard_brands"
    ON public.giftcard_brands FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Admin full access for purchase_requests" ON public.purchase_requests;
CREATE POLICY "Admin full access for purchase_requests"
    ON public.purchase_requests FOR ALL
    USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin full access for transactions" ON public.transactions;
CREATE POLICY "Admin full access for transactions"
    ON public.transactions FOR ALL
    USING (auth.role() = 'authenticated');

-- ============================================
-- STEP 7: Statistics Views
-- ============================================
DROP VIEW IF EXISTS public.daily_stats;
CREATE VIEW public.daily_stats AS
SELECT
    DATE(created_at) as date,
    COUNT(*) as total_requests,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_count,
    SUM(amount) as total_amount,
    SUM(payment_amount) as total_payment,
    AVG(buy_rate) as avg_buy_rate
FROM public.purchase_requests
GROUP BY DATE(created_at)
ORDER BY date DESC;

DROP VIEW IF EXISTS public.brand_stats;
CREATE VIEW public.brand_stats AS
SELECT
    gb.brand_name,
    COUNT(pr.id) as total_requests,
    COUNT(pr.id) FILTER (WHERE pr.status = 'completed') as completed_count,
    SUM(pr.amount) as total_amount,
    SUM(pr.payment_amount) as total_payment,
    AVG(pr.buy_rate) as avg_buy_rate
FROM public.giftcard_brands gb
LEFT JOIN public.purchase_requests pr ON gb.id = pr.brand_id
GROUP BY gb.id, gb.brand_name
ORDER BY total_requests DESC;

-- ============================================
-- STEP 8: Comments
-- ============================================
COMMENT ON TABLE public.giftcard_brands IS 'Gift card brand information';
COMMENT ON TABLE public.purchase_requests IS 'Gift card purchase request records';
COMMENT ON TABLE public.transactions IS 'Transaction records';
COMMENT ON COLUMN public.purchase_requests.pin_encrypted IS 'Encrypted PIN number';
COMMENT ON COLUMN public.purchase_requests.payment_amount IS 'Actual payment amount (amount * buy_rate / 100)';

-- ============================================
-- COMPLETE! Run verify_setup.sql to confirm
-- ============================================
