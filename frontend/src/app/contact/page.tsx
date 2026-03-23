'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  MessageCircle,
  Headphones,
  Globe,
  ArrowRight,
} from 'lucide-react';
import { FadeUp, SlideLeft, SlideRight, Stagger, StaggerChild, ScaleIn } from '@/components/animations';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const faqs = [
  {
    question: 'What tailoring services do you offer?',
    answer: 'We provide custom tailoring for all types of clothing including suits, dresses, traditional wear, and alterations. We specialise in creating perfectly fitted garments to your measurements.',
  },
  {
    question: 'Do you offer monogram designing?',
    answer: 'Yes! We create custom monogram designs for clothing, accessories, and corporate wear. Our designers can create unique patterns and embroidery work tailored to your preferences.',
  },
  {
    question: 'How long does custom tailoring take?',
    answer: 'Custom tailoring typically takes 12 weeks depending on the complexity of the garment. Rush orders can be accommodated with prior arrangement.',
  },
  {
    question: 'Can I visit your atelier for fittings?',
    answer: 'Absolutely! We encourage in-person fittings at our Osogbo location. Please call or WhatsApp to schedule an appointment for the best service.',
  },
  {
    question: 'Do you work with traditional African fabrics?',
    answer: 'Yes, we specialise in working with all types of fabrics including traditional African prints, ankara, adire, and other local materials for authentic cultural designs.',
  },
];

export default function ContactPage() {
  const [contactInfo, setContactInfo] = useState({
    phone1: '08109612952',
    phone2: '08142362093',
    whatsapp: '+2348109612952',
    email: 'info@maxystyles.com',
    address: 'Irewole community, zone 9, kunike junction, idi oro, ilesha garage, Osogbo, Osun State',
    instagram1: 'maxy_styles_',
    instagram2: 'finest_tailor',
    openingHours: 'MonSat 8AM7PM WAT',
  });

  useEffect(() => {
    fetch(`${API}/content?section=contact`)
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        const c = data?.data?.metadata?.contactInfo;
        if (!c) return;
        const phonesArr = Array.isArray(c.phones)
          ? c.phones
          : typeof c.phones === 'string' ? c.phones.split(/\s+/).filter(Boolean) : [];
        const instaArr = Array.isArray(c.instagram)
          ? c.instagram
          : typeof c.instagram === 'string' ? c.instagram.split(/\s+/).filter(Boolean) : [];
        setContactInfo({
          phone1: phonesArr[0] ?? '08109612952',
          phone2: phonesArr[1] ?? '08142362093',
          whatsapp: c.whatsapp ?? '+2348109612952',
          email: c.email ?? 'info@maxystyles.com',
          address: c.address ?? '',
          instagram1: instaArr[0] ?? 'maxy_styles_',
          instagram2: instaArr[1] ?? 'finest_tailor',
          openingHours: c.openingHours ?? 'MonSat 8AM7PM WAT',
        });
      })
      .catch(() => {});
  }, []);

  const phoneDisplay = [contactInfo.phone1, contactInfo.phone2].filter(Boolean).join(' / ');
  const instagramDisplay = [`@${contactInfo.instagram1}`, `@${contactInfo.instagram2}`]
    .filter(s => s !== '@')
    .join(' / ');

  const contactMethods = [
    {
      icon: Phone,
      title: 'Phone',
      contact: phoneDisplay,
      sublabel: contactInfo.openingHours,
      href: `tel:${contactInfo.phone1}`,
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp',
      contact: contactInfo.whatsapp,
      sublabel: 'Available 24 / 7',
      href: `https://wa.me/${contactInfo.whatsapp.replace(/\D/g, '')}`,
    },
    {
      icon: Globe,
      title: 'Instagram',
      contact: instagramDisplay,
      sublabel: 'Active daily',
      href: `https://instagram.com/${contactInfo.instagram1}`,
    },
    {
      icon: Mail,
      title: 'Email',
      contact: contactInfo.email,
      sublabel: 'Response within 24 hours',
      href: `mailto:${contactInfo.email}`,
    },
  ];

  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
      alert("Thank you for your message! We'll get back to you soon.");
    }, 2000);
  };

  const inputClass =
    'w-full bg-white dark:bg-[#111] text-[#1A1A1A] dark:text-white border border-[#D4AF37]/30 dark:border-[#D4AF37]/15 px-4 py-3 text-sm placeholder:text-[#8C7B6E] dark:placeholder:text-gray-600 focus:outline-none focus:border-[#D4AF37] transition-colors duration-200';
  const labelClass = 'block text-xs uppercase tracking-widest text-[#8C7B6E] dark:text-gray-500 mb-2';

  return (
    <div className="bg-[#FAF8F4] dark:bg-[#0A0A0A] text-[#1A1A1A] dark:text-white min-h-screen transition-colors duration-300">

      {/*  HERO  */}
      <section className="relative py-32 md:py-44 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-[8%] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#D4AF37]/25 to-transparent" />
          <div className="absolute right-[8%] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#D4AF37]/25 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#E8DDD0]/30 via-transparent to-transparent dark:from-transparent" />
        </div>
        <div className="container mx-auto px-6 lg:px-16 relative z-10">
          <div className="max-w-4xl">
            <FadeUp delay={0.1}>
            <div className="flex items-center gap-3 mb-10">
              <span className="block h-px w-12 bg-[#D4AF37]" />
              <span className="text-[#D4AF37] text-xs uppercase tracking-[0.3em] font-medium">
                Osogbo, Osun State
              </span>
            </div>
            <h1 className="text-[clamp(3rem,9vw,8rem)] font-bold leading-[0.9] tracking-tight mb-8">
              <span className="block">Get in</span>
              <span className="block text-[#D4AF37] italic font-normal">touch.</span>
            </h1>
            </FadeUp>
            <FadeUp delay={0.55}>
            <div className="h-px w-24 bg-[#D4AF37] mb-8" />
            <p className="text-[#5C524A] dark:text-gray-400 text-lg md:text-xl max-w-2xl leading-relaxed font-light">
              Expert tailoring and custom monogram designs. Reach out  every great garment starts with a single conversation.
            </p>
            </FadeUp>
          </div>
        </div>
      </section>

      {/*  CONTACT METHODS  */}
      <section className="border-y border-[#D4AF37]/25 dark:border-[#D4AF37]/15 bg-[#F3EDE6]/60 dark:bg-transparent">
        <div className="container mx-auto px-6 lg:px-16">
          <Stagger className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[#D4AF37]/25 dark:divide-[#D4AF37]/15">
            {contactMethods.map((m, i) => (
              <StaggerChild key={i}>
              <a
                href={m.href}
                target={m.href.startsWith('http') ? '_blank' : undefined}
                rel={m.href.startsWith('http') ? 'noreferrer' : undefined}
                className="group py-10 px-6 flex flex-col items-center text-center hover:bg-[#EDE7DC] dark:hover:bg-[#D4AF37]/5 transition-colors duration-300"
              >
                <div className="w-12 h-12 border border-[#D4AF37]/50 dark:border-[#D4AF37]/30 flex items-center justify-center mb-5 group-hover:border-[#D4AF37] transition-colors duration-300">
                  <m.icon className="h-5 w-5 text-[#D4AF37]" />
                </div>
                <div className="text-xs uppercase tracking-widest text-[#8C7B6E] dark:text-gray-500 mb-2">{m.title}</div>
                <div className="text-sm font-semibold text-[#1A1A1A] dark:text-white mb-1 break-all">{m.contact}</div>
                <div className="text-xs text-[#8C7B6E] dark:text-gray-600">{m.sublabel}</div>
              </a>
              </StaggerChild>
            ))}
          </Stagger>
        </div>
      </section>

      {/*  FORM + INFO  */}
      <section className="py-28 md:py-40">
        <div className="container mx-auto px-6 lg:px-16">
          <div className="grid lg:grid-cols-[1fr_420px] gap-16 lg:gap-24 items-start">

            {/* Left  Contact Form */}
            <SlideLeft>
              <div className="flex items-center gap-3 mb-8">
                <span className="block h-px w-12 bg-[#D4AF37]" />
                <span className="text-[#D4AF37] text-xs uppercase tracking-[0.3em]">Send a Message</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-12 leading-tight">
                Tell us what you <span className="text-[#D4AF37] italic font-normal">need.</span>
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className={labelClass}>Full Name *</label>
                    <input type="text" id="name" name="name" required value={formData.name} onChange={handleInputChange} className={inputClass} placeholder="Your full name" />
                  </div>
                  <div>
                    <label htmlFor="email" className={labelClass}>Email Address *</label>
                    <input type="email" id="email" name="email" required value={formData.email} onChange={handleInputChange} className={inputClass} placeholder="your@email.com" />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className={labelClass}>Subject *</label>
                  <select id="subject" name="subject" required value={formData.subject} onChange={handleInputChange} className={inputClass}>
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="order">Order Support</option>
                    <option value="custom">Custom Tailoring</option>
                    <option value="monogram">Monogram Design</option>
                    <option value="fitting">Book a Fitting</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className={labelClass}>Message *</label>
                  <textarea id="message" name="message" required rows={6} value={formData.message} onChange={handleInputChange} className={inputClass} placeholder="Describe how we can help you..." />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group inline-flex items-center gap-3 bg-[#D4AF37] text-black px-10 py-4 text-sm font-semibold uppercase tracking-widest hover:bg-[#F4E5C3] transition-colors duration-300 disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      Sending
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </SlideLeft>

            {/* Right  Location & Hours */}
            <SlideRight className="space-y-0 border border-[#D4AF37]/30 dark:border-[#D4AF37]/15 shadow-sm dark:shadow-none">
              {/* Address */}
              <div className="p-8 border-b border-[#D4AF37]/30 dark:border-[#D4AF37]/15 bg-white/40 dark:bg-transparent">
                <div className="w-10 h-10 border border-[#D4AF37]/50 flex items-center justify-center mb-5">
                  <MapPin className="h-4 w-4 text-[#D4AF37]" />
                </div>
                <h3 className="text-xs uppercase tracking-widest text-[#D4AF37] mb-3">Our Atelier</h3>
                <p className="text-sm text-[#5C524A] dark:text-gray-400 leading-relaxed mb-1 font-semibold text-[#1A1A1A] dark:text-white">
                  MaxyStyles  Osogbo
                </p>
                <p className="text-sm text-[#6B6057] dark:text-gray-500 leading-relaxed">
                  {contactInfo.address}
                </p>
              </div>

              {/* Hours */}
              <div className="p-8 border-b border-[#D4AF37]/30 dark:border-[#D4AF37]/15 bg-white/40 dark:bg-transparent">
                <div className="w-10 h-10 border border-[#D4AF37]/50 flex items-center justify-center mb-5">
                  <Clock className="h-4 w-4 text-[#D4AF37]" />
                </div>
                <h3 className="text-xs uppercase tracking-widest text-[#D4AF37] mb-3">Opening Hours</h3>
                <p className="text-sm font-semibold text-[#1A1A1A] dark:text-white mb-4">{contactInfo.openingHours}</p>
                <div className="flex items-center gap-2 text-sm text-[#5C524A] dark:text-gray-400">
                  <Headphones className="h-4 w-4 text-[#D4AF37]" />
                  <span>WhatsApp: <span className="font-semibold">{contactInfo.whatsapp}</span></span>
                </div>
              </div>

              {/* Quick WhatsApp CTA */}
              <div className="p-8 bg-[#EDE7DC] dark:bg-[#0D0D0D]">
                <p className="text-sm text-[#5C524A] dark:text-gray-400 mb-5 leading-relaxed">
                  Prefer a faster reply? Chat with us directly on WhatsApp  we typically respond within minutes.
                </p>
                <a
                  href={`https://wa.me/${contactInfo.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex items-center gap-3 border border-[#D4AF37]/60 dark:border-[#D4AF37]/40 text-[#D4AF37] px-6 py-3 text-xs font-semibold uppercase tracking-widest hover:border-[#D4AF37] hover:bg-[#D4AF37]/8 dark:hover:bg-[#D4AF37]/5 transition-all duration-300 w-full justify-center"
                >
                  <MessageCircle className="h-4 w-4" />
                  Open WhatsApp
                  <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </SlideRight>
          </div>
        </div>
      </section>

      {/*  FAQs  */}
      <section className="py-28 md:py-40 bg-[#EDE7DC] dark:bg-[#0D0D0D] border-y border-[#D4AF37]/25 dark:border-[#D4AF37]/10">
        <div className="container mx-auto px-6 lg:px-16">
          <div className="flex items-center gap-3 mb-6">
            <span className="block h-px w-12 bg-[#D4AF37]" />
            <span className="text-[#D4AF37] text-xs uppercase tracking-[0.3em]">FAQs</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-20 max-w-lg leading-tight">
            Common <span className="text-[#D4AF37] italic font-normal">questions</span>
          </h2>

          <div className="max-w-3xl">
            {faqs.map((faq, i) => (
              <div key={i} className="border-b border-[#D4AF37]/25 dark:border-[#D4AF37]/10 py-8">
                <div className="flex gap-8 items-start">
                  <span className="text-[#D4AF37]/40 dark:text-[#D4AF37]/20 font-bold text-3xl leading-none flex-shrink-0 pt-1">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="font-bold text-lg text-[#1A1A1A] dark:text-white mb-3">{faq.question}</h3>
                    <p className="text-[#5C524A] dark:text-gray-400 text-sm leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/*  BOTTOM CTA  */}
      <section className="bg-[#D4AF37] py-24 md:py-32">
        <div className="container mx-auto px-6 lg:px-16 text-center">
          <FadeUp>
          <div className="flex items-center gap-3 justify-center mb-8">
            <span className="block h-px w-12 bg-black/30" />
            <span className="text-black/60 text-xs uppercase tracking-[0.3em]">Ready to begin?</span>
            <span className="block h-px w-12 bg-black/30" />
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-black mb-6 leading-tight">
            Call us &mdash; or just <br />
            <span className="italic font-normal">walk in.</span>
          </h2>
          <p className="text-black/60 text-lg max-w-xl mx-auto mb-12">
            We welcome walk-ins at our Osogbo atelier. No appointment needed for a quick consultation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`tel:${contactInfo.phone1}`}
              className="group inline-flex items-center gap-3 bg-black text-[#D4AF37] px-10 py-4 text-sm font-semibold uppercase tracking-widest hover:bg-[#111] transition-colors duration-300"
            >
              <Phone className="h-4 w-4" />
              Call {contactInfo.phone1}
            </a>
            <a
              href={`https://wa.me/${contactInfo.whatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-3 border-2 border-black/30 text-black px-10 py-4 text-sm font-semibold uppercase tracking-widest hover:border-black transition-colors duration-300"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp Us
            </a>
          </div>
          </FadeUp>
        </div>
      </section>

    </div>
  );
}
