import dotenv from "dotenv"
import path from "node:path"

const envFile = process.env.NODE_ENV === "test" ? ".env.test" : ".env"
dotenv.config({ path: path.resolve(process.cwd(), envFile) })

interface AppConfig {
  port: number
  env: string
  corsOrigin: string
  jwtSecret: string
  jwtExpiresIn: string
  refreshTokenSecret: string
  refreshTokenExpiresIn: string
  mongoUri: string
  celoRpcUrl: string
  contractAddress: string
  bridgeServiceUrl: string
  bettingOracleUrl: string
}

const getEnvVar = (key: string, fallback?: string): string => {
  const value = process.env[key] ?? fallback
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`)
  }
  return value
}

const config: AppConfig = {
  port: Number(getEnvVar("PORT", "4000")),
  env: getEnvVar("NODE_ENV", "development"),
  corsOrigin: getEnvVar("CORS_ORIGIN", "http://localhost:3000"),
  jwtSecret: getEnvVar("JWT_SECRET"),
  jwtExpiresIn: getEnvVar("JWT_EXPIRES_IN", "1d"),
  refreshTokenSecret: getEnvVar("REFRESH_TOKEN_SECRET"),
  refreshTokenExpiresIn: getEnvVar("REFRESH_TOKEN_EXPIRES_IN", "7d"),
  mongoUri: getEnvVar("MONGODB_URI"),
  celoRpcUrl: getEnvVar("CELO_RPC_URL"),
  contractAddress: getEnvVar("CONTRACT_ADDRESS"),
  bridgeServiceUrl: getEnvVar("BRIDGE_SERVICE_URL"),
  bettingOracleUrl: getEnvVar("BETTING_ORACLE_URL")
}

export default config