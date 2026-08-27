import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createLogger } from './logger';

const logger = createLogger('auth');

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? 'access_secret_dev_change';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? 'refresh_secret_dev_change';
const ACCESS_EXPIRES_IN = '15m';
const REFRESH_EXPIRES_IN = '7d';
const SALT_ROUNDS = 12;

export interface TokenPayload {
  userId: string;
  tenantId: string;
  role: string;
}

export async function hashPassword(password: string): Promise<string> {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    logger.error('hashPassword error', { error });
    throw error;
  }
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    logger.error('comparePassword error', { error });
    throw error;
  }
}

export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES_IN });
}

export function signRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN });
}

export function verifyAccessToken(token: string): TokenPayload {
  try {
    const decoded = jwt.verify(token, ACCESS_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    logger.error('verifyAccessToken failed', { error });
    throw error;
  }
}

export function verifyRefreshToken(token: string): TokenPayload {
  try {
    const decoded = jwt.verify(token, REFRESH_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    logger.error('verifyRefreshToken failed', { error });
    throw error;
  }
}
