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

/**
 * One full copy of the text block - solid or hollow.
 * outlineIndex: when >= 0, this is an outline copy for photo[outlineIndex],
 * clipped by --clip-include-{outlineIndex}.
 */
function TextBlock({ words, strokeMode = false, className = '', outlineIndex = -1 }) {
  const clipVar = outlineIndex >= 0
    ? `var(--clip-include-${outlineIndex}, inset(50%))`
    : undefined;

  return (
    <h2
      className={`ss__text-block ${className}`}
      aria-hidden={strokeMode ? 'true' : undefined}
      style={clipVar ? { clipPath: clipVar } : undefined}
    >
      {words.map((word, i) => (
        <AnimatedWord key={i} strokeMode={strokeMode}>
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

/**
 * PhotoItem - bounce-in photo. Rotation is passed as a Framer Motion
 * animated value (not via style.transform) so the spring animation and the
 * rotate don't fight each other.
 */
function PhotoItem({ photoSrc, photoAlt, className, style, index, registerRef, rotate = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-20% 0px' });

  useEffect(() => {
    const el = ref.current;
    if (el) {
      registerRef(index, el);
      return () => registerRef(index, null);
    }
  }, [registerRef, index]);

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
  const words        = statementText.split(' ');
  const textStackRef = useRef(null);
  // photoEls[i] holds the DOM element for photos[i]
  const photoEls     = useRef([null, null, null]);

  const registerRef = useCallback((index, el) => {
    photoEls.current[index] = el;
  }, []);

  /**
   * Single rAF loop:
   *  - Computes each photo's bounding rect relative to the text stack.
   *  - Sets --clip-include-N (inset to photo N's bounds) for each outline copy.
   *  - Sets --clip-exclude (polygon with N holes) for the single solid copy.
   */
  useEffect(() => {
    let rafId;

    const update = () => {
      const stackEl = textStackRef.current;
      if (!stackEl) { rafId = requestAnimationFrame(update); return; }

      const cR = stackEl.getBoundingClientRect();
      const cW = cR.width;
      const cH = cR.height;

      const rects = photoEls.current.map((el, i) => {
        if (!el) return null;
        const pR = el.getBoundingClientRect();
        return {
          index:  i,
          top:    Math.max(0,  pR.top  - cR.top),
          left:   Math.max(0,  pR.left - cR.left),
          right:  Math.min(cW, pR.left - cR.left + pR.width),
          bottom: Math.min(cH, pR.top  - cR.top  + pR.height),
        };
      });

      // --clip-include-N: inset rect for each photo's outline copy
      rects.forEach((r, i) => {
        if (!r || r.right <= r.left || r.bottom <= r.top) {
          // Photo not overlapping: hide this outline copy entirely
          stackEl.style.setProperty(`--clip-include-${i}`, 'inset(50%)');
        } else {
          stackEl.style.setProperty(
            `--clip-include-${i}`,
            `inset(${r.top}px ${cW - r.right}px ${cH - r.bottom}px ${r.left}px)`
          );
        }
      });

      // --clip-exclude: solid copy with a rectangular hole punched for each overlapping photo
      const overlapping = rects.filter(r => r && r.right > r.left && r.bottom > r.top);
      if (overlapping.length === 0) {
        stackEl.style.setProperty('--clip-exclude', 'none');
      } else {
        // even-odd polygon: outer rect + one sub-path hole per photo
        const outer = '0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%';
        const holes = overlapping
          .map(({ top, left, right, bottom }) =>
            `${left}px ${top}px, ${left}px ${bottom}px, ${right}px ${bottom}px, ${right}px ${top}px, ${left}px ${top}px`
          )
          .join(', 0% 0%, ');

        stackEl.style.setProperty(
          '--clip-exclude',
          `polygon(evenodd, ${outer}, ${holes})`
        );
      }

      rafId = requestAnimationFrame(update);
    };

    rafId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <section className="statement-section" aria-label="Statement">

      <div className="ss__container">

        {/*
          Text stack: CSS grid so all children occupy the exact same cell.
          - 1 solid copy (holes punched per photo via --clip-exclude)
          - 3 outline copies, one per photo (each clipped to its photo's rect)
        */}
        <div className="ss__text-stack" ref={textStackRef}>
          {/* Solid fill - polygon with N holes */}
          <TextBlock words={words} strokeMode={false} className="ss__text--solid" />
          {/* Outline copy 0 - visible only inside photo 0's bounding box */}
          <TextBlock words={words} strokeMode={true} className="ss__text--outline" outlineIndex={0} />
          {/* Outline copy 1 - visible only inside photo 1's bounding box */}
          <TextBlock words={words} strokeMode={true} className="ss__text--outline" outlineIndex={1} />
          {/* Outline copy 2 - visible only inside photo 2's bounding box */}
          <TextBlock words={words} strokeMode={true} className="ss__text--outline" outlineIndex={2} />
        </div>

        {/*
          Photos centered over specific text lines.
          Photo 0: over "PUDDI'N / ANYWHERE"  — top-left area, tilted left
          Photo 1: over "MORNING, CRAFTED"    — mid-right area, tilted right
          Photo 2: over "AFTER THE LAST"      — lower-center area, tilted left
          rotate prop goes to Framer Motion's animate to guarantee it renders.
        */}
        <PhotoItem
          photoSrc={photos[0]}
          photoAlt="Puddi'n product 1"
          className="ss__photo ss__photo-1"
          style={{ top: '6%', left: '5%' }}
          rotate={-10}
          index={0}
          registerRef={registerRef}
        />

        <PhotoItem
          photoSrc={photos[1]}
          photoAlt="Puddi'n product 2"
          className="ss__photo ss__photo-2"
          style={{ top: '38%', right: '3%' }}
          rotate={10}
          index={1}
          registerRef={registerRef}
        />

        <PhotoItem
          photoSrc={photos[2]}
          photoAlt="Puddi'n product 3"
          className="ss__photo ss__photo-3"
          style={{ bottom: '6%', left: '8%' }}
          rotate={-10}
          index={2}
          registerRef={registerRef}
        />

        {/* -- Torn-paper Tags - positions and styles unchanged -- */}
        <ScatteredItem className="ss__tag ss__tag-1" style={{ top: '25%', right: '2%', transform: 'rotate(-6deg)' }}>
          <span>{tags[0]}</span>
        </ScatteredItem>

        <ScatteredItem className="ss__tag ss__tag-2" style={{ bottom: '30%', left: '-2%', transform: 'rotate(-10deg)' }}>
          <span>{tags[1]}</span>
        </ScatteredItem>

      </div>
    </section>
  );
}