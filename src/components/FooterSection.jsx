import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import './FooterSection.css';

export default function FooterSection({ 
  lenisRef, 
  headingLine1 = `"PUDDI'N"`, 
  headingLine2 = "NUGGETSINMYBAG", 
  tagCaption = "Let's dig in",
  photos = [null, null], 
  creditLine = "©2026. Created by overcodey"
}) {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-30% 0px" });

  const handleGoToTop = (e) => {
    e.preventDefault();
    if (lenisRef && lenisRef.current) {
      lenisRef.current.scrollTo(0);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Container variants for staggered children reveal
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  // Bounce/Scale variants for elements
  const itemVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: 'spring', stiffness: 100, damping: 15 }
    }
  };

  return (
    <section className="footer-section" ref={sectionRef} aria-label="Footer">
      {/* ── Background Image & Overlay ── */}
      <div className="fs__bg-image"></div>
      <div className="fs__bg-overlay"></div>

      {/* ── Staggered Foreground Content ── */}
      <motion.div 
        className="fs__content"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        


        {/* Die-cut Corner Photos */}
        <motion.div className="fs__photo fs__photo-top-left" variants={itemVariants}>
          {photos[0] ? <img src={photos[0]} alt="Featured product" /> : <div className="fs__photo-placeholder">🍮</div>}
        </motion.div>
        
        <motion.div className="fs__photo fs__photo-bottom-right" variants={itemVariants}>
          {photos[1] ? <img src={photos[1]} alt="Featured product" /> : <div className="fs__photo-placeholder">🥄</div>}
        </motion.div>

        {/* Center Typography */}
        <div className="fs__center-cluster">
          <motion.h2 className="fs__heading fs__heading-line1" variants={itemVariants}>
            {headingLine1}
          </motion.h2>

          <motion.div className="fs__tag-wrapper" variants={itemVariants}>
            <div className="fs__tag">
              <span className="fs__tag-text">{tagCaption}</span>
              <span className="fs__tag-icon">🍪</span>
            </div>
          </motion.div>

          <motion.h2 className="fs__heading fs__heading-line2" variants={itemVariants}>
            {headingLine2}
          </motion.h2>
        </div>

        {/* Bottom Row Links */}
        <motion.div className="fs__bottom-row" variants={itemVariants}>
          <div className="fs__credit">{creditLine}</div>
          <button className="fs__go-top" onClick={handleGoToTop}>
            Go to top ↑
          </button>
        </motion.div>

      </motion.div>
    </section>
  );
}
