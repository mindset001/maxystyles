import mongoose, { Document, Schema } from 'mongoose';

// Order Interface
export interface IOrder extends Document {
  user?: mongoose.Types.ObjectId;
  guestInfo?: {
    name: string;
    email: string;
    phone?: string;
  };
  products: Array<{
    product?: mongoose.Types.ObjectId;
    productName?: string;
    quantity: number;
    size?: string;
    color?: string;
    price: number;
  }>;
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode?: string;
    country: string;
  };
  paymentStatus: 'pending' | 'completed' | 'failed';
  paymentMethod?: string;
  paystackReference?: string;
  trackingNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Order Schema
const OrderSchema = new Schema<IOrder>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  guestInfo: {
    name: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
  },
  products: [{
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: false
    },
    productName: { type: String },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    },
    size: {
      type: String,
      required: false
    },
    color: {
      type: String,
      required: false
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative']
    }
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: [0, 'Total amount cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: false },
    country: { type: String, required: true }
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  paymentMethod: {
    type: String
  },
  paystackReference: {
    type: String
  },
  trackingNumber: {
    type: String
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

export const Order = mongoose.model<IOrder>('Order', OrderSchema);