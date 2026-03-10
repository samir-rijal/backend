import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { UserListPage } from '@/pages/dashboard/UserListPage';
import { UserProfilePage } from '@/pages/dashboard/UserProfilePage';
import { EditProfilePage } from '@/pages/dashboard/EditProfilePage';
import { NotFoundPage } from '@/pages/system/NotFoundPage';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public auth routes */}
        <Route
          element={
            <PublicRoute>
              <AuthLayout />
            </PublicRoute>
          }
        >
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
        </Route>

        {/* Protected dashboard routes */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
          <Route path={ROUTES.USERS} element={<UserListPage />} />
          <Route path={ROUTES.USER_PROFILE} element={<UserProfilePage />} />
          <Route path={ROUTES.EDIT_PROFILE} element={<EditProfilePage />} />
        </Route>

        {/* Redirect root to dashboard */}
        <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.DASHBOARD} replace />} />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
