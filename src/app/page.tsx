'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

import type { Variants } from 'framer-motion';

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  },
};

const lineExpand: Variants = {
  hidden: { scaleX: 0, opacity: 0 },
  show: {
    scaleX: 1,
    opacity: 1,
    transition: {
      duration: 1.2,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  },
};

export default function LandingPage() {
  return (
    <div className="relative min-h-dvh flex flex-col items-center justify-center overflow-hidden">
      {/* Subtle warm radial gradient background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 40%, hsl(20 30% 12% / 0.6), transparent)',
        }}
      />

      {/* Main content */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 flex flex-col items-center px-6 text-center"
      >
        {/* Decorative line */}
        <motion.div
          variants={lineExpand}
          className="mb-10 h-px w-16 origin-center bg-gradient-to-r from-transparent via-muted-foreground/40 to-transparent"
        />

        {/* App name */}
        <motion.h1
          variants={fadeUp}
          className="font-serif text-5xl tracking-[0.25em] sm:text-6xl md:text-7xl"
        >
          OURS
        </motion.h1>

        {/* Headline */}
        <motion.p
          variants={fadeUp}
          className="mt-5 font-serif text-xl text-secondary-foreground/80 sm:text-2xl"
        >
          A place that&apos;s only ours.
        </motion.p>

        {/* Subheadline */}
        <motion.p
          variants={fadeUp}
          className="mt-3 max-w-xs text-sm text-muted-foreground sm:max-w-sm sm:text-base"
        >
          Talk, remember, grow, and build your story together.
        </motion.p>

        {/* CTA buttons */}
        <motion.div variants={fadeUp} className="mt-10 flex w-full max-w-xs flex-col gap-3">
          <Link href="/signup?intent=create">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex h-12 w-full items-center justify-center rounded-xl bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Create Our Space
            </motion.div>
          </Link>

          <Link href="/signup?intent=join">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex h-12 w-full items-center justify-center rounded-xl border border-border text-sm font-medium text-foreground transition-colors hover:bg-accent/10"
            >
              Join Your Partner
            </motion.div>
          </Link>
        </motion.div>

        {/* Decorative line below buttons */}
        <motion.div
          variants={lineExpand}
          className="mt-10 h-px w-10 origin-center bg-gradient-to-r from-transparent via-muted-foreground/25 to-transparent"
        />

        {/* Bottom text */}
        <motion.p
          variants={fadeUp}
          className="mt-6 text-xs tracking-wide text-muted-foreground/60"
        >
          Private. Just the two of you.
        </motion.p>
      </motion.div>
    </div>
  );
}
