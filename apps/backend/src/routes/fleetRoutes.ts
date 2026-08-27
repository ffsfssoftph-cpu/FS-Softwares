import express, { Request, Response } from 'express';
import { authMiddleware, permit } from '../middleware/rbac';
import { createLogger } from '../logger';
import * as fleetService from '../services/fleetService';

const router = express.Router();
const logger = createLogger('fleetRoutes');

router.use(authMiddleware);

router.post('/', permit('SUPER_ADMIN', 'ADMIN', 'MANAGER'), async (req: Request, res: Response) => {
  try {
    const tenantId = req.auth!.tenantId;
    const input = { ...req.body, tenantId };
    const vehicle = await fleetService.createVehicle(input);
    res.json(vehicle);
  } catch (error) {
    logger.error('create vehicle failed', { error });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/', permit('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'DISPATCHER'), async (req: Request, res: Response) => {
  try {
    const tenantId = req.auth!.tenantId;
    const vehicles = await fleetService.listVehicles(tenantId);
    res.json(vehicles);
  } catch (error) {
    logger.error('list vehicles failed', { error });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/:id', permit('SUPER_ADMIN', 'ADMIN', 'MANAGER'), async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const updated = await fleetService.updateVehicle(id, req.body);
    res.json(updated);
  } catch (error) {
    logger.error('update vehicle failed', { error });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete('/:id', permit('SUPER_ADMIN', 'ADMIN'), async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    await fleetService.deleteVehicle(id);
    res.json({ ok: true });
  } catch (error) {
    logger.error('delete vehicle failed', { error });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
