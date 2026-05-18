import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Lead, CreateLeadInput, UpdateLeadInput } from '@/types';

const leadSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email'),
  status: z.enum(['New', 'Contacted', 'Qualified', 'Lost']),
  source: z.enum(['Website', 'Instagram', 'Referral'], {
    required_error: 'Please select a source',
  }),
});

type LeadFormValues = z.infer<typeof leadSchema>;

interface LeadFormProps {
  onSubmit: (data: CreateLeadInput | UpdateLeadInput) => void;
  isLoading?: boolean;
  defaultValues?: Partial<Lead>;
  mode: 'create' | 'edit';
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

export const LeadForm: React.FC<LeadFormProps> = ({
  onSubmit,
  isLoading,
  defaultValues,
  mode,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      email: defaultValues?.email ?? '',
      status: defaultValues?.status ?? 'New',
      source: defaultValues?.source ?? undefined,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Input
        label="Full Name"
        placeholder="e.g. Rahul Sharma"
        required
        error={errors.name?.message}
        {...register('name')}
      />

      <Input
        label="Email Address"
        type="email"
        placeholder="rahul@example.com"
        required
        error={errors.email?.message}
        {...register('email')}
      />

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Status"
          options={statusOptions}
          error={errors.status?.message}
          {...register('status')}
        />

        <Select
          label="Source"
          options={sourceOptions}
          placeholder="Select source"
          required
          error={errors.source?.message}
          {...register('source')}
        />
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" isLoading={isLoading} className="w-full sm:w-auto">
          {mode === 'create' ? 'Create Lead' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
};
