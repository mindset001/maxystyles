import express from 'express';
import { Order } from '../models';

const router = express.Router();

// GET /api/orders - Get all orders
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, userId } = req.query;
    
    const query: any = {};
    if (status) query.status = status;
    if (userId) query.user = userId;

    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .populate('products.product', 'name price images')
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: orders,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / Number(limit)),
        total
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
});

// GET /api/orders/:id - Get single order
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone address')
      .populate('products.product', 'name price images');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: error.message
    });
  }
});

// POST /api/orders - Create new order (supports guest checkout)
router.post('/', async (req, res) => {
  try {
    const { user, guestInfo, products, totalAmount, shippingAddress, paymentMethod, notes } = req.body;

    // Require either an authenticated user OR guestInfo
    const isUserOrder = !!user;
    if (!isUserOrder && (!guestInfo?.name || !guestInfo?.email)) {
      return res.status(400).json({
        success: false,
        message: 'Guest name and email are required (or sign in)'
      });
    }

    if (!shippingAddress?.street || !shippingAddress?.city || !shippingAddress?.country) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address (street, city, country) is required'
      });
    }

    const order = await Order.create({
      ...(isUserOrder ? { user } : { guestInfo }),
      products,
      totalAmount,
      shippingAddress,
      paymentMethod: paymentMethod || 'bank_transfer',
      notes,
      status: 'pending',
      paymentStatus: 'pending',
    });

    const populatedOrder = await Order.findById(order._id)
      .populate('user', 'name email')
      .populate('products.product', 'name price images');

    res.status(201).json({
      success: true,
      data: populatedOrder,
      message: 'Order created successfully'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
});

// PUT /api/orders/:id - Update order
router.put('/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('user', 'name email')
     .populate('products.product', 'name price images');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order,
      message: 'Order updated successfully'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: 'Failed to update order',
      error: error.message
    });
  }
});

// DELETE /api/orders/:id - Delete order
router.delete('/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete order',
      error: error.message
    });
  }
});

export default router;