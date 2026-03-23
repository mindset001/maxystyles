import Link from "next/link";
import { Scissors, ArrowRight, Award, Users, Palette, Quote } from "lucide-react";
import { FadeUp, SlideLeft, SlideRight, Stagger, StaggerChild, ScaleIn } from "@/components/animations";

// Server-side internal URL — no CORS needed
const BACKEND = 'http://localhost:5000/api';

async function getHomepageContent() {
  const defaults = {
    heroTitle: 'MaxyStyles',
    motto: 'Anything but Styles',
    heroSubtitle: 'Expert Tailoring & Monogram Design',
    description: 'Expert tailoring and bespoke monogram designing in Osogbo. We create exquisitely fitted garments that blend time-honored craftsmanship with contemporary elegance.',
    services: [
      { title: 'Custom Tailoring', description: 'Perfectly fitted garments crafted to your exact measurements and vision.' },
      { title: 'Monogram Design', description: 'Personalized embroidery and monogram artwork that makes every piece uniquely yours.' },
      { title: 'Expert Craftsmanship', description: 'Years of experience in traditional and contemporary tailoring techniques.' },
    ],
  };
  try {
    const res = await fetch(`${BACKEND}/content?section=homepage`, { cache: 'no-store' });
    const data = await res.json();
    const m = data?.data?.metadata;
    if (!m) return defaults;
    return {
      heroTitle: m.heroTitle || defaults.heroTitle,
      motto: m.motto || defaults.motto,
      heroSubtitle: m.heroSubtitle || defaults.heroSubtitle,
      description: m.description || defaults.description,
      services: (Array.isArray(m.services) && m.services.length) ? m.services : defaults.services,
    };
  } catch {
    return defaults;
  }
}

const SERVICE_ICONS = [Scissors, Palette, Award];

async function getTestimonials() {
  try {
    const res = await fetch(`${BACKEND}/admin/testimonials/all`, { cache: 'no-store' });
    const data = await res.json();
    const all: any[] = data.data ?? data ?? [];
    return all.filter((t: any) => t.isPublished);
  } catch {
    return [];
  }
}

const PROCESS_STEPS = [
  { num: '01', title: 'Consultation', body: 'We discuss your vision, style preferences, occasion, and take precise measurements in person or via WhatsApp.' },
  { num: '02', title: 'Design', body: 'Our designers draft patterns and material selections, presenting samples for your approval before cutting begins.' },
  { num: '03', title: 'Crafting', body: 'Every seam is stitched by hand with meticulous attention to structure, drape, and finishing details.' },
  { num: '04', title: 'Delivery', body: 'A final fitting ensures perfect comfort. Your garment is pressed, wrapped, and delivered to you.' },
];

const STATS = [
  { value: '1,000+', label: 'Garments Crafted' },
  { value: '500+', label: 'Monogram Designs' },
  { value: '5+', label: 'Years of Excellence' },
  { value: '5 ★', label: 'Client Satisfaction' },
];

export default async function Home() {
  const [content, testimonials] = await Promise.all([
    getHomepageContent(),
    getTestimonials(),
  ]);

  return (
    <div className="bg-[#FAF8F4] dark:bg-[#0A0A0A] text-[#1A1A1A] dark:text-white min-h-screen overflow-x-hidden transition-colors duration-300">

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col justify-center">
        {/* Decorative vertical lines */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
          <div className="absolute left-[10%] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#D4AF37]/30 to-transparent" />
          <div className="absolute right-[10%] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#D4AF37]/30 to-transparent" />
          {/* Light mode: subtle warm gradient wash */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#E8DDD0]/40 via-transparent to-[#F5EDE0]/30 dark:from-transparent dark:to-transparent" />
          {/* Gold radial glow — stronger in light */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-[#D4AF37]/8 dark:bg-[#D4AF37]/5 blur-3xl" />
        </div>

        <div className="container mx-auto px-6 lg:px-16 relative z-10">
          <div className="max-w-5xl">
            {/* Eyebrow */}
            <FadeUp delay={0.1}>
              <div className="flex items-center gap-3 mb-10">
                <span className="block h-px w-12 bg-[#D4AF37]" />
                <span className="text-[#D4AF37] text-xs uppercase tracking-[0.3em] font-medium">
                  Osogbo, Osun State — Est. 2019
                </span>
              </div>
            </FadeUp>

            {/* Main heading */}
            <FadeUp delay={0.3}>
              <h1 className="text-[clamp(4rem,12vw,11rem)] font-bold leading-[0.9] tracking-tight mb-8">
                <span className="block text-[#1A1A1A] dark:text-white">{content.heroTitle}</span>
                <span className="block text-[#D4AF37] italic font-normal text-[clamp(2rem,5vw,5rem)] mt-4 leading-tight">
                  {content.motto}
                </span>
              </h1>
            </FadeUp>

            {/* Divider + Description + CTAs */}
            <FadeUp delay={0.55}>
              {/* Divider */}
              <div className="h-px w-24 bg-[#D4AF37] mb-8" />

              {/* Description */}
              <p className="text-gray-600 dark:text-gray-400 text-lg md:text-xl max-w-2xl leading-relaxed mb-12 font-light">
                {content.description}
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4">
              <Link
                href="/contact"
                className="group inline-flex items-center gap-3 bg-[#D4AF37] text-black px-8 py-4 text-sm font-semibold uppercase tracking-widest hover:bg-[#F4E5C3] transition-colors duration-300"
              >
                Book a Consultation
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/portfolio"
                className="group inline-flex items-center gap-3 border border-[#D4AF37]/60 dark:border-[#D4AF37]/40 text-[#D4AF37] px-8 py-4 text-sm font-semibold uppercase tracking-widest hover:border-[#D4AF37] hover:bg-[#D4AF37]/8 dark:hover:bg-[#D4AF37]/5 transition-all duration-300"
              >
                View Our Work
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            </FadeUp>
          </div>
        </div>

        {/* Bottom scroll hint */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30 dark:opacity-40">
          <span className="text-xs uppercase tracking-[0.3em] text-[#8C7B6E] dark:text-gray-500">Scroll</span>
          <div className="h-12 w-px bg-gradient-to-b from-[#8C7B6E] dark:from-gray-500 to-transparent" />
        </div>
      </section>

      {/* ── STATS STRIP ───────────────────────────────────────────────── */}
      <section className="border-y border-[#D4AF37]/25 dark:border-[#D4AF37]/15 bg-[#F3EDE6]/60 dark:bg-transparent">
        <div className="container mx-auto px-6 lg:px-16">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[#D4AF37]/25 dark:divide-[#D4AF37]/15">
            {STATS.map((stat) => (
              <div key={stat.label} className="py-10 px-6 text-center">
                <div className="text-3xl md:text-4xl font-bold text-[#D4AF37] mb-2">{stat.value}</div>
                <div className="text-xs uppercase tracking-widest text-[#8C7B6E] dark:text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT SPLIT ───────────────────────────────────────────────── */}
      <section className="py-28 md:py-40 bg-[#FAF8F4] dark:bg-[#0A0A0A]">
        <div className="container mx-auto px-6 lg:px-16">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            {/* Left — text */}
            <SlideLeft>
              <div className="flex items-center gap-3 mb-8">
                <span className="block h-px w-12 bg-[#D4AF37]" />
                <span className="text-[#D4AF37] text-xs uppercase tracking-[0.3em]">Our Story</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
                Where thread meets <br />
                <span className="text-[#D4AF37] italic font-normal">tradition</span>
              </h2>
              <p className="text-[#5C524A] dark:text-gray-400 leading-relaxed mb-6">
                Born in the heart of Osogbo, MaxyStyles is a boutique tailoring atelier dedicated to the art of the perfectly fitted garment. Every piece we create carries the mark of patience, skill, and a deep respect for fabric.
              </p>
              <p className="text-[#5C524A] dark:text-gray-400 leading-relaxed mb-10">
                From flowing ankara to precision-cut suiting — our master tailors bring both heritage techniques and modern sensibility to every commission.
              </p>
              <Link
                href="/about"
                className="group inline-flex items-center gap-3 text-[#D4AF37] text-sm uppercase tracking-widest font-medium hover:gap-5 transition-all duration-300"
              >
                Our full story
                <ArrowRight className="h-4 w-4" />
              </Link>
            </SlideLeft>

            {/* Right — decorative panel */}
            <SlideRight className="relative hidden lg:block">
              <div className="aspect-[4/5] bg-gradient-to-br from-[#EDE4D9] to-[#E0D5C8] dark:bg-[#111] dark:bg-none border border-[#D4AF37]/40 dark:border-[#D4AF37]/15 relative overflow-hidden shadow-[inset_0_1px_0_0_rgba(212,175,55,0.2)] dark:shadow-none">
                {/* Corner accents */}
                <span className="absolute top-4 left-4 w-8 h-8 border-t border-l border-[#D4AF37]/60" />
                <span className="absolute top-4 right-4 w-8 h-8 border-t border-r border-[#D4AF37]/60" />
                <span className="absolute bottom-4 left-4 w-8 h-8 border-b border-l border-[#D4AF37]/60" />
                <span className="absolute bottom-4 right-4 w-8 h-8 border-b border-r border-[#D4AF37]/60" />
                {/* Inner content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 opacity-30 dark:opacity-20">
                  <Scissors className="h-20 w-20 text-[#D4AF37]" />
                </div>
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="h-px w-full bg-[#D4AF37]/30 mb-4" />
                  <p className="text-[#D4AF37] italic text-lg opacity-60">&ldquo;{content.motto}&rdquo;</p>
                </div>
              </div>
              {/* Offset accent box */}
              <div className="absolute -bottom-6 -right-6 w-32 h-32 border border-[#D4AF37]/20 -z-[1]" />
            </SlideRight>
          </div>
        </div>
      </section>

      {/* ── SERVICES ──────────────────────────────────────────────────── */}
      <section className="py-28 md:py-40 border-t border-[#D4AF37]/20 dark:border-[#D4AF37]/10 bg-[#FAF8F4] dark:bg-[#0A0A0A]">
        <div className="container mx-auto px-6 lg:px-16">
          <div className="flex items-center gap-3 mb-6">
            <span className="block h-px w-12 bg-[#D4AF37]" />
            <span className="text-[#D4AF37] text-xs uppercase tracking-[0.3em]">What We Do</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-20 max-w-lg leading-tight">
            Crafted for you, <span className="text-[#D4AF37] italic font-normal">only</span>
          </h2>

          <Stagger className="grid md:grid-cols-3 gap-0 border border-[#D4AF37]/30 dark:border-[#D4AF37]/15 shadow-sm dark:shadow-none">
            {content.services.map((service: { title: string; description: string }, i: number) => {
              const Icon = SERVICE_ICONS[i % SERVICE_ICONS.length];
              return (
                <StaggerChild
                  key={i}
                  className="group p-10 border-r border-[#D4AF37]/30 dark:border-[#D4AF37]/15 last:border-r-0 hover:bg-[#F3EDE6] dark:hover:bg-[#D4AF37]/5 transition-colors duration-500 bg-white/40 dark:bg-transparent"
                >
                  <div className="flex items-start justify-between mb-8">
                    <div className="w-12 h-12 border border-[#D4AF37]/50 dark:border-[#D4AF37]/30 flex items-center justify-center group-hover:border-[#D4AF37] group-hover:bg-[#D4AF37]/8 dark:group-hover:bg-transparent transition-all duration-500">
                      <Icon className="h-5 w-5 text-[#D4AF37]" />
                    </div>
                    <span className="text-[#D4AF37]/25 dark:text-[#D4AF37]/20 font-bold text-4xl leading-none group-hover:text-[#D4AF37]/50 dark:group-hover:text-[#D4AF37]/40 transition-colors duration-500">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-[#1A1A1A] dark:text-white group-hover:text-[#D4AF37] transition-colors duration-300">
                    {service.title}
                  </h3>
                  <p className="text-[#6B6057] dark:text-gray-500 text-sm leading-relaxed group-hover:text-[#4A3F38] dark:group-hover:text-gray-400 transition-colors duration-300">
                    {service.description}
                  </p>
                </StaggerChild>
              );
            })}
          </Stagger>
        </div>
      </section>

      {/* ── PROCESS ───────────────────────────────────────────────────── */}
      <section className="py-28 md:py-40 bg-[#EDE7DC] dark:bg-[#0D0D0D] border-y border-[#D4AF37]/25 dark:border-[#D4AF37]/10">
        <div className="container mx-auto px-6 lg:px-16">
          <div className="flex items-center gap-3 mb-6">
            <span className="block h-px w-12 bg-[#D4AF37]" />
            <span className="text-[#D4AF37] text-xs uppercase tracking-[0.3em]">How It Works</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-20 max-w-lg leading-tight">
            Your journey <span className="text-[#D4AF37] italic font-normal">from idea to garment</span>
          </h2>

          <Stagger className="grid sm:grid-cols-2 lg:grid-cols-4 gap-0 border border-[#D4AF37]/30 dark:border-[#D4AF37]/15 shadow-sm dark:shadow-none">
            {PROCESS_STEPS.map((step, i) => (
              <StaggerChild key={step.num} className="p-8 border-r border-b sm:border-b-0 border-[#D4AF37]/30 dark:border-[#D4AF37]/15 last:border-r-0 relative overflow-hidden group hover:bg-[#E5DDD3] dark:hover:bg-[#D4AF37]/3 bg-[#EDE7DC]/80 dark:bg-transparent transition-colors duration-500">
                {/* Big bg number */}
                <span className="absolute -top-4 -right-2 text-8xl font-black text-[#D4AF37]/10 dark:text-[#D4AF37]/5 select-none group-hover:text-[#D4AF37]/20 dark:group-hover:text-[#D4AF37]/10 transition-colors duration-500">
                  {step.num}
                </span>
                <div className="text-[#D4AF37] text-xs uppercase tracking-[0.3em] mb-4">{step.num}</div>
                <h3 className="text-lg font-bold mb-3 text-[#1A1A1A] dark:text-white">{step.title}</h3>
                <p className="text-[#6B6057] dark:text-gray-500 text-sm leading-relaxed">{step.body}</p>
                {i < PROCESS_STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 z-10">
                    <ArrowRight className="h-5 w-5 text-[#D4AF37]/40" />
                  </div>
                )}
              </StaggerChild>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ── GALLERY CTA ───────────────────────────────────────────────── */}
      <section className="py-28 md:py-40 bg-[#FAF8F4] dark:bg-[#0A0A0A]">
        <div className="container mx-auto px-6 lg:px-16">
          <ScaleIn>
          <div className="relative border border-[#D4AF37]/40 dark:border-[#D4AF37]/20 p-12 md:p-20 overflow-hidden shadow-md dark:shadow-none">
            {/* Corner accents */}
            <span className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-[#D4AF37]" />
            <span className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-[#D4AF37]" />
            <span className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-[#D4AF37]" />
            <span className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-[#D4AF37]" />

            {/* Light: warm tinted background wash, Dark: gold tint */}
            <div className="absolute inset-0 bg-[#F3EDE6]/80 dark:bg-[#D4AF37]/3 pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
              <div className="max-w-xl text-center lg:text-left">
                <div className="flex items-center gap-3 mb-6 justify-center lg:justify-start">
                  <span className="block h-px w-12 bg-[#D4AF37]" />
                  <span className="text-[#D4AF37] text-xs uppercase tracking-[0.3em]">Our Portfolio</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                  See the work that <br />
                  <span className="text-[#D4AF37] italic font-normal">speaks for itself</span>
                </h2>
                <p className="text-[#5C524A] dark:text-gray-400 leading-relaxed">
                  Browse our full gallery of custom garments, monogram designs, and tailoring commissions — each one a one-of-a-kind creation.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/gallery"
                  className="group inline-flex items-center gap-3 bg-[#D4AF37] text-black px-8 py-4 text-sm font-semibold uppercase tracking-widest hover:bg-[#F4E5C3] transition-colors duration-300 whitespace-nowrap"
                >
                  Browse Gallery
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/portfolio"
                  className="group inline-flex items-center gap-3 border border-[#D4AF37]/40 text-[#D4AF37] px-8 py-4 text-sm font-semibold uppercase tracking-widest hover:border-[#D4AF37] transition-all duration-300 whitespace-nowrap"
                >
                  View Portfolio
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
          </ScaleIn>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────── */}
      {testimonials.length > 0 && (
        <section className="py-28 md:py-40 bg-[#EDE7DC] dark:bg-[#0D0D0D] border-y border-[#D4AF37]/25 dark:border-[#D4AF37]/10">
          <div className="container mx-auto px-6 lg:px-16">
            <div className="flex items-center gap-3 mb-6">
              <span className="block h-px w-12 bg-[#D4AF37]" />
              <span className="text-[#D4AF37] text-xs uppercase tracking-[0.3em]">Client Stories</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-20 max-w-lg leading-tight">
              Words from those who{' '}
              <span className="text-[#D4AF37] italic font-normal">wear our work</span>
            </h2>

            <Stagger className="grid sm:grid-cols-2 lg:grid-cols-3 gap-0 border border-[#D4AF37]/30 dark:border-[#D4AF37]/15 shadow-sm dark:shadow-none">
              {testimonials.slice(0, 6).map((t: any, i: number) => (
                <StaggerChild
                  key={t._id}
                  className="group p-8 md:p-10 border-r border-b border-[#D4AF37]/25 dark:border-[#D4AF37]/10 last:border-r-0 [&:nth-child(3)]:border-r-0 [&:nth-child(3)~*]:border-b-0 hover:bg-[#E5DDD3] dark:hover:bg-[#D4AF37]/3 bg-[#EDE7DC]/80 dark:bg-transparent transition-colors duration-500"
                >
                  <Quote className="h-7 w-7 text-[#D4AF37]/40 mb-6" />
                  <p className="text-[#3A3028] dark:text-gray-300 leading-relaxed mb-8 text-sm italic">
                    &ldquo;{t.testimonialText}&rdquo;
                  </p>
                  <div className="border-t border-[#D4AF37]/20 dark:border-[#D4AF37]/10 pt-6">
                    <div className="font-bold text-[#1A1A1A] dark:text-white text-sm">{t.customerName}</div>
                    {t.rating && (
                      <div className="flex gap-0.5 mt-2">
                        {Array.from({ length: 5 }).map((_, s) => (
                          <span
                            key={s}
                            className={s < t.rating ? 'text-[#D4AF37]' : 'text-[#D4AF37]/20'}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </StaggerChild>
              ))}
            </Stagger>

            {testimonials.length > 6 && (
              <div className="mt-12 text-center">
                <Link
                  href="/portfolio"
                  className="group inline-flex items-center gap-3 border border-[#D4AF37]/50 text-[#D4AF37] px-8 py-3 text-xs font-semibold uppercase tracking-widest hover:border-[#D4AF37] hover:bg-[#D4AF37]/5 transition-all duration-300"
                >
                  Read more stories
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── FINAL CTA ─────────────────────────────────────────────────── */}
      <section className="bg-[#D4AF37] py-24 md:py-32">
        <div className="container mx-auto px-6 lg:px-16 text-center">
          <FadeUp>
          <div className="flex items-center gap-3 justify-center mb-8">
            <span className="block h-px w-12 bg-black/30" />
            <span className="text-black/60 text-xs uppercase tracking-[0.3em]">Ready to Begin?</span>
            <span className="block h-px w-12 bg-black/30" />
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-black mb-6 leading-tight">
            Let&rsquo;s create something <br />
            <span className="italic font-normal">extraordinary together</span>
          </h2>
          <p className="text-black/60 text-lg max-w-xl mx-auto mb-12">
            Contact us on WhatsApp or visit our Osogbo atelier to start your commission. Every great garment begins with a conversation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="group inline-flex items-center gap-3 bg-black text-[#D4AF37] px-10 py-4 text-sm font-semibold uppercase tracking-widest hover:bg-[#111] transition-colors duration-300"
            >
              Book a Consultation
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
