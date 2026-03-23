import mongoose from 'mongoose';
import { Portfolio } from './models/Portfolio';
import { Content } from './models/Content';
import { Testimonial } from './models/Testimonial';
import { User } from './models/User';
import dotenv from 'dotenv';

dotenv.config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/maxystyles');
    console.log('Connected to MongoDB for seeding...');

    // Clear demo portfolio and testimonials — real data is uploaded via admin panel
    await Portfolio.deleteMany({});
    await Testimonial.deleteMany({});
    console.log('Cleared demo portfolio and testimonial data...');

    // Check if content already exists (do not overwrite admin edits)
    const contentExists = await Content.countDocuments();

    // Create admin user if doesn't exist
    const adminExists = await User.findOne({ email: 'admin@maxystyles.com' });
    if (!adminExists) {
      const adminUser = new User({
        name: 'MaxyStyles Admin',
        email: 'admin@maxystyles.com',
        password: 'admin123', // This will be hashed automatically
        role: 'admin'
      });
      await adminUser.save();
      console.log('Admin user created...');
    }

    // Seed Content Data
    const contentData = [
      {
        section: 'homepage',
        metadata: {
          heroTitle: 'MaxyStyles',
          heroSubtitle: 'Expert tailoring and custom monogram designing in Osogbo',
          motto: 'Anything but Styles',
          description: 'We create perfectly fitted garments that blend traditional craftsmanship with modern style.',
          services: [
            {
              title: 'Custom Tailoring',
              description: 'Perfectly fitted garments crafted to your exact measurements',
              icon: 'Scissors'
            },
            {
              title: 'Monogram Design',
              description: 'Personalized embroidery and monogram artwork for all garments',
              icon: 'Palette'
            },
            {
              title: 'Expert Craftsmanship',
              description: 'Years of experience in traditional and contemporary tailoring',
              icon: 'Award'
            }
          ]
        },
        isActive: true
      },
      {
        section: 'about',
        title: 'About MaxyStyles',
        content: 'Located in the heart of Osogbo, Osun State, MaxyStyles specializes in expert tailoring and custom monogram designing. We create perfectly fitted garments that combine traditional craftsmanship with contemporary style.',
        metadata: {
          motto: 'Anything but Styles - Our commitment to excellence in every thread',
          achievements: [
            { number: '1000+', label: 'Custom Garments' },
            { number: '500+', label: 'Monogram Designs' },
            { number: '5+', label: 'Years Experience' },
            { number: '5★', label: 'Customer Satisfaction' }
          ]
        },
        isActive: true
      },
      {
        section: 'contact',
        metadata: {
          contactInfo: {
            phones: ['08109612952', '08142362093'],
            whatsapp: '+2348109612952',
            email: 'info@maxystyles.com',
            address: 'Irewole community, zone 9, kunike junction, idi oro, ilesha garage, Osogbo, Osun State',
            instagram: ['maxy_styles_', 'finest_tailor'],
            openingHours: 'Mon–Sat 8AM–7PM WAT'
          }
        },
        isActive: true
      },
      {
        section: 'branding',
        metadata: {
          businessName: 'MaxyStyles',
          tagline: 'Anything but Styles',
          logoUrl: '',
          faviconUrl: ''
        },
        isActive: true
      }
    ];

    if (contentExists === 0) {
      await Content.insertMany(contentData);
      console.log('Content data seeded...');
    } else {
      console.log('Content already exists – skipping content seed.');
    }

    console.log('Database setup completed successfully!');
    
    // Display summary
    const contentCount = await Content.countDocuments();
    
    console.log(`\n=== SETUP SUMMARY ===`);
    console.log(`Content Sections: ${contentCount}`);
    console.log(`Portfolio & Testimonials: managed via admin panel`);
    console.log(`Admin User: Created (email: admin@maxystyles.com, password: admin123)`);
    console.log(`=====================\n`);

  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedData();
}

export default seedData;