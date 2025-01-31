import { ReclaimProofRequest, verifyProof } from '@reclaimprotocol/js-sdk';
import { config } from '../config';

export class ReclaimService {
  private static instance: ReclaimService;

  private constructor() {}

  public static getInstance(): ReclaimService {
    if (!ReclaimService.instance) {
      ReclaimService.instance = new ReclaimService();
    }
    return ReclaimService.instance;
  }

  async generateProofRequest(provider: string, context: string): Promise<{
    reclaimProofRequest: ReclaimProofRequest;
    requestUrl: string;
    statusUrl: string;
  }> {
    try {
      const reclaimProofRequest = await ReclaimProofRequest.init(
        process.env.RECLAIM_APP_ID || "",
        process.env.RECLAIM_APP_SECRET || "",
        provider
      );
      
      const requestUrl = await reclaimProofRequest.getRequestUrl();
      const statusUrl = await reclaimProofRequest.getStatusUrl();

      return {
        reclaimProofRequest,
        requestUrl,
        statusUrl
      };
    } catch (error) {
      console.error('Error generating proof request:', error);
      throw new Error('Failed to generate proof request');
    }
  }

  async verifyProof(proof: any): Promise<boolean> {
    try {
      if (!proof) {
        throw new Error('No proof provided');
      }
      
      // Use the standalone verifyProof function instead of class method
      return await verifyProof(proof);
    } catch (error) {
      console.error('Error verifying proof:', error);
      return false;
    }
  }
} 