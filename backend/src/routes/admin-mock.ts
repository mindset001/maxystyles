import express from 'express';

const router = express.Router();

// Mock data for testing
const mockContent = {
  hero: {
    title: "Welcome to MaxyStyles",
    subtitle: "Professional Tailoring and Monogram Designing",
    description: "We create custom-fitted clothing and beautiful monogram designs for all your fashion needs.",
    image: "/hero-image.jpg"
  },
  about: {
    title: "About MaxyStyles",
    description: "With years of experience in tailoring and monogram designing, we bring you the finest craftsmanship and attention to detail.",
    mission: "To provide exceptional tailoring services and unique monogram designs that reflect your personal style.",
    vision: "To be the leading fashion house known for quality, creativity, and customer satisfaction."
  }
};

const mockTestimonials = [
  {
    id: "1",
    name: "Sarah Johnson",
    rating: 5,
    text: "Amazing work! The tailoring is perfect and the monogram design exceeded my expectations.",
    image: "/testimonial1.jpg",
    isActive: true
  },
  {
    id: "2", 
    name: "Michael Brown",
    rating: 5,
    text: "Professional service and excellent quality. Highly recommended!",
    image: "/testimonial2.jpg",
    isActive: true
  }
];

const mockPortfolio = [
  {
    id: "1",
    title: "Custom Suit Design",
    description: "Elegant business suit with custom monogram",
    category: "suits",
    images: ["/portfolio1.jpg"],
    isActive: true
  },
  {
    id: "2",
    title: "Wedding Dress Tailoring", 
    description: "Beautiful wedding dress with intricate details",
    category: "dresses",
    images: ["/portfolio2.jpg"],
    isActive: true
  }
];

// Content Management Routes
router.get('/content/:section', async (req, res) => {
  try {
    const { section } = req.params;
    const content = mockContent[section as keyof typeof mockContent];
    
    if (!content) {
      return res.status(404).json({ message: 'Content section not found' });
    }
    
    res.json(content);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching content', error });
  }
});

router.put('/content/:section', async (req, res) => {
  try {
    const { section } = req.params;
    
    // Update mock data (in a real app, this would update the database)
    (mockContent as any)[section] = { ...req.body };
    
    res.json({ 
      message: 'Content updated successfully',
      content: (mockContent as any)[section]
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating content', error });
  }
});

// Testimonials Management Routes
router.get('/testimonials', async (req, res) => {
  try {
    res.json(mockTestimonials);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching testimonials', error });
  }
});

router.post('/testimonials', async (req, res) => {
  try {
    const newTestimonial = {
      id: Date.now().toString(),
      ...req.body,
      isActive: true
    };
    
    mockTestimonials.push(newTestimonial);
    res.status(201).json(newTestimonial);
  } catch (error) {
    res.status(400).json({ message: 'Error creating testimonial', error });
  }
});

router.put('/testimonials/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const index = mockTestimonials.findIndex(t => t.id === id);
    
    if (index === -1) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }
    
    mockTestimonials[index] = { ...mockTestimonials[index], ...req.body };
    res.json(mockTestimonials[index]);
  } catch (error) {
    res.status(400).json({ message: 'Error updating testimonial', error });
  }
});

router.delete('/testimonials/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const index = mockTestimonials.findIndex(t => t.id === id);
    
    if (index === -1) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }
    
    mockTestimonials.splice(index, 1);
    res.json({ message: 'Testimonial deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting testimonial', error });
  }
});

// Portfolio Management Routes
router.get('/portfolio', async (req, res) => {
  try {
    res.json(mockPortfolio);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching portfolio', error });
  }
});

router.post('/portfolio', async (req, res) => {
  try {
    const newPortfolioItem = {
      id: Date.now().toString(),
      ...req.body,
      isActive: true
    };
    
    mockPortfolio.push(newPortfolioItem);
    res.status(201).json(newPortfolioItem);
  } catch (error) {
    res.status(400).json({ message: 'Error creating portfolio item', error });
  }
});

router.put('/portfolio/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const index = mockPortfolio.findIndex(p => p.id === id);
    
    if (index === -1) {
      return res.status(404).json({ message: 'Portfolio item not found' });
    }
    
    mockPortfolio[index] = { ...mockPortfolio[index], ...req.body };
    res.json(mockPortfolio[index]);
  } catch (error) {
    res.status(400).json({ message: 'Error updating portfolio item', error });
  }
});

router.delete('/portfolio/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const index = mockPortfolio.findIndex(p => p.id === id);
    
    if (index === -1) {
      return res.status(404).json({ message: 'Portfolio item not found' });
    }
    
    mockPortfolio.splice(index, 1);
    res.json({ message: 'Portfolio item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting portfolio item', error });
  }
});

export default router;