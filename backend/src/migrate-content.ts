/**
 * One-time migration: fix old string-format phones/instagram → arrays,
 * add missing achievements to about, create branding section.
 * Run: npx ts-node src/migrate-content.ts
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env') });

import { Content } from './models/Content';

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI!);
  console.log('✅ Connected to MongoDB');

  // ── Fix contact section ───────────────────────────────────────────
  const contact = await Content.findOne({ section: 'contact' });
  if (contact) {
    const ci = (contact as any).metadata?.contactInfo ?? {};
    const phones = Array.isArray(ci.phones)
      ? ci.phones
      : typeof ci.phones === 'string' ? ci.phones.split(/\s+/).filter(Boolean) : ['08109612952', '08142362093'];
    const instagram = Array.isArray(ci.instagram)
      ? ci.instagram
      : typeof ci.instagram === 'string' ? ci.instagram.split(/\s+/).filter(Boolean) : ['maxy_styles_', 'finest_tailor'];

    await Content.findOneAndUpdate(
      { section: 'contact' },
      {
        $set: {
          metadata: {
            contactInfo: {
              phones,
              instagram,
              whatsapp: ci.whatsapp || '+2348109612952',
              email: ci.email || 'info@maxystyles.com',
              address: ci.address || 'Irewole community, zone 9, kunike junction, idi oro, ilesha garage, Osogbo, Osun State',
              openingHours: ci.openingHours || 'Mon–Sat 8AM–7PM WAT',
            },
          },
          isActive: true,
        },
      }
    );
    console.log('✅ Contact section fixed — phones:', phones, '| instagram:', instagram);
  }

  // ── Fix about section (add achievements if missing) ───────────────
  const about = await Content.findOne({ section: 'about' });
  if (about) {
    const existing = (about as any).metadata?.achievements ?? [];
    if (!existing.length) {
      await Content.findOneAndUpdate(
        { section: 'about' },
        {
          $set: {
            'metadata.achievements': [
              { number: '1000+', label: 'Custom Garments' },
              { number: '500+', label: 'Monogram Designs' },
              { number: '5+', label: 'Years Experience' },
              { number: '5★', label: 'Customer Satisfaction' },
            ],
          },
        }
      );
      console.log('✅ About section — achievements added');
    } else {
      console.log('ℹ️  About section already has achievements');
    }
  }

  // ── Create branding section if missing ───────────────────────────
  const branding = await Content.findOne({ section: 'branding' });
  if (!branding) {
    await Content.create({
      section: 'branding',
      metadata: {
        businessName: 'MaxyStyles',
        tagline: 'Anything but Styles',
        logoUrl: '',
        faviconUrl: '',
      },
      isActive: true,
    });
    console.log('✅ Branding section created');
  } else {
    console.log('ℹ️  Branding section already exists');
  }

  // ── Fix homepage services if they are stringified ────────────────
  const homepage = await Content.findOne({ section: 'homepage' });
  if (homepage) {
    const services = (homepage as any).metadata?.services ?? [];
    // If services are stringified (PS artifact), replace with defaults
    const hasStringifiedItems = services.some((s: any) => typeof s === 'string');
    if (hasStringifiedItems || services.length === 0) {
      await Content.findOneAndUpdate(
        { section: 'homepage' },
        {
          $set: {
            'metadata.services': [
              { title: 'Custom Tailoring', description: 'Perfectly fitted garments crafted to your exact measurements', icon: 'Scissors' },
              { title: 'Monogram Design', description: 'Personalized embroidery and monogram artwork for all garments', icon: 'Palette' },
              { title: 'Expert Craftsmanship', description: 'Years of experience in traditional and contemporary tailoring', icon: 'Award' },
            ],
          },
        }
      );
      console.log('✅ Homepage services reset to defaults');
    } else {
      console.log('ℹ️  Homepage services OK');
    }
  }

  console.log('\n🎉 Migration complete!');
  await mongoose.disconnect();
};

run().catch(e => { console.error(e); process.exit(1); });
