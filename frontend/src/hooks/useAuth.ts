import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '@/services';
import { useAuthStore } from '@/store';
import { QUERY_KEYS, ROUTES } from '@/constants';
import type { LoginPayload, RegisterPayload, ChangePasswordPayload } from '@/types';
import { userService } from '@/services';

/** Fetch current user profile and sync with Zustand store */
export function useCurrentUser() {
  const { setUser } = useAuthStore();

  return useQuery({
    queryKey: QUERY_KEYS.AUTH_USER,
    queryFn: async () => {
      try {
        // Attempt to get current user via users/me or first user endpoint
        const users = await userService.getAll({ page: 1, limit: 1 });
        const user = users.data[0] ?? null;
        setUser(user);
        return user;
      } catch {
        setUser(null);
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: useAuthStore.getState().isAuthenticated,
  });
}

/** Login mutation */
export function useLogin() {
  const { setUser } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess: (data) => {
      setUser(data.user);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUTH_USER });
      toast.success('Logged in successfully');
      navigate(ROUTES.DASHBOARD);
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message ?? 'Login failed');
    },
  });
}

/** Register mutation */
export function useRegister() {
  const { setUser } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
    onSuccess: (data) => {
      setUser(data.user);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUTH_USER });
      toast.success('Account created successfully');
      navigate(ROUTES.DASHBOARD);
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message ?? 'Registration failed');
    },
  });
}

/** Logout mutation */
export function useLogout() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      logout();
      queryClient.clear();
      toast.success('Logged out successfully');
      navigate(ROUTES.LOGIN);
    },
    onError: () => {
      // Force logout even if API call fails
      logout();
      queryClient.clear();
      navigate(ROUTES.LOGIN);
    },
  });
}

/** Change password mutation */
export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) =>
      authService.changePassword(payload),
    onSuccess: () => {
      toast.success('Password changed successfully');
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message ?? 'Failed to change password');
    },
  });
}
