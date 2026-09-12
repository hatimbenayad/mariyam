import { useEffect } from 'react';

/**
 * Hook to align hollow text clipping with transformed photos using exact polygon coordinates.
 * This ensures the clipping mask follows the photo's rotated/scaled edges instead of a straight unrotated bounding box.
 * 
 * @param {Object} options
 * @param {React.RefObject} options.containerRef - The text stack container.
 * @param {React.MutableRefObject} options.photoNodes - Array of refs to PhotoWithCorners components.
 */
export function useHollowTextClip({ containerRef, photoNodes }) {
  useEffect(() => {
    let rafId;

    const updateClipPaths = () => {
      const container = containerRef.current;
      if (!container) {
        rafId = requestAnimationFrame(updateClipPaths);
        return;
      }

      const cRect = container.getBoundingClientRect();
      const outerPoly = '0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%';
      let holes = [];

      photoNodes.current.forEach((node, i) => {
        if (!node || !node.corners) {
          container.style.setProperty(`--clip-include-${i}`, 'polygon(0 0, 0 0, 0 0, 0 0)');
          return;
        }

        const getPt = (cornerEl) => {
          if (!cornerEl) return null;
          const rect = cornerEl.getBoundingClientRect();
          // Coordinates relative to container
          return `${rect.left - cRect.left}px ${rect.top - cRect.top}px`;
        };

        const tl = getPt(node.corners.tl);
        const tr = getPt(node.corners.tr);
        const br = getPt(node.corners.br);
        const bl = getPt(node.corners.bl);

        if (tl && tr && br && bl) {
          // Polygon ordered TL -> BL -> BR -> TR -> TL
          const poly = `${tl}, ${bl}, ${br}, ${tr}, ${tl}`;
          
          // Set include clip for this specific photo's outline text copy
          container.style.setProperty(`--clip-include-${i}`, `polygon(${poly})`);
          holes.push(poly);
        } else {
          container.style.setProperty(`--clip-include-${i}`, 'polygon(0 0, 0 0, 0 0, 0 0)');
        }
      });

      if (holes.length === 0) {
        container.style.setProperty('--clip-exclude', 'none');
      } else {
        // SVG evenodd polygon syntax
        const excludePoly = `polygon(evenodd, ${outerPoly}, ${holes.join(', 0% 0%, ')})`;
        container.style.setProperty('--clip-exclude', excludePoly);
      }

      rafId = requestAnimationFrame(updateClipPaths);
    };

    rafId = requestAnimationFrame(updateClipPaths);
    return () => cancelAnimationFrame(rafId);
  }, [containerRef, photoNodes]);
}
