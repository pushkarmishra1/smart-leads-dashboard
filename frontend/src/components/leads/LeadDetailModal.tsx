import React from 'react';
import { format } from 'date-fns';
import { Mail, User as UserIcon, Tag, Globe, Calendar } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Lead, User } from '@/types';

interface LeadDetailModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
}

interface DetailRowProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

const DetailRow: React.FC<DetailRowProps> = ({ icon, label, value }) => (
  <div className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 mt-0.5 text-gray-500 dark:text-gray-400">
      {icon}
    </div>
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{label}</p>
      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{value}</div>
    </div>
  </div>
);

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({ lead, isOpen, onClose }) => {
  if (!lead) return null;

  const creator = typeof lead.createdBy === 'object'
    ? (lead.createdBy as User)
    : null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Lead Details" size="md">
      <div className="space-y-1">
        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
              {lead.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base">
              {lead.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{lead.email}</p>
          </div>
        </div>

        {/* Details */}
        <DetailRow
          icon={<Mail size={15} />}
          label="Email"
          value={lead.email}
        />
        <DetailRow
          icon={<Tag size={15} />}
          label="Status"
          value={<Badge variant={lead.status}>{lead.status}</Badge>}
        />
        <DetailRow
          icon={<Globe size={15} />}
          label="Source"
          value={<Badge variant={lead.source}>{lead.source}</Badge>}
        />
        {creator && (
          <DetailRow
            icon={<UserIcon size={15} />}
            label="Created By"
            value={
              <span>
                {creator.name}{' '}
                <span className="text-gray-400 font-normal text-xs">({creator.role})</span>
              </span>
            }
          />
        )}
        <DetailRow
          icon={<Calendar size={15} />}
          label="Created At"
          value={format(new Date(lead.createdAt), 'dd MMMM yyyy, hh:mm a')}
        />
        <DetailRow
          icon={<Calendar size={15} />}
          label="Last Updated"
          value={format(new Date(lead.updatedAt), 'dd MMMM yyyy, hh:mm a')}
        />
      </div>
    </Modal>
  );
};
