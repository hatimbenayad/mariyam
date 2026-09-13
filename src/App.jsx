import { useState, useEffect, useCallback } from 'react';
import SplashScreen from './components/SplashScreen';
import HeroSection from './components/HeroSection';
import PanelTransition from './components/PanelTransition';
import AnatomyWrapper from './components/AnatomyWrapper';
import InlineHeadingSection from './components/InlineHeadingSection';
import ProductsShowcase from './components/ProductsShowcase';
import StatementSection from './components/StatementSection';
import FooterSection from './components/FooterSection';
import { useLenis } from './hooks/useLenis';
import './App.css';

export default function App() {
  const [splashDone, setSplashDone] = useState(false);

  /* Smooth scroll — Lenis, initialised once at root */
  const lenisRef = useLenis();

  /* ── Lock scroll while splash is active ──
     Pauses Lenis + sets overflow:hidden on <html> so wheel/touch events
     during the intro don't shift the underlying page position. */
  useEffect(() => {
    if (!splashDone) {
      document.documentElement.style.overflow = 'hidden';
      if (lenisRef.current) lenisRef.current.stop();
    }
  }, [splashDone, lenisRef]);

  /* Called by AnimatePresence onExitComplete after the splash fades out */
  const handleEnter = useCallback(() => {
    window.scrollTo(0, 0);                          // native snap to top
    document.documentElement.style.overflow = '';   // restore native scroll
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true }); // Lenis snap to top
      lenisRef.current.start();                          // resume smooth scroll
    }
    setSplashDone(true);
  }, [lenisRef]);

  return (
    <>
      {/* ── Splash gate ──────────────────────────────────── */}
      {!splashDone && (
        <SplashScreen onEnter={handleEnter} />
      )}

      {/* ── Hero — first section (plays on splash exit) ── */}
      <HeroSection
        isActive={splashDone}
        photos={[
          { src: '/banana pudding.png', alt: 'Banana Pudding' },
          { src: '/chocchip pudding.png', alt: 'Chocchip Pudding' },
          { src: '/chocolate pudding.png', alt: 'Chocolate Pudding' },
          { src: '/banana pudding.png', alt: 'Banana Pudding' },
          { src: '/chocchip pudding.png', alt: 'Chocchip Pudding' },
          { src: '/chocolate pudding.png', alt: 'Chocolate Pudding' }
        ]}
      />

      {/* ── Panel transition — scroll-scrubbed expansion ── */}
      <PanelTransition
        heading="The Beginning"
        description="From a small kitchen in the heart of the city, Puddi'n was born out of a simple obsession: making the perfect pudding. Every batch is handcrafted fresh each morning, poured with care, and served with the kind of love that lingers long after the last spoonful."
        year="2024"
        photoSrc="/creampour.png"
        photoAlt="A fresh batch of creampour"
      />

      {/* ── Typewriter & Anatomy Sections (Shared Scroll Wrapper) ── */}
      <AnatomyWrapper anatomyPhoto="/anatomy section image.png" />

      {/* ── Inline Heading Section ── */}
      <InlineHeadingSection
        thumb1="/inline heading section 1.png"
        thumb2="/inline heading section 2.png"
        thumb3="/inline heading section 3.png"
      />

      {/* ── Products Showcase Section ── */}
      <ProductsShowcase />

      {/* ── Statement Reading Section ── */}
      <StatementSection
        photos={[
          '/banana pudding.png',
          '/chocchip pudding.png',
          '/chocolate pudding.png',
        ]}
      />

      {/* ── Footer Section ── */}
      <FooterSection
        lenisRef={lenisRef}
        photos={[
          '/chocchip pudding.png',
          '/banana pudding.png',
        ]}
      />
    </>
  );
}
