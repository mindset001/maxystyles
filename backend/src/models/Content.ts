import mongoose, { Schema, Document } from 'mongoose';

export interface IContent extends Document {
  section: string;
  title?: string;
  content?: string;
  metadata?: {
    heroTitle?: string;
    heroSubtitle?: string;
    motto?: string;
    description?: string;
    logoUrl?: string;
    faviconUrl?: string;
    businessName?: string;
    tagline?: string;
    achievements?: Array<{ number: string; label: string }>;
    services?: Array<{
      title: string;
      description: string;
      icon?: string;
    }>;
    contactInfo?: {
      phones?: string[];
      whatsapp?: string;
      email?: string;
      address?: string;
      instagram?: string[];
      openingHours?: string;
    };
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ContentSchema: Schema = new Schema({
  section: {
    type: String,
    required: [true, 'Content section is required'],
    unique: true,
    enum: ['homepage', 'about', 'contact', 'services', 'footer', 'navigation', 'branding']
  },
  title: {
    type: String,
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    maxlength: [5000, 'Content cannot exceed 5000 characters']
  },
  metadata: {
    heroTitle: String,
    heroSubtitle: String,
    motto: String,
    description: String,
    logoUrl: String,
    faviconUrl: String,
    businessName: String,
    tagline: String,
    achievements: [{
      number: String,
      label: String,
    }],
    services: [{
      title: { type: String, required: true },
      description: { type: String, required: true },
      icon: String
    }],
    contactInfo: {
      phones: [String],
      whatsapp: String,
      email: String,
      address: String,
      instagram: [String],
      openingHours: String,
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create indexes
ContentSchema.index({ section: 1, isActive: 1 });

export const Content = mongoose.model<IContent>('Content', ContentSchema);