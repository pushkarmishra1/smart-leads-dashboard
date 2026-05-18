import { apiClient } from '@/lib/axios';
import { ApiResponse, User, UserRole } from '@/types';

export const usersApi = {
  getAllUsers: async (): Promise<User[]> => {
    const res = await apiClient.get<ApiResponse<User[]>>('/users');
    return res.data.data;
  },

  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },

  updateUserRole: async (id: string, role: UserRole): Promise<User> => {
    const res = await apiClient.patch<ApiResponse<User>>(`/users/${id}/role`, { role });
    return res.data.data;
  },
};
