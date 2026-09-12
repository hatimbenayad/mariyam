import { useRef, useEffect, useCallback } from 'react';
import { motion, useScroll, useTransform, useInView, useMotionTemplate } from 'framer-motion';
import './StatementSection.css';

/**
 * AnimatedWord - scrubs color from caramel to dark brown on scroll.
 * In strokeMode: transparent fill + matching scroll-driven stroke color.
 */
function AnimatedWord({ children, strokeMode = false }) {
  const wordRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: wordRef,
    offset: ['start 60%', 'end 40%'],
  });

  const r = useTransform(scrollYProgress, [0, 1], [217, 42]);
  const g = useTransform(scrollYProgress, [0, 1], [165, 27]);
  const b = useTransform(scrollYProgress, [0, 1], [102, 16]);
  const colorTemplate = useMotionTemplate`rgb(${r}, ${g}, ${b})`;

  if (strokeMode) {
    return (
      <motion.span
        ref={wordRef}
        className="ss__word"
        style={{
          color: 'transparent',
          WebkitTextStroke: '2px',
          WebkitTextStrokeColor: colorTemplate,
        }}
      >
        {children}{' '}
      </motion.span>
    );
  }

  return (
    <motion.span
      ref={wordRef}
      className="ss__word"
      style={{ color: colorTemplate }}
    >
      {children}{' '}
    </motion.span>
  );
}

function TextBlock({ words, className = '' }) {
  return (
    <h2 className={`ss__text-block ${className}`}>
      {words.map((word, i) => (
        <AnimatedWord key={i}>
          {word}
        </AnimatedWord>
      ))}
    </h2>
  );
}

/**
 * ScatteredItem - bounce-in wrapper for tags only.
 */
function ScatteredItem({ children, className, style }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-20% 0px' });
  const variants = {
    hidden:  { opacity: 0, scale: 0.8, y: 50 },
    visible: { opacity: 1, scale: 1,   y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } },
  };
  return (
    <motion.div
      ref={ref}
      className={`ss__scattered ${className || ''}`}
      style={style}
      variants={variants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
    >
      {children}
    </motion.div>
  );
}

function PhotoItem({ photoSrc, photoAlt, className, style, rotate = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-20% 0px' });

  return (
    <motion.div
      ref={ref}
      className={`ss__scattered ${className || ''}`}
      style={style}
      initial={{ opacity: 0, scale: 0.8, y: 50, rotate: 0 }}
      animate={isInView
        ? { opacity: 1, scale: 1, y: 0, rotate }
        : { opacity: 0, scale: 0.8, y: 50, rotate: 0 }
      }
      transition={{ type: 'spring', stiffness: 100, damping: 15 }}
    >
      {photoSrc
        ? <img src={photoSrc} alt={photoAlt} />
        : <div className="ss__placeholder">🍮</div>
      }
    </motion.div>
  );
}

export default function StatementSection({
  statementText = "PUDDI'N CAN BE FOUND ANYWHERE YOU CRAVE SOMETHING SWEET. MADE FRESH EVERY MORNING, CRAFTED WITH LOVE, AND SERVED WITH A SMILE THAT LINGERS LONG AFTER THE LAST SPOONFUL.",
  photos = [null, null, null],
  tags   = ['Made fresh daily', 'Small batch, big flavor'],
}) {
  const words = statementText.split(' ');

  return (
    <section className="statement-section" aria-label="Statement">

      <div className="ss__container">

        {/* Text stack: Just the solid fill now, no clip paths */}
        <div className="ss__text-stack">
          <TextBlock words={words} className="ss__text--solid" />
        </div>

        {/*
          Photos moved to the left and right margins to avoid overlapping text.
        */}
        <PhotoItem
          photoSrc={photos[0]}
          photoAlt="Puddi'n product 1"
          className="ss__photo ss__photo-1"
          style={{ top: '6%', left: '-15%' }}
          rotate={-10}
        />

        <PhotoItem
          photoSrc={photos[1]}
          photoAlt="Puddi'n product 2"
          className="ss__photo ss__photo-2"
          style={{ top: '38%', right: '-25%' }}
          rotate={10}
        />

        <PhotoItem
          photoSrc={photos[2]}
          photoAlt="Puddi'n product 3"
          className="ss__photo ss__photo-3"
          style={{ bottom: '6%', left: '-12%' }}
          rotate={-10}
        />

        {/* -- Torn-paper Tags - positions and styles unchanged -- */}
        <ScatteredItem className="ss__tag ss__tag-1" style={{ top: '25%', right: '2%', transform: 'rotate(-6deg)' }}>
          <span>{tags[0]}</span>
        </ScatteredItem>

        <ScatteredItem className="ss__tag ss__tag-2" style={{ bottom: '30%', left: '-18%', transform: 'rotate(-7deg)' }}>
          <span>{tags[1]}</span>
        </ScatteredItem>

      </div>
    </section>
  );
}