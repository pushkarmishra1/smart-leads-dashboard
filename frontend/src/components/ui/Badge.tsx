import React from 'react';
import { cn } from '@/lib/cn';
import { LeadStatus, LeadSource } from '@/types';

type BadgeVariant = 'default' | LeadStatus | LeadSource;

const variantStyles: Record<string, string> = {
  default: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  New: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  Contacted: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  Qualified: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  Lost: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  Website: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  Instagram: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
  Referral: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  children,
  className,
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variantStyles[variant] ?? variantStyles.default,
        className
      )}
    >
      {children}
    </span>
  );
};
