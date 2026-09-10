import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './SplashScreen.css';

/* ─── Spring presets ─────────────────────────────────────── */
const cornerSpring = {
  type: 'spring',
  stiffness: 180,
  damping: 10,
  mass: 0.8,
};

const logoSpring = {
  type: 'spring',
  stiffness: 140,
  damping: 9,
  mass: 1.1,
};

/* ─── Wobble variants ────────────────────────────────────── */
const wobbleIn = (delay = 0) => ({
  hidden: {
    opacity: 0,
    scaleX: 1.25,
    scaleY: 0.55,
    skewX: -6,
    filter: 'blur(2px)',
  },
  visible: {
    opacity: 1,
    scaleX: 1,
    scaleY: 1,
    skewX: 0,
    filter: 'blur(0px)',
    transition: { ...cornerSpring, delay },
  },
  exit: {
    opacity: 0,
    scale: 0.92,
    transition: { duration: 0.35, ease: 'easeIn' },
  },
});

const logoWobble = {
  hidden: {
    opacity: 0,
    scaleX: 1.3,
    scaleY: 0.5,
    skewX: 4,
    filter: 'blur(3px)',
  },
  visible: {
    opacity: 1,
    scaleX: 1,
    scaleY: 1,
    skewX: 0,
    filter: 'blur(0px)',
    transition: { ...logoSpring, delay: 0.45 },
  },
  exit: {
    opacity: 0,
    scale: 0.88,
    transition: { duration: 0.35, ease: 'easeIn' },
  },
};

const pulseVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: [0, 0.7, 0.3, 0.7],
    transition: {
      delay: 2.1,
      duration: 1.8,
      times: [0, 0.3, 0.6, 1],
      repeat: Infinity,
      repeatType: 'mirror',
      ease: 'easeInOut',
    },
  },
};

const screenExit = {
  hidden: { opacity: 1, scale: 1 },
  exit: {
    opacity: 0,
    scale: 0.96,
    transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] },
  },
};

/* ─── Component ──────────────────────────────────────────── */
export default function SplashScreen({ onEnter }) {
  const [visible, setVisible] = useState(true);
  const [animDone, setAnimDone] = useState(false);

  /* Mark anim done after longest stagger + spring settle */
  useEffect(() => {
    const t = setTimeout(() => setAnimDone(true), 2200);
    return () => clearTimeout(t);
  }, []);

  const handleClick = () => {
    setVisible(false);
  };

  return (
    <AnimatePresence onExitComplete={onEnter}>
      {visible && (
        <motion.div
          className="splash"
          variants={screenExit}
          initial="hidden"
          animate="hidden"
          exit="exit"
          onClick={handleClick}
          id="splash-screen"
          aria-label="Splash screen — tap to enter"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleClick()}
        >
          {/* ── Border overlay ── */}
          <div className="splash__border" aria-hidden="true" />

          {/* ── Stripes ── */}
          <div className="splash__stripes" aria-hidden="true">
            <div className="splash__stripe" />
            <div className="splash__stripe" />
            <div className="splash__stripe" />
          </div>

          {/* ── TOP ROW corner words ── */}
          <div className="splash__top-row" aria-hidden="true">
            {/* LEFT — over first stripe */}
            <motion.span
              className="splash__word splash__word--top-left"
              variants={wobbleIn(0)}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              YOUR
            </motion.span>

            {/* CENTER — over second stripe */}
            <motion.span
              className="splash__word splash__word--top-center"
              variants={wobbleIn(0.12)}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              CRAVING
            </motion.span>

            {/* RIGHT — over third stripe */}
            <motion.span
              className="splash__word splash__word--top-right"
              variants={wobbleIn(0.24)}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              CALLED
            </motion.span>
          </div>

          {/* ── LOGO center ── */}
          <div className="splash__logo-wrap">
            <motion.div
              className="splash__logo"
              variants={logoWobble}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <span className="splash__logo-text" id="splash-logo">Puddi&rsquo;n</span>
              <span className="splash__by">by NUGGETSINMYBAG</span>
            </motion.div>
          </div>

          {/* ── BOTTOM ROW corner words ── */}
          <div className="splash__bottom-row" aria-hidden="true">
            {/* LEFT */}
            <motion.span
              className="splash__word splash__word--bottom-left"
              variants={wobbleIn(0.08)}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              MADE FRESH.
            </motion.span>

            {/* RIGHT */}
            <motion.span
              className="splash__word splash__word--bottom-right"
              variants={wobbleIn(0.2)}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              SERVED HAPPY.
            </motion.span>
          </div>

          {/* ── Tap hint ── */}
          <motion.p
            className="splash__hint"
            variants={pulseVariants}
            initial="hidden"
            animate={animDone ? 'visible' : 'hidden'}
            exit={{ opacity: 0 }}
            aria-label="Tap to enter"
          >
            tap to enter
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
