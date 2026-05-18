import { apiClient } from '@/lib/axios';
import {
  ApiResponse,
  Lead,
  CreateLeadInput,
  UpdateLeadInput,
  PaginatedResponse,
  LeadFilters,
} from '@/types';

export const leadsApi = {
  getLeads: async (filters: LeadFilters = {}): Promise<PaginatedResponse<Lead>> => {
    // Remove empty string values before sending
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== '' && v !== undefined)
    );
    const res = await apiClient.get<ApiResponse<PaginatedResponse<Lead>>>('/leads', { params });
    return res.data.data;
  },

  getLeadById: async (id: string): Promise<Lead> => {
    const res = await apiClient.get<ApiResponse<Lead>>(`/leads/${id}`);
    return res.data.data;
  },

  createLead: async (payload: CreateLeadInput): Promise<Lead> => {
    const res = await apiClient.post<ApiResponse<Lead>>('/leads', payload);
    return res.data.data;
  },

  updateLead: async (id: string, payload: UpdateLeadInput): Promise<Lead> => {
    const res = await apiClient.put<ApiResponse<Lead>>(`/leads/${id}`, payload);
    return res.data.data;
  },

  deleteLead: async (id: string): Promise<void> => {
    await apiClient.delete(`/leads/${id}`);
  },

  exportCsv: async (filters: Omit<LeadFilters, 'page'> = {}): Promise<Blob> => {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== '' && v !== undefined)
    );
    const res = await apiClient.get('/leads/export/csv', {
      params,
      responseType: 'blob',
    });
    return res.data as Blob;
  },
};
