import mongoose from 'mongoose';
import InventoryBalance from '../models/InventoryBalance.js';
import InventoryReservation from '../models/InventoryReservation.js';
import StockLedger from '../models/StockLedger.js';

export const InventoryService = {
  /**
   * Helper to get or create balance record with optional session
   */
  async getOrCreateBalance(organizationId, productId, session = null) {
    let query = InventoryBalance.findOne({ organizationId, product: productId });
    if (session) query = query.session(session);
    let balance = await query;
    
    if (!balance) {
      const created = await InventoryBalance.create([{ organizationId, product: productId, onHand: 0, reserved: 0, incoming: 0 }], { session });
      balance = created[0];
    }
    return balance;
  },

  /**
   * Get dynamic availability calculation (available = onHand - reserved)
   */
  async getAvailability(organizationId, productId) {
    const balance = await InventoryBalance.findOne({ organizationId, product: productId });
    if (!balance) return { onHand: 0, reserved: 0, available: 0, incoming: 0 };
    
    return {
      onHand: balance.onHand,
      reserved: balance.reserved,
      available: Math.max(0, balance.onHand - balance.reserved),
      incoming: balance.incoming || 0
    };
  },

  /**
   * Increase physical stock (Purchase Receipts, Manufacturing Production, Positive Adjustments)
   * Supports external session to prevent nested transactions
   */
  async increase(params) {
    const { organizationId, productId, quantity, eventType, referenceType, referenceId, userId, notes, session: externalSession } = params;
    const qty = Number(quantity);
    if (qty <= 0) throw new Error('Increase quantity must be greater than zero');

    const shouldManageSession = !externalSession;
    const session = externalSession || await mongoose.startSession();
    if (shouldManageSession) session.startTransaction();

    try {
      const balance = await this.getOrCreateBalance(organizationId, productId, session);
      
      const previousOnHand = balance.onHand;
      const previousReserved = balance.reserved;
      balance.onHand += qty;
      
      if (eventType === 'PURCHASE_RECEIPT' && balance.incoming >= qty) {
        balance.incoming -= qty;
      }
      
      await balance.save({ session });
      
      const ledgerEntry = await StockLedger.create([{
        organizationId,
        product: productId,
        eventType,
        quantityChange: qty,
        previousOnHand,
        newOnHand: balance.onHand,
        previousReserved,
        newReserved: balance.reserved,
        referenceType: referenceType || 'PURCHASE_ORDER',
        referenceId: referenceId || 'N/A',
        userId,
        notes
      }], { session });

      if (shouldManageSession) await session.commitTransaction();
      return { success: true, balance, ledgerEntry: ledgerEntry[0] };
    } catch (error) {
      if (shouldManageSession) await session.abortTransaction();
      throw error;
    } finally {
      if (shouldManageSession) session.endSession();
    }
  },

  /**
   * Decrease physical stock (Sales Deliveries, Manufacturing Consumption, Negative Adjustments)
   * Supports external session
   */
  async decrease(params) {
    const { organizationId, productId, quantity, eventType, referenceType, referenceId, userId, notes, session: externalSession } = params;
    const qty = Number(quantity);
    if (qty <= 0) throw new Error('Decrease quantity must be greater than zero');

    const shouldManageSession = !externalSession;
    const session = externalSession || await mongoose.startSession();
    if (shouldManageSession) session.startTransaction();

    try {
      const balance = await this.getOrCreateBalance(organizationId, productId, session);
      
      if (balance.onHand < qty) {
        throw new Error(`Insufficient physical stock for decrease operation. On-hand: ${balance.onHand}, Requested: ${qty}`);
      }
      
      const previousOnHand = balance.onHand;
      const previousReserved = balance.reserved;
      balance.onHand -= qty;
      
      await balance.save({ session });
      
      const ledgerEntry = await StockLedger.create([{
        organizationId,
        product: productId,
        eventType,
        quantityChange: -qty,
        previousOnHand,
        newOnHand: balance.onHand,
        previousReserved,
        newReserved: balance.reserved,
        referenceType: referenceType || 'SALES_ORDER',
        referenceId: referenceId || 'N/A',
        userId,
        notes
      }], { session });

      if (shouldManageSession) await session.commitTransaction();
      return { success: true, balance, ledgerEntry: ledgerEntry[0] };
    } catch (error) {
      if (shouldManageSession) await session.abortTransaction();
      throw error;
    } finally {
      if (shouldManageSession) session.endSession();
    }
  },

  /**
   * Reserve stock for an order (available = onHand - reserved)
   * Supports external session
   */
  async reserve(params) {
    const { organizationId, productId, quantity, referenceType, referenceId, userId, session: externalSession } = params;
    const qty = Number(quantity);
    if (qty <= 0) throw new Error('Reserve quantity must be greater than zero');

    const shouldManageSession = !externalSession;
    const session = externalSession || await mongoose.startSession();
    if (shouldManageSession) session.startTransaction();

    try {
      const balance = await this.getOrCreateBalance(organizationId, productId, session);
      const available = Math.max(0, balance.onHand - balance.reserved);
      
      if (available < qty) {
        throw new Error(`Insufficient available stock. Available: ${available}, Requested: ${qty}`);
      }
      
      // Create reservation record
      const reservation = await InventoryReservation.create([{
        organizationId,
        product: productId,
        quantity: qty,
        referenceType: referenceType || 'SALES_ORDER',
        referenceId: referenceId || 'N/A',
        status: 'ACTIVE'
      }], { session });
      
      const previousOnHand = balance.onHand;
      const previousReserved = balance.reserved;
      balance.reserved += qty;
      await balance.save({ session });
      
      const ledgerEntry = await StockLedger.create([{
        organizationId,
        product: productId,
        eventType: 'RESERVATION',
        quantityChange: 0,
        previousOnHand,
        newOnHand: balance.onHand,
        previousReserved,
        newReserved: balance.reserved,
        referenceType: referenceType || 'SALES_ORDER',
        referenceId: referenceId || 'N/A',
        userId,
        notes: `Reserved ${qty} units`
      }], { session });

      if (shouldManageSession) await session.commitTransaction();
      return { success: true, reservation: reservation[0], balance, ledgerEntry: ledgerEntry[0] };
    } catch (error) {
      if (shouldManageSession) await session.abortTransaction();
      throw error;
    } finally {
      if (shouldManageSession) session.endSession();
    }
  },

  /**
   * Release reserved stock (Order Cancelled or Delivered)
   * Supports external session
   */
  async release(params) {
    const { organizationId, reservationId, userId, isFulfillment, session: externalSession } = params;
    
    const shouldManageSession = !externalSession;
    const session = externalSession || await mongoose.startSession();
    if (shouldManageSession) session.startTransaction();

    try {
      const reservation = await InventoryReservation.findOne({ 
        _id: reservationId, 
        organizationId,
        status: 'ACTIVE' 
      }).session(session);
      
      if (!reservation) {
        throw new Error('Active reservation not found');
      }
      
      reservation.status = isFulfillment ? 'FULFILLED' : 'CANCELLED';
      await reservation.save({ session });
      
      const balance = await InventoryBalance.findOne({ 
        organizationId, 
        product: reservation.product 
      }).session(session);
      
      const previousOnHand = balance.onHand;
      const previousReserved = balance.reserved;
      balance.reserved = Math.max(0, balance.reserved - reservation.quantity);
      
      await balance.save({ session });
      
      const ledgerEntry = await StockLedger.create([{
        organizationId,
        product: reservation.product,
        eventType: 'RESERVATION_RELEASE',
        quantityChange: 0,
        previousOnHand,
        newOnHand: balance.onHand,
        previousReserved,
        newReserved: balance.reserved,
        referenceType: reservation.referenceType || 'SALES_ORDER',
        referenceId: reservation.referenceId || 'N/A',
        userId,
        notes: `Released ${reservation.quantity} units (${isFulfillment ? 'Fulfilled' : 'Cancelled'})`
      }], { session });

      if (shouldManageSession) await session.commitTransaction();
      return { success: true, balance, ledgerEntry: ledgerEntry[0] };
    } catch (error) {
      if (shouldManageSession) await session.abortTransaction();
      throw error;
    } finally {
      if (shouldManageSession) session.endSession();
    }
  },

  /**
   * Manual inventory adjustment (e.g. cycle counts)
   */
  async adjust(params) {
    const { organizationId, productId, newQuantity, userId, notes, session: externalSession } = params;
    const newQty = Number(newQuantity);
    if (newQty < 0) throw new Error('Adjusted stock cannot be negative');

    const shouldManageSession = !externalSession;
    const session = externalSession || await mongoose.startSession();
    if (shouldManageSession) session.startTransaction();

    try {
      const balance = await this.getOrCreateBalance(organizationId, productId, session);
      
      const previousOnHand = balance.onHand;
      const previousReserved = balance.reserved;
      const quantityChange = newQty - previousOnHand;
      
      if (quantityChange === 0) {
        if (shouldManageSession) await session.commitTransaction();
        return { success: true, balance, skipped: true };
      }
      
      balance.onHand = newQty;
      await balance.save({ session });
      
      const ledgerEntry = await StockLedger.create([{
        organizationId,
        product: productId,
        eventType: 'INVENTORY_ADJUSTMENT',
        quantityChange,
        previousOnHand,
        newOnHand: balance.onHand,
        previousReserved,
        newReserved: balance.reserved,
        referenceType: 'MANUAL_ADJUSTMENT',
        referenceId: balance._id,
        userId,
        notes: notes || 'Manual cycle count adjustment'
      }], { session });

      if (shouldManageSession) await session.commitTransaction();
      return { success: true, balance, ledgerEntry: ledgerEntry[0] };
    } catch (error) {
      if (shouldManageSession) await session.abortTransaction();
      throw error;
    } finally {
      if (shouldManageSession) session.endSession();
    }
  }
};
