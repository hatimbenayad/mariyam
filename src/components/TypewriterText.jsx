import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

export default function TypewriterText({
  text,
  speed = 0.008,
  delay = 0,
  className = "",
  as = "span",
  onComplete,
  inViewMargin = "-20% 0px" // Allows adjusting when the trigger happens
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: inViewMargin });
  
  const characters = Array.from(text);
  
  const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: speed,
        delayChildren: delay,
      },
    },
  };

  const charVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.01 } 
    },
  };

  const MotionComponent = motion[as] || motion.span;

  return (
    <MotionComponent
      ref={ref}
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      onAnimationComplete={(definition) => {
        if (definition === "visible" && onComplete) {
          onComplete();
        }
      }}
      aria-label={text}
    >
      {characters.map((char, index) => (
        <motion.span 
          key={index} 
          variants={charVariants}
          aria-hidden="true"
        >
          {char}
        </motion.span>
      ))}
    </MotionComponent>
  );
}
