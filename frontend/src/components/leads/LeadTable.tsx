import React, { useState } from 'react';
import { Pencil, Trash2, Eye, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { TableRowSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Lead, User } from '@/types';
import { useDeleteLead } from '@/hooks/useLeads';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/cn';

interface LeadTableProps {
  leads: Lead[];
  isLoading: boolean;
  onEdit: (lead: Lead) => void;
  onView: (lead: Lead) => void;
  onCreateFirst?: () => void;
}

export const LeadTable: React.FC<LeadTableProps> = ({
  leads,
  isLoading,
  onEdit,
  onView,
  onCreateFirst,
}) => {
  const { mutate: deleteLead, isPending: isDeleting } = useDeleteLead();
  const { user, isAdmin } = useAuthStore();
  const [deleteTarget, setDeleteTarget] = useState<Lead | null>(null);

  const canModify = (lead: Lead): boolean => {
    if (isAdmin()) return true;
    const creatorId = typeof lead.createdBy === 'object'
      ? (lead.createdBy as User)._id
      : lead.createdBy;
    return creatorId === user?._id;
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteLead(deleteTarget._id, {
      onSuccess: () => setDeleteTarget(null),
    });
  };

  if (!isLoading && leads.length === 0) {
    return (
      <EmptyState
        title="No leads found"
        description="Try adjusting your filters or add your first lead to get started."
        actionLabel="Add Lead"
        onAction={onCreateFirst}
      />
    );
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
              {['Name', 'Email', 'Status', 'Source', 'Created', 'Actions'].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} />)
              : leads.map((lead) => (
                  <tr
                    key={lead._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors group"
                  >
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {lead.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{lead.email}</td>
                    <td className="px-4 py-3">
                      <Badge variant={lead.status}>{lead.status}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={lead.source}>{lead.source}</Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {format(new Date(lead.createdAt), 'dd MMM yyyy')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onView(lead)}
                          className="p-1.5 h-auto"
                          title="View details"
                        >
                          <Eye size={15} />
                        </Button>
                        {canModify(lead) && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEdit(lead)}
                              className="p-1.5 h-auto"
                              title="Edit lead"
                            >
                              <Pencil size={15} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteTarget(lead)}
                              className="p-1.5 h-auto text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                              title="Delete lead"
                            >
                              <Trash2 size={15} />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List */}
      <div className="md:hidden space-y-3">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card p-4 space-y-2 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-2/3" />
              </div>
            ))
          : leads.map((lead) => (
              <div key={lead._id} className="card p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{lead.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{lead.email}</p>
                  </div>
                  <div className="flex gap-1">
                    <Badge variant={lead.status}>{lead.status}</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex gap-2">
                    <Badge variant={lead.source}>{lead.source}</Badge>
                    <span className="text-xs text-gray-400">
                      {format(new Date(lead.createdAt), 'dd MMM yyyy')}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => onView(lead)} className="p-1.5 h-auto">
                      <Eye size={14} />
                    </Button>
                    {canModify(lead) && (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => onEdit(lead)} className="p-1.5 h-auto">
                          <Pencil size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteTarget(lead)}
                          className="p-1.5 h-auto text-red-500"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Lead"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        isLoading={isDeleting}
      />
    </>
  );
};
