import apiClient from '@/api/client';
import { API_ENDPOINTS, STORAGE_KEYS } from '@/constants';
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  ChangePasswordPayload,
  ApiResponse,
} from '@/types';

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await apiClient.post<ApiResponse<AuthResponse>>(
      API_ENDPOINTS.AUTH.LOGIN,
      payload
    );
    const authData = data.data ?? (data as unknown as AuthResponse);
    // Store tokens
    if (authData.tokens) {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, authData.tokens.accessToken);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, authData.tokens.refreshToken);
    }
    return authData;
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const { data } = await apiClient.post<ApiResponse<AuthResponse>>(
      API_ENDPOINTS.AUTH.REGISTER,
      payload
    );
    const authData = data.data ?? (data as unknown as AuthResponse);
    if (authData.tokens) {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, authData.tokens.accessToken);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, authData.tokens.refreshToken);
    }
    return authData;
  },

  async logout(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, { refreshToken });
    } finally {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    }
  },

  async changePassword(payload: ChangePasswordPayload): Promise<void> {
    await apiClient.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, payload);
  },

  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    const { data } = await apiClient.post<ApiResponse<AuthResponse>>(
      API_ENDPOINTS.AUTH.REFRESH,
      { refreshToken }
    );
    return data.data ?? (data as unknown as AuthResponse);
  },
};
