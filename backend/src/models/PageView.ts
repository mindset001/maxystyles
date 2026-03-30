import mongoose, { Document, Schema } from 'mongoose';

export interface IPageView extends Document {
  page: string;       // URL path e.g. "/products/abc123"
  pageLabel: string;  // Human-friendly label e.g. "Product Page"
  sessionId: string;  // anonymous session to deduplicate rapid hits
  referrer: string;
  userAgent: string;
  createdAt: Date;
}

const PageViewSchema = new Schema<IPageView>(
  {
    page:      { type: String, required: true, index: true },
    pageLabel: { type: String, default: '' },
    sessionId: { type: String, default: '' },
    referrer:  { type: String, default: '' },
    userAgent: { type: String, default: '' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// TTL: auto-delete raw views older than 1 year to keep collection lean
PageViewSchema.index({ createdAt: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });

export const PageView = mongoose.model<IPageView>('PageView', PageViewSchema);
