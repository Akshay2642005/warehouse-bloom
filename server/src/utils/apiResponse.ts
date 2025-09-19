export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string> | string;
}

/**
 * Creates a standard API response object.
 */
export function createResponse<T>(payload: Partial<ApiResponse<T>>): ApiResponse<T> {
  return { success: true, ...payload } as ApiResponse<T>;
} 