import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { sendError } from '../utils/response';
import { UserRole } from '../types';

/**
 * Middleware: Verifies JWT from Authorization header.
 * Sets req.user = { userId, role } on success.
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendError(res, 'Access denied. No token provided.', 401);
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch {
    sendError(res, 'Invalid or expired token.', 401);
  }
};

/**
 * Middleware factory: Restricts access to specific roles.
 * Must be used AFTER authenticate middleware.
 *
 * @example router.delete('/', authenticate, authorize('admin'), deleteUser)
 */
export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Not authenticated.', 401);
      return;
    }

    if (!roles.includes(req.user.role)) {
      sendError(res, 'Access denied. Insufficient permissions.', 403);
      return;
    }

    next();
  };
};
