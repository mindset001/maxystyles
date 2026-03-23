'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, ReactNode } from 'react';

// ── Easing ─────────────────────────────────────────────────────────────────────
const ease = [0.25, 0.46, 0.45, 0.94] as const;

// ── Base variants ──────────────────────────────────────────────────────────────
const variants = {
  fadeUp: {
    hidden: { opacity: 0, y: 36 },
    visible: (delay = 0) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.85, ease, delay },
    }),
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: (delay = 0) => ({
      opacity: 1,
      transition: { duration: 0.75, ease: 'easeOut', delay },
    }),
  },
  slideLeft: {
    hidden: { opacity: 0, x: -50 },
    visible: (delay = 0) => ({
      opacity: 1,
      x: 0,
      transition: { duration: 0.9, ease, delay },
    }),
  },
  slideRight: {
    hidden: { opacity: 0, x: 50 },
    visible: (delay = 0) => ({
      opacity: 1,
      x: 0,
      transition: { duration: 0.9, ease, delay },
    }),
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.9 },
    visible: (delay = 0) => ({
      opacity: 1,
      scale: 1,
      transition: { duration: 0.75, ease, delay },
    }),
  },
  drawLine: {
    hidden: { scaleX: 0, originX: 0 },
    visible: (delay = 0) => ({
      scaleX: 1,
      transition: { duration: 0.7, ease, delay },
    }),
  },
};

// ── Stagger container / item (used together) ───────────────────────────────────
export const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.13,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease },
  },
};

// ── Prop types ────────────────────────────────────────────────────────────────
interface AnimProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Element type to render, defaults to 'div' */
  as?: keyof typeof motion;
}

// ── Viewport config shared across all components ───────────────────────────────
const vp = { once: true, margin: '-80px' } as const;

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

/** Fade + slide up on scroll. Most versatile. */
export function FadeUp({ children, className, delay = 0 }: AnimProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={vp}
      variants={variants.fadeUp}
      custom={delay}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Pure fade in — good for overlays, images, backgrounds */
export function FadeIn({ children, className, delay = 0 }: AnimProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={vp}
      variants={variants.fadeIn}
      custom={delay}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Slide in from the left. Good for the 'text' side of split layouts. */
export function SlideLeft({ children, className, delay = 0 }: AnimProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={vp}
      variants={variants.slideLeft}
      custom={delay}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Slide in from the right. Good for the 'image' side of split layouts. */
export function SlideRight({ children, className, delay = 0 }: AnimProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={vp}
      variants={variants.slideRight}
      custom={delay}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Scale + fade in — great for cards and hero boxes. */
export function ScaleIn({ children, className, delay = 0 }: AnimProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={vp}
      variants={variants.scaleIn}
      custom={delay}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Gold line that draws from left to right. */
export function GoldLine({ className, delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.span
      initial="hidden"
      whileInView="visible"
      viewport={vp}
      variants={variants.drawLine}
      custom={delay}
      className={`block h-px w-12 bg-[#D4AF37] ${className ?? ''}`}
    />
  );
}

/**
 * Stagger wrapper — wrap a grid/list with this and add StaggerChild to each
 * child. Triggers when the container scrolls into view.
 */
export function Stagger({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={vp}
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: 0.13, delayChildren: delay },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Child item for use inside <Stagger> */
export function StaggerChild({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={staggerItem} className={className}>
      {children}
    </motion.div>
  );
}

/**
 * Animated counter — counts from 0 to the target number when in view.
 * For display purposes the number is rendered as text with optional prefix/suffix.
 */
export function AnimatedNumber({
  value,
  suffix = '',
  prefix = '',
  className,
}: {
  value: string;
  suffix?: string;
  prefix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  // Extract numeric part
  const numericMatch = value.match(/[\d,.]+/);
  const numericPart = numericMatch ? numericMatch[0] : value;
  const nonNumeric = value.replace(numericPart, '');

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease }}
    >
      {prefix}{value}{nonNumeric}{suffix}
    </motion.span>
  );
}

/**
 * Hero text line — slides up with a clip mask for a luxury reveal effect.
 */
export function HeroLine({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <span className="block overflow-hidden">
      <motion.span
        className={`block ${className ?? ''}`}
        initial={{ y: '110%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease, delay }}
      >
        {children}
      </motion.span>
    </span>
  );
}

/**
 * Page entrance — wraps the whole page and plays a short fade+shift on mount.
 */
export function PageEntrance({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
