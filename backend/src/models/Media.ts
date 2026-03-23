import mongoose, { Schema, Document } from 'mongoose';

export interface IMedia extends Document {
  filename: string;
  originalName?: string;
  mimeType: string;
  size: number;
  path?: string;
  url: string;
  cloudinaryId: string;
  altText?: string;
  caption?: string;
  category: string;
  tags: string[];
  isPublic: boolean;
  uploadedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MediaSchema: Schema = new Schema({
  filename: {
    type: String,
    required: [true, 'Filename is required']
  },
  originalName: {
    type: String
  },
  mimeType: {
    type: String,
    required: [true, 'MIME type is required']
  },
  size: {
    type: Number,
    required: [true, 'File size is required'],
    max: [10 * 1024 * 1024, 'File size cannot exceed 10MB'] // 10MB limit
  },
  path: {
    type: String
  },
  url: {
    type: String,
    required: [true, 'File URL is required']
  },
  cloudinaryId: {
    type: String,
    required: [true, 'Cloudinary ID is required']
  },
  altText: {
    type: String,
    maxlength: [200, 'Alt text cannot exceed 200 characters']
  },
  caption: {
    type: String,
    maxlength: [500, 'Caption cannot exceed 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['portfolio', 'testimonial', 'hero', 'gallery', 'product', 'general', 'other'],
    default: 'other'
  },
  tags: [{
    type: String,
    trim: true
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Uploader is required']
  }
}, {
  timestamps: true
});

// Create indexes
MediaSchema.index({ category: 1, isPublic: 1 });
MediaSchema.index({ tags: 1 });
MediaSchema.index({ createdAt: -1 });
MediaSchema.index({ mimeType: 1 });

// Virtual for public URL
MediaSchema.virtual('publicUrl').get(function() {
  return this.isPublic ? this.url : null;
});

export const Media = mongoose.model<IMedia>('Media', MediaSchema);