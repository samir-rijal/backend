import apiClient from '@/api/client';
import { API_ENDPOINTS } from '@/constants';
import type { HealthStatus, ApiResponse } from '@/types';

export const healthService = {
  async check(): Promise<HealthStatus> {
    const { data } = await apiClient.get<ApiResponse<HealthStatus>>(
      API_ENDPOINTS.HEALTH
    );
    return data.data ?? (data as unknown as HealthStatus);
  },
};
