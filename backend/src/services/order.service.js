import Order from '../models/Order.model.js';
import User from '../models/User.model.js';
import GrowerProfile from '../models/GrowerProfile.model.js';
import ConsumerProfile from '../models/ConsumerProfile.model.js';
import { ApiError } from '../utils/apiResponse.js';
import { ROLES } from '../config/constants.js';

export const createOrder = async (consumerId, { growerId, items }) => {
  // 1. Verify grower exists
  const grower = await User.findOne({ _id: growerId, role: ROLES.GROWER });
  if (!grower) {
    throw new ApiError(404, 'Grower not found');
  }

  // 2. Validate items
  if (!items || items.length === 0) {
    throw new ApiError(400, 'Order must contain at least one item');
  }

  const processedItems = items.map((item) => ({
    name: item.name.trim(),
    quantity: Math.max(1, Number(item.quantity) || 1),
    price: Math.max(0, Number(item.price) || 45), // Default mock price of 45 INR
  }));

  const totalAmount = processedItems.reduce(
    (acc, curr) => acc + curr.quantity * curr.price,
    0
  );

  const order = await Order.create({
    consumerId,
    growerId,
    items: processedItems,
    totalAmount,
  });

  return order;
};

export const getConsumerOrders = async (consumerId) => {
  const orders = await Order.find({ consumerId })
    .populate({
      path: 'growerId',
      select: 'email',
    })
    .sort({ createdAt: -1 });

  return Promise.all(
    orders.map(async (order) => {
      const profile = await GrowerProfile.findOne({ userId: order.growerId._id });
      const orderObj = order.toObject();
      orderObj.growerName = profile?.name || 'Unknown Farm';
      orderObj.growerCity = profile?.city || '';
      return orderObj;
    })
  );
};

export const getGrowerOrders = async (growerId) => {
  const orders = await Order.find({ growerId })
    .populate({
      path: 'consumerId',
      select: 'email',
    })
    .sort({ createdAt: -1 });

  return Promise.all(
    orders.map(async (order) => {
      const profile = await ConsumerProfile.findOne({ userId: order.consumerId._id });
      const orderObj = order.toObject();
      orderObj.consumerName = profile?.name || 'Anonymous Consumer';
      orderObj.consumerCity = profile?.city || '';
      return orderObj;
    })
  );
};

export const updateOrderStatus = async (userId, orderId, status) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  const isGrower = order.growerId.toString() === userId.toString();
  const isConsumer = order.consumerId.toString() === userId.toString();

  if (!isGrower && !isConsumer) {
    throw new ApiError(403, 'Unauthorized to view or update this order');
  }

  // Define allowable state transitions
  if (status === 'cancelled') {
    if (isConsumer && order.status !== 'pending') {
      throw new ApiError(400, 'Consumers can only cancel pending orders');
    }
    // Growers can cancel at any stage (except already completed/cancelled)
    if (['completed', 'cancelled'].includes(order.status)) {
      throw new ApiError(400, 'Finished orders cannot be cancelled');
    }
  } else if (['accepted', 'completed'].includes(status)) {
    if (!isGrower) {
      throw new ApiError(403, 'Only growers can accept or complete orders');
    }
    if (status === 'accepted' && order.status !== 'pending') {
      throw new ApiError(400, 'Only pending orders can be accepted');
    }
    if (status === 'completed' && order.status !== 'accepted') {
      throw new ApiError(400, 'Only accepted orders can be marked as completed');
    }
  } else {
    throw new ApiError(400, 'Invalid status update');
  }

  order.status = status;
  await order.save();
  return order;
};
