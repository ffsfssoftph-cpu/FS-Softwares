import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../auth';
import { createLogger } from '../logger';

const logger = createLogger('rbac');

export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'DISPATCHER' | 'DRIVER' | 'CUSTOMER';

declare global {
  namespace Express {
    interface Request {
      auth?: TokenPayload;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ error: 'Missing Authorization header' });
      return;
    }
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      res.status(401).json({ error: 'Invalid Authorization header' });
      return;
    }
    const token = parts[1];
    try {
      const payload = verifyAccessToken(token);
      req.auth = payload;
      next();
    } catch (err) {
      res.status(401).json({ error: 'Invalid or expired token' });
    }
  } catch (error) {
    logger.error('authMiddleware error', { error });
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export function permit(...allowed: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const auth = req.auth;
      if (!auth) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      if (allowed.includes(auth.role as Role)) {
        next();
      } else {
        res.status(403).json({ error: 'Forbidden' });
      }
    } catch (error) {
      logger.error('permit middleware error', { error });
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
}
