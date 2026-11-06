import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config/index.js';
import emailRoutes from './routes/emailRoutes.js';
import proposalRoutes from './routes/proposalRoutes.js';
import catalogRoutes from './routes/catalogRoutes.js';
import { seedCatalog } from './prisma/seed.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads directory for generated proposals
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// API Routes
app.use('/api/emails', emailRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/catalog', catalogRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'PropFlow AI Backend API',
    version: '1.0.0',
  });
});

async function startServer() {
  try {
    // Ensure catalog is seeded
    const catalogCount = await prisma.catalogItem.count();
    if (catalogCount === 0) {
      console.log('Catalog is empty. Running initial pricing seed...');
      await seedCatalog();
    }

    app.listen(config.port, () => {
      console.log(`=================================================`);
      console.log(` PropFlow AI Backend Server Running               `);
      console.log(` Port:    http://localhost:${config.port}         `);
      console.log(` Client:  ${config.clientUrl}                     `);
      console.log(` Health:  http://localhost:${config.port}/api/health `);
      console.log(`=================================================`);
    });
  } catch (err) {
    console.error('Fatal server startup error:', err);
    process.exit(1);
  }
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
