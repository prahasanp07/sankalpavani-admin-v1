import { db } from '../db/client';
import { bookings, bookingPilgrims, receipts, shipments, sevas, auditEvents } from '../../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { RequestContext } from '../tenant/context';
import { authorization } from '../authorization/service';
import crypto from 'crypto';

export interface PilgrimInput {
  name: string;
  age?: number;
  gender?: string;
  gotra?: string;
  nakshatra?: string;
  relationship?: string;
}

export interface CreateBookingInput {
  sevaId: string;
  bookingDate: Date;
  slotTime: string;
  primaryDevoteeName: string;
  primaryPhone: string;
  primaryEmail?: string;
  gotra: string;
  nakshatra: string;
  pilgrims?: PilgrimInput[];
  paymentMethod?: string;
  isHomeDelivery?: boolean;
  deliveryAddress?: string;
  notes?: string;
}

export class BookingRepository {
  /**
   * List bookings for a temple with tenant isolation
   */
  async listBookings(ctx: RequestContext, templeId: string) {
    await authorization.require({
      subjectId: ctx.userId,
      trustId: ctx.trustId,
      scopeId: templeId,
      action: 'temple.booking.view',
      resourceType: 'booking'
    });

    return db.query.bookings.findMany({
      where: and(
        eq(bookings.templeId, templeId),
        eq(bookings.trustId, ctx.trustId)
      ),
      with: {
        // pilgrims
      },
      orderBy: [desc(bookings.createdAt)]
    });
  }

  /**
   * Create a new Devotee Seva Booking + Issue Official Receipt Slip
   */
  async createBooking(ctx: RequestContext, templeId: string, input: CreateBookingInput) {
    await authorization.require({
      subjectId: ctx.userId,
      trustId: ctx.trustId,
      scopeId: templeId,
      action: 'temple.booking.create',
      resourceType: 'booking'
    });

    // 1. Verify Seva and calculate pricing server-side
    const seva = await db.query.sevas.findFirst({
      where: and(
        eq(sevas.id, input.sevaId),
        eq(sevas.templeId, templeId),
        eq(sevas.trustId, ctx.trustId),
        eq(sevas.isActive, true)
      )
    });

    if (!seva) {
      throw new Error(`Seva with ID '${input.sevaId}' is not available at this temple`);
    }

    const totalPersons = 1 + (input.pilgrims?.length || 0);
    const basePrice = Number(seva.price);
    const extraPersons = Math.max(0, totalPersons - seva.includedPersons);
    const extraPrice = extraPersons * Number(seva.extraPersonPrice);
    const deliveryFee = input.isHomeDelivery ? 100 : 0;
    const totalCalculatedAmount = (basePrice + extraPrice + deliveryFee).toFixed(2);

    const bookingId = `bkg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // 2. Insert Booking Record
    const [newBooking] = await db.insert(bookings).values({
      id: bookingId,
      trustId: ctx.trustId,
      templeId,
      sevaId: seva.id,
      bookingDate: input.bookingDate,
      slotTime: input.slotTime || seva.timingsDisplay,
      primaryDevoteeName: input.primaryDevoteeName,
      primaryPhone: input.primaryPhone,
      primaryEmail: input.primaryEmail,
      gotra: input.gotra,
      nakshatra: input.nakshatra,
      totalPersons,
      totalAmount: totalCalculatedAmount,
      bookingStatus: 'Confirmed',
      paymentStatus: 'Paid',
      paymentMethod: input.paymentMethod || 'UPI / Online',
      isHomeDelivery: input.isHomeDelivery ?? false,
      deliveryAddressJson: input.deliveryAddress ? { address: input.deliveryAddress } : null,
      notes: input.notes,
      bookedByUserId: ctx.userId
    }).returning();

    // 3. Insert Pilgrims Roster
    if (input.pilgrims && input.pilgrims.length > 0) {
      await db.insert(bookingPilgrims).values(
        input.pilgrims.map((p, idx) => ({
          id: `pilg_${bookingId}_${idx}`,
          bookingId: newBooking.id,
          name: p.name,
          age: p.age,
          gender: p.gender,
          gotra: p.gotra || input.gotra,
          nakshatra: p.nakshatra || input.nakshatra,
          relationship: p.relationship
        }))
      );
    }

    // 4. Generate Unique Scoped Receipt
    const receiptNumber = `RCP-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const verificationHash = crypto.createHash('sha256').update(`${bookingId}-${receiptNumber}-${ctx.trustId}`).digest('hex').substring(0, 16);

    const [receipt] = await db.insert(receipts).values({
      id: `rcp_${Date.now()}`,
      trustId: ctx.trustId,
      templeId,
      bookingId: newBooking.id,
      receiptNumber,
      verificationHash,
      amount: totalCalculatedAmount,
      issuedByUserId: ctx.userId
    }).returning();

    // 5. If Remote Delivery is Selected, Queue Shipment Automatically
    if (input.isHomeDelivery && input.deliveryAddress) {
      await db.insert(shipments).values({
        id: `ship_${Date.now()}`,
        trustId: ctx.trustId,
        templeId,
        bookingId: newBooking.id,
        recipientName: input.primaryDevoteeName,
        recipientPhone: input.primaryPhone,
        shippingAddress: input.deliveryAddress,
        contents: `Sacred ${seva.name} Maha Prasadam, Akshata & Kumkum Box`,
        courierProvider: 'India Post Speed Post',
        status: 'Pending'
      });
    }

    // 6. Record Immutable Financial Audit Event
    await db.insert(auditEvents).values({
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      trustId: ctx.trustId,
      templeId,
      actorUserId: ctx.userId,
      eventType: 'BOOKING_CREATED',
      targetType: 'booking',
      targetId: newBooking.id,
      action: 'temple.booking.create',
      decision: 'MUTATE',
      requestId: ctx.requestId,
      payloadJson: { receiptNumber, amount: totalCalculatedAmount, sevaCode: seva.code }
    });

    return {
      booking: newBooking,
      receipt
    };
  }

  /**
   * Modify Payment State (with server-side validation and audit log)
   */
  async updatePaymentStatus(ctx: RequestContext, templeId: string, bookingId: string, status: 'Paid' | 'Pending' | 'Refunded') {
    await authorization.require({
      subjectId: ctx.userId,
      trustId: ctx.trustId,
      scopeId: templeId,
      action: 'temple.finance.manage',
      resourceType: 'payment',
      resourceId: bookingId
    });

    const [updated] = await db.update(bookings)
      .set({
        paymentStatus: status,
        updatedAt: new Date()
      })
      .where(and(
        eq(bookings.id, bookingId),
        eq(bookings.templeId, templeId),
        eq(bookings.trustId, ctx.trustId)
      ))
      .returning();

    // Audit Event
    await db.insert(auditEvents).values({
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      trustId: ctx.trustId,
      templeId,
      actorUserId: ctx.userId,
      eventType: status === 'Refunded' ? 'PAYMENT_REFUNDED' : 'PAYMENT_APPROVED',
      targetType: 'booking_payment',
      targetId: bookingId,
      action: 'temple.finance.manage',
      decision: 'MUTATE',
      requestId: ctx.requestId,
      payloadJson: { newStatus: status }
    });

    return updated;
  }
}

export const bookingRepository = new BookingRepository();
