import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/constants';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-200">404</h1>
        <h2 className="mt-4 text-2xl font-semibold text-gray-900">
          Page Not Found
        </h2>
        <p className="mt-2 text-gray-600">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>
        <Link to={ROUTES.DASHBOARD}>
          <Button className="mt-6">Go to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
