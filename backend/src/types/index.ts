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

export interface VerificationRequest {
  metadata: {
    email: string;
  };
  provider: Database['verifications']['provider'];
  type: Database['verifications']['verification_type'];
} 