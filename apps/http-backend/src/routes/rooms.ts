import { Router } from 'express';
import { z } from 'zod';
import { verifyToken, AuthRequest } from '../middleware/auth';
import Room from '../models/Room';
import {CreateRoomSchema} from "@repo/common/types";
const router:Router = Router();
// const roomSchema = z.object({ name: z.string().min(1) });

// POST /api/rooms
router.post('/', verifyToken, async (req: AuthRequest, res, next) => {
  try {
    const { name } = CreateRoomSchema.safeParse(req.body);
    const room = await Room.create({ name, ownerId: req.userId });

    // (Optional) Notify WebSocket backend here if needed

    res.status(201).json(room);
  } catch (err) {
    next(err); // forward to global error handler
  }
});

export default router;
