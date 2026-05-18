import React, { useState } from 'react';
import { Plus, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { LeadTable } from '@/components/leads/LeadTable';
import { LeadFiltersBar } from '@/components/leads/LeadFiltersBar';
import { LeadForm } from '@/components/leads/LeadForm';
import { LeadDetailModal } from '@/components/leads/LeadDetailModal';
import {
  useLeads,
  useCreateLead,
  useUpdateLead,
  useExportCsv,
} from '@/hooks/useLeads';
import { Lead, LeadFilters, CreateLeadInput, UpdateLeadInput } from '@/types';

const LeadsPage: React.FC = () => {
  const [filters, setFilters] = useState<LeadFilters>({ sort: 'latest', page: 1 });
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Lead | null>(null);
  const [viewTarget, setViewTarget] = useState<Lead | null>(null);

  const { data, isLoading } = useLeads(filters);
  const { mutate: createLead, isPending: isCreating } = useCreateLead();
  const { mutate: updateLead, isPending: isUpdating } = useUpdateLead();
  const { mutate: exportCsv, isPending: isExporting } = useExportCsv();

  const leads = data?.data ?? [];
  const pagination = data?.pagination;

  const handleCreate = (formData: CreateLeadInput | UpdateLeadInput) => {
    createLead(formData as CreateLeadInput, {
      onSuccess: () => setIsCreateOpen(false),
    });
  };

  const handleUpdate = (formData: CreateLeadInput | UpdateLeadInput) => {
    if (!editTarget) return;
    updateLead(
      { id: editTarget._id, data: formData as UpdateLeadInput },
      { onSuccess: () => setEditTarget(null) }
    );
  };

  const handleExport = () => {
    const { page: _page, ...exportFilters } = filters;
    exportCsv(exportFilters);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Leads</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {pagination ? `${pagination.total} total leads` : 'Manage your sales leads'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            leftIcon={<Download size={16} />}
            onClick={handleExport}
            isLoading={isExporting}
          >
            Export CSV
          </Button>
          <Button
            leftIcon={<Plus size={16} />}
            onClick={() => setIsCreateOpen(true)}
          >
            Add Lead
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <LeadFiltersBar filters={filters} onChange={setFilters} />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <LeadTable
          leads={leads}
          isLoading={isLoading}
          onEdit={setEditTarget}
          onView={setViewTarget}
          onCreateFirst={() => setIsCreateOpen(true)}
        />

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="px-4 border-t border-gray-100 dark:border-gray-800">
            <Pagination
              meta={pagination}
              onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
            />
          </div>
        )}
      </div>

      {/* Create Lead Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add New Lead"
      >
        <LeadForm mode="create" onSubmit={handleCreate} isLoading={isCreating} />
      </Modal>

      {/* Edit Lead Modal */}
      <Modal
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="Edit Lead"
      >
        {editTarget && (
          <LeadForm
            mode="edit"
            defaultValues={editTarget}
            onSubmit={handleUpdate}
            isLoading={isUpdating}
          />
        )}
      </Modal>

      {/* View Lead Detail Modal */}
      <LeadDetailModal
        lead={viewTarget}
        isOpen={!!viewTarget}
        onClose={() => setViewTarget(null)}
      />
    </div>
  );
};

export default LeadsPage;
