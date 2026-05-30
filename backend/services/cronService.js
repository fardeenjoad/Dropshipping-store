const Order = require('../models/Order');
const { getTrackingNumber } = require('./cjService');

/**
 * Perform sync for a single order's tracking details.
 */
const syncOrderTracking = async (order) => {
  if (!order.supplierOrderId) return null;

  try {
    const trackingData = await getTrackingNumber(order.supplierOrderId);
    if (trackingData && trackingData.trackingNumber) {
      order.trackingNumber = trackingData.trackingNumber;
      order.status = 'shipped';
      const updatedOrder = await order.save();
      console.log(`[Tracking Sync] Order ${order._id} updated with tracking: ${trackingData.trackingNumber}`);
      return updatedOrder;
    }
  } catch (error) {
    console.error(`[Tracking Sync Error] Failed for order ${order._id}:`, error.message);
  }
  return null;
};

/**
 * Scan all pending tracking orders and synchronize with CJ API.
 */
const runTrackingSync = async () => {
  console.log('[Tracking Sync] Checking for orders requiring tracking sync...');
  try {
    const orders = await Order.find({
      status: 'processing',
      forwardedToSupplier: true,
      $or: [
        { trackingNumber: { $exists: false } },
        { trackingNumber: '' },
        { trackingNumber: null }
      ]
    });

    console.log(`[Tracking Sync] Found ${orders.length} orders to synchronize.`);
    const syncPromises = orders.map(syncOrderTracking);
    await Promise.all(syncPromises);
  } catch (error) {
    console.error('[Tracking Sync Error] Failed running sync job:', error.message);
  }
};

/**
 * Start recurring tracking sync interval.
 */
const startTrackingSyncJob = (intervalMs = 60000) => {
  console.log(`[Tracking Sync] Initializing background tracker sync (Interval: ${intervalMs}ms)`);
  // Run initial check shortly after startup
  const initialTimeout = setTimeout(runTrackingSync, 5000);
  
  const intervalId = setInterval(runTrackingSync, intervalMs);
  return {
    intervalId,
    initialTimeout,
    stop: () => {
      clearInterval(intervalId);
      clearTimeout(initialTimeout);
    }
  };
};

module.exports = {
  syncOrderTracking,
  runTrackingSync,
  startTrackingSyncJob
};
