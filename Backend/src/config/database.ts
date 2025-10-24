import mongoose from "mongoose"
import dotenv from 'dotenv'
import logger from "@utils/logger.js"

// Load environment variables
dotenv.config()

export const connectDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment variables')
    }

    await mongoose.connect(mongoUri)
    logger.info("Connected to MongoDB Atlas")
  } catch (error) {
    logger.error({ error }, "Failed to connect to MongoDB Atlas")
    throw error
  }
}

export const disconnectDatabase = async () => {
  await mongoose.disconnect()
}