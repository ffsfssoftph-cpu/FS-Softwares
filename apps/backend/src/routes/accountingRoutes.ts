import express, { Request, Response } from 'express';
import { authMiddleware, permit } from '../middleware/rbac';
import { createLogger } from '../logger';
import { createJournalEntry } from '../services/accountingService';
import { createJournalSchema } from '../validators/accountingSchema';
import prisma from '../prismaClient';

const router = express.Router();
const logger = createLogger('accountingRoutes');

router.use(authMiddleware);

router.post('/', permit('SUPER_ADMIN', 'ADMIN'), async (req: Request, res: Response) => {
  try {
    const parsed = createJournalSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.format() });

    const tenantId = req.auth!.tenantId;
    const { date, description, lines } = parsed.data;

    // Validate accounts belong to tenant
    for (const l of lines) {
      const acct = await prisma.account.findUnique({ where: { id: l.accountId } });
      if (!acct || acct.tenantId !== tenantId) {
        return res.status(400).json({ error: `Account ${l.accountId} not found for tenant` });
      }
    }

    const journal = await createJournalEntry(tenantId, new Date(date), description, lines.map((l) => ({ accountId: l.accountId, debit: l.debit, credit: l.credit })));
    res.json(journal);
  } catch (error) {
    logger.error('create journal failed', { error });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
