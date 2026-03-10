import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-blue-600">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your application with ease
          </p>
        </div>
        <div className="rounded-xl bg-white px-8 py-10 shadow-lg">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
