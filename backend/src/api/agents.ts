import { Router, Request, Response } from 'express';
import { logger } from '../lib/logging';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, ValidationError, NotFoundError } from '../lib/errors';

const router = Router();
const prisma = new PrismaClient();

// GET /api/agents - Get all agents
router.get('/', async (req: Request, res: Response) => {
  try {
    const agents = await prisma.agentProfile.findMany({
      orderBy: { created_at: 'desc' }
    });

    logger.info('Retrieved agent roster', { count: agents.length });
    res.json(agents);
  } catch (error) {
    logger.error('Failed to retrieve agents', { error: error.message });
    res.status(500).json({ error: 'Failed to retrieve agents' });
  }
});

// GET /api/agents/:id - Get agent by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const agent = await prisma.agentProfile.findUnique({
      where: { id },
      include: {
        posts: true,
        captions: true,
        governance: true
      }
    });

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    logger.info('Retrieved agent details', { agentId: id });
    res.json(agent);
  } catch (error) {
    logger.error('Failed to retrieve agent', { agentId: req.params.id, error: error.message });
    res.status(500).json({ error: 'Failed to retrieve agent' });
  }
});

// POST /api/agents - Create new agent
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, persona, scope, captions_tone, created_by } = req.body;

    // Basic validation
    if (!name || !created_by) {
      return res.status(400).json({ error: 'Name and created_by are required' });
    }

    const agent = await prisma.agentProfile.create({
      data: {
        name,
        persona,
        scope,
        captions_tone,
        created_by,
        status: 'active'
      }
    });

    logger.auditAgentOperation('create', agent.id, created_by, { name, persona });
    res.status(201).json(agent);
  } catch (error) {
    logger.error('Failed to create agent', { error: error.message, body: req.body });
    res.status(500).json({ error: 'Failed to create agent' });
  }
});

// PATCH /api/agents/:id - Update agent (including governance actions)
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, performed_by, notes, ...updateData } = req.body;

    // Check if agent exists
    const existingAgent = await prisma.agentProfile.findUnique({
      where: { id }
    });

    if (!existingAgent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    // If status is being changed, create a governance action
    if (status && status !== existingAgent.status && performed_by) {
      await prisma.governanceAction.create({
        data: {
          agent_id: id,
          action: status === 'paused' ? 'pause' : 'resume',
          performed_by,
          notes
        }
      });

      logger.auditGovernanceAction(
        status === 'paused' ? 'pause' : 'resume',
        performed_by,
        id,
        { previousStatus: existingAgent.status, newStatus: status, notes }
      );
    }

    // Update the agent
    const updatedAgent = await prisma.agentProfile.update({
      where: { id },
      data: {
        ...updateData,
        ...(status && { status })
      }
    });

    if (status && status !== existingAgent.status) {
      logger.auditAgentOperation('status_change', id, performed_by || 'system', {
        previousStatus: existingAgent.status,
        newStatus: status
      });
    }

    res.json(updatedAgent);
  } catch (error) {
    logger.error('Failed to update agent', { agentId: req.params.id, error: error.message });
    res.status(500).json({ error: 'Failed to update agent' });
  }
});

export default router;