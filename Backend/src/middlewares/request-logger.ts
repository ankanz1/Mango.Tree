import type { Request, Response, NextFunction } from "express"
import logger from "@utils/logger.js"

const requestLogger = (req: Request, _res: Response, next: NextFunction) => {
  logger.info({ method: req.method, path: req.path, body: req.body }, "Incoming request")
  next()
}

export default requestLogger