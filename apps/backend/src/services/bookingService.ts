import prisma from '../prismaClient';
import { createLogger } from '../logger';

const logger = createLogger('bookingService');

export interface CreateBookingInput {
  tenantId: string;
  customerId: string;
  pickupAt: Date;
  dropoffAt: Date;
  totalAmount: number;
}

export async function createBooking(input: CreateBookingInput) {
  try {
    const booking = await prisma.booking.create({ data: input });

    // create an invoice for the booking
    const invoiceNumber = `INV-${Date.now()}`;
    const invoice = await prisma.invoice.create({
      data: {
        tenantId: input.tenantId,
        bookingId: booking.id,
        invoiceNumber,
        date: new Date(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        total: input.totalAmount
      }
    });

    await prisma.booking.update({ where: { id: booking.id }, data: { totalAmount: input.totalAmount } });

    return { booking, invoice };
  } catch (error) {
    logger.error('createBooking failed', { error, input });
    throw error;
  }
}

export async function assignVehicle(bookingId: string, vehicleId: string) {
  try {
    const booking = await prisma.booking.update({ where: { id: bookingId }, data: { vehicleId, status: 'CONFIRMED' } });
    return booking;
  } catch (error) {
    logger.error('assignVehicle failed', { error, bookingId, vehicleId });
    throw error;
  }
}

export async function listBookings(tenantId: string) {
  try {
    return await prisma.booking.findMany({ where: { tenantId } });
  } catch (error) {
    logger.error('listBookings failed', { error, tenantId });
    throw error;
  }
}
