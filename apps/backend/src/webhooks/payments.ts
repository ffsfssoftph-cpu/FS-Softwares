import express, { Request, Response } from 'express';
import { createLogger } from '../logger';
import prisma from '../prismaClient';
import Stripe from 'stripe';
import axios from 'axios';
import { createJournalEntry } from '../services/accountingService';

const router = express.Router();
const logger = createLogger('webhooks');

const stripeSecret = process.env.STRIPE_SECRET ?? '';
const stripe = new Stripe(stripeSecret, { apiVersion: '2023-08-16' });

// Stripe webhook
router.post('/stripe', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
  try {
    const sig = req.headers['stripe-signature'] as string | undefined;
    if (!sig) return res.status(400).send('Missing stripe signature');
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) return res.status(400).send('Webhook secret not configured');

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(req.body as Buffer, sig, webhookSecret);
    } catch (err) {
      logger.error('stripe webhook signature verification failed', { err });
      return res.status(400).send('Webhook signature verification failed');
    }

    if (event.type === 'payment_intent.succeeded') {
      const pi = event.data.object as Stripe.PaymentIntent;
      // find payment by providerId
      const payment = await prisma.payment.findFirst({ where: { providerId: pi.id } });
      if (payment) {
        await prisma.payment.update({ where: { id: payment.id }, data: { status: 'CONFIRMED' } });
        // auto post accounting entries: debit cash, credit revenue
        const tenantId = payment.tenantId;
        // simplistic account lookup: assume accounts exist
        const cashAccount = await prisma.account.findFirst({ where: { tenantId, code: '1000' } });
        const revenueAccount = await prisma.account.findFirst({ where: { tenantId, code: '4000' } });
        if (cashAccount && revenueAccount) {
          await createJournalEntry(tenantId, new Date(), `Payment ${payment.id} - Stripe`, [
            { accountId: cashAccount.id, debit: payment.amount },
            { accountId: revenueAccount.id, credit: payment.amount }
          ]);
        }
      }
    }

    res.json({ received: true });
  } catch (error) {
    logger.error('stripe webhook error', { error });
    res.status(500).send('Internal Server Error');
  }
});

// PayMongo webhook
router.post('/paymongo', express.json(), async (req: Request, res: Response) => {
  try {
    // PayMongo sends events describing payments; process generically
    const event = req.body;
    const data = event.data?.attributes ?? event;
    const providerId = data.id ?? data.payment_id ?? null;
    const status = data.status ?? data.state ?? 'unknown';
    if (!providerId) {
      logger.warn('paymongo webhook missing provider id', { event });
      return res.status(400).json({ error: 'Missing provider id' });
    }

    const payment = await prisma.payment.findFirst({ where: { providerId } });
    if (payment) {
      const newStatus = status.toUpperCase() === 'SUCCEEDED' || status.toUpperCase() === 'PAID' ? 'CONFIRMED' : payment.status;
      await prisma.payment.update({ where: { id: payment.id }, data: { status: newStatus } });
      if (newStatus === 'CONFIRMED') {
        const tenantId = payment.tenantId;
        const cashAccount = await prisma.account.findFirst({ where: { tenantId, code: '1000' } });
        const revenueAccount = await prisma.account.findFirst({ where: { tenantId, code: '4000' } });
        if (cashAccount && revenueAccount) {
          await createJournalEntry(tenantId, new Date(), `Payment ${payment.id} - PayMongo`, [
            { accountId: cashAccount.id, debit: payment.amount },
            { accountId: revenueAccount.id, credit: payment.amount }
          ]);
        }
      }
    }

    res.json({ ok: true });
  } catch (error) {
    logger.error('paymongo webhook error', { error });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
