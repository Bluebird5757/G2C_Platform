import { asyncHandler, sendSuccess } from '../utils/apiResponse.js';
import * as orderService from '../services/order.service.js';

export const createOrder = asyncHandler(async (req, res) => {
  const order = await orderService.createOrder(req.user._id, req.body);
  sendSuccess(res, { order }, 'Order placed successfully', 201);
});

export const getConsumerOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.getConsumerOrders(req.user._id);
  sendSuccess(res, { orders });
});

export const getGrowerOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.getGrowerOrders(req.user._id);
  sendSuccess(res, { orders });
});

export const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await orderService.updateOrderStatus(
    req.user._id,
    req.params.orderId,
    status
  );
  sendSuccess(res, { order }, `Order status updated to ${status}`);
});
