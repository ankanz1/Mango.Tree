import type { Request, Response, NextFunction } from "express"

export type AsyncRouteHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>

export const asyncHandler = (handler: AsyncRouteHandler) =>
  (req: Request, res: Response, next: NextFunction) => {
    handler(req, res, next).catch(next)
  }