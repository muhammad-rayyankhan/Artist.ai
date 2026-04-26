import { Router, Request, Response } from 'express';
import { logger } from '../lib/logging';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, ValidationError, NotFoundError } from '../lib/errors';

const router = Router();
const prisma = new PrismaClient();

// GET /api/posts - Get all posts
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { agent_id, status } = req.query;

  const where: any = {};
  if (agent_id) where.agent_id = agent_id as string;
  if (status) where.status = status as string;

  const posts = await prisma.visualPost.findMany({
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

  logger.info('Retrieved posts', { count: posts.length, filters: { agent_id, status } });
  res.json(posts);
}));

// GET /api/posts/:id - Get post by ID
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const post = await prisma.visualPost.findUnique({
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

  if (!post) {
    throw new NotFoundError('Post');
  }

  logger.info('Retrieved post details', { postId: id });
  res.json(post);
}));

// POST /api/posts - Create new post
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const { agent_id, caption, asset_reference, target_channel, scheduled_for, created_by } = req.body;

  // Basic validation
  if (!agent_id || !caption) {
    throw new ValidationError('agent_id and caption are required');
  }

  // Validate caption length (max 4000 characters)
  if (caption.length > 4000) {
    throw new ValidationError('Caption exceeds maximum length of 4000 characters');
  }

  // Check if agent exists
  const agent = await prisma.agentProfile.findUnique({
    where: { id: agent_id }
  });

  if (!agent) {
    throw new NotFoundError('Agent');
  }

  const post = await prisma.visualPost.create({
    data: {
      agent_id,
      caption,
      asset_reference,
      target_channel,
      scheduled_for: scheduled_for ? new Date(scheduled_for) : null,
      status: scheduled_for ? 'scheduled' : 'draft'
    }
  });

  logger.auditPostOperation('create', post.id, agent_id, created_by || 'system', {
    captionLength: caption.length,
    target_channel,
    scheduled_for
  });

  res.status(201).json(post);
}));

// PATCH /api/posts/:id - Update post status
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, published_at, performed_by } = req.body;

    // Check if post exists
    const existingPost = await prisma.visualPost.findUnique({
      where: { id }
    });

    if (!existingPost) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Validate status transition
    const validTransitions: Record<string, string[]> = {
      draft: ['scheduled', 'published'],
      scheduled: ['published', 'failed'],
      published: [], // Can't change from published
      failed: ['draft', 'scheduled']
    };

    if (status && !validTransitions[existingPost.status]?.includes(status)) {
      return res.status(400).json({
        error: `Invalid status transition from ${existingPost.status} to ${status}`
      });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (published_at) updateData.published_at = new Date(published_at);

    const updatedPost = await prisma.visualPost.update({
      where: { id },
      data: updateData
    });

    if (status && status !== existingPost.status) {
      logger.auditPostOperation('status_change', id, existingPost.agent_id, performed_by || 'system', {
        previousStatus: existingPost.status,
        newStatus: status
      });
    }

    res.json(updatedPost);
  } catch (error) {
    logger.error('Failed to update post', { postId: req.params.id, error: error.message });
    res.status(500).json({ error: 'Failed to update post' });
  }
});

export default router;