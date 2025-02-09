export interface Database {
  verifications: {
    id: string;
    email: string;
    provider: 'chess.com' | 'uber' | 'amazon' | 'reddit' | 'equinox' | 'healthify.me';
    verification_type: 'identity' | 'employment' | 'credentials' | 'membership';
    status: 'INITIATED' | 'PROOF_PENDING' | 'PROOF_GENERATED' | 'COMPLETED' | 'FAILED';
    proof?: string;
    verified_data?: Record<string, unknown>;
    error?: string;
    created_at: Date;
    updated_at: Date;
  }
}

export interface WebhookPayload {
  webhookURL: string;
  event: 'verification.step' | 'verification.completed' | 'verification.failed';
  verificationId: string;
  timestamp: string;
  data: {
    status: string;
    proof?: string;
    verifiedData?: Record<string, unknown>;
    error?: string;
  };
}

export const PROVIDERS = {
  'chess.com': '7c9303b3-8e1c-405b-b3d7-d9eaf114d2ce',
  'uber': 'e3e51528-5da9-433c-a266-96716d363012',
  'amazon': 'f5766218-a1d4-4f53-b32f-4c00efd7f56c',
  'reddit': 'fdaea3c3-86af-459a-bb21-1b6b90146766',
  'equinox': 'equinox-provider-id',
  'healthify.me': 'f109ae82-3546-4536-a41b-64243b838009'
} as const;

export type Provider = keyof typeof PROVIDERS;

export interface VerificationRequest {
  metadata: {
    email: string;
  };
  provider: 'chess.com' | 'uber' | 'amazon' | 'reddit' | 'equinox' | 'healthify.me';
  type: 'identity' | 'employment' | 'credentials' | 'membership';
  webhookURL: string;
} 