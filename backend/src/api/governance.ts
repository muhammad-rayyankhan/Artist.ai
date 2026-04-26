import { Router, Request, Response } from 'express';
import { logger } from '../lib/logging';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/governance - Get all governance actions
router.get('/', async (req: Request, res: Response) => {
  try {
    const { agent_id, action, performed_by } = req.query;

    const where: any = {};
    if (agent_id) where.agent_id = agent_id as string;
    if (action) where.action = action as string;
    if (performed_by) where.performed_by = performed_by as string;

    const governanceActions = await prisma.governanceAction.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            persona: true
          }
        }
      }
    });

    logger.info('Retrieved governance actions', { count: governanceActions.length, filters: { agent_id, action, performed_by } });
    res.json(governanceActions);
  } catch (error) {
    logger.error('Failed to retrieve governance actions', { error: error.message });
    res.status(500).json({ error: 'Failed to retrieve governance actions' });
  }
});

// GET /api/governance/:id - Get governance action by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const governanceAction = await prisma.governanceAction.findUnique({
      where: { id },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            persona: true
          }
        }
      }
    });

    if (!governanceAction) {
      return res.status(404).json({ error: 'Governance action not found' });
    }

    logger.info('Retrieved governance action details', { governanceActionId: id });
    res.json(governanceAction);
  } catch (error) {
    logger.error('Failed to retrieve governance action', { governanceActionId: req.params.id, error: error.message });
    res.status(500).json({ error: 'Failed to retrieve governance action' });
  }
});

// GET /api/governance/agent/:agentId - Get governance actions for specific agent
router.get('/agent/:agentId', async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;
    const governanceActions = await prisma.governanceAction.findMany({
      where: { agent_id: agentId },
      orderBy: { created_at: 'desc' }
    });

    logger.info('Retrieved governance actions for agent', { agentId, count: governanceActions.length });
    res.json(governanceActions);
  } catch (error) {
    logger.error('Failed to retrieve governance actions for agent', { agentId: req.params.agentId, error: error.message });
    res.status(500).json({ error: 'Failed to retrieve governance actions for agent' });
  }
});

// POST /api/governance - Create governance action
router.post('/', async (req: Request, res: Response) => {
  try {
    const { agent_id, action, performed_by, notes } = req.body;

    // Basic validation
    if (!agent_id || !action || !performed_by) {
      return res.status(400).json({ error: 'agent_id, action, and performed_by are required' });
    }

    // Check if agent exists
    const agent = await prisma.agentProfile.findUnique({
      where: { id: agent_id }
    });

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    // Validate action type
    const validActions = ['create', 'update', 'pause', 'resume'];
    if (!validActions.includes(action)) {
      return res.status(400).json({ error: `Invalid action. Must be one of: ${validActions.join(', ')}` });
    }

    const governanceAction = await prisma.governanceAction.create({
      data: {
        agent_id,
        action,
        performed_by,
        notes
      }
    });

    logger.auditGovernanceAction(action, performed_by, agent_id, { notes });

    // If action is pause or resume, update agent status
    if (action === 'pause' || action === 'resume') {
      await prisma.agentProfile.update({
        where: { id: agent_id },
        data: {
          status: action === 'pause' ? 'paused' : 'active'
        }
      });

      logger.auditAgentOperation('status_change', agent_id, performed_by, {
        action,
        previousStatus: agent.status,
        newStatus: action === 'pause' ? 'paused' : 'active'
      });
    }

    res.status(201).json(governanceAction);
  } catch (error) {
    logger.error('Failed to create governance action', { error: error.message, body: req.body });
    res.status(500).json({ error: 'Failed to create governance action' });
  }
});

export default router;