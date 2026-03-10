import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUser, useUpdateUser } from '@/hooks';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { useEffect } from 'react';

const editUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  role: z.enum(['admin', 'user']),
});

type EditUserFormValues = z.infer<typeof editUserSchema>;

export function EditProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: user, isLoading } = useUser(id!);
  const updateUser = useUpdateUser();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
  });

  // Populate form when user data loads
  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        role: user.role,
      });
    }
  }, [user, reset]);

  const onSubmit = (data: EditUserFormValues) => {
    updateUser.mutate(
      { id: id!, payload: data },
      {
        onSuccess: () => navigate(`/dashboard/users/${id}`),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl">
        <CardSkeleton />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900">User not found</h2>
        <Link to="/dashboard/users">
          <Button variant="secondary" className="mt-4">
            Back to Users
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit User</h1>
        <p className="mt-1 text-sm text-gray-500">
          Update user information
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            {errors.role && (
              <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={updateUser.isPending}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
