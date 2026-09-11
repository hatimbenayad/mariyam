import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import './InlineHeadingSection.css';

export default function InlineHeadingSection({
  line1Text = "TYPES OF",
  line2Text = "PUDDI'N",
  line3Text = "FLAVORS",
  thumb1 = null,
  thumb2 = null,
  thumb3 = null,
}) {
  const sectionRef = useRef(null);
  
  // Trigger animation once when the section is 40% into the viewport
  const isInView = useInView(sectionRef, {
    once: true,
    margin: "-40% 0px",
  });

  // Stagger container for the three lines
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2, // ~200ms stagger for cascading reveal
      },
    },
  };

  // Bounce / scale-up fade for each line (the text and inline thumbnail together)
  const lineVariants = {
    hidden: { 
      opacity: 0, 
      y: 50, 
      scale: 0.9 
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        mass: 1,
      },
    },
  };

  return (
    <section className="inline-heading-section" ref={sectionRef} aria-label="Product Types">
      
      {/* ── Menu & Tab (Own instance for this section) ── */}
      <div className="ihs__nav">Menu</div>
      <div className="ihs__tab">
        <span className="ihs__tab-text">W. / Honors</span>
      </div>

      <div className="ihs__container">
        <motion.div 
          className="ihs__heading-wrapper"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {/* LINE 1: Text then Thumb */}
          <motion.div className="ihs__line" variants={lineVariants}>
            <span>{line1Text}</span>
            <div className="ihs__thumb">
              {thumb1 ? <img src={thumb1} alt="Product thumb 1" draggable="false" /> : <span className="ihs__thumb-placeholder">🍮</span>}
            </div>
          </motion.div>

          {/* LINE 2: Thumb then Text */}
          <motion.div className="ihs__line" variants={lineVariants}>
            <div className="ihs__thumb">
              {thumb2 ? <img src={thumb2} alt="Product thumb 2" draggable="false" /> : <span className="ihs__thumb-placeholder">🍮</span>}
            </div>
            <span>{line2Text}</span>
          </motion.div>

          {/* LINE 3: Text then Thumb */}
          <motion.div className="ihs__line" variants={lineVariants}>
            <span>{line3Text}</span>
            <div className="ihs__thumb">
              {thumb3 ? <img src={thumb3} alt="Product thumb 3" draggable="false" /> : <span className="ihs__thumb-placeholder">🍮</span>}
            </div>
          </motion.div>
        </motion.div>
      </div>

    </section>
  );
}
