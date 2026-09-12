/**
 * HeroSection.jsx
 * ────────────────────────────────────────────────────────────
 * Full-viewport hero: nav bar + 6 scattered photo slots + centered logo block.
 *
 * Props
 *   isActive  boolean  — true once the splash screen has exited; starts all animations
 *   photos    array    — optional array of { src, alt } objects (up to 6). Falls back
 *                        to tan placeholder boxes when items are missing.
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

/* ─── Component ──────────────────────────────────────────── */
export default function HeroSection({ isActive = false, photos = [] }) {
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

        {/* ── Center text block ────────────────────────── */}
        <div className="hero__center" aria-label="Puddi'n — by NUGGETSINMYBAG">
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
        </div>

      </div>{/* /hero__canvas */}

    </section>
  );
}
