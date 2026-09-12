/**
 * HeroSection.jsx
 * ────────────────────────────────────────────────────────────
 * Full-viewport hero: nav bar + 6 scattered photo slots + centered logo block.
 *
 * Props
 *   isActive  boolean  — true once the splash screen has exited; starts all animations
 *   photos    array    — optional array of { src, alt } objects (up to 6). Falls back
 *                        to tan placeholder boxes when items are missing.
 *   labels    array    — optional array of 4 string labels for the pointing arrows.
 */
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import './HeroSection.css';

/* ─── Nav items ──────────────────────────────────────────── */
const NAV_ITEMS = [
  { id: 'story',     label: 'Story',               group: 'left' },
  { id: 'anatomy',   label: 'Anatomy',             group: 'left' },
  { id: 'hashtag',   label: '#TheTasteOfPuddin',   group: 'center', isHashtag: true },
  { id: 'flavors',   label: 'Flavors',             group: 'right' },
  { id: 'sweetspot', label: 'Sweet Spot',          group: 'right' },
];

/* ─── Photo slot definitions ─────────────────────────────── */
/*
  xPct is used only to sort slots left-to-right for the stagger.
  All positions are tuned for 16:9+ viewports; CSS handles scaling.
*/
const PHOTO_SLOTS = [
  {
    id: 'p-upper-left',
    xPct: 7,
    cls: 'hero__photo--upper-left',
    defaultAlt: 'Pudding photo 1',
    rotate: -7,
  },
  {
    id: 'p-upper-right',
    xPct: 59,
    cls: 'hero__photo--upper-right',
    defaultAlt: 'Pudding photo 2',
    rotate: 5,
  },
  {
    id: 'p-mid-left',
    xPct: 1,
    cls: 'hero__photo--mid-left',
    defaultAlt: 'Pudding photo 3',
    rotate: 3.5,
  },
  {
    id: 'p-mid-right',
    xPct: 97,
    cls: 'hero__photo--mid-right',
    defaultAlt: 'Pudding photo 4',
    rotate: -4,
  },
  {
    id: 'p-lower-left',
    xPct: 20,
    cls: 'hero__photo--lower-left',
    defaultAlt: 'Pudding photo 5',
    rotate: 6,
  },
  {
    id: 'p-lower-right',
    xPct: 57,
    cls: 'hero__photo--lower-right',
    defaultAlt: 'Pudding photo 6',
    rotate: -8.5,
  },
];

/* Sort slots by x-position so stagger reads left → right */
const SLOTS_BY_X = [...PHOTO_SLOTS].sort((a, b) => a.xPct - b.xPct);
const STAGGER_BASE   = 0.12;   /* seconds before first photo appears */
const STAGGER_STEP   = 0.10;   /* seconds between each photo */

/* ─── Framer Motion variants ─────────────────────────────── */
const navContainerV = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
};

const navItemV = {
  hidden:  { opacity: 0, scale: 0.78, y: -10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 280, damping: 22 },
  },
};

/* Photo: fade up with subtle spring, lands at its final rotation */
const photoV = (delay, finalRotate = 0) => ({
  hidden:  { opacity: 0, y: 28, scale: 0.94, rotate: finalRotate * 0.3 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotate: finalRotate,
    transition: { type: 'spring', stiffness: 200, damping: 24, delay },
  },
});

/* Center text: bouncy scale-up */
const textV = (delay) => ({
  hidden:  { opacity: 0, scale: 0.82, y: 14 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 260, damping: 18, delay },
  },
});

/* Doodles: draw path */
const doodleV = (delay) => ({
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut", delay }
  }
});

/* Labels: simple fade up */
const labelV = (delay) => ({
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 200, damping: 20, delay }
  }
});

/* ─── Component ──────────────────────────────────────────── */
export default function HeroSection({ 
  isActive = false, 
  photos = [],
  labels = ['Real ingredients', 'Small batches', 'Pure indulgence', 'Big flavor']
}) {
  /* Local ready flag — fires one frame after isActive becomes true
     so React has painted the component before we kick off animations. */
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isActive) return;
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, [isActive]);

  const animState = ready ? 'visible' : 'hidden';

  return (
    <section className="hero" id="hero" aria-label="Hero section">

      {/* ══ NAV ═════════════════════════════════════════════ */}
      <motion.nav
        className="hero__nav"
        variants={navContainerV}
        initial="hidden"
        animate={animState}
        aria-label="Main navigation"
      >
        {/* Left group */}
        <div className="hero__nav-group" role="list">
          {NAV_ITEMS.filter((n) => n.group === 'left').map((item) => (
            <motion.a
              key={item.id}
              id={`nav-${item.id}`}
              className="hero__nav-item"
              href={`#${item.id}`}
              variants={navItemV}
              role="listitem"
            >
              {item.label}
            </motion.a>
          ))}
        </div>

        {/* Center hashtag */}
        {NAV_ITEMS.filter((n) => n.group === 'center').map((item) => (
          <motion.a
            key={item.id}
            id={`nav-${item.id}`}
            className="hero__nav-hashtag"
            href={`#${item.id}`}
            variants={navItemV}
          >
            {item.label}
          </motion.a>
        ))}

        {/* Right group */}
        <div className="hero__nav-group" role="list">
          {NAV_ITEMS.filter((n) => n.group === 'right').map((item) => (
            <motion.a
              key={item.id}
              id={`nav-${item.id}`}
              className="hero__nav-item"
              href={`#${item.id}`}
              variants={navItemV}
              role="listitem"
            >
              {item.label}
            </motion.a>
          ))}
        </div>
      </motion.nav>

      {/* ══ CANVAS (photos + center text) ══════════════════ */}
      <div className="hero__canvas" aria-hidden={!isActive}>

        {/* ── Background Blobs ── */}
        <div className="hero__blob hero__blob--top-left" />
        <div className="hero__blob hero__blob--bottom-right" />

        {/* ── 6 Photo placeholders ─────────────────────── */}
        {SLOTS_BY_X.map((slot, i) => {
          const photoData = photos[PHOTO_SLOTS.indexOf(slot)] ?? null;
          const delay = STAGGER_BASE + i * STAGGER_STEP;

          return (
            <motion.div
              key={slot.id}
              id={slot.id}
              className={`hero__photo ${slot.cls}`}
              variants={photoV(delay, slot.rotate)}
              initial="hidden"
              animate={animState}
              aria-label={photoData?.alt ?? slot.defaultAlt}
            >
              {photoData?.src ? (
                <img
                  src={photoData.src}
                  alt={photoData.alt ?? slot.defaultAlt}
                  className="hero__photo-img"
                  loading="lazy"
                  draggable={false}
                />
              ) : (
                /* Placeholder shimmer */
                <div className="hero__photo-placeholder" aria-hidden="true">
                  <span className="hero__photo-placeholder-icon">🍮</span>
                </div>
              )}
            </motion.div>
          );
        })}

        {/* ── Doodles & Labels (Scatter Layer) ─────────────── */}
        
        {/* Top-Left Label -> "Real ingredients" */}
        <motion.div className="hero__label-block hero__label-block--upper-left" variants={labelV(STAGGER_BASE + 0 * STAGGER_STEP + 0.3)} initial="hidden" animate={animState}>
          <span className="hero__label-text">{labels[0]}</span>
          <svg className="hero__arrow hero__arrow--upper-left" viewBox="0 0 100 50">
            <motion.path d="M 10 40 Q 50 -10 90 20" className="hero__stroke hero__stroke--arrow" variants={doodleV(STAGGER_BASE + 0 * STAGGER_STEP + 0.4)} />
            <motion.path d="M 80 10 L 90 20 L 75 25" className="hero__stroke hero__stroke--arrow-head" variants={doodleV(STAGGER_BASE + 0 * STAGGER_STEP + 0.4)} />
          </svg>
        </motion.div>

        {/* Top-Right Label -> "Pure indulgence" */}
        <motion.div className="hero__label-block hero__label-block--upper-right" variants={labelV(STAGGER_BASE + 1 * STAGGER_STEP + 0.3)} initial="hidden" animate={animState}>
          <span className="hero__label-text">{labels[2]}</span>
          <svg className="hero__arrow hero__arrow--upper-right" viewBox="0 0 100 50">
            <motion.path d="M 90 10 Q 50 60 10 30" className="hero__stroke hero__stroke--arrow" variants={doodleV(STAGGER_BASE + 1 * STAGGER_STEP + 0.4)} />
            <motion.path d="M 20 40 L 10 30 L 25 25" className="hero__stroke hero__stroke--arrow-head" variants={doodleV(STAGGER_BASE + 1 * STAGGER_STEP + 0.4)} />
          </svg>
        </motion.div>

        {/* Mid-Left Label -> "Small batches" */}
        <motion.div className="hero__label-block hero__label-block--mid-left" variants={labelV(STAGGER_BASE + 2 * STAGGER_STEP + 0.3)} initial="hidden" animate={animState}>
          <span className="hero__label-text">{labels[1]}</span>
          <svg className="hero__arrow hero__arrow--mid-left" viewBox="0 0 100 50">
            <motion.path d="M 10 10 Q 50 60 90 30" className="hero__stroke hero__stroke--arrow" variants={doodleV(STAGGER_BASE + 2 * STAGGER_STEP + 0.4)} />
            <motion.path d="M 80 40 L 90 30 L 75 25" className="hero__stroke hero__stroke--arrow-head" variants={doodleV(STAGGER_BASE + 2 * STAGGER_STEP + 0.4)} />
          </svg>
        </motion.div>

        {/* Bottom-Right Label -> "Big flavor" */}
        <motion.div className="hero__label-block hero__label-block--lower-right" variants={labelV(STAGGER_BASE + 5 * STAGGER_STEP + 0.3)} initial="hidden" animate={animState}>
          <svg className="hero__arrow hero__arrow--lower-right" viewBox="0 0 100 50">
            <motion.path d="M 90 10 Q 50 60 10 30" className="hero__stroke hero__stroke--arrow" variants={doodleV(STAGGER_BASE + 5 * STAGGER_STEP + 0.4)} />
            <motion.path d="M 20 40 L 10 30 L 25 25" className="hero__stroke hero__stroke--arrow-head" variants={doodleV(STAGGER_BASE + 5 * STAGGER_STEP + 0.4)} />
          </svg>
          <span className="hero__label-text">{labels[3]}</span>
        </motion.div>

        {/* Decorative Sparkles & Hearts */}
        <svg className="hero__doodle hero__doodle--sparkle-1" viewBox="0 0 50 50">
          <motion.path d="M 25 5 L 25 15 M 25 35 L 25 45 M 5 25 L 15 25 M 35 25 L 45 25 M 10 10 L 18 18 M 32 32 L 40 40 M 10 40 L 18 32 M 32 18 L 40 10" className="hero__stroke hero__stroke--sparkle" variants={doodleV(0.8)} initial="hidden" animate={animState} />
        </svg>

        <svg className="hero__doodle hero__doodle--heart-1" viewBox="0 0 50 50">
          <motion.path d="M 25 38 C 25 38 10 25 10 15 C 10 8 16 5 20 5 C 23 5 25 8 25 10 C 25 8 27 5 30 5 C 34 5 40 8 40 15 C 40 25 25 38 25 38 Z" className="hero__stroke hero__stroke--heart" variants={doodleV(0.9)} initial="hidden" animate={animState} />
        </svg>
        
        <svg className="hero__doodle hero__doodle--heart-2" viewBox="0 0 50 50">
          <motion.path d="M 25 38 C 25 38 10 25 10 15 C 10 8 16 5 20 5 C 23 5 25 8 25 10 C 25 8 27 5 30 5 C 34 5 40 8 40 15 C 40 25 25 38 25 38 Z" className="hero__stroke hero__stroke--heart" variants={doodleV(0.95)} initial="hidden" animate={animState} />
        </svg>

        {/* ── Center text block ────────────────────────── */}
        <div className="hero__center" aria-label="Puddi'n — by NUGGETSINMYBAG">
          
          {/* Crown image */}
          <motion.img
            src="/crown.png"
            alt="Crown"
            className="hero__doodle-crown"
            variants={textV(0.6)}
            initial="hidden"
            animate={animState}
            draggable={false}
          />

          {/* Line 1: Logo */}
          <motion.h1
            className="hero__logo"
            variants={textV(0.38)}
            initial="hidden"
            animate={animState}
          >
            Puddi&rsquo;n
          </motion.h1>

          {/* Line 2: By-line */}
          <motion.p
            className="hero__byline"
            variants={textV(0.54)}
            initial="hidden"
            animate={animState}
          >
            by NUGGETSINMYBAG
          </motion.p>

          {/* Line 3: Tagline */}
          <motion.p
            className="hero__tagline"
            variants={textV(0.68)}
            initial="hidden"
            animate={animState}
          >
            Your craving called.&nbsp;We picked up.
          </motion.p>

          {/* Wavy Squiggle doodle */}
          <svg className="hero__doodle-squiggle" viewBox="0 0 150 20">
            <motion.path d="M 10 10 Q 25 0 40 10 T 70 10 T 100 10 T 130 10 T 140 10" className="hero__stroke hero__stroke--squiggle" variants={doodleV(0.75)} initial="hidden" animate={animState} />
          </svg>
        </div>

      </div>{/* /hero__canvas */}

    </section>
  );
}
