import axios from 'axios';
import { WebhookPayload } from '../types';
import { config } from '../config';

export class WebhookService {
  private static instance: WebhookService;
  private retryAttempts = 3;
  private retryDelay = 1000; // 1 second

  private constructor() {}

  public static getInstance(): WebhookService {
    if (!WebhookService.instance) {
      WebhookService.instance = new WebhookService();
    }
    return WebhookService.instance;
  }

  async sendWebhook(payload: WebhookPayload): Promise<void> {
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        await axios.post(config.webhook.url, payload, {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 5000
        });
        return;
      } catch (error) {
        console.error(`Webhook delivery failed (attempt ${attempt}):`, error);
        if (attempt < this.retryAttempts) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
        }
      }
    }
    throw new Error('Failed to deliver webhook after all retry attempts');
  }
} 