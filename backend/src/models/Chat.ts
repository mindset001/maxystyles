import mongoose, { Document, Schema } from 'mongoose';

export interface IAttachment {
  url: string;
  publicId: string;
  filename: string;
  mimetype: string;
}

export interface IMessage {
  _id?: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  senderName: string;
  senderRole: 'customer' | 'admin';
  text: string;
  attachments: IAttachment[];
  isRead: boolean;
  createdAt: Date;
}

export interface IChat extends Document {
  customer: mongoose.Types.ObjectId;
  customerName: string;
  customerEmail: string;
  subject: string;
  status: 'open' | 'in-progress' | 'closed';
  messages: IMessage[];
  lastMessageAt: Date;
  unreadByAdmin: number;
  unreadByCustomer: number;
  createdAt: Date;
  updatedAt: Date;
}

const AttachmentSchema = new Schema<IAttachment>({
  url: { type: String, required: true },
  publicId: { type: String, default: '' },
  filename: { type: String, required: true },
  mimetype: { type: String, default: 'image/jpeg' },
});

const MessageSchema = new Schema<IMessage>(
  {
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    senderName: { type: String, required: true },
    senderRole: { type: String, enum: ['customer', 'admin'], required: true },
    text: { type: String, default: '' },
    attachments: { type: [AttachmentSchema], default: [] },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const ChatSchema = new Schema<IChat>(
  {
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    subject: { type: String, default: 'Design Inquiry' },
    status: { type: String, enum: ['open', 'in-progress', 'closed'], default: 'open' },
    messages: { type: [MessageSchema], default: [] },
    lastMessageAt: { type: Date, default: Date.now },
    unreadByAdmin: { type: Number, default: 0 },
    unreadByCustomer: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Index for quick lookup
ChatSchema.index({ customer: 1 });
ChatSchema.index({ status: 1 });
ChatSchema.index({ lastMessageAt: -1 });

export const Chat = mongoose.model<IChat>('Chat', ChatSchema);
