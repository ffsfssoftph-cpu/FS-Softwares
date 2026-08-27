import PDFDocument from 'pdfkit';
import stream from 'stream';
import { promisify } from 'util';
import prisma from './prismaClient';
import { createLogger } from './logger';

const logger = createLogger('invoiceGenerator');
const pipeline = promisify(stream.pipeline);

export async function generateInvoicePdfBuffer(invoiceId: string): Promise<Buffer> {
  try {
    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId }, include: { items: true, booking: true, tenant: true } });
    if (!invoice) throw new Error('Invoice not found');

    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(Buffer.from(chunk)));

    // Header
    doc.fillColor('#00E676');
    doc.fontSize(20).text('FS Softwares', { continued: true, align: 'left' });
    doc.moveDown(0.5);
    doc.fillColor('#FFFFFF');
    doc.fontSize(10).text('TophComm Engineering & System Solutions Inc.', { align: 'left' });
    doc.moveDown(0.5);

    doc.fillColor('#94A3B8');
    doc.fontSize(12).text(`Invoice: ${invoice.invoiceNumber}`);
    doc.text(`Date: ${invoice.date.toISOString().slice(0, 10)}`);
    if (invoice.booking) {
      doc.text(`Booking: ${invoice.booking.id}`);
    }

    doc.moveDown();
    doc.fillColor('#FFFFFF');
    doc.font('Courier');
    doc.fontSize(10);

    // Table header
    doc.text('Description', 40, doc.y, { continued: true });
    doc.text('Qty', 320, doc.y, { width: 50, continued: true });
    doc.text('Unit', 370, doc.y, { width: 80, continued: true });
    doc.text('Line Total', 460, doc.y, { align: 'right' });
    doc.moveDown(0.5);

    for (const item of invoice.items) {
      doc.fillColor('#FFFFFF');
      doc.text(item.description, 40, doc.y, { continued: true });
      doc.text(String(item.quantity), 320, doc.y, { width: 50, continued: true });
      doc.text(item.unitPrice.toFixed(2), 370, doc.y, { width: 80, continued: true });
      doc.text(item.lineTotal.toFixed(2), 460, doc.y, { align: 'right' });
      doc.moveDown(0.25);
    }

    doc.moveDown();
    doc.fontSize(12).text(`Total: ${invoice.total.toFixed(2)}`, { align: 'right' });

    // Footer - TophComm copyright
    doc.moveTo(40, 760).lineTo(555, 760).stroke('#1A2332');
    doc.fontSize(8).fillColor('#94A3B8').text('© 2026 TophComm Engineering & System Solutions Inc. — All Rights Reserved.', 40, 770, { align: 'center' });

    doc.end();

    await new Promise<void>((resolve) => doc.on('end', () => resolve()));
    return Buffer.concat(chunks);
  } catch (error) {
    logger.error('generateInvoicePdfBuffer failed', { error, invoiceId });
    throw error;
  }
}
