import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadsApi } from '@/api/leads.api';
import { LeadFilters, CreateLeadInput, UpdateLeadInput } from '@/types';
import toast from 'react-hot-toast';

// Query key factory for consistent cache keys
export const leadKeys = {
  all: ['leads'] as const,
  lists: () => [...leadKeys.all, 'list'] as const,
  list: (filters: LeadFilters) => [...leadKeys.lists(), filters] as const,
  detail: (id: string) => [...leadKeys.all, 'detail', id] as const,
};

/**
 * Fetches paginated leads list with filters
 */
export const useLeads = (filters: LeadFilters) => {
  return useQuery({
    queryKey: leadKeys.list(filters),
    queryFn: () => leadsApi.getLeads(filters),
    placeholderData: (prev) => prev, // Keep old data while fetching new page
    staleTime: 30 * 1000, // 30 seconds
  });
};

/**
 * Fetches a single lead
 */
export const useLead = (id: string) => {
  return useQuery({
    queryKey: leadKeys.detail(id),
    queryFn: () => leadsApi.getLeadById(id),
    enabled: !!id,
  });
};

/**
 * Creates a new lead
 */
export const useCreateLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLeadInput) => leadsApi.createLead(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
      toast.success('Lead created successfully!');
    },
    onError: () => {
      toast.error('Failed to create lead. Please try again.');
    },
  });
};

/**
 * Updates an existing lead
 */
export const useUpdateLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLeadInput }) =>
      leadsApi.updateLead(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
      queryClient.invalidateQueries({ queryKey: leadKeys.detail(id) });
      toast.success('Lead updated successfully!');
    },
    onError: () => {
      toast.error('Failed to update lead. Please try again.');
    },
  });
};

/**
 * Deletes a lead
 */
export const useDeleteLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => leadsApi.deleteLead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
      toast.success('Lead deleted successfully!');
    },
    onError: () => {
      toast.error('Failed to delete lead. Please try again.');
    },
  });
};

/**
 * Exports leads as CSV download
 */
export const useExportCsv = () => {
  return useMutation({
    mutationFn: (filters: Omit<LeadFilters, 'page'>) => leadsApi.exportCsv(filters),
    onSuccess: (blob) => {
      // Trigger browser download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('CSV exported successfully!');
    },
    onError: () => {
      toast.error('Failed to export CSV.');
    },
  });
};
