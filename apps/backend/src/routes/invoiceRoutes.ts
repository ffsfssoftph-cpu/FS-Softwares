import express, { Request, Response } from 'express';
import { authMiddleware, permit } from '../middleware/rbac';
import { createLogger } from '../logger';
import { generateInvoicePdfBuffer } from '../invoiceGenerator';
import prisma from '../prismaClient';

const router = express.Router();
const logger = createLogger('invoiceRoutes');

router.use(authMiddleware);

router.get('/:id/pdf', permit('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'DISPATCHER'), async (req: Request, res: Response) => {
  try {
    const invoiceId = req.params.id;
    const tenantId = req.auth!.tenantId;
    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice || invoice.tenantId !== tenantId) return res.status(404).json({ error: 'Invoice not found' });

    const buffer = await generateInvoicePdfBuffer(invoiceId);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`);
    res.send(buffer);
  } catch (error) {
    logger.error('invoice pdf failed', { error });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
