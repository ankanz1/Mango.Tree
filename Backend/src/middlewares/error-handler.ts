import type { Request, Response, NextFunction } from "express"
import { errorResponse } from "@utils/api-response.js"
import logger from "@utils/logger.js"

// Custom error structure
interface ApiError extends Error {
  status?: number
  details?: Record<string, string>
}

// Global error handler
const errorHandler = (err: ApiError, _req: Request, res: Response, _next: NextFunction) => {
  const statusCode = err.status ?? 500
  const responseMessage = statusCode >= 500 ? "Internal server error" : err.message

  logger.error({ err }, `Request failed with status ${statusCode}`)

  res.status(statusCode).json(errorResponse(responseMessage, err.details))
}

export default errorHandler