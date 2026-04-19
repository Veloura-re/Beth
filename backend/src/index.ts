process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

dotenv.config();

import authRoutes from './routes/auth';
import inviteRoutes from './routes/invites';
import campaignRoutes from './routes/campaigns';
import qrRoutes from './routes/qrs';
import scanRoutes from './routes/scans';
import analyticsRoutes from './routes/analytics';
import userRoutes from './routes/users';
import financialRoutes from './routes/financial';
import organizationRoutes from './routes/organizations';

const pool = new Pool({ 
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/invites', inviteRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/qrs', qrRoutes);
app.use('/api/scans', scanRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/financial', financialRoutes);
app.use('/api/organizations', organizationRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[SERVER_ERROR]', err);
  res.status(500).json({ 
    message: 'Internal Portal Error', 
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
  });
});

// Start Server
app.listen(Number(PORT), '0.0.0.0' as any, () => {
  console.log(`Server running on 0.0.0.0:${PORT}`);
});

export { prisma };
