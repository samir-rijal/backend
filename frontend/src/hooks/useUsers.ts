import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { userService } from '@/services';
import { QUERY_KEYS } from '@/constants';
import type { CreateUserPayload, UpdateUserPayload } from '@/types';

/** Fetch all users with pagination */
export function useUsers(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: [...QUERY_KEYS.USERS, params],
    queryFn: () => userService.getAll(params),
    staleTime: 30 * 1000, // 30 seconds
  });
}

/** Fetch a single user by ID */
export function useUser(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.USER(id),
    queryFn: () => userService.getById(id),
    enabled: !!id,
  });
}

/** Create user mutation */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateUserPayload) => userService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS });
      toast.success('User created successfully');
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message ?? 'Failed to create user');
    },
  });
}

/** Update user mutation */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) =>
      userService.update(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER(variables.id) });
      toast.success('User updated successfully');
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message ?? 'Failed to update user');
    },
  });
}

/** Delete user mutation */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS });
      toast.success('User deleted successfully');
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message ?? 'Failed to delete user');
    },
  });
}
