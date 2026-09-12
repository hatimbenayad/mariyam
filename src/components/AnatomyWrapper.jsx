import { useRef } from 'react';
import { useScroll } from 'framer-motion';
import TypewriterSection from './TypewriterSection';
import AnatomySection from './AnatomySection';
import './AnatomyWrapper.css';

export default function AnatomyWrapper({ anatomyPhoto }) {
  const wrapperRef = useRef(null);

  // The wrapper is 250vh tall. We track scroll progress across this entire height.
  // When progress = 0, the top of the wrapper hits the top of the viewport.
  // When progress = 1, the bottom of the wrapper hits the bottom of the viewport.
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ['start start', 'end end'],
  });

  return (
    <section ref={wrapperRef} className="anatomy-wrapper">
      <div className="aw__sticky">
        {/* The previous section, rendered underneath */}
        <TypewriterSection sharedProgress={scrollYProgress} photoSrc="/chocchip pudding.png" photoAlt="Chocchip pudding — Puddi'n signature" />
        
        {/* The new section, revealed on top via mask */}
        <AnatomySection scrollProgress={scrollYProgress} photoSrc={anatomyPhoto} />
      </div>
    </section>
  );
}
