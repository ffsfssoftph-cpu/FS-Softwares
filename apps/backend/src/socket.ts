import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createLogger } from './logger';
import { getRedisClient } from './redisClient';
import prisma from './prismaClient';

const logger = createLogger('socket');

export function initSocket(server: HttpServer): Server {
  const io = new Server(server, { cors: { origin: '*' } });

  try {
    const redis = getRedisClient();
    const pubClient = redis.duplicate();
    const subClient = redis.duplicate();
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
      io.adapter(createAdapter(pubClient, subClient));
      logger.info('Socket.io adapter configured with Redis');
    }).catch((err) => logger.error('Redis adapter connect error', { err }));
  } catch (error) {
    logger.warn('Redis not available for adapter, running single-node', { error });
  }

  io.on('connection', (socket: Socket) => {
    logger.info('Socket connected', { id: socket.id });

    socket.on('tracking:update', async (payload: { vehicleId: string; latitude: number; longitude: number; speedKph?: number; heading?: number; }) => {
      try {
        const { vehicleId, latitude, longitude, speedKph, heading } = payload;
        await prisma.trackingLog.create({ data: { vehicleId, latitude, longitude, speedKph: speedKph ?? undefined, heading: heading ?? undefined } });
        io.to(`vehicle:${vehicleId}`).emit('tracking:update', { vehicleId, latitude, longitude, speedKph, heading, timestamp: new Date().toISOString() });
      } catch (error) {
        logger.error('tracking:update handler error', { error });
      }
    });

    socket.on('chat:message', async (payload: { roomId: string; senderId?: string; content: string }) => {
      try {
        const { roomId, senderId, content } = payload;
        const msg = await prisma.chatMessage.create({ data: { roomId, senderId, content } });
        io.to(`room:${roomId}`).emit('chat:message', msg);
      } catch (error) {
        logger.error('chat:message handler error', { error });
      }
    });

    socket.on('joinRoom', (room: string) => {
      socket.join(room);
    });

    socket.on('leaveRoom', (room: string) => {
      socket.leave(room);
    });

    socket.on('disconnect', () => {
      logger.info('Socket disconnected', { id: socket.id });
    });
  });

  return io;
}
