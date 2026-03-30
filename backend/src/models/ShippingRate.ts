import mongoose, { Schema, Document } from 'mongoose';

export interface IShippingRate extends Document {
  key: string;
  rates: Map<string, number>;
}

const ShippingRateSchema = new Schema<IShippingRate>(
  {
    key: { type: String, default: 'default', unique: true },
    rates: { type: Map, of: Number, required: true },
  },
  { timestamps: true }
);

export const ShippingRate = mongoose.model<IShippingRate>('ShippingRate', ShippingRateSchema);
