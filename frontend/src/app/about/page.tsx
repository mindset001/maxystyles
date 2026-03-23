import Link from 'next/link';
import { Heart, Users, Award, Globe, Scissors, ArrowRight, CheckCircle } from 'lucide-react';
import { FadeUp, SlideLeft, SlideRight, Stagger, StaggerChild, ScaleIn } from '@/components/animations';

const BACKEND = 'http://localhost:5000/api';

const values = [
  {
    icon: Heart,
    title: 'Craftsmanship First',
    description: 'We pour passion into every stitch, creating garments that reflect true artistry and uncompromising attention to detail.',
  },
  {
    icon: Users,
    title: 'Personal Touch',
    description: 'Every client receives personalized service — custom fittings, direct consultations, and tailoring built around you.',
  },
  {
    icon: Award,
    title: 'Master Skill',
    description: 'Our artisans bring years of experience in both traditional and contemporary tailoring, honed stitch by stitch.',
  },
  {
    icon: Globe,
    title: 'Cultural Pride',
    description: 'We celebrate both modern fashion and the rich heritage of African textile artistry — ankara, adire, and beyond.',
  },
];

const DEFAULT_ACHIEVEMENTS = [
  { number: '1,000+', label: 'Custom Garments' },
  { number: '500+',   label: 'Monogram Designs' },
  { number: '5+',     label: 'Years Excellence' },
  { number: '5 ★',   label: 'Client Satisfaction' },
];

const PILLARS = [
  'Bespoke measurements for every client',
  'In-house master tailors — no outsourcing',
  'Traditional and contemporary techniques',
  'Same-day WhatsApp consultation available',
  'Ankara, adire, lace & suiting fabrics',
  'Rush commissions accommodated',
];

async function getAboutContent() {
  const defaults = {
    title: 'About MaxyStyles',
    description: 'Located in the heart of Osogbo, Osun State, MaxyStyles specializes in expert tailoring and custom monogram designing. We create perfectly fitted garments that combine traditional craftsmanship with contemporary style.',
    motto: 'Anything but Styles',
    achievements: DEFAULT_ACHIEVEMENTS,
  };
  try {
    const res = await fetch(`${BACKEND}/content?section=about`, { cache: 'no-store' });
    const data = await res.json();
    const d = data?.data;
    if (!d) return defaults;
    return {
      title: d.title || defaults.title,
      description: d.content || defaults.description,
      motto: d.metadata?.motto || defaults.motto,
      achievements: (Array.isArray(d.metadata?.achievements) && d.metadata.achievements.length)
        ? d.metadata.achievements : defaults.achievements,
    };
  } catch {
    return defaults;
  }
}

export default async function AboutPage() {
  const { title, description, motto, achievements } = await getAboutContent();

  return (
    <div className="bg-[#FAF8F4] dark:bg-[#0A0A0A] text-[#1A1A1A] dark:text-white min-h-screen transition-colors duration-300">

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative py-32 md:py-44 overflow-hidden">
        {/* Decorative lines */}
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
                <span className="text-[#D4AF37] text-xs uppercase tracking-[0.3em] font-medium">Est. 2019 · Osogbo, Osun State</span>
              </div>
            </FadeUp>
            <FadeUp delay={0.3}>
              <h1 className="text-[clamp(3rem,9vw,8rem)] font-bold leading-[0.9] tracking-tight mb-8">
                <span className="block">Made with</span>
                <span className="block text-[#D4AF37] italic font-normal">intention.</span>
              </h1>
            </FadeUp>
            <FadeUp delay={0.55}>
              <div className="h-px w-24 bg-[#D4AF37] mb-8" />
              <p className="text-[#5C524A] dark:text-gray-400 text-lg md:text-xl max-w-2xl leading-relaxed font-light mb-12">
                {description}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/contact"
                  className="group inline-flex items-center gap-3 bg-[#D4AF37] text-black px-8 py-4 text-sm font-semibold uppercase tracking-widest hover:bg-[#F4E5C3] transition-colors duration-300"
                >
                  Visit Our Atelier
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/portfolio"
                  className="group inline-flex items-center gap-3 border border-[#D4AF37]/60 dark:border-[#D4AF37]/40 text-[#D4AF37] px-8 py-4 text-sm font-semibold uppercase tracking-widest hover:border-[#D4AF37] hover:bg-[#D4AF37]/8 dark:hover:bg-[#D4AF37]/5 transition-all duration-300"
                >
                  See Our Work
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── ACHIEVEMENTS STRIP ────────────────────────────────────────── */}
      <section className="border-y border-[#D4AF37]/25 dark:border-[#D4AF37]/15 bg-[#F3EDE6]/60 dark:bg-transparent">
        <div className="container mx-auto px-6 lg:px-16">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[#D4AF37]/25 dark:divide-[#D4AF37]/15">
            {achievements.map((a: { number: string; label: string }, i: number) => (
              <div key={i} className="py-10 px-6 text-center">
                <div className="text-3xl md:text-4xl font-bold text-[#D4AF37] mb-2">{a.number}</div>
                <div className="text-xs uppercase tracking-widest text-[#8C7B6E] dark:text-gray-500">{a.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STORY SPLIT ───────────────────────────────────────────────── */}
      <section className="py-28 md:py-40 bg-[#FAF8F4] dark:bg-[#0A0A0A]">
        <div className="container mx-auto px-6 lg:px-16">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-28 items-center">
            {/* Left — decorative panel */}
            <SlideLeft className="relative hidden lg:block">
              <div className="aspect-[4/5] bg-gradient-to-br from-[#EDE4D9] to-[#E0D5C8] dark:bg-[#111] dark:bg-none border border-[#D4AF37]/40 dark:border-[#D4AF37]/15 relative overflow-hidden shadow-md dark:shadow-none">
                <span className="absolute top-5 left-5 w-10 h-10 border-t-2 border-l-2 border-[#D4AF37]" />
                <span className="absolute top-5 right-5 w-10 h-10 border-t-2 border-r-2 border-[#D4AF37]" />
                <span className="absolute bottom-5 left-5 w-10 h-10 border-b-2 border-l-2 border-[#D4AF37]" />
                <span className="absolute bottom-5 right-5 w-10 h-10 border-b-2 border-r-2 border-[#D4AF37]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Scissors className="h-24 w-24 text-[#D4AF37] opacity-25 dark:opacity-15" />
                </div>
                <div className="absolute bottom-10 left-8 right-8">
                  <div className="h-px w-full bg-[#D4AF37]/40 mb-4" />
                  <p className="text-[#D4AF37] italic text-xl opacity-70">&ldquo;{motto}&rdquo;</p>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-36 h-36 border border-[#D4AF37]/20 -z-[1]" />
            </SlideLeft>

            {/* Right — text */}
            <SlideRight>
              <div className="flex items-center gap-3 mb-8">
                <span className="block h-px w-12 bg-[#D4AF37]" />
                <span className="text-[#D4AF37] text-xs uppercase tracking-[0.3em]">Our Story</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
                Born from a love of <br />
                <span className="text-[#D4AF37] italic font-normal">fabric & form</span>
              </h2>
              <p className="text-[#5C524A] dark:text-gray-400 leading-relaxed mb-5">
                MaxyStyles was founded in Osogbo with a single conviction: that every person deserves clothing made precisely for them. Not close enough — exactly right. From your first consultation to your final fitting, we obsess over the details so you don't have to.
              </p>
              <p className="text-[#5C524A] dark:text-gray-400 leading-relaxed mb-10">
                Over five years and more than a thousand garments later, that conviction hasn't changed. It's the reason clients return, and the reason every new commission is treated with the same care as the first.
              </p>

              {/* Pillars checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PILLARS.map((p) => (
                  <div key={p} className="flex items-start gap-2.5">
                    <CheckCircle className="h-4 w-4 text-[#D4AF37] mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-[#5C524A] dark:text-gray-400">{p}</span>
                  </div>
                ))}
              </div>
            </SlideRight>
          </div>
        </div>
      </section>

      {/* ── MISSION & VISION ──────────────────────────────────────────── */}
      <section className="py-28 md:py-40 bg-[#EDE7DC] dark:bg-[#0D0D0D] border-y border-[#D4AF37]/25 dark:border-[#D4AF37]/10">
        <div className="container mx-auto px-6 lg:px-16">
          <div className="flex items-center gap-3 mb-6">
            <span className="block h-px w-12 bg-[#D4AF37]" />
            <span className="text-[#D4AF37] text-xs uppercase tracking-[0.3em]">Purpose</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-20 max-w-lg leading-tight">
            What drives <span className="text-[#D4AF37] italic font-normal">every stitch</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-0 border border-[#D4AF37]/30 dark:border-[#D4AF37]/15 shadow-sm dark:shadow-none">
            <div className="p-12 md:p-16 border-r border-[#D4AF37]/30 dark:border-[#D4AF37]/15 bg-[#EDE7DC]/80 dark:bg-transparent">
              <div className="w-12 h-12 border border-[#D4AF37]/50 flex items-center justify-center mb-8">
                <Heart className="h-5 w-5 text-[#D4AF37]" />
              </div>
              <h3 className="text-xs uppercase tracking-[0.3em] text-[#D4AF37] mb-4">Mission</h3>
              <p className="text-2xl font-bold text-[#1A1A1A] dark:text-white leading-snug mb-4">
                Perfect fit for every body.
              </p>
              <p className="text-[#5C524A] dark:text-gray-400 leading-relaxed">
                To make impeccably tailored clothing accessible in Osogbo and beyond — where quality craftsmanship meets genuine personal service, every single time.
              </p>
            </div>
            <div className="p-12 md:p-16 bg-[#E5DDD3] dark:bg-transparent">
              <div className="w-12 h-12 border border-[#D4AF37]/50 flex items-center justify-center mb-8">
                <Globe className="h-5 w-5 text-[#D4AF37]" />
              </div>
              <h3 className="text-xs uppercase tracking-[0.3em] text-[#D4AF37] mb-4">Vision</h3>
              <p className="text-2xl font-bold text-[#1A1A1A] dark:text-white leading-snug mb-4">
                The most trusted atelier in Osun State.
              </p>
              <p className="text-[#5C524A] dark:text-gray-400 leading-relaxed">
                To be the name synonymous with bespoke tailoring excellence in Nigeria — celebrating culture, craftsmanship, and the joy of wearing something made just for you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── VALUES ────────────────────────────────────────────────────── */}
      <section className="py-28 md:py-40 bg-[#FAF8F4] dark:bg-[#0A0A0A]">
        <div className="container mx-auto px-6 lg:px-16">
          <div className="flex items-center gap-3 mb-6">
            <span className="block h-px w-12 bg-[#D4AF37]" />
            <span className="text-[#D4AF37] text-xs uppercase tracking-[0.3em]">Our Values</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-20 max-w-lg leading-tight">
            Principles that guide <span className="text-[#D4AF37] italic font-normal">every commission</span>
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-0 border border-[#D4AF37]/30 dark:border-[#D4AF37]/15 shadow-sm dark:shadow-none">
            {values.map((v, i) => (
              <div
                key={i}
                className="group p-10 border-r border-[#D4AF37]/30 dark:border-[#D4AF37]/15 last:border-r-0 hover:bg-[#F3EDE6] dark:hover:bg-[#D4AF37]/5 transition-colors duration-500 bg-white/40 dark:bg-transparent"
              >
                <div className="w-12 h-12 border border-[#D4AF37]/50 dark:border-[#D4AF37]/30 flex items-center justify-center mb-8 group-hover:border-[#D4AF37] transition-colors duration-300">
                  <v.icon className="h-5 w-5 text-[#D4AF37]" />
                </div>
                <h3 className="text-lg font-bold mb-3 text-[#1A1A1A] dark:text-white group-hover:text-[#D4AF37] transition-colors duration-300">
                  {v.title}
                </h3>
                <p className="text-[#6B6057] dark:text-gray-500 text-sm leading-relaxed">
                  {v.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────── */}
      <section className="bg-[#D4AF37] py-24 md:py-32">
        <div className="container mx-auto px-6 lg:px-16 text-center">
          <FadeUp>
          <div className="flex items-center gap-3 justify-center mb-8">
            <span className="block h-px w-12 bg-black/30" />
            <span className="text-black/60 text-xs uppercase tracking-[0.3em]">Begin Your Commission</span>
            <span className="block h-px w-12 bg-black/30" />
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-black mb-6 leading-tight">
            Ready for something <br />
            <span className="italic font-normal">made for you?</span>
          </h2>
          <p className="text-black/60 text-lg max-w-xl mx-auto mb-12">
            Reach out on WhatsApp or visit our Osogbo atelier. Every great garment starts with a single conversation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="group inline-flex items-center gap-3 bg-black text-[#D4AF37] px-10 py-4 text-sm font-semibold uppercase tracking-widest hover:bg-[#111] transition-colors duration-300"
            >
              Contact Us
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="https://wa.me/2348109612952"
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-3 border-2 border-black/30 text-black px-10 py-4 text-sm font-semibold uppercase tracking-widest hover:border-black transition-colors duration-300"
            >
              <Users className="h-4 w-4" />
              Chat on WhatsApp
            </Link>
          </div>
          </FadeUp>
        </div>
      </section>

    </div>
  );
}
