import express from 'express';
import { Portfolio } from '../models/Portfolio';
import { Content } from '../models/Content';
import { Testimonial } from '../models/Testimonial';
import { Media } from '../models/Media';
import { Category } from '../models/Category';
import { Product } from '../models';
import { upload, uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary';

const router = express.Router();

// Upload Media Route — accepts single 'file' OR multiple 'images'
router.post('/upload', upload.any(), async (req, res) => {
  try {
    const files = (req.files as Express.Multer.File[]) ?? [];
    if (files.length === 0) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const category = req.body.category || 'gallery';
    const saved: any[] = [];
    for (const file of files) {
      const { url, publicId } = await uploadToCloudinary(file.buffer, 'maxystyles/gallery');
      const media = await Media.create({
        filename: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url,
        cloudinaryId: publicId,
        category,
        isPublic: req.body.isPublic !== 'false',
        uploadedBy: req.body.uploadedBy || '000000000000000000000000',
      });
      saved.push(media);
    }
    res.status(201).json({
      success: true,
      message: `${saved.length} file(s) uploaded successfully`,
      data: saved,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading file',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Delete Media Route
router.delete('/media/:id', async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    
    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }

    // Delete from Cloudinary
    const cloudinaryId = media.get('cloudinaryId') as string;
    await deleteFromCloudinary(cloudinaryId);

    // Delete from database
    await Media.findByIdAndDelete(req.params.id);

    res.json({ 
      success: true,
      message: 'Media deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting media', error });
  }
});

// Portfolio Management Routes
router.get('/portfolio', async (req, res) => {
  try {
    const portfolioItems = await Portfolio.find().sort({ createdAt: -1 });
    res.json(portfolioItems);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching portfolio items', error });
  }
});

// ─── Portfolio: image-aware create ─────────────────────────────────────────
router.post('/portfolio/upload', upload.array('images', 10), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    const imageUrls: string[] = [];

    for (const file of files ?? []) {
      const { url } = await uploadToCloudinary(file.buffer, 'maxystyles/portfolio');
      imageUrls.push(url);
    }

    const { title, description, category, client, completionTime, rating, year, tags, isPublished } = req.body;

    const portfolioItem = await Portfolio.create({
      title,
      description,
      category,
      client,
      completionTime,
      rating: Number(rating),
      year: Number(year),
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map((t: string) => t.trim()).filter(Boolean)) : [],
      images: imageUrls,
      isPublished: isPublished !== 'false',
    });

    res.status(201).json({ success: true, data: portfolioItem });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ─── Portfolio: image-aware update ──────────────────────────────────────────
router.put('/portfolio/upload/:id', upload.array('images', 10), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    const newImageUrls: string[] = [];

    for (const file of files ?? []) {
      const { url } = await uploadToCloudinary(file.buffer, 'maxystyles/portfolio');
      newImageUrls.push(url);
    }

    const { title, description, category, client, completionTime, rating, year, tags, isPublished, existingImages } = req.body;
    const keepImages: string[] = existingImages
      ? (Array.isArray(existingImages) ? existingImages : [existingImages])
      : [];

    const updatedItem = await Portfolio.findByIdAndUpdate(
      req.params.id,
      {
        title, description, category, client, completionTime,
        rating: Number(rating),
        year: Number(year),
        tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map((t: string) => t.trim()).filter(Boolean)) : [],
        images: [...keepImages, ...newImageUrls],
        isPublished: isPublished !== 'false',
      },
      { new: true, runValidators: true }
    );

    if (!updatedItem) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, data: updatedItem });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post('/portfolio', async (req, res) => {
  try {
    const portfolioItem = new Portfolio(req.body);
    const savedItem = await portfolioItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(400).json({ message: 'Error creating portfolio item', error });
  }
});

router.put('/portfolio/:id', async (req, res) => {
  try {
    const updatedItem = await Portfolio.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedItem) {
      return res.status(404).json({ message: 'Portfolio item not found' });
    }
    res.json(updatedItem);
  } catch (error) {
    res.status(400).json({ message: 'Error updating portfolio item', error });
  }
});

router.delete('/portfolio/:id', async (req, res) => {
  try {
    const deletedItem = await Portfolio.findByIdAndDelete(req.params.id);
    if (!deletedItem) {
      return res.status(404).json({ message: 'Portfolio item not found' });
    }
    res.json({ message: 'Portfolio item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting portfolio item', error });
  }
});

// Content Management Routes
router.get('/content', async (req, res) => {
  try {
    const content = await Content.find().sort({ section: 1 });
    res.json({ success: true, data: content });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching content', error });
  }
});

router.get('/content/:section', async (req, res) => {
  try {
    const content = await Content.findOne({ section: req.params.section });
    res.json({ success: true, data: content ?? null });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching content section', error });
  }
});

router.put('/content/:section', async (req, res) => {
  try {
    const updatedContent = await Content.findOneAndUpdate(
      { section: req.params.section },
      { ...req.body, section: req.params.section },
      { new: true, upsert: true, runValidators: true }
    );
    res.json({ success: true, data: updatedContent });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error updating content', error });
  }
});

// Testimonials Management Routes
router.get('/testimonials', async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ isPublished: true }).sort({ createdAt: -1 });
    res.json(testimonials);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching testimonials', error });
  }
});

router.get('/testimonials/all', async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    res.json(testimonials);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching all testimonials', error });
  }
});

router.post('/testimonials', async (req, res) => {
  try {
    const testimonial = new Testimonial(req.body);
    const savedTestimonial = await testimonial.save();
    res.status(201).json(savedTestimonial);
  } catch (error) {
    res.status(400).json({ message: 'Error creating testimonial', error });
  }
});

router.put('/testimonials/:id', async (req, res) => {
  try {
    const updatedTestimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedTestimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }
    res.json(updatedTestimonial);
  } catch (error) {
    res.status(400).json({ message: 'Error updating testimonial', error });
  }
});

router.delete('/testimonials/:id', async (req, res) => {
  try {
    const deletedTestimonial = await Testimonial.findByIdAndDelete(req.params.id);
    if (!deletedTestimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }
    res.json({ message: 'Testimonial deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting testimonial', error });
  }
});

// Media Management Routes
// GET all media (admin)
router.get('/media', async (req, res) => {
  try {
    const { category, page = 1, limit = 200 } = req.query;
    const query: any = {};
    if (category && category !== 'all') query.category = category;
    const media = await Media.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));
    const total = await Media.countDocuments(query);
    res.json({ success: true, data: media, total });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching media', error });
  }
});

// PATCH — update isPublic / category / altText / caption
router.patch('/media/:id', async (req, res) => {
  try {
    const allowed = ['isPublic', 'category', 'altText', 'caption'];
    const update: any = {};
    allowed.forEach((k) => { if (req.body[k] !== undefined) update[k] = req.body[k]; });
    const media = await Media.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!media) return res.status(404).json({ success: false, message: 'Media not found' });
    res.json({ success: true, data: media });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating media', error });
  }
});

// DELETE — remove from Cloudinary + DB
router.delete('/media/:id', async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) return res.status(404).json({ success: false, message: 'Media not found' });
    try { await deleteFromCloudinary(media.get('cloudinaryId') as string); } catch (_) { /* ignore if already gone */ }
    await Media.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Media deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting media', error });
  }
});

// ─── Admin Products ─────────────────────────────────────────────────────────
router.get('/products', async (req, res) => {
  try {
    const { page = 1, limit = 50, category, search } = req.query;
    const query: any = {};
    if (category) query.category = category;
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));
    const total = await Product.countDocuments(query);
    res.json({ success: true, data: products, total });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/products', upload.array('images', 10), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    const imageUrls: string[] = [];

    for (const file of files ?? []) {
      const { url } = await uploadToCloudinary(file.buffer, 'maxystyles/products');
      imageUrls.push(url);
    }

    const { name, description, price, category, sizes, colors, stockQuantity, brand, tags, inStock } = req.body;

    const product = await Product.create({
      name,
      description,
      price: Number(price),
      category,
      sizes: sizes ? (Array.isArray(sizes) ? sizes : [sizes]) : [],
      colors: colors ? (Array.isArray(colors) ? colors : colors.split(',').map((c: string) => c.trim()).filter(Boolean)) : [],
      stockQuantity: Number(stockQuantity ?? 0),
      brand: brand || undefined,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map((t: string) => t.trim()).filter(Boolean)) : [],
      images: imageUrls,
      inStock: inStock !== 'false',
    });

    res.status(201).json({ success: true, data: product });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/products/:id', upload.array('images', 10), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    const newImageUrls: string[] = [];

    for (const file of files ?? []) {
      const { url } = await uploadToCloudinary(file.buffer, 'maxystyles/products');
      newImageUrls.push(url);
    }

    const { name, description, price, category, sizes, colors, stockQuantity, brand, tags, inStock, existingImages } = req.body;
    const keepImages: string[] = existingImages
      ? (Array.isArray(existingImages) ? existingImages : [existingImages])
      : [];

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name, description, price: Number(price), category,
        sizes: sizes ? (Array.isArray(sizes) ? sizes : [sizes]) : [],
        colors: colors ? (Array.isArray(colors) ? colors : colors.split(',').map((c: string) => c.trim()).filter(Boolean)) : [],
        stockQuantity: Number(stockQuantity ?? 0),
        brand: brand || undefined,
        tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map((t: string) => t.trim()).filter(Boolean)) : [],
        images: [...keepImages, ...newImageUrls],
        inStock: inStock !== 'false',
      },
      { new: true, runValidators: true }
    );

    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── Admin Categories ────────────────────────────────────────────────────────
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({ success: true, data: categories });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/categories', upload.single('image'), async (req, res) => {
  try {
    let imageUrl = '';
    if (req.file) {
      const { url } = await uploadToCloudinary(req.file.buffer, 'maxystyles/categories');
      imageUrl = url;
    }
    const category = await Category.create({ ...req.body, image: imageUrl || req.body.image || '' });
    res.status(201).json({ success: true, data: category });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/categories/:id', upload.single('image'), async (req, res) => {
  try {
    let imageUrl = req.body.existingImage || '';
    if (req.file) {
      const { url } = await uploadToCloudinary(req.file.buffer, 'maxystyles/categories');
      imageUrl = url;
    }
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { ...req.body, image: imageUrl },
      { new: true, runValidators: true }
    );
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, data: category });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/categories/:id', async (req, res) => {
  try {
    const deleted = await Category.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, message: 'Category deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Bulk operations
router.post('/portfolio/bulk-update', async (req, res) => {
  try {
    const { ids, updates } = req.body;
    const result = await Portfolio.updateMany(
      { _id: { $in: ids } },
      updates
    );
    res.json({ message: `Updated ${result.modifiedCount} portfolio items` });
  } catch (error) {
    res.status(400).json({ message: 'Error bulk updating portfolio items', error });
  }
});

router.delete('/portfolio/bulk-delete', async (req, res) => {
  try {
    const { ids } = req.body;
    const result = await Portfolio.deleteMany({ _id: { $in: ids } });
    res.json({ message: `Deleted ${result.deletedCount} portfolio items` });
  } catch (error) {
    res.status(400).json({ message: 'Error bulk deleting portfolio items', error });
  }
});

export default router;