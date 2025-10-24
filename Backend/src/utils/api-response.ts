export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  errors?: Record<string, string>
}

export const successResponse = <T>(data: T, message?: string): ApiResponse<T> => ({
  success: true,
  data,
  message,
})

export const errorResponse = (message: string, errors?: Record<string, string>): ApiResponse<null> => ({
  success: false,
  message,
  errors,
})