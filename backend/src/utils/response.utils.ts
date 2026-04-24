export const successResponse = <T>(data: T, message?: string) => ({
  success: true,
  message,
  data
});

export const errorResponse = (code: string, message: string, details?: unknown) => ({
  success: false,
  error: {
    code,
    message,
    details
  }
});

