// ==========================================
// HEALTH ROUTES - System health endpoints
// ==========================================

import { Router, Request, Response } from 'express';
import { ApiResponse, HealthResponse } from '../types';

const router = Router();
const startTime = Date.now();

router.get('/', (_req: Request, res: Response) => {
  const response: HealthResponse = {
    status: 'ok',
    version: '1.0.0',
    uptime: Math.floor((Date.now() - startTime) / 1000),
    timestamp: Date.now(),
  };
  
  return res.json({
    success: true,
    data: response,
    timestamp: Date.now(),
  } as ApiResponse<HealthResponse>);
});

router.get('/ready', (_req: Request, res: Response) => {
  return res.json({
    success: true,
    data: { ready: true },
    timestamp: Date.now(),
  } as ApiResponse<{ ready: boolean }>);
});

router.get('/live', (_req: Request, res: Response) => {
  return res.json({
    success: true,
    data: { alive: true },
    timestamp: Date.now(),
  } as ApiResponse<{ alive: boolean }>);
});

export default router;