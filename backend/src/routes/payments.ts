import express from 'express';
import { Order, User } from '../models';

const router = express.Router();

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || '';
const PAYSTACK_BASE = 'https://api.paystack.co';

// POST /api/payments/initialize
// Initialize a Paystack transaction; returns authorization_url for redirect
router.post('/initialize', async (req, res) => {
  try {
    const { email, amount, metadata, callback_url } = req.body;

    if (!email || !amount) {
      return res.status(400).json({ success: false, message: 'email and amount are required' });
    }

    if (!PAYSTACK_SECRET) {
      return res.status(500).json({ success: false, message: 'Paystack secret key not configured' });
    }

    const response = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        // amount is in kobo (NGN) — frontend sends orderTotal in base currency × 100
        amount: Math.round(Number(amount) * 100),
        metadata: metadata || {},
        callback_url: callback_url || '',
        currency: 'NGN',
        channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],
      }),
    });

    const data = await response.json() as any;

    if (!data.status) {
      throw new Error(data.message || 'Paystack initialization failed');
    }

    res.json({
      success: true,
      data: {
        authorization_url: data.data.authorization_url,
        access_code: data.data.access_code,
        reference: data.data.reference,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Payment initialization failed' });
  }
});

// POST /api/payments/verify
// Verify a completed Paystack payment and create the order
router.post('/verify', async (req, res) => {
  try {
    const { reference, orderPayload } = req.body;

    if (!reference) {
      return res.status(400).json({ success: false, message: 'Payment reference is required' });
    }

    if (!PAYSTACK_SECRET) {
      return res.status(500).json({ success: false, message: 'Paystack secret key not configured' });
    }

    // Verify with Paystack
    const response = await fetch(`${PAYSTACK_BASE}/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
    });

    const data = await response.json() as any;

    if (!data.status || data.data?.status !== 'success') {
      return res.status(400).json({
        success: false,
        message: data.data?.gateway_response || 'Payment verification failed. Transaction not successful.',
      });
    }

    const paystackTx = data.data;
    const txMeta = paystackTx.metadata || {};

    // ── Custom / admin-generated payment link — build order from Paystack data ──
    if (!orderPayload || txMeta.customOrder === true) {
      const amountPaid = paystackTx.amount / 100; // convert from kobo
      const customerEmail = paystackTx.customer?.email || txMeta.email || 'unknown@unknown.com';
      const customerName  = txMeta.customerName || paystackTx.customer?.first_name || 'Customer';
      const description   = txMeta.description  || 'Custom order (admin payment link)';

      // Try to link order to a registered user by email
      const existingUser = await (User as any).findOne({ email: customerEmail });

      const order = await Order.create({
        ...(existingUser ? { user: existingUser._id } : { guestInfo: { name: customerName, email: customerEmail, phone: '' } }),
        products: [{
          productName: description,
          quantity: 1,
          price: amountPaid,
        }],
        totalAmount: amountPaid,
        shippingAddress: { street: 'TBD', city: 'TBD', state: 'TBD', country: 'Nigeria' },
        paymentMethod: 'paystack',
        paystackReference: reference,
        notes: `Admin-generated payment link. Description: ${description}`,
        status: 'pending',
        paymentStatus: 'completed',
      });

      return res.status(201).json({
        success: true,
        data: order,
        message: 'Payment verified successfully',
      });
    }

    // Create the order
    const { user, guestInfo, products, totalAmount, shippingAddress, notes } = orderPayload || {};

    const isUserOrder = !!user;
    if (!isUserOrder && (!guestInfo?.name || !guestInfo?.email)) {
      return res.status(400).json({
        success: false,
        message: 'Guest name and email are required',
      });
    }

    if (!shippingAddress?.street || !shippingAddress?.city || !shippingAddress?.country) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address is required',
      });
    }

    const order = await Order.create({
      ...(isUserOrder ? { user } : { guestInfo }),
      products,
      totalAmount,
      shippingAddress,
      paymentMethod: 'paystack',
      paystackReference: reference,
      notes,
      status: 'pending',
      paymentStatus: 'completed',
    });

    const populatedOrder = await Order.findById(order._id)
      .populate('user', 'name email')
      .populate('products.product', 'name price images');

    res.status(201).json({
      success: true,
      data: populatedOrder,
      message: 'Payment verified and order created successfully',
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to verify payment' });
  }
});

export default router;
