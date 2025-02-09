import { Request, Response } from 'express';
import { ReclaimService } from '../services/reclaim';
import { VerificationRequest, PROVIDERS } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { Proof } from '@reclaimprotocol/js-sdk';

export class VerificationController {
  private static instance: VerificationController;
  private reclaimService: ReclaimService;
  
  private constructor() {
    this.reclaimService = ReclaimService.getInstance();
  }

  public static getInstance(): VerificationController {
    if (!VerificationController.instance) {
      VerificationController.instance = new VerificationController();
    }
    return VerificationController.instance;
  }

  private async sendWebhook(webhookURL: string, event: string, verificationId: string, data: any): Promise<void> {
    const payload = {
      webhookURL,
      event,
      verificationId,
      timestamp: new Date().toISOString(),
      data
    };

    await fetch(webhookURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzEyMyJ9.WLXxpR08RWvKtIcr6cUkiRY4p_o-fScNUlOqGE-N2UM',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });
  }

  async initializeVerification(req: Request<{}, {}, VerificationRequest>, res: Response) {
    const { metadata, provider, type, webhookURL } = req.body;
    const verificationId = uuidv4();
    try {
      const { reclaimProofRequest, requestUrl, statusUrl } = await this.reclaimService.generateProofRequest(
        PROVIDERS[provider],
        `Verification for ${metadata.email}`
      );

      reclaimProofRequest.startSession({
        onSuccess: async (proofs) => {
          try {
            const isValid = await this.reclaimService.verifyProof(proofs);

            if (!isValid) {
              await this.sendWebhook(webhookURL, 'verification.failed', verificationId, {
                status: 'FAILED', 
                error: 'Invalid proof' 
              });
              return;
            }

            await this.sendWebhook(webhookURL, 'verification.step', verificationId, {
              status: 'PROOF_GENERATED',
              proof: proofs,
              verified_data: JSON.parse((proofs as Proof).claimData.parameters).paramValues as Record<string, unknown>
            });
          } catch (error) {
            console.error('Error processing proof:', error);
            await this.sendWebhook(webhookURL, 'verification.failed', verificationId, { 
              status: 'FAILED', 
              error: (error as Error).message 
            });
          }
        },
        onError: async (error) => {
          console.error('Error in proof generation:', error);
          await this.sendWebhook(webhookURL, 'verification.failed', verificationId, { 
            status: 'FAILED', 
            error: error.message 
          });
        }
      });

      res.json({
        verificationId: verificationId,
        status: 'INITIATED',
        nextStep: {
          type: 'GENERATE_PROOF',
          requestUrl,
          statusUrl
        }
      });
    } catch (error) {
      console.error('Error creating verification:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
} 