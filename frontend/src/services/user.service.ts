import apiClient from '@/api/client';
import { API_ENDPOINTS } from '@/constants';
import type {
  User,
  CreateUserPayload,
  UpdateUserPayload,
  ApiResponse,
  PaginatedResponse,
} from '@/types';

export const userService = {
  async getAll(params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<User>> {
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<User>>>(
      API_ENDPOINTS.USERS.BASE,
      { params }
    );
    // Handle both wrapped and unwrapped responses
    if (data.data && 'data' in data.data) {
      return data.data;
    }
    // If the API returns an array directly
    const items = (data.data as unknown as User[]) ?? (data as unknown as User[]);
    return {
      data: Array.isArray(items) ? items : [],
      total: Array.isArray(items) ? items.length : 0,
      page: params?.page ?? 1,
      limit: params?.limit ?? 10,
      totalPages: 1,
    };
  },

  async getById(id: string): Promise<User> {
    const { data } = await apiClient.get<ApiResponse<User>>(
      API_ENDPOINTS.USERS.BY_ID(id)
    );
    return data.data ?? (data as unknown as User);
  },

  async create(payload: CreateUserPayload): Promise<User> {
    const { data } = await apiClient.post<ApiResponse<User>>(
      API_ENDPOINTS.USERS.BASE,
      payload
    );
    return data.data ?? (data as unknown as User);
  },

  async update(id: string, payload: UpdateUserPayload): Promise<User> {
    const { data } = await apiClient.patch<ApiResponse<User>>(
      API_ENDPOINTS.USERS.BY_ID(id),
      payload
    );
    return data.data ?? (data as unknown as User);
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.USERS.BY_ID(id));
  },
};
