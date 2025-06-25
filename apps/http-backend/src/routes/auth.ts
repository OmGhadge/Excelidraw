import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { CreateUserSchema, SigninSchema } from "@repo/common/types";
import { prismaClient } from '@repo/db/client';
import {JWT_SECRET} from '@repo/backend-common/config';


const router: Router = Router();

// POST /api/auth/signup
router.post('/signup', async (req, res, next) => {
  try {
    const result = CreateUserSchema.safeParse(req.body);

    if (!result.success) {
      res.status(401).json({ error: result.error.format() });
      return;
    }

    const { username, password, email } = result.data;

    const existingUser = await prismaClient.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      res.status(409).json({ message: 'User already exists' });
      return ;
    }

    const hash = await bcrypt.hash(password, 12);

    const user = await prismaClient.user.create({
      data: {
        email,
        password: hash,
        name: username
      }
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET!, {
      expiresIn: '7d',
    });

    res.status(201).json({ token });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/signin
router.post('/signin', async (req, res, next) => {
  try {
    const result = SigninSchema.safeParse(req.body);

    if (!result.success) {
       res.status(401).json({ error: result.error.format() });
       return;
    }

    const { username: email, password } = result.data;

    const user = await prismaClient.user.findUnique({
      where: { email }
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
       res.status(401).json({ message: 'Bad credentials' });
       return;
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET!, {
      expiresIn: '7d',
    });

    res.status(200).json({ token });
  } catch (err) {
    next(err);
  }
});

export default router;
