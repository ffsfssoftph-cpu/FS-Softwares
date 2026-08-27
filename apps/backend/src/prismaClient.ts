import { PrismaClient } from '@prisma/client';
import { createLogger } from './logger';

const logger = createLogger('prisma');

const prisma = new PrismaClient({
  log: [
    { level: 'info', emit: 'event' },
    { level: 'warn', emit: 'event' },
    { level: 'error', emit: 'event' }
  ]
});

prisma.$on('info', (e) => logger.info(e.message));
prisma.$on('warn', (e) => logger.warn(e.message));
prisma.$on('error', (e) => logger.error(e.message));

export async function connectPrisma(): Promise<void> {
  try {
    await prisma.$connect();
    logger.info('Prisma connected');
  } catch (error) {
    logger.error('Prisma connection error', { error });
    throw error;
  }
}

export default prisma;
