import express from 'express';
import { PageView } from '../models/PageView';
import { Order } from '../models/Order';
import { User } from '../models/User';
import { Product } from '../models/Product';

const router = express.Router();

// ─── POST /api/analytics/pageview ──────────────────────────────────────────
// Called by the frontend on every route change.
router.post('/pageview', async (req, res) => {
  try {
    const { page, pageLabel, sessionId, referrer, userAgent } = req.body;
    if (!page) return res.status(400).json({ message: 'page is required' });

    await PageView.create({
      page,
      pageLabel: pageLabel || page,
      sessionId: sessionId || '',
      referrer: referrer || '',
      userAgent: userAgent || req.headers['user-agent'] || '',
    });

    res.status(201).json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: 'Error recording page view', error });
  }
});

// ─── GET /api/analytics ─────────────────────────────────────────────────────
// Returns aggregated stats for the admin analytics page.
router.get('/', async (_req, res) => {
  try {
    const now = new Date();

    // Time boundaries
    const startOfToday    = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday= new Date(startOfToday.getTime() - 86400000);
    const startOfWeek     = new Date(startOfToday.getTime() - 6 * 86400000);
    const startOfMonth    = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOf30Days   = new Date(startOfToday.getTime() - 29 * 86400000);
    const startOfLastMonth= new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth  = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // ── Page views ────────────────────────────────────────────────────────────
    const [
      viewsTotal,
      viewsToday,
      viewsYesterday,
      viewsThisWeek,
      viewsThisMonth,
    ] = await Promise.all([
      PageView.countDocuments(),
      PageView.countDocuments({ createdAt: { $gte: startOfToday } }),
      PageView.countDocuments({ createdAt: { $gte: startOfYesterday, $lt: startOfToday } }),
      PageView.countDocuments({ createdAt: { $gte: startOfWeek } }),
      PageView.countDocuments({ createdAt: { $gte: startOfMonth } }),
    ]);

    // Views per day for the last 30 days
    const viewsByDay = await PageView.aggregate([
      { $match: { createdAt: { $gte: startOf30Days } } },
      {
        $group: {
          _id: {
            year:  { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day:   { $dayOfMonth: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    // Top 10 pages
    const topPages = await PageView.aggregate([
      { $group: { _id: '$page', label: { $first: '$pageLabel' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // ── Orders ─────────────────────────────────────────────────────────────────
    const [
      ordersTotal,
      ordersThisMonth,
      ordersLastMonth,
      revenueData,
      revenueLastMonthData,
      ordersByStatus,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Order.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
      Order.aggregate([
        { $match: { paymentStatus: 'completed' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Order.aggregate([
        { $match: { paymentStatus: 'completed', createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    const revenueTotal    = revenueData[0]?.total ?? 0;
    const revenueLastMonth = revenueLastMonthData[0]?.total ?? 0;

    // Revenue per day (last 30 days)
    const revenueByDay = await Order.aggregate([
      { $match: { paymentStatus: 'completed', createdAt: { $gte: startOf30Days } } },
      {
        $group: {
          _id: {
            year:  { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day:   { $dayOfMonth: '$createdAt' },
          },
          total: { $sum: '$totalAmount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    // ── Customers ──────────────────────────────────────────────────────────────
    const [customersTotal, customersThisMonth] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'user', createdAt: { $gte: startOfMonth } }),
    ]);

    // ── Products ───────────────────────────────────────────────────────────────
    const productsTotal = await Product.countDocuments();

    // Top products by revenue from completed orders
    const topProducts = await Order.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $unwind: '$products' },
      {
        $group: {
          _id: '$products.productName',
          revenue: { $sum: { $multiply: ['$products.price', '$products.quantity'] } },
          units: { $sum: '$products.quantity' },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
    ]);

    res.json({
      views: {
        total: viewsTotal,
        today: viewsToday,
        yesterday: viewsYesterday,
        thisWeek: viewsThisWeek,
        thisMonth: viewsThisMonth,
        byDay: viewsByDay,
        topPages,
      },
      orders: {
        total: ordersTotal,
        thisMonth: ordersThisMonth,
        lastMonth: ordersLastMonth,
        byStatus: ordersByStatus,
        revenueByDay,
      },
      revenue: {
        total: revenueTotal,
        lastMonth: revenueLastMonth,
      },
      customers: {
        total: customersTotal,
        thisMonth: customersThisMonth,
      },
      products: {
        total: productsTotal,
        topProducts,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching analytics', error });
  }
});

export default router;
