import pino from "pino"
import config from "@config/index.js"

const logger = pino({
  level: config.env === "development" ? "debug" : "info",
  transport: config.env === "development" ? { target: "pino-pretty" } : undefined,
})

export default logger