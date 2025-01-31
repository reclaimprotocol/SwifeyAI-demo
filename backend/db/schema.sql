CREATE TYPE verification_status AS ENUM (
  'INITIATED',
  'PROOF_GENERATED',
  'COMPLETED',
  'FAILED'
);

CREATE TYPE provider_type AS ENUM (
  'chess.com',
  'uber', 
  'amazon',
  'reddit',
  'equinox',
  'healthify.me'
);

CREATE TYPE verification_type AS ENUM (
  'identity',
  'employment',
  'credentials',
  'membership'
);

CREATE TABLE verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  provider provider_type NOT NULL,
  verification_type verification_type NOT NULL,
  status verification_status NOT NULL DEFAULT 'INITIATED',
  proof TEXT,
  verified_data JSONB,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_verifications_status ON verifications(status); 