/**
 * PanelTransition.jsx — clip-path reveal edition
 * ────────────────────────────────────────────────────────────
 * The panel content is ALWAYS rendered at full viewport size
 * in normal document flow. A clip-path: inset() mask reveals
 * it like a window opening from the center outward — the
 * content itself never scales, only the visible cut-out grows.
 *
 * clip-path: inset(P% P% P% P%)
 *   P = 50 → zero-size point at center (fully hidden)
 *   P = 0  → inset(0) → entire panel visible
 *
 * Scroll scrub: Framer Motion useScroll + useTransform.
 * Pin effect:   position:sticky on the inner frame (pure CSS).
 * Lenis:        reads window.scrollY; no extra wiring needed.
 */
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import './PanelTransition.css';

/* ─── Easing ─────────────────────────────────────────────── */
/* ease-out cubic — window bursts open fast, settles gently */
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

/* ─── Component ──────────────────────────────────────────── */
export default function PanelTransition({
  heading     = 'The Beginning',
  description = "From a small kitchen in the heart of the city, Puddi\u2019n was born out of a simple obsession: making the perfect pudding. Every batch is handcrafted fresh each morning, poured with care, and served with the kind of love that lingers long after the last spoonful.",
  year        = '2024',
  photoSrc    = null,
  photoAlt    = 'Brand photo',
}) {
  const sectionRef = useRef(null);

  /*
    offset: ['start start', 'end end']
    Section = 250vh  →  150vh of actual scroll travel
    progress 0 → panel fully hidden (inset 50%)
    progress 1 → panel fully revealed (inset 0%)
  */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  /* ── clip-path driven by scroll ─────────────────────────── */
  const clipPath = useTransform(scrollYProgress, (raw) => {
    /* Dead zone: keep fully hidden until user actually scrolls */
    if (raw < 0.005) return 'inset(50%)';
    /* Map eased progress to inset percentage: 50% → 0% */
    const pct = (1 - easeOutCubic(raw)) * 50;
    const v   = pct.toFixed(3);
    return `inset(${v}% ${v}% ${v}% ${v}%)`;
  });

  /* ── Overlay opacity: hidden at rest, fades in on scroll ── */
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.06], [0, 1]);

  return (
    <section
      ref={sectionRef}
      className="pt"
      id="panel-transition"
      aria-label="Brand story panel"
    >
      {/* ══ Sticky viewport frame (CSS pin) ════════════════ */}
      <div className="pt__sticky">

        {/* ── Panel — always full-size, revealed by clip-path ── */}
        <motion.div
          className="pt__panel"
          style={{ clipPath }}
          aria-hidden="true"
        >
          {/* Left half — caramel / brand story */}
          <div className="pt__left">
            <div className="pt__left-content">
              <h2 className="pt__heading">{heading}</h2>
              <p className="pt__description">{description}</p>
            </div>
            {/* Giant year bleeds off bottom-left */}
            <span className="pt__year" aria-hidden="true">{year}</span>
          </div>

          {/* Right half — photo or placeholder */}
          <div className="pt__right">
            {photoSrc ? (
              <img
                src={photoSrc}
                alt={photoAlt}
                className="pt__photo-img"
                draggable={false}
              />
            ) : (
              <div className="pt__photo-inner">
                <span className="pt__photo-icon" aria-hidden="true">🍮</span>
                <span className="pt__photo-label">Photo coming soon</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* ══ Persistent overlays — OUTSIDE the clipped panel ═══
            They are never masked, always render above everything.  */}


        <motion.div
          className="pt__overlay-tab"
          style={{ opacity: overlayOpacity }}
          aria-label="W. Honors"
        >
          <span className="pt__overlay-tab-w">W.</span>
          <span>Honors</span>
        </motion.div>

      </div>{/* /pt__sticky */}

      {/* Screen-reader accessible copy (unmasked) */}
      <div className="sr-only">
        <h2>{heading}</h2>
        <p>{description}</p>
        <p>Est. {year}</p>
      </div>
    </section>
  );
}
