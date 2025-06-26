import { Router } from 'express';
import { verifyToken, AuthRequest } from '../middleware/auth.js';
import { prismaClient } from '@repo/db/client';
import { CreateRoomSchema } from "@repo/common/types";

const router: Router = Router();

// POST /api/rooms
router.post('/', verifyToken, async (req: AuthRequest, res, next) => {
  try {
    const result = CreateRoomSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({ error: result.error.format() });
      return;
    }

    const { name } = result.data;

    const room = await prismaClient.room.create({
  data: {
    slug: name,
    adminId: req.userId! 
  }
    });

    res.status(201).json(room);
  } catch (err) {
    next(err); // forward to global error handler
  }
});


router.post("/chats/:roomId",async (req,res)=>{
  const roomId=Number(req.params.roomId);
  const messages=await prismaClient.chat.findMany({
    where:{
      roomId:roomId
    },
    orderBy:{
      id:"desc"
    },
    take:50
  });

  res.json({messages});
});
export default router;
