import prisma from '../prismaClient';
import { createLogger } from '../logger';

const logger = createLogger('accountingService');

export interface JournalLineInput {
  accountId: string;
  debit?: number;
  credit?: number;
}

export async function createJournalEntry(tenantId: string, date: Date, description: string, lines: JournalLineInput[]) {
  try {
    const totalDebit = lines.reduce((s, l) => s + (l.debit ?? 0), 0);
    const totalCredit = lines.reduce((s, l) => s + (l.credit ?? 0), 0);
    if (Math.abs(totalDebit - totalCredit) > 0.0001) {
      throw new Error('Journal entry is not balanced');
    }

    const journal = await prisma.journalEntry.create({ data: { tenantId, date, description } });
    for (const l of lines) {
      await prisma.journalEntryLine.create({ data: { journalEntryId: journal.id, accountId: l.accountId, debit: l.debit ?? 0, credit: l.credit ?? 0 } });
    }
    return journal;
  } catch (error) {
    logger.error('createJournalEntry failed', { error, tenantId, date, description, lines });
    throw error;
  }
}
