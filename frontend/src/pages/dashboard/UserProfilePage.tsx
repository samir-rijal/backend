import { useParams, Link } from 'react-router-dom';
import { useUser } from '@/hooks';
import { Button } from '@/components/ui/Button';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { formatDateTime, getInitials, capitalize } from '@/utils';

export function UserProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { data: user, isLoading, error } = useUser(id!);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl">
        <CardSkeleton />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900">User not found</h2>
        <p className="mt-2 text-sm text-gray-500">
          The user you are looking for does not exist.
        </p>
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
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">User Profile</h1>
        <Link to={`/dashboard/users/${user.id}/edit`}>
          <Button>Edit Profile</Button>
        </Link>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        {/* Avatar & basic info */}
        <div className="flex items-center gap-4 border-b border-gray-200 pb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white">
            {getInitials(user.name)}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>

        {/* Details */}
        <dl className="mt-6 space-y-4">
          <div className="flex justify-between">
            <dt className="text-sm font-medium text-gray-500">Role</dt>
            <dd>
              <span
                className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                  user.role === 'admin'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {capitalize(user.role)}
              </span>
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sm font-medium text-gray-500">User ID</dt>
            <dd className="text-sm text-gray-900 font-mono">{user.id}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sm font-medium text-gray-500">Created</dt>
            <dd className="text-sm text-gray-900">{formatDateTime(user.createdAt)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
            <dd className="text-sm text-gray-900">{formatDateTime(user.updatedAt)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
