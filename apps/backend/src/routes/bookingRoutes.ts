import express, { Request, Response } from 'express';
import { authMiddleware, permit } from '../middleware/rbac';
import { createLogger } from '../logger';
import * as bookingService from '../services/bookingService';

const router = express.Router();
const logger = createLogger('bookingRoutes');

router.use(authMiddleware);

router.post('/', permit('CUSTOMER', 'SUPER_ADMIN', 'ADMIN', 'MANAGER'), async (req: Request, res: Response) => {
  try {
    const tenantId = req.auth!.tenantId;
    const body = req.body;
    const input = { tenantId, customerId: body.customerId, pickupAt: new Date(body.pickupAt), dropoffAt: new Date(body.dropoffAt), totalAmount: Number(body.totalAmount) };
    const result = await bookingService.createBooking(input);
    res.json(result);
  } catch (error) {
    logger.error('create booking failed', { error });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/', permit('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'DISPATCHER'), async (req: Request, res: Response) => {
  try {
    const tenantId = req.auth!.tenantId;
    const bookings = await bookingService.listBookings(tenantId);
    res.json(bookings);
  } catch (error) {
    logger.error('list bookings failed', { error });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/:id/assign', permit('DISPATCHER', 'MANAGER', 'ADMIN', 'SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const bookingId = req.params.id;
    const { vehicleId } = req.body;
    const updated = await bookingService.assignVehicle(bookingId, vehicleId);
    res.json(updated);
  } catch (error) {
    logger.error('assign vehicle failed', { error });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
