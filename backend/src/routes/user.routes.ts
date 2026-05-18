import { Router } from 'express';
import {
  getAllUsers,
  deleteUser,
  updateUserRole,
} from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All user management routes are admin-only
router.use(authenticate, authorize('admin'));

router.get('/', getAllUsers);
router.delete('/:id', deleteUser);
router.patch('/:id/role', updateUserRole);

export default router;
