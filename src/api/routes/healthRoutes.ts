// ==========================================
// HEALTH ROUTES - Health check endpoints
// ==========================================

import { Router, Request, Response } from 'express';
import { successResponse } from '../types';

const router = Router();
const startTime = Date.now();

router.get('/', (_req: Request, res: Response) => {
  res.json(successResponse({
    status: 'ok',
    version: '2.0.0',
    uptime: Math.floor((Date.now() - startTime) / 1000),
    timestamp: Date.now(),
  }));
});

router.get('/ready', (_req: Request, res: Response) => {
  res.json(successResponse({ ready: true }));
});

router.get('/live', (_req: Request, res: Response) => {
  res.json(successResponse({ alive: true }));
});

export default router;