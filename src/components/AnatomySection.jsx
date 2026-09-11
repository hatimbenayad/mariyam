import { motion, useTransform } from 'framer-motion';
import './AnatomySection.css';

export default function AnatomySection({
  scrollProgress,
  heading = "Anatomy",
  brand = "PUDDI'N",
  photoSrc = null,
  photoAlt = "Anatomy Hero",
  ingredientsLeft = ["Filling A", "Filling B", "Filling C", "Filling D", "Filling E"],
  ingredientsRight = ["Topping A", "Topping B", "Topping C", "Topping D", "Topping E"],
}) {

  /* ── 1. The Diagonal Band Mask ── */
  // We want the clip-path to start as a thin diagonal line in the center,
  // then expand outward to cover the whole screen.
  // We can do this using polygon. 
  // Let's map progress to a spread value.
  // Spread goes from 0 (thin line) to 150 (fully covering screen corners).
  const spread = useTransform(scrollProgress, [0, 1], [0, 150]);
  
  // Custom transform to generate the polygon string.
  // A diagonal line from bottom-left to top-right.
  // We offset the corners perpendicular to the line by the spread amount.
  const clipPath = useTransform(spread, (s) => {
    // If progress is very small, keep it completely hidden or very thin
    if (s < 0.5) return `polygon(0% 100%, 0% 100%, 100% 0%, 100% 0%)`;
    
    // We create a thick diagonal band.
    // Top-left side of the band moves up/left, bottom-right side moves down/right.
    // For simplicity, we just move the four corners of a polygon.
    // 0% 100% is bottom left. 100% 0% is top right.
    return `polygon(
      ${0 - s}% ${100 - s}%, 
      ${0 + s}% ${100 + s}%, 
      ${100 + s}% ${0 + s}%, 
      ${100 - s}% ${0 - s}%
    )`;
  });

  /* ── 2. Center Image Scale-up ── */
  // Scales up only after the band has grown significantly.
  const imageScale = useTransform(scrollProgress, [0.3, 0.9], [0.5, 1]);
  const imageOpacity = useTransform(scrollProgress, [0.3, 0.6], [0, 1]);

  /* ── 3. Text Reveal Timing ── */
  // Text should appear before the image finishes scaling, maybe starting at 0.1 and finishing at 0.4.
  // Since we want the list items to ripple outward from the center, we'll calculate individual opacities
  // based on their distance from the center index.

  const renderList = (items) => {
    const centerIndex = Math.floor(items.length / 2);
    
    return (
      <ul className="as__list">
        {items.map((item, i) => {
          // Distance from center item (0 for center, 1 for adjacent, 2 for next...)
          const dist = Math.abs(i - centerIndex);
          // Calculate start and end scrub values for this item's fade
          // Center starts first (e.g. 0.1), further ones start later (+0.05 per dist)
          const start = 0.1 + (dist * 0.05);
          const end = start + 0.15;
          
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const opacity = useTransform(scrollProgress, [start, end], [0, 1]);
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const y = useTransform(scrollProgress, [start, end], [10, 0]);

          return (
            <motion.li key={i} className="as__list-item" style={{ opacity, y }}>
              {item}
            </motion.li>
          );
        })}
      </ul>
    );
  };

  // General text fade for heading and brand
  const textOpacity = useTransform(scrollProgress, [0.1, 0.4], [0, 1]);
  const textY = useTransform(scrollProgress, [0.1, 0.4], [15, 0]);

  return (
    <motion.section 
      className="anatomy-section" 
      style={{ clipPath }}
      aria-label="Product Anatomy"
    >
      {/* ── Background Watermark ── */}
      <div className="as__watermark-container" aria-hidden="true">
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={i} className="as__watermark-row">
            MAIN INGREDIENTS MAIN INGREDIENTS MAIN INGREDIENTS
          </div>
        ))}
      </div>

      {/* ── Persistent overlays (inside the masked area so they reveal with it) ── */}
      {/* Since they perfectly overlap TypewriterSection's overlays, they just replace them seamlessly */}
      <div className="as__overlay-menu" aria-hidden="true">
        Menu
      </div>

      <div className="as__overlay-tab" aria-label="W. Honors">
        <span className="as__overlay-tab-w">W.</span>
        <span>Honors</span>
      </div>

      {/* ── Content ── */}
      <div className="as__content">
        
        <motion.h2 
          className="as__heading"
          style={{ opacity: textOpacity, y: textY }}
        >
          {heading}
        </motion.h2>

        <div className="as__main-layout">
          {/* Left Column */}
          <div className="as__col">
            {renderList(ingredientsLeft)}
          </div>

          {/* Center Image with Starburst */}
          <motion.div 
            className="as__center-hero"
            style={{ scale: imageScale, opacity: imageOpacity }}
          >
            {/* Starburst SVG */}
            <svg 
              className="as__starburst" 
              viewBox="0 0 100 100" 
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path d="M50 0 L55 35 L90 20 L65 50 L90 80 L55 65 L50 100 L45 65 L10 80 L35 50 L10 20 L45 35 Z" fill="#FDF3D5" opacity="0.3"/>
            </svg>
            
            <div className="as__photo-container">
              {photoSrc ? (
                <img src={photoSrc} alt={photoAlt} className="as__photo" draggable={false} />
              ) : (
                <div className="as__photo-placeholder">🍮</div>
              )}
            </div>
          </motion.div>

          {/* Right Column */}
          <div className="as__col">
            {renderList(ingredientsRight)}
          </div>
        </div>

        <motion.div 
          className="as__brand"
          style={{ opacity: textOpacity, y: textY }}
        >
          {brand}
        </motion.div>

      </div>
    </motion.section>
  );
}
