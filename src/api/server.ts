// ==========================================
// API SERVER - Express + Swagger
// ==========================================

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { createServer } from 'http';
import dotenv from 'dotenv';

import gameRoutes from './routes/gameRoutes';
import healthRoutes from './routes/healthRoutes';
import debugRoutes from './routes/debugRoutes';
import { apiSpec, tags } from './docs/openapi';

// Load environment
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Debug-Token'],
}));
app.use(express.json({ limit: '10mb' }));

// Request logging
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// CORS preflight
app.options('*', cors());

// Swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(apiSpec, {
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info .title { color: #a855f7; }
    .swagger-ui .scheme-container { background: #0d0d1a; }
    .swagger-ui { background: #0d0d1a; }
    .swagger-ui .opblock .opblock-summary { background: #1a0a2e; }
    .swagger-ui .btn { background: #6B21A8; }
  `,
  customSiteTitle: 'Buy a Buddy API',
}));

// API info endpoint
app.get('/api', (_req, res) => {
  res.json({
    success: true,
    data: {
      name: 'Buy a Buddy API',
      version: '2.0.0',
      description: 'RPG game backend with mini-games',
      documentation: '/api-docs',
      endpoints: {
        game: '/api/game',
        health: '/api/health',
        debug: '/api/debug',
        metrics: '/api/metrics',
      },
    },
    timestamp: Date.now(),
  });
});

// Routes
app.use('/api/game', gameRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/debug', debugRoutes);
app.use('/api/metrics', debugRoutes); // Metrics also at /api/metrics

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
    error: err.message || 'Internal server error',
    timestamp: Date.now(),
  });
});

// Start server
const server = createServer(app);

server.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🎮 Buy a Buddy API Server                             ║
║                                                          ║
║   Server:     http://localhost:${PORT}                    ║
║   Docs:       http://localhost:${PORT}/api-docs             ║
║                                                          ║
║   Endpoints:                                            ║
║   • GET  /api/game/state      - Get game state            ║
║   • POST /api/game/action    - Perform game action        ║
║   • GET  /api/debug/report   - Get debug report           ║
║   • GET  /api/health         - Health check               ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
  `);
});

export default app;