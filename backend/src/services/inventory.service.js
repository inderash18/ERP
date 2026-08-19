import mongoose from 'mongoose';
import InventoryBalance from '../models/InventoryBalance.js';
import InventoryReservation from '../models/InventoryReservation.js';
import StockLedger from '../models/StockLedger.js';

export const InventoryService = {
  /**
   * Helper to get or create balance record
   */
  async getOrCreateBalance(organizationId, productId, session) {
    let balance = await InventoryBalance.findOne({ organizationId, product: productId }).session(session);
    if (!balance) {
      balance = await InventoryBalance.create([{ organizationId, product: productId }], { session });
      balance = balance[0];
    }
    return balance;
  },

  /**
   * Get dynamic availability calculation
   */
  async getAvailability(organizationId, productId) {
    const balance = await InventoryBalance.findOne({ organizationId, product: productId });
    if (!balance) return { onHand: 0, reserved: 0, available: 0, incoming: 0 };
    
    return {
      onHand: balance.onHand,
      reserved: balance.reserved,
      available: balance.available, // virtual field
      incoming: balance.incoming
    };
  },

  /**
   * Increase physical stock (Purchase Receipts, Manufacturing Production, Positive Adjustments)
   */
  async increase(params) {
    const { organizationId, productId, quantity, eventType, referenceType, referenceId, userId, notes } = params;
    
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      const balance = await this.getOrCreateBalance(organizationId, productId, session);
      
      const previousOnHand = balance.onHand;
      balance.onHand += quantity;
      
      // If this was a purchase receipt, we reduce the incoming projection
      if (eventType === 'PURCHASE_RECEIPT' && balance.incoming >= quantity) {
        balance.incoming -= quantity;
      }
      
      await balance.save({ session });
      
      const ledgerEntry = await StockLedger.create([{
        organizationId,
        product: productId,
        eventType,
        quantityChange: quantity,
        previousOnHand,
        newOnHand: balance.onHand,
        referenceType,
        referenceId,
        userId,
        notes
      }], { session });

      await session.commitTransaction();
      return { success: true, balance, ledgerEntry: ledgerEntry[0] };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  },

  /**
   * Decrease physical stock (Sales Deliveries, Manufacturing Consumption, Negative Adjustments)
   */
  async decrease(params) {
    const { organizationId, productId, quantity, eventType, referenceType, referenceId, userId, notes } = params;
    
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      const balance = await this.getOrCreateBalance(organizationId, productId, session);
      
      if (balance.onHand < quantity) {
        throw new Error('Insufficient physical stock for decrease operation');
      }
      
      const previousOnHand = balance.onHand;
      balance.onHand -= quantity;
      
      await balance.save({ session });
      
      const ledgerEntry = await StockLedger.create([{
        organizationId,
        product: productId,
        eventType,
        quantityChange: -quantity,
        previousOnHand,
        newOnHand: balance.onHand,
        referenceType,
        referenceId,
        userId,
        notes
      }], { session });

      await session.commitTransaction();
      return { success: true, balance, ledgerEntry: ledgerEntry[0] };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  },

  /**
   * Reserve stock for an order
   */
  async reserve(params) {
    const { organizationId, productId, quantity, referenceType, referenceId, userId } = params;
    
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      const balance = await this.getOrCreateBalance(organizationId, productId, session);
      
      if (balance.available < quantity) {
        throw new Error(`Insufficient available stock. Available: ${balance.available}, Requested: ${quantity}`);
      }
      
      // Create reservation record
      const reservation = await InventoryReservation.create([{
        organizationId,
        product: productId,
        quantity,
        referenceType,
        referenceId,
        status: 'ACTIVE'
      }], { session });
      
      // Update balance
      const previousOnHand = balance.onHand;
      balance.reserved += quantity;
      await balance.save({ session });
      
      // Log reservation event
      await StockLedger.create([{
        organizationId,
        product: productId,
        eventType: 'RESERVATION',
        quantityChange: 0, // Doesn't change physical on-hand
        previousOnHand,
        newOnHand: balance.onHand,
        referenceType,
        referenceId,
        userId,
        notes: `Reserved ${quantity} units`
      }], { session });

      await session.commitTransaction();
      return { success: true, reservation: reservation[0], balance };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  },

  /**
   * Release reserved stock (e.g., Order Cancelled or Delivered)
   */
  async release(params) {
    const { organizationId, reservationId, userId, isFulfillment } = params;
    
    const session = await mongoose.startSession();
    session.startTransaction();
    
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
      balance.reserved -= reservation.quantity;
      if (balance.reserved < 0) balance.reserved = 0; // Guard
      
      await balance.save({ session });
      
      await StockLedger.create([{
        organizationId,
        product: reservation.product,
        eventType: 'RESERVATION_RELEASE',
        quantityChange: 0,
        previousOnHand,
        newOnHand: balance.onHand,
        referenceType: reservation.referenceType,
        referenceId: reservation.referenceId,
        userId,
        notes: `Released ${reservation.quantity} units (${isFulfillment ? 'Fulfilled' : 'Cancelled'})`
      }], { session });

      await session.commitTransaction();
      return { success: true, balance };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  },

  /**
   * Manual inventory adjustment (e.g. cycle counts)
   */
  async adjust(params) {
    const { organizationId, productId, newQuantity, userId, notes } = params;
    
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      const balance = await this.getOrCreateBalance(organizationId, productId, session);
      
      const previousOnHand = balance.onHand;
      const quantityChange = newQuantity - previousOnHand;
      
      if (quantityChange === 0) {
        await session.abortTransaction();
        session.endSession();
        return { success: true, balance, skipped: true };
      }
      
      balance.onHand = newQuantity;
      await balance.save({ session });
      
      const ledgerEntry = await StockLedger.create([{
        organizationId,
        product: productId,
        eventType: 'INVENTORY_ADJUSTMENT',
        quantityChange,
        previousOnHand,
        newOnHand: balance.onHand,
        referenceType: 'MANUAL_ADJUSTMENT',
        referenceId: balance._id, // Self-referential for manual ad-hoc
        userId,
        notes: notes || 'Manual cycle count adjustment'
      }], { session });

      await session.commitTransaction();
      return { success: true, balance, ledgerEntry: ledgerEntry[0] };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
};
