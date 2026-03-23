import mongoose, { Schema, Document } from 'mongoose';

export interface IPortfolio extends Document {
  title: string;
  description: string;
  category: string;
  images: string[];
  tags: string[];
  client: string;
  completionTime: string;
  rating: number;
  year: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PortfolioSchema: Schema = new Schema({
  title: {
    type: String,
    required: [true, 'Portfolio title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Traditional Wear', 'Contemporary Fashion', 'Monogram Designs', 'Wedding Attire', 'Corporate Wear', 'Alterations']
  },
  images: [{
    type: String,
    required: true
  }],
  tags: [{
    type: String,
    trim: true
  }],
  client: {
    type: String,
    required: [true, 'Client name is required'],
    trim: true
  },
  completionTime: {
    type: String,
    required: [true, 'Completion time is required']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: [2020, 'Year must be 2020 or later']
  },
  isPublished: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
PortfolioSchema.index({ category: 1, isPublished: 1 });
PortfolioSchema.index({ createdAt: -1 });
PortfolioSchema.index({ tags: 1 });

export const Portfolio = mongoose.model<IPortfolio>('Portfolio', PortfolioSchema);