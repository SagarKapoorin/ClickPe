CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  bank TEXT NOT NULL,
  type TEXT CHECK (type IN ('personal','education','vehicle','home','credit_line','debt_consolidation')),
  rate_apr NUMERIC NOT NULL,
  min_income NUMERIC NOT NULL,
  min_credit_score INT NOT NULL,
  tenure_min_months INT DEFAULT 6,
  tenure_max_months INT DEFAULT 60,
  processing_fee_pct NUMERIC DEFAULT 0,
  prepayment_allowed BOOLEAN DEFAULT TRUE,
  disbursal_speed TEXT DEFAULT 'standard',
  docs_level TEXT DEFAULT 'standard',
  summary TEXT,
  faq JSONB DEFAULT '[]',
  terms JSONB DEFAULT '{}'
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  display_name TEXT
);

CREATE TABLE ai_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  product_id UUID REFERENCES products(id),
  role TEXT CHECK (role IN ('user','assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

