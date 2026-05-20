import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCircle, TrendingUp, CheckCircle, XCircle, Phone, Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { StatCard } from '@/components/dashboard/StatCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { leadsApi } from '@/api/leads.api';
import { useAuthStore } from '@/store/auth.store';
import { format } from 'date-fns';
import { Lead } from '@/types';

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Fetch all leads for stats (no pagination)
  const { data: allLeads, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => leadsApi.getLeads({ limit: 100 }),
    staleTime: 60 * 1000,
  });

  const leads = allLeads?.data ?? [];
  const total = allLeads?.pagination.total ?? 0;

  const stats = {
    total,
    new: leads.filter((l) => l.status === 'New').length,
    contacted: leads.filter((l) => l.status === 'Contacted').length,
    qualified: leads.filter((l) => l.status === 'Qualified').length,
    lost: leads.filter((l) => l.status === 'Lost').length,
  };

  // Recent 5 leads
  const recentLeads = leads.slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Good morning, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-0.5 text-sm">
            Here's what's happening with your leads today.
          </p>
        </div>
        <Button onClick={() => navigate('/leads')} leftIcon={<Plus size={16} />}>
          Add Lead
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Leads"
          value={stats.total}
          icon={<UserCircle size={22} />}
          color="blue"
          isLoading={isLoading}
          change="All time"
          changeType="neutral"
        />
        <StatCard
          title="Qualified"
          value={stats.qualified}
          icon={<CheckCircle size={22} />}
          color="green"
          isLoading={isLoading}
          change={stats.total ? `${Math.round((stats.qualified / stats.total) * 100)}% of total` : '—'}
          changeType="positive"
        />
        <StatCard
          title="Contacted"
          value={stats.contacted}
          icon={<Phone size={22} />}
          color="yellow"
          isLoading={isLoading}
          change={stats.total ? `${Math.round((stats.contacted / stats.total) * 100)}% of total` : '—'}
          changeType="neutral"
        />
        <StatCard
          title="Lost"
          value={stats.lost}
          icon={<XCircle size={22} />}
          color="red"
          isLoading={isLoading}
          change={stats.total ? `${Math.round((stats.lost / stats.total) * 100)}% of total` : '—'}
          changeType="negative"
        />
      </div>

      {/* Source Breakdown + Recent Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Source Breakdown */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Leads by Source
          </h2>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center gap-3">
                  <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded" />
                  <div className="h-3 w-6 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {(['Website', 'Instagram', 'Referral'] as const).map((source) => {
                const count = leads.filter((l) => l.source === source).length;
                const pct = total ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={source}>
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant={source}>{source}</Badge>
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary-500 transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Leads */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Recent Leads
            </h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/leads')} className="text-xs">
              View all →
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center gap-3 py-2">
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-1/3 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-2.5 w-1/2 bg-gray-100 dark:bg-gray-800 rounded" />
                  </div>
                  <div className="h-5 w-16 bg-gray-100 dark:bg-gray-800 rounded-full" />
                </div>
              ))}
            </div>
          ) : recentLeads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <TrendingUp size={32} className="text-gray-300 dark:text-gray-600 mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">No leads yet</p>
              <Button
                variant="secondary"
                size="sm"
                className="mt-3"
                onClick={() => navigate('/leads')}
              >
                Add your first lead
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {recentLeads.map((lead: Lead) => (
                <div key={lead._id} className="flex items-center gap-3 py-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                      {lead.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {lead.name}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                      {lead.email}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <Badge variant={lead.status}>{lead.status}</Badge>
                    <span className="text-xs text-gray-400">
                      {format(new Date(lead.createdAt), 'dd MMM')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
