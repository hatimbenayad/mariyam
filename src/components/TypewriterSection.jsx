import { useRef } from 'react';
import { motion, useInView, useTransform } from 'framer-motion';
import TypewriterText from './TypewriterText';
import './TypewriterSection.css';

export default function TypewriterSection({
  headline = "Discover the sweet balance of flavor and texture that made the world fall in love",
  photoSrc = null,
  photoAlt = "Puddi'n signature dessert",
  sharedProgress = null,
}) {
  const sectionRef = useRef(null);

  // Trigger animation once when the section is 40% into the viewport
  const isInView = useInView(sectionRef, {
    once: true,
    margin: "-40% 0px",
  });

  // If sharedProgress is provided, shrink the photo as the user scrolls
  const shrinkScale = useTransform(sharedProgress || [0], [0.1, 1], [1, 0.4]);
  const shrinkOpacity = useTransform(sharedProgress || [0], [0.1, 1], [1, 0]);

  // Split headline into characters for the typewriter effect to calculate delay
  const characters = Array.from(headline);

  // Sticker photo animation (spring up and fade in)
  // Delay is calculated to start slightly before the text finishes typing
  // Total text time roughly = characters.length * 0.008
  const typingDuration = characters.length * 0.008;
  const photoDelay = Math.max(0, typingDuration - 0.2);

  const photoVariants = {
    hidden: { opacity: 0, scale: 0.5, y: 50 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        delay: photoDelay,
        type: "spring",
        stiffness: 150,
        damping: 12,
      },
    },
  };

  // Accents pop animation
  const accentVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        delay: photoDelay + 0.3, // Pop shortly after photo appears
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  return (
    <section 
      className="typewriter-section" 
      ref={sectionRef}
      aria-label="Brand statement"
    >
      {/* ── Persistent overlays ── */}
      <div className="ts__overlay-menu" aria-hidden="true">
        Menu
      </div>

      <div className="ts__overlay-tab" aria-label="W. Honors">
        <span className="ts__overlay-tab-w">W.</span>
        <span>Honors</span>
      </div>

      {/* ── Main Content ── */}
      <div className="ts__content">
        
        {/* ── Headline ── */}
        <TypewriterText
          as="h2"
          className="ts__headline"
          text={headline}
          speed={0.008}
          inViewMargin="-40% 0px"
        />

        {/* ── Product Photo Sticker (Scrub Shrink Wrapper) ── */}
        <motion.div 
          style={{ 
            scale: shrinkScale, 
            opacity: shrinkOpacity, 
            transformOrigin: '20% 80%', // Roughly the bottom-left corner
            position: 'absolute', 
            inset: 0, 
            pointerEvents: 'none' 
          }}
        >
          <motion.div 
            className="ts__product-wrapper"
            variants={photoVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            style={{ pointerEvents: 'auto' }}
          >
            {/* Accent marks (SVG) */}
            <svg 
              className="ts__accents" 
              viewBox="0 0 100 100" 
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <motion.path 
                d="M 20 80 L 10 90" 
                className="ts__accent-path"
                variants={accentVariants}
              />
              <motion.path 
                d="M 30 50 L 15 45" 
                className="ts__accent-path"
                variants={accentVariants}
              />
              <motion.path 
                d="M 60 25 L 55 10" 
                className="ts__accent-path"
                variants={accentVariants}
              />
            </svg>

            {/* Photo itself — no box, just the raw image with drop shadow */}
            <div className="ts__photo-sticker">
              {photoSrc ? (
                <>
                  <img
                    src={photoSrc}
                    alt={photoAlt}
                    className="ts__photo-img"
                    draggable={false}
                  />
                  {/* ── Knockout layer ──────────────────────────────────────
                      An outlined copy of the headline sits inside the image
                      container. overflow:hidden on .ts__photo-sticker clips
                      it to the image bounds only — so the stroke-only text
                      appears wherever the image overlaps the headline.       */}
                  <div className="ts__knockout-layer" aria-hidden="true">
                    <h2 className="ts__headline ts__headline--knockout">
                      {headline}
                    </h2>
                  </div>
                </>
              ) : (
                <div className="ts__photo-placeholder">
                  🍮
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}
