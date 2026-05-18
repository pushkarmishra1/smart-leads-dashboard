import { UserRole } from './index';

// Extends Express Request to include authenticated user info
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: UserRole;
      };
    }
  }
}
