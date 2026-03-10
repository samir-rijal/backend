import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUsers, useDeleteUser, useCreateUser } from '@/hooks';
import { Table } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PAGINATION } from '@/constants';
import { formatDate, capitalize } from '@/utils';
import type { User } from '@/types';

const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['admin', 'user']).default('user'),
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;

export function UserListPage() {
  const [page, setPage] = useState(PAGINATION.DEFAULT_PAGE);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const { data, isLoading } = useUsers({ page, limit: PAGINATION.DEFAULT_LIMIT });
  const deleteUser = useDeleteUser();
  const createUser = useCreateUser();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { role: 'user' },
  });

  const onCreateUser = (formData: CreateUserFormValues) => {
    createUser.mutate(formData, {
      onSuccess: () => {
        setShowCreateModal(false);
        reset();
      },
    });
  };

  const handleDelete = (id: string) => {
    deleteUser.mutate(id, {
      onSuccess: () => setDeleteConfirmId(null),
    });
  };

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (user: User) => (
        <Link
          to={`/dashboard/users/${user.id}`}
          className="font-medium text-blue-600 hover:text-blue-500"
        >
          {user.name}
        </Link>
      ),
    },
    { key: 'email', header: 'Email' },
    {
      key: 'role',
      header: 'Role',
      render: (user: User) => (
        <span
          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
            user.role === 'admin'
              ? 'bg-purple-100 text-purple-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {capitalize(user.role)}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (user: User) => formatDate(user.createdAt),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (user: User) => (
        <div className="flex items-center gap-2">
          <Link
            to={`/dashboard/users/${user.id}/edit`}
            className="rounded px-2 py-1 text-sm text-blue-600 hover:bg-blue-50"
          >
            Edit
          </Link>
          <button
            onClick={() => setDeleteConfirmId(user.id)}
            className="rounded px-2 py-1 text-sm text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage all users in the system
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>Add User</Button>
      </div>

      <Table
        columns={columns}
        data={data?.data ?? []}
        keyExtractor={(user) => user.id}
        isLoading={isLoading}
        emptyMessage="No users found"
      />

      {data && (
        <Pagination
          currentPage={page}
          totalPages={data.totalPages}
          onPageChange={setPage}
        />
      )}

      {/* Create User Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          reset();
        }}
        title="Create New User"
      >
        <form onSubmit={handleSubmit(onCreateUser)} className="space-y-4">
          <Input
            label="Full Name"
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            label="Email"
            type="email"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Password"
            type="password"
            error={errors.password?.message}
            {...register('password')}
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Role
            </label>
            <select
              {...register('role')}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowCreateModal(false);
                reset();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={createUser.isPending}>
              Create User
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        title="Delete User"
        size="sm"
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to delete this user? This action cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteConfirmId(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            isLoading={deleteUser.isPending}
            onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
