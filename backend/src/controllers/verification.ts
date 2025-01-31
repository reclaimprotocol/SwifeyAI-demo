import { Request, Response } from 'express';
import { db } from '../db';
import { ReclaimService } from '../services/reclaim';
import { WebhookService } from '../services/webhook';
import { VerificationRequest } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { Proof } from '@reclaimprotocol/js-sdk';

export class VerificationController {
  private static instance: VerificationController;
  private reclaimService: ReclaimService;
  private webhookService: WebhookService;
  
  private providers = {
    'chess.com': '7c9303b3-8e1c-405b-b3d7-d9eaf114d2ce',
    'uber': 'e3e51528-5da9-433c-a266-96716d363012',
    'amazon': 'f5766218-a1d4-4f53-b32f-4c00efd7f56c',
    'reddit': 'fdaea3c3-86af-459a-bb21-1b6b90146766',
    'equinox': 'equinox-provider-id',
    'healthify.me': 'f109ae82-3546-4536-a41b-64243b838009'
  };

  private constructor() {
    this.reclaimService = ReclaimService.getInstance();
    this.webhookService = WebhookService.getInstance();
  }

  public static getInstance(): VerificationController {
    if (!VerificationController.instance) {
      VerificationController.instance = new VerificationController();
    }
    return VerificationController.instance;
  }

  async initializeVerification(req: Request<{}, {}, VerificationRequest>, res: Response) {
    const { metadata, provider, type } = req.body;
    console.log('Initializing verification:', { metadata, provider, type });

    const verification = await db
      .insertInto('verifications')
      .values({
        id: uuidv4(),
        email: metadata.email,
        provider: provider,
        verification_type: type,
        status: 'INITIATED',
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning(['id'])
      .executeTakeFirstOrThrow();

    try {
      console.log('Created verification record:', verification.id);

      const { reclaimProofRequest, requestUrl, statusUrl } = await this.reclaimService.generateProofRequest(
        this.providers[provider],
        `Verification for ${metadata.email}`
      );

      console.log('Generated proof request:', { requestUrl, statusUrl });

      reclaimProofRequest.startSession({
        onSuccess: async (proofs) => {
          try {
            console.log('Received proofs:', proofs);
            const isValid = await this.reclaimService.verifyProof(proofs);

            if (!isValid) {
              console.error('Invalid proof received for verification:', verification.id);
              // await this.webhookService.sendWebhook({
              //   event: 'verification.failed',
              //   verificationId: verification.id,
              //   timestamp: new Date().toISOString(),
              //   data: { status: 'FAILED', error: 'Invalid proof' }
              // });
              return;
            }
            // Update verification with proof
            await db
              .updateTable('verifications')
              .set({
                status: 'PROOF_GENERATED',
                proof: JSON.stringify(proofs),
                verified_data: JSON.parse((proofs as Proof).claimData.parameters).paramValues as Record<string, unknown>,
                updated_at: new Date()
              })
              .where('id', '=', verification.id)
              .execute();

            console.log('Updated verification with proof:', verification.id);

            // await this.webhookService.sendWebhook({
            //   event: 'verification.step',
            //   verificationId: verification.id,
            //   timestamp: new Date().toISOString(),
            //   data: {
            //     status: 'PROOF_GENERATED',
            //     proof: proofs?.toString()
            //   }
            // });

            console.log('Sent success webhook for verification:', verification.id);
          } catch (error) {
            console.error('Error processing proof:', error);
            
            await db
              .updateTable('verifications')
              .set({
                status: 'FAILED',
                error: (error as Error).message,
                updated_at: new Date()
              })
              .where('id', '=', verification.id)
              .execute();

            // await this.webhookService.sendWebhook({
            //   event: 'verification.failed',
            //   verificationId: verification.id,
            //   timestamp: new Date().toISOString(),
            //   data: { status: 'FAILED', error: (error as Error).message }
            // });
          }
        },
        onError: async (error) => {
          console.error('Error in proof generation:', error);
          
          await db
            .updateTable('verifications')
            .set({
              status: 'FAILED',
              error: error.message,
              updated_at: new Date()
            })
            .where('id', '=', verification.id)
            .execute();

          await this.webhookService.sendWebhook({
            event: 'verification.failed',
            verificationId: verification.id,
            timestamp: new Date().toISOString(),
            data: { status: 'FAILED', error: error.message }
          });
        }
      });

      res.json({
        verificationId: verification.id,
        status: 'INITIATED',
        nextStep: {
          type: 'GENERATE_PROOF',
          requestUrl,
          statusUrl
        }
      });
    } catch (error) {
      console.error('Error creating verification:', error);
      
      // Add error to database if verification ID exists in this scope
      try {
        await db
          .updateTable('verifications')
          .set({
            status: 'FAILED',
            error: (error as Error).message,
            updated_at: new Date()
          })
          .where('id', '=', verification.id)
          .execute();
      } catch (dbError) {
        console.error('Error saving to database:', dbError);
      }
      
      res.status(500).json({ error: 'Internal server error' });
    }
  }
} 