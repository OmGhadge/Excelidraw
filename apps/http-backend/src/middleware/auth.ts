
import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { JWT_SECRET } from '@repo/backend-common/config';

interface TokenPayload extends JwtPayload {
  userId: string;
}

export interface AuthRequest extends Request {
  user?: { id: string };
}

export const verifyToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  let token: string | undefined;

 
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else {
   
    const bearer = req.headers.authorization;
    if (bearer?.startsWith('Bearer ')) {
      const [, rawToken] = bearer.split(' ');
      token = rawToken?.trim();
    }
  }

  if (!token) {
    res.status(401).json({ message: 'No token provided or invalid format' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET!) as JwtPayload;
    console.log('[Auth Middleware] Decoded JWT:', decoded);
    console.log('[Auth Middleware] JWT_SECRET:', JWT_SECRET);

    if (
      typeof decoded !== 'object' ||
      decoded === null ||
      !('userId' in decoded)
    ) {
      res.status(401).json({ message: 'Invalid token payload' });
      return;
    }

    req.user = { id: (decoded as TokenPayload).userId };
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};
