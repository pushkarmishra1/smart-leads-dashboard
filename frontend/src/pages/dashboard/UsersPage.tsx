import React, { useState } from 'react';
import { format } from 'date-fns';
import { Trash2, ShieldCheck, Shield } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/api/users.api';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { TableRowSkeleton } from '@/components/ui/Skeleton';
import { useAuthStore } from '@/store/auth.store';
import { User } from '@/types';
import toast from 'react-hot-toast';

const UsersPage: React.FC = () => {
  const { user: currentUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.getAllUsers,
  });

  const { mutate: deleteUser, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => usersApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted successfully');
      setDeleteTarget(null);
    },
    onError: () => toast.error('Failed to delete user'),
  });

  const { mutate: updateRole } = useMutation({
    mutationFn: ({ id, role }: { id: string; role: 'admin' | 'sales' }) =>
      usersApi.updateUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Role updated successfully');
    },
    onError: () => toast.error('Failed to update role'),
  });

  const toggleRole = (u: User) => {
    const newRole = u.role === 'admin' ? 'sales' : 'admin';
    updateRole({ id: u._id, role: newRole });
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Users</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Manage team members and their roles
        </p>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                {['Name', 'Email', 'Role', 'Joined', 'Actions'].map((h) => (
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
                ? Array.from({ length: 4 }).map((_, i) => <TableRowSkeleton key={i} />)
                : users.length === 0
                ? (
                  <tr>
                    <td colSpan={5}>
                      <EmptyState title="No users found" description="No team members yet." />
                    </td>
                  </tr>
                )
                : users.map((u) => {
                    const isSelf = u._id === currentUser?._id;
                    return (
                      <tr
                        key={u._id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors group"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-semibold text-primary-600 dark:text-primary-400">
                                {u.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-900 dark:text-gray-100">
                                {u.name}
                              </span>
                              {isSelf && (
                                <span className="ml-2 text-xs text-gray-400">(you)</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{u.email}</td>
                        <td className="px-4 py-3">
                          <Badge variant={u.role === 'admin' ? 'Qualified' : 'New'}>
                            {u.role === 'admin' ? 'Admin' : 'Sales'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {format(new Date(u.createdAt), 'dd MMM yyyy')}
                        </td>
                        <td className="px-4 py-3">
                          {!isSelf && (
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleRole(u)}
                                className="p-1.5 h-auto"
                                title={`Change to ${u.role === 'admin' ? 'Sales' : 'Admin'}`}
                              >
                                {u.role === 'admin' ? (
                                  <Shield size={15} />
                                ) : (
                                  <ShieldCheck size={15} />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteTarget(u)}
                                className="p-1.5 h-auto text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                title="Delete user"
                              >
                                <Trash2 size={15} />
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteUser(deleteTarget._id)}
        title="Delete User"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default UsersPage;
