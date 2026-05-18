import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { asyncHandler } from '../middleware/error.middleware';
import { sendSuccess } from '../utils/response';
import { RegisterBody, LoginBody } from '../types';

/**
 * Auth Controller: Thin layer that parses HTTP, calls service, sends response.
 * No business logic here.
 */

export const register = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as RegisterBody;
  const result = await authService.register(body);

  sendSuccess(res, result, 'Registration successful', 201);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as LoginBody;
  const result = await authService.login(body);

  sendSuccess(res, result, 'Login successful');
});

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const user = await authService.getProfile(userId);

  sendSuccess(res, user, 'Profile fetched');
});
