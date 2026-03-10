import { useAuthStore, useAppStore } from '@/store';
import { useLogout } from '@/hooks';
import { getInitials } from '@/utils';

export function Navbar() {
  const { user } = useAuthStore();
  const { toggleSidebar } = useAppStore();
  const logout = useLogout();

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left: Sidebar toggle */}
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Right: User menu */}
        <div className="ml-auto flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-medium text-white">
                {getInitials(user.name)}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.role}</p>
              </div>
            </div>
          )}
          <button
            onClick={() => logout.mutate()}
            className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
