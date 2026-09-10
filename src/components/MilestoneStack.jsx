/**
 * MilestoneStack.jsx
 * ────────────────────────────────────────────────────────────
 * A pinned scroll-scrubbed section containing a deck of MilestoneCards.
 * As the user scrolls, Card 1 twists to the back and Card 2 twists to the front.
 */
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import MilestoneCard from './MilestoneCard';
import './MilestoneStack.css';

export default function MilestoneStack() {
  const sectionRef = useRef(null);

  /*
    offset: ['start start', 'end end']
    Section = 200vh  →  100vh of actual scroll travel for the swap
  */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  /* ── Card 1: "2011" (Twists away to the back) ──────────────── */
  // Starts full size with a subtle left tilt (-4deg).
  // Shrinks to 90%, twists sharply right (12deg), fades slightly.
  const card1Scale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
  const card1Rotate = useTransform(scrollYProgress, [0, 1], [-4, 12]);
  const card1Opacity = useTransform(scrollYProgress, [0, 1], [1, 0.3]);
  const card1Y = useTransform(scrollYProgress, [0, 1], ['-50%', '-50%']);
  const card1X = useTransform(scrollYProgress, [0, 1], ['-50%', '-50%']);

  /* ── Card 2: "2018" (Twists into the front) ────────────────── */
  // Starts scaled down and hidden with a right tilt (10deg).
  // Scales up to 100%, twists left (-8deg), fades in.
  const card2Scale = useTransform(scrollYProgress, [0, 1], [0.85, 1]);
  const card2Rotate = useTransform(scrollYProgress, [0, 1], [10, -8]);
  // Fade in faster at the beginning so we see the twist
  const card2Opacity = useTransform(scrollYProgress, [0, 0.3, 1], [0, 0.8, 1]);
  // Slight upward motion as it comes to the front
  const card2Y = useTransform(scrollYProgress, [0, 1], ['-40%', '-50%']);
  const card2X = useTransform(scrollYProgress, [0, 1], ['-50%', '-50%']);

  return (
    <section
      ref={sectionRef}
      className="stack"
      id="milestone-stack"
      aria-label="Brand Milestones"
    >
      {/* ══ Sticky viewport frame (CSS pin) ════════════════ */}
      <div className="stack__sticky">

        {/* ── Card 1: 2011 ── */}
        <motion.div
          className="stack__card-wrapper"
          style={{
            scale: card1Scale,
            rotate: card1Rotate,
            opacity: card1Opacity,
            x: card1X,
            y: card1Y,
            zIndex: 1, // behind card 2
          }}
        >
          <MilestoneCard 
            heading="Global Recognition"
            description="Our humble pudding began turning heads outside the neighborhood. Word of mouth spread faster than we could stir, and soon we were shipping our signature batches across the country. We never changed the recipe, just bought bigger pots."
            year="2011"
            imagePosition="right"
          />
        </motion.div>

        {/* ── Card 2: 2018 ── */}
        <motion.div
          className="stack__card-wrapper"
          style={{
            scale: card2Scale,
            rotate: card2Rotate,
            opacity: card2Opacity,
            x: card2X,
            y: card2Y,
            zIndex: 2, // in front
          }}
        >
          <MilestoneCard 
            heading="A New Chapter"
            description="With the opening of our flagship store downtown, Puddi'n evolved from a well-kept secret to a daily ritual for thousands. We added new flavors, built a passionate team, and created a space where every cup feels like coming home."
            year="2018"
            imagePosition="left" /* mirrored layout */
          />
        </motion.div>

        {/* ══ Persistent overlays (Static UI chrome) ═══════ */}
        <div className="stack__overlay-menu" aria-hidden="true">
          Menu
        </div>

        <div className="stack__overlay-tab" aria-label="W. Honors">
          <span className="stack__overlay-tab-w">W.</span>
          <span>Honors</span>
        </div>

      </div>
    </section>
  );
}
