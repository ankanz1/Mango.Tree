import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import config from "@config/index.js"
import User, { type UserDocument } from "@models/user.model.js"

interface TokenPair {
  accessToken: string
  refreshToken: string
}

export const hashPassword = async (plainPassword: string): Promise<string> => {
  const saltRounds = 10
  return bcrypt.hash(plainPassword, saltRounds)
}

export const verifyPassword = async (plainPassword: string, passwordHash: string): Promise<boolean> => {
  return bcrypt.compare(plainPassword, passwordHash)
}

const generateAccessToken = (user: UserDocument) => {
  return jwt.sign(
    { sub: user.id, username: user.username },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  )
}

const generateRefreshToken = (user: UserDocument) => {
  return jwt.sign(
    { sub: user.id },
    config.refreshTokenSecret,
    { expiresIn: config.refreshTokenExpiresIn }
  )
}

export const createTokenPair = (user: UserDocument): TokenPair => ({
  accessToken: generateAccessToken(user),
  refreshToken: generateRefreshToken(user),
})

export const findUserByUsernameOrEmail = async (identifier: string): Promise<UserDocument | null> => {
  return User.findOne({ $or: [{ username: identifier }, { email: identifier }] })
}