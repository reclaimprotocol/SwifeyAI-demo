import express from 'express';
import cors from 'cors';
import { verificationRouter } from './routes/verification';
import { config } from './config';

async function startServer() {
  const app = express();
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));
  app.use(express.json());
  app.use('/verifications', verificationRouter);

  app.listen(config.server.port, () => {
    console.log(`Server running on port ${config.server.port}`);
  });
}

startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
}); 