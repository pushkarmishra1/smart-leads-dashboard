import { Request, Response } from 'express';
import { User } from '../models/User';
import { asyncHandler } from '../middleware/error.middleware';
import { sendSuccess } from '../utils/response';
import { AppError } from '../utils/AppError';

/**
 * User Controller: Admin-only user management operations.
 */

export const getAllUsers = asyncHandler(async (_req: Request, res: Response) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  sendSuccess(res, users, 'Users fetched');
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Prevent admin from deleting themselves
  if (req.user!.userId === id) {
    throw new AppError('You cannot delete your own account', 400);
  }

  const user = await User.findByIdAndDelete(id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  sendSuccess(res, null, 'User deleted successfully');
});

export const updateUserRole = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!['admin', 'sales'].includes(role)) {
    throw new AppError('Invalid role. Must be admin or sales', 400);
  }

  // Prevent self role change
  if (req.user!.userId === id) {
    throw new AppError('You cannot change your own role', 400);
  }

  const user = await User.findByIdAndUpdate(
    id,
    { role },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  sendSuccess(res, user, 'User role updated');
});
