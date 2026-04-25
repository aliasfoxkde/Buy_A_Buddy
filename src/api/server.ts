// ==========================================
// API SERVER - Express server with Swagger UI
// ==========================================

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { createServer } from 'http';
import dotenv from 'dotenv';

import gameRoutes from './routes/gameRoutes';
import healthRoutes from './routes/healthRoutes';
import { apiInfo, tags, schemas, gameEndpoints, buddyEndpoints, plotEndpoints, upgradeEndpoints, adminEndpoints, healthEndpoints } from './docs/openapi';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(express.json());

// Request logging
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// ==========================================
// API DOCUMENTATION
// ==========================================

// Build OpenAPI spec dynamically
const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: apiInfo.title,
    version: apiInfo.version,
    description: apiInfo.description,
    contact: apiInfo.contact,
    license: apiInfo.license,
  },
  servers: [
    { url: `http://localhost:${PORT}`, description: 'Local server' },
    { url: process.env.API_URL || '', description: 'Production' },
  ],
  tags,
  paths: {
    ...gameEndpoints,
    ...buddyEndpoints,
    ...plotEndpoints,
    ...upgradeEndpoints,
    ...adminEndpoints,
    ...healthEndpoints,
  },
  components: {
    schemas,
  },
};

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec, {
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info .title { color: #a855f7; }
    .swagger-ui .scheme-container { background: #1a0a2e; }
  `,
  customSiteTitle: 'Buy a Buddy API Docs',
}));

// API info endpoint
app.get('/api', (_req, res) => {
  res.json({
    success: true,
    data: {
      title: 'Buy a Buddy API',
      version: '1.0.0',
      documentation: '/api-docs',
      endpoints: {
        game: '/api/game/state',
        health: '/api/health',
        docs: '/api-docs',
      },
    },
    timestamp: Date.now(),
  });
});

// ==========================================
// ROUTES
// ==========================================

app.use('/api/game', gameRoutes);
app.use('/api/buddy', gameRoutes);
app.use('/api/plot', gameRoutes);
app.use('/api/upgrade', gameRoutes);
app.use('/api/admin', gameRoutes);
app.use('/api/health', healthRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    timestamp: Date.now(),
  });
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    timestamp: Date.now(),
  });
});

// ==========================================
// SERVER INITIALIZATION
// ==========================================

const server = createServer(app);

// Import game state initialization
import { createInitialState } from '../game/types';
import { initGameState } from './routes/gameRoutes';

// Initialize with game state
const initialState = createInitialState();
initGameState(initialState);

server.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🎮 Buy a Buddy API Server                               ║
║                                                           ║
║   Server running at: http://localhost:${PORT}              ║
║   API Documentation: http://localhost:${PORT}/api-docs     ║
║                                                           ║
║   Endpoints:                                              ║
║   • GET  /api/game/state  - Get game state                ║
║   • POST /api/buddy/buy   - Buy a buddy                   ║
║   • POST /api/buddy/assign - Assign to plot               ║
║   • GET  /api/health      - Health check                  ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

export default app;