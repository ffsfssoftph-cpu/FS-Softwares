import { z } from 'zod';

export const journalLineSchema = z.object({
  accountId: z.string().uuid(),
  debit: z.number().nonnegative().optional().default(0),
  credit: z.number().nonnegative().optional().default(0)
});

export const createJournalSchema = z.object({
  date: z.string().refine((s) => !Number.isNaN(Date.parse(s)), { message: 'Invalid date' }),
  description: z.string().min(1),
  lines: z.array(journalLineSchema).min(1)
});

export type CreateJournalInput = z.infer<typeof createJournalSchema>;
