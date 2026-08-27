import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import { connectPrisma } from './prismaClient';
import { connectRedis } from './redisClient';
import { createLogger } from './logger';
import authRoutes from './routes/authRoutes';
import fleetRoutes from './routes/fleetRoutes';
import bookingRoutes from './routes/bookingRoutes';
import paymentsWebhooks from './webhooks/payments';
import accountingRoutes from './routes/accountingRoutes';
import invoiceRoutes from './routes/invoiceRoutes';
import { initSocket } from './socket';

const logger = createLogger('server');

async function startServer(): Promise<void> {
  try {
    await connectPrisma();
    await connectRedis();

    const app = express();
    // health, JSON and raw for stripe
    app.get('/health', (_req: Request, res: Response) => res.json({ ok: true }));

    app.use('/api/auth', express.json(), authRoutes);
    app.use('/api/fleet', fleetRoutes);
    app.use('/api/bookings', bookingRoutes);
    app.use('/api/accounting', accountingRoutes);
    app.use('/api/invoices', invoiceRoutes);
    app.use('/webhooks', paymentsWebhooks);

    // Basic error handler
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
      logger.error('Unhandled error', { error: err.message });
      res.status(500).json({ error: 'Internal Server Error' });
    });

    const server = http.createServer(app);
    initSocket(server);

    const port = Number(process.env.PORT ?? 4000);
    server.listen(port, () => logger.info(`Server listening on port ${port}`));
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

startServer();
