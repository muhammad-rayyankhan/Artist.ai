import { Router } from 'express';
import { logger } from '../lib/logging';

const router = Router();

// Import route modules
// import agentsRouter from './agents';
// import postsRouter from './posts';
// import governanceRouter from './governance';

// Mount routes
// router.use('/agents', agentsRouter);
// router.use('/posts', postsRouter);
// router.use('/governance', governanceRouter);

// API health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'agent-media-posting-api',
    timestamp: new Date().toISOString()
  });
});

// API version info
router.get('/version', (req, res) => {
  res.json({
    version: '1.0.0',
    api: 'agent-media-posting',
    documentation: '/api/docs'
  });
});

export default router;