import { Router, Request, Response } from 'express';
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

    const { username, password, email, photo = null } = result.data;

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
        name: username,
        photo: photo || null
      }
    });

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET!, {
      expiresIn: '7d',
    });

    // Set JWT as HttpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
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

    const { email, password } = result.data;

    const user = await prismaClient.user.findUnique({
      where: { email }
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
       res.status(401).json({ message: 'Bad credentials' });
       return;
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET!, {
      expiresIn: '7d',
    });

    // Set JWT as HttpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    res.status(200).json({ token });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });
  res.status(200).json({ message: 'Logged out' });
});

// Add /api/auth/me endpoint
router.get('/me', (req: Request, res: Response, next) => {
  (async () => {
    try {
      let token: string | undefined;
      if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
      } else {
        const auth = req.headers.authorization;
        if (auth && auth.startsWith('Bearer ')) {
          token = auth.split(' ')[1];
        }
      }
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }
      const secret = String(process.env.JWT_SECRET || JWT_SECRET || '');
      if (!secret || secret === 'undefined') {
        return res.status(500).json({ error: 'JWT secret not configured' });
      }
      let decoded: any;
      try {
        decoded = jwt.verify(String(token), String(secret));
      } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }
      if (!decoded || typeof decoded !== 'object' || !('userId' in decoded)) {
        return res.status(401).json({ error: 'Invalid token' });
      }
      const user = await prismaClient.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, name: true, email: true, photo: true },
      });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ user });
    } catch (err) {
      next(err);
    }
  })();
});

export default router;
