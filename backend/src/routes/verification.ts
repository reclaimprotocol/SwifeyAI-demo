import { Router } from 'express';
import { VerificationController } from '../controllers/verification';

const router = Router();
const controller = VerificationController.getInstance();

router.post('/', controller.initializeVerification.bind(controller));

export { router as verificationRouter }; 