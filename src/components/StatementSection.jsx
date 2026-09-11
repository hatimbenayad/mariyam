import { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import './StatementSection.css';

/**
 * AnimatedWord component tracks its own scroll progress relative to the viewport.
 * As it crosses the center, it scrubs its color from caramel to dark brown.
 */
function AnimatedWord({ children }) {
  const wordRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: wordRef,
    // Trigger starts when top of word hits 60% of viewport height (just below center)
    // Ends when bottom of word hits 40% of viewport height (just above center)
    offset: ["start 60%", "end 40%"] 
  });

  // Interpolate color based on scroll progress
  const color = useTransform(scrollYProgress, [0, 1], ["#D9A566", "#2A1B10"]);

  return (
    <motion.span 
      ref={wordRef} 
      className="ss__word" 
      style={{ color }}
    >
      {children}
    </motion.span>
  );
}

/**
 * Scattered item component (Photos and Tags) that bounce in when scrolled into view.
 */
function ScatteredItem({ children, className, style }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-20% 0px" });

  const variants = {
    hidden: { opacity: 0, scale: 0.8, y: 50 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  return (
    <motion.div
      ref={ref}
      className={`ss__scattered ${className || ''}`}
      style={style}
      variants={variants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      {children}
    </motion.div>
  );
}

export default function StatementSection({
  statementText = "PUDDI'N CAN BE FOUND ANYWHERE YOU CRAVE SOMETHING SWEET. MADE FRESH EVERY MORNING, CRAFTED WITH LOVE, AND SERVED WITH A SMILE THAT LINGERS LONG AFTER THE LAST SPOONFUL.",
  photos = [null, null, null], // Placeholders
  tags = ["Made fresh daily", "Small batch, big flavor"]
}) {
  // Split text into words
  const words = statementText.split(' ');

  return (
    <section className="statement-section" aria-label="Statement">
      
      {/* ── Menu & Tab (Own instance for this section) ── */}
      <div className="ss__nav">Menu</div>
      <div className="ss__tab">
        <span className="ss__tab-text">W. / Honors</span>
      </div>

      <div className="ss__container">
        
        {/* The large block of text */}
        <h2 className="ss__text-block">
          {words.map((word, index) => (
            <AnimatedWord key={index}>
              {word}{' '}
            </AnimatedWord>
          ))}
        </h2>

        {/* Scattered Photos */}
        <ScatteredItem className="ss__photo ss__photo-1" style={{ top: '15%', left: '5%', transform: 'rotate(-5deg)' }}>
          {photos[0] ? <img src={photos[0]} alt="Scattered 1" /> : <div className="ss__placeholder">🍮</div>}
        </ScatteredItem>

        <ScatteredItem className="ss__photo ss__photo-2" style={{ top: '45%', right: '8%', transform: 'rotate(8deg)' }}>
          {photos[1] ? <img src={photos[1]} alt="Scattered 2" /> : <div className="ss__placeholder">🍮</div>}
        </ScatteredItem>

        <ScatteredItem className="ss__photo ss__photo-3" style={{ bottom: '15%', left: '10%', transform: 'rotate(-3deg)' }}>
          {photos[2] ? <img src={photos[2]} alt="Scattered 3" /> : <div className="ss__placeholder">🍮</div>}
        </ScatteredItem>

        {/* Scattered Tags */}
        <ScatteredItem className="ss__tag ss__tag-1" style={{ top: '25%', right: '15%', transform: 'rotate(4deg)' }}>
          <span>{tags[0]}</span>
        </ScatteredItem>

        <ScatteredItem className="ss__tag ss__tag-2" style={{ bottom: '30%', right: '25%', transform: 'rotate(-6deg)' }}>
          <span>{tags[1]}</span>
        </ScatteredItem>

      </div>
    </section>
  );
}
