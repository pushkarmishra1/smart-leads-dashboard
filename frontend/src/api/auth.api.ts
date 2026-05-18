import { apiClient } from '@/lib/axios';
import { ApiResponse, User } from '@/types';

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'sales';
}

interface AuthData {
  user: User;
  token: string;
}

export const authApi = {
  login: async (payload: LoginPayload): Promise<AuthData> => {
    const res = await apiClient.post<ApiResponse<AuthData>>('/auth/login', payload);
    return res.data.data;
  },

  register: async (payload: RegisterPayload): Promise<AuthData> => {
    const res = await apiClient.post<ApiResponse<AuthData>>('/auth/register', payload);
    return res.data.data;
  },

  getProfile: async (): Promise<User> => {
    const res = await apiClient.get<ApiResponse<User>>('/auth/profile');
    return res.data.data;
  },
};
