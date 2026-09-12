import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { motion } from 'framer-motion';

/**
 * A wrapper component that places 4 zero-size corner markers inside it.
 * This allows the parent to read the exact viewport coordinates of its corners
 * after any CSS rotation or scaling is applied by the browser layout engine.
 * Useful for precise polygon clipping.
 */
const PhotoWithCorners = forwardRef(({ children, className, style, ...props }, ref) => {
  const tl = useRef(null);
  const tr = useRef(null);
  const br = useRef(null);
  const bl = useRef(null);

  useImperativeHandle(ref, () => ({
    corners: {
      tl: tl.current,
      tr: tr.current,
      br: br.current,
      bl: bl.current,
    }
  }));

  const cornerStyle = { position: 'absolute', width: 0, height: 0, pointerEvents: 'none', zIndex: -1 };

  return (
    <motion.div className={className} style={{ position: 'relative', ...style }} {...props}>
      {/* 4 invisible corner markers */}
      <div ref={tl} style={{ ...cornerStyle, top: 0, left: 0 }} />
      <div ref={tr} style={{ ...cornerStyle, top: 0, right: 0 }} />
      <div ref={br} style={{ ...cornerStyle, bottom: 0, right: 0 }} />
      <div ref={bl} style={{ ...cornerStyle, bottom: 0, left: 0 }} />
      
      {children}
    </motion.div>
  );
});

export default PhotoWithCorners;
