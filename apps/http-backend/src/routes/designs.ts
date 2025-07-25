import { Router, Request, Response } from 'express';
import { prismaClient } from '@repo/db/client';

import { verifyToken } from '../middleware/auth.js';

interface AuthRequest extends Request {
  user: { id: string };
}

const router: import('express').Router = Router();
router.use(verifyToken); 


router.get('/', async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).user.id;
  const designs = await prismaClient.design.findMany({
    where: { ownerId: userId },
    orderBy: { updatedAt: 'desc' },
    select: { id: true, name: true, createdAt: true, updatedAt: true },
  });
  res.json({ designs });
});


router.post('/', async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).user.id;
  const { name } = req.body;
  if (!name) {
    res.status(400).json({ error: 'Name is required' });
    return;
  }
  const design = await prismaClient.design.create({
    data: {
      name,
      ownerId: userId,
    },
    select: { id: true, name: true, createdAt: true, updatedAt: true },
  });
  res.json({ design });
});


router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).user.id;
  const id = Number(req.params.id);
  const design = await prismaClient.design.findFirst({
    where: { id, ownerId: userId },
    include: { shapes: true },
  });
  if (!design) {
    res.status(404).json({ error: 'Design not found' });
    return;
  }
  res.json({ design });
});


router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).user.id;
  const id = Number(req.params.id);
  const { name, shapes } = req.body;
  const design = await prismaClient.design.findFirst({ where: { id, ownerId: userId } });
  if (!design) {
    res.status(404).json({ error: 'Design not found' });
    return;
  }

 
  if (name) {
    await prismaClient.design.update({ where: { id }, data: { name } });
  }


  if (Array.isArray(shapes)) {
   
    await prismaClient.shape.deleteMany({ where: { designId: id } });
    
    for (const shape of shapes) {
      await prismaClient.shape.create({
        data: {
          designId: id,
          type: shape.type,
          data: shape.data,
        },
      });
    }
  }

  const updated = await prismaClient.design.findFirst({ where: { id }, include: { shapes: true } });
  res.json({ design: updated });
});


router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).user.id;
  const id = Number(req.params.id);
  const design = await prismaClient.design.findFirst({ where: { id, ownerId: userId } });
  if (!design) {
    res.status(404).json({ error: 'Design not found' });
    return;
  }
  await prismaClient.shape.deleteMany({ where: { designId: id } });
  await prismaClient.chat.deleteMany({ where: { designId: id } });
  await prismaClient.design.delete({ where: { id } });
  res.json({ success: true });
});


router.get('/:id/chats', async (req: Request, res: Response): Promise<void> => {

  const isReadOnly = req.query.readonly === '1';
  let userId: string | undefined = undefined;
  if (!isReadOnly) {
  
    userId = (req as AuthRequest).user?.id;
    if (!userId) {
      res.status(401).json({ message: 'No token provided or invalid format' });
      return;
    }
  }
  const id = Number(req.params.id);

  let design;
  if (isReadOnly) {
    design = await prismaClient.design.findFirst({ where: { id } });
  } else {
    design = await prismaClient.design.findFirst({ where: { id } });
  }
  if (!design) {
    res.status(404).json({ error: 'Design not found' });
    return;
  }
  const messages = await prismaClient.chat.findMany({
    where: { designId: id },
    orderBy: { createdAt: 'asc' },
    select: { message: true, createdAt: true },
  });
  
  let lastClearIndex = -1;
  messages.forEach((m, i) => {
    try {
      const parsed = JSON.parse(m.message);
      if (parsed.clear) lastClearIndex = i;
    } catch {}
  });
 
  const relevantMessages = lastClearIndex >= 0 ? messages.slice(lastClearIndex + 1) : messages;

  const erasedIds = new Set(
    relevantMessages
      .map(m => {
        try {
          const parsed = JSON.parse(m.message);
          return parsed.erase;
        } catch (err) { console.warn('Malformed erase message:', m.message, err); return undefined; }
      })
      .filter(Boolean)
  );
  const shapes = relevantMessages
    .map(m => {
      try {
        const parsed = JSON.parse(m.message);
        if (parsed.shape && parsed.shape.id && typeof parsed.shape.id === 'string') {
          return parsed.shape;
        } else {
          if (parsed.shape) console.warn('Shape missing id:', parsed.shape);
          return undefined;
        }
      } catch (err) { console.warn('Malformed shape message:', m.message, err); return undefined; }
    })
    .filter(s => s && !erasedIds.has(s.id));
  res.json({ messages: shapes.map(s => ({ message: JSON.stringify({ shape: s }) })) });
});

export default router; 