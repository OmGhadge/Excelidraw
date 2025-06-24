// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

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
    res.status(401).json({ message: 'No token' });
    return;
  }

  // ➤ split once and check the second part exists
  const [, token] = bearer.split(' ');

  if (!token) {                        // token is still string | undefined here
    res.status(401).json({ message: 'No token' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    if (typeof decoded !== 'object' || decoded === null || !('userId' in decoded)) {
      res.status(401).json({ message: 'Invalid token payload' });
      return;
    }

    req.userId = (decoded as TokenPayload).userId;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};
