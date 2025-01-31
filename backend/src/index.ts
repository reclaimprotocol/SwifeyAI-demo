import express from 'express';
import cors from 'cors';
import { verificationRouter } from './routes/verification';
import { config } from './config';
import { db } from './db';

async function testDbConnection() {
  try {
    // Execute a simple query to test the connection
    await db.selectFrom('verifications')
      .select('id')
      .limit(1)
      .execute();
    
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

async function startServer() {
  // Test database connection first
  const isDbConnected = await testDbConnection();
  if (!isDbConnected) {
    console.error('Server startup aborted due to database connection failure');
    process.exit(1);
  }

  const app = express();
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
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