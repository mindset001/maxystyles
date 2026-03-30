import mongoose, { Document, Schema } from 'mongoose';

export interface IPromoCode {
  code: string;
  discount: number;   // decimal, e.g. 0.1 = 10%
  active: boolean;
  description?: string;
}

export interface ISiteSettings extends Document {
  key: string;
  taxRate: number;                 // decimal, e.g. 0.075 = 7.5%
  maintenanceMode: boolean;
  maintenanceMessage: string;
  promoCodes: IPromoCode[];
}

const PromoCodeSchema = new Schema<IPromoCode>({
  code:        { type: String, required: true, uppercase: true, trim: true },
  discount:    { type: Number, required: true, min: 0, max: 1 },
  active:      { type: Boolean, default: true },
  description: { type: String, default: '' },
}, { _id: false });

const SiteSettingsSchema = new Schema<ISiteSettings>(
  {
    key:                { type: String, default: 'default', unique: true },
    taxRate:            { type: Number, default: 0.075, min: 0, max: 1 },
    maintenanceMode:    { type: Boolean, default: false },
    maintenanceMessage: { type: String, default: 'We\'re currently performing maintenance. We\'ll be back shortly.' },
    promoCodes:         { type: [PromoCodeSchema], default: [
      { code: 'MAXY10',    discount: 0.1,  active: true, description: '10% off' },
      { code: 'STYLE20',   discount: 0.2,  active: true, description: '20% off' },
      { code: 'FASHION15', discount: 0.15, active: true, description: '15% off' },
    ]},
  },
  { timestamps: true }
);

export const SiteSettings = mongoose.model<ISiteSettings>('SiteSettings', SiteSettingsSchema);
