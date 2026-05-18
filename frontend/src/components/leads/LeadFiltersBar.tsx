import React, { useState, useEffect } from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useDebounce } from '@/hooks/useDebounce';
import { LeadFilters, LeadStatus, LeadSource, SortOrder } from '@/types';
import { cn } from '@/lib/cn';

interface LeadFiltersBarProps {
  filters: LeadFilters;
  onChange: (filters: LeadFilters) => void;
}

const statusOptions = [
  { value: 'New', label: 'New' },
  { value: 'Contacted', label: 'Contacted' },
  { value: 'Qualified', label: 'Qualified' },
  { value: 'Lost', label: 'Lost' },
];

const sourceOptions = [
  { value: 'Website', label: 'Website' },
  { value: 'Instagram', label: 'Instagram' },
  { value: 'Referral', label: 'Referral' },
];

const sortOptions = [
  { value: 'latest', label: 'Latest First' },
  { value: 'oldest', label: 'Oldest First' },
];

export const LeadFiltersBar: React.FC<LeadFiltersBarProps> = ({ filters, onChange }) => {
  const [searchInput, setSearchInput] = useState(filters.search ?? '');
  const debouncedSearch = useDebounce(searchInput, 400);

  // Apply debounced search to parent filters
  useEffect(() => {
    onChange({ ...filters, search: debouncedSearch, page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const hasActiveFilters =
    !!filters.status || !!filters.source || !!filters.search;

  const clearAll = () => {
    setSearchInput('');
    onChange({ sort: 'latest', page: 1 });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="flex-1">
          <Input
            placeholder="Search by name or email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            leftIcon={<Search size={16} />}
            rightIcon={
              searchInput ? (
                <button
                  onClick={() => setSearchInput('')}
                  className="pointer-events-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X size={14} />
                </button>
              ) : undefined
            }
          />
        </div>

        {/* Filter Controls */}
        <div className="flex gap-2 flex-wrap">
          <Select
            options={statusOptions}
            placeholder="All Statuses"
            value={filters.status ?? ''}
            onChange={(e) =>
              onChange({ ...filters, status: e.target.value as LeadStatus || undefined, page: 1 })
            }
            className="w-36"
          />

          <Select
            options={sourceOptions}
            placeholder="All Sources"
            value={filters.source ?? ''}
            onChange={(e) =>
              onChange({ ...filters, source: e.target.value as LeadSource || undefined, page: 1 })
            }
            className="w-36"
          />

          <Select
            options={sortOptions}
            value={filters.sort ?? 'latest'}
            onChange={(e) =>
              onChange({ ...filters, sort: e.target.value as SortOrder, page: 1 })
            }
            className="w-36"
          />
        </div>
      </div>

      {/* Active filter chips */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <SlidersHorizontal size={12} />
            Active filters:
          </span>
          {filters.status && (
            <FilterChip
              label={`Status: ${filters.status}`}
              onRemove={() => onChange({ ...filters, status: undefined, page: 1 })}
            />
          )}
          {filters.source && (
            <FilterChip
              label={`Source: ${filters.source}`}
              onRemove={() => onChange({ ...filters, source: undefined, page: 1 })}
            />
          )}
          {filters.search && (
            <FilterChip
              label={`Search: "${filters.search}"`}
              onRemove={() => { setSearchInput(''); onChange({ ...filters, search: '', page: 1 }); }}
            />
          )}
          <Button variant="ghost" onClick={clearAll} className="text-xs px-2 py-1 h-auto">
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
};

const FilterChip: React.FC<{ label: string; onRemove: () => void }> = ({ label, onRemove }) => (
  <span className={cn(
    'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
    'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300',
    'border border-primary-200 dark:border-primary-800'
  )}>
    {label}
    <button
      onClick={onRemove}
      className="ml-0.5 hover:text-primary-900 dark:hover:text-primary-100"
    >
      <X size={11} />
    </button>
  </span>
);
