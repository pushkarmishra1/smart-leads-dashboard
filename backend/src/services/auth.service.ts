import { User, IUserDocument } from '../models/User';
import { signToken } from '../utils/jwt';
import { AppError } from '../utils/AppError';
import { RegisterBody, LoginBody, IUserPublic } from '../types';

interface AuthResult {
  user: IUserPublic;
  token: string;
}

/**
 * Auth Service: Handles all authentication business logic.
 * Controllers call services; services talk to models/DB.
 */
export class AuthService {
  /**
   * Registers a new user and returns token + user data
   */
  async register(body: RegisterBody): Promise<AuthResult> {
    const { name, email, password, role } = body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('Email already registered', 409);
    }

    // Create user (password hashing is handled in pre-save hook)
    const user = await User.create({ name, email, password, role });

    const token = signToken({ userId: user._id.toString(), role: user.role });

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  /**
   * Authenticates a user and returns token + user data
   */
  async login(body: LoginBody): Promise<AuthResult> {
    const { email, password } = body;

    // Explicitly select password since it's excluded by default
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = signToken({ userId: user._id.toString(), role: user.role });

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  /**
   * Fetches the authenticated user's profile
   */
  async getProfile(userId: string): Promise<IUserPublic> {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return this.sanitizeUser(user);
  }

  /**
   * Strips sensitive fields before sending user data to client
   */
  private sanitizeUser(user: IUserDocument): IUserPublic {
    return {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
  }
}

export const authService = new AuthService();
