import mongoose, { Schema, Document } from 'mongoose';

export interface ITestimonial extends Document {
  customerName: string;
  customerRole: string;
  testimonialText: string;
  rating: number;
  customerImage?: string;
  projectType?: string;
  isPublished: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TestimonialSchema: Schema = new Schema({
  customerName: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
    maxlength: [100, 'Customer name cannot exceed 100 characters']
  },
  customerRole: {
    type: String,
    required: [true, 'Customer role is required'],
    trim: true,
    maxlength: [100, 'Customer role cannot exceed 100 characters']
  },
  testimonialText: {
    type: String,
    required: [true, 'Testimonial text is required'],
    maxlength: [1000, 'Testimonial cannot exceed 1000 characters']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  customerImage: {
    type: String,
    default: null
  },
  projectType: {
    type: String,
    enum: ['Traditional Wear', 'Contemporary Fashion', 'Monogram Designs', 'Wedding Attire', 'Corporate Wear', 'Alterations'],
    default: null
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Create indexes
TestimonialSchema.index({ isPublished: 1, isFeatured: 1 });
TestimonialSchema.index({ rating: -1 });
TestimonialSchema.index({ createdAt: -1 });

export const Testimonial = mongoose.model<ITestimonial>('Testimonial', TestimonialSchema);