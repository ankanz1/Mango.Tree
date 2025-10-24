import type { Request, Response, NextFunction } from "express"
import { errorResponse } from "@utils/api-response.js"

const notFoundHandler = (_req: Request, res: Response, _next: NextFunction) => {
  res.status(404).json(errorResponse("Route not found"))
}

export default notFoundHandler