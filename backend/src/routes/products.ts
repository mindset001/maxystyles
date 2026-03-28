import express from 'express';
import { Product } from '../models';

const router = express.Router();

// GET /api/products - Get all products
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      category, 
      search, 
      minPrice, 
      maxPrice,
      inStock 
    } = req.query;

    const query: any = {};

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by stock status
    if (inStock !== undefined) {
      query.inStock = inStock === 'true';
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Text search
    if (search) {
      query.$text = { $search: search as string };
    }

    const products = await Product.find(query)
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      data: products,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / Number(limit)),
        total
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
});

// GET /api/products/:id - Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message
    });
  }
});

// POST /api/products - Create new product
router.post('/', async (req, res) => {
  try {
    const product = await Product.create(req.body);
    
    res.status(201).json({
      success: true,
      data: product,
      message: 'Product created successfully'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: 'Failed to create product',
      error: error.message
    });
  }
});

// PUT /api/products/:id - Update product
router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product,
      message: 'Product updated successfully'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: 'Failed to update product',
      error: error.message
    });
  }
});

// DELETE /api/products/:id - Delete product
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: error.message
    });
  }
});

// POST /api/products/:id/reviews — Submit a review
router.post('/:id/reviews', async (req, res) => {
  try {
    const { name, email, rating, comment, userId } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    if (!comment || !comment.trim()) {
      return res.status(400).json({ success: false, message: 'Comment is required' });
    }
    const parsedRating = parseInt(rating, 10);
    if (!parsedRating || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const review: any = {
      name: name.trim(),
      rating: parsedRating,
      comment: comment.trim(),
      createdAt: new Date(),
    };
    if (email) review.email = email.trim().toLowerCase();
    if (userId) review.user = userId;

    (product as any).reviews.push(review);

    // Recalculate aggregate rating
    const reviews = (product as any).reviews as { rating: number }[];
    product.reviewCount = reviews.length;
    product.rating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await product.save();

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: { reviews: (product as any).reviews, rating: product.rating, reviewCount: product.reviewCount },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to submit review', error: error.message });
  }
});

export default router;