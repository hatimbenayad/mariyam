import { useRef, useEffect } from 'react';
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
  const headlinesRef = useRef(null);
  const photoRef = useRef(null);

  useEffect(() => {
    let rafId;
    const updateClipPaths = () => {
      if (headlinesRef.current && photoRef.current) {
        const headRect = headlinesRef.current.getBoundingClientRect();
        const photoRect = photoRef.current.getBoundingClientRect();

        const top = photoRect.top - headRect.top;
        const left = photoRect.left - headRect.left;
        const right = left + photoRect.width;
        const bottom = top + photoRect.height;

        const insetTop = Math.max(0, top);
        const insetRight = Math.max(0, headRect.width - right);
        const insetBottom = Math.max(0, headRect.height - bottom);
        const insetLeft = Math.max(0, left);

        headlinesRef.current.style.setProperty('--clip-include', `inset(${insetTop}px ${insetRight}px ${insetBottom}px ${insetLeft}px)`);

        headlinesRef.current.style.setProperty('--clip-exclude',
          `polygon(
            0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%,
            ${left}px ${top}px, ${left}px ${bottom}px, ${right}px ${bottom}px, ${right}px ${top}px, ${left}px ${top}px
          )`
        );
      }
      rafId = requestAnimationFrame(updateClipPaths);
    };
    rafId = requestAnimationFrame(updateClipPaths);
    return () => cancelAnimationFrame(rafId);
  }, []);

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

      <div className="ts__overlay-tab" aria-label="W. Honors">
        <span className="ts__overlay-tab-w">W.</span>
        <span>Honors</span>
      </div>

      {/* ── Main Content ── */}
      <div className="ts__content">
        
        {/* ── Product Photo Sticker (Scrub Shrink Wrapper) ── */}
        <motion.div 
          style={{ 
            scale: shrinkScale, 
            opacity: shrinkOpacity, 
            transformOrigin: '10% 90%', // Matches photo's new bottom-left anchor
            position: 'absolute', 
            inset: 0, 
            pointerEvents: 'none',
            zIndex: 1
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
            <div className="ts__photo-sticker" ref={photoRef}>
              {photoSrc ? (
                <img
                  src={photoSrc}
                  alt={photoAlt}
                  className="ts__photo-img"
                  draggable={false}
                />
              ) : (
                <div className="ts__photo-placeholder">
                  🍮
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>

        {/* ── Headlines (Stacked in front of photo) ── */}
        <div className="ts__headlines-container" ref={headlinesRef}>
          {/* Solid Text - clipped to EXCLUDE photo */}
          <TypewriterText
            as="h2"
            className="ts__headline ts__headline--solid"
            text={headline}
            speed={0.008}
            inViewMargin="-40% 0px"
          />

          {/* Outline Text - clipped to INCLUDE photo */}
          <TypewriterText
            as="h2"
            className="ts__headline ts__headline--outline"
            text={headline}
            speed={0.008}
            inViewMargin="-40% 0px"
          />
        </div>

      </div>
    </section>
  );
}
