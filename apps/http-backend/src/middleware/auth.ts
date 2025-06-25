// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { JWT_SECRET } from '@repo/backend-common/config';

interface TokenPayload extends JwtPayload {
  userId: string;
}

export interface AuthRequest extends Request {
  userId?: string;
}

export const verifyToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const bearer = req.headers.authorization;

  if (!bearer?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'No token provided or invalid format' });
    return;
  }

  const [, rawToken] = bearer.split(' ');
  const token = rawToken?.trim(); 

  if (!token) {
    res.status(401).json({ message: 'Token missing after Bearer' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET!) as JwtPayload;

    if (
      typeof decoded !== 'object' ||
      decoded === null ||
      !('userId' in decoded)
    ) {
      res.status(401).json({ message: 'Invalid token payload' });
      return;
    }

    req.userId = (decoded as TokenPayload).userId;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};
