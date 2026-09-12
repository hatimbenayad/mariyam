import { useState } from 'react';
import SplashScreen from './components/SplashScreen';
import HeroSection from './components/HeroSection';
import PanelTransition from './components/PanelTransition';
import AnatomyWrapper from './components/AnatomyWrapper';
import InlineHeadingSection from './components/InlineHeadingSection';
import MilestoneStack from './components/MilestoneStack';
import ProductsShowcase from './components/ProductsShowcase';
import StatementSection from './components/StatementSection';
import FooterSection from './components/FooterSection';
import { useLenis } from './hooks/useLenis';
import './App.css';

export default function App() {
  const [splashDone, setSplashDone] = useState(false);

  /* Smooth scroll — Lenis, initialised once at root */
  const lenisRef = useLenis();

  return (
    <>
      {/* ── Splash gate ─────────────────────────────────── */}
      {!splashDone && (
        <SplashScreen onEnter={() => setSplashDone(true)} />
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
        photoSrc="/banana pudding.png"
        photoAlt="A fresh batch of banana pudding"
      />

      {/* ── Typewriter & Anatomy Sections (Shared Scroll Wrapper) ── */}
      <AnatomyWrapper anatomyPhoto="/anatomy section image.png" />

      {/* ── Inline Heading Section ── */}
      <InlineHeadingSection
        thumb1="/inline heading section 1.png"
        thumb2="/inline heading section 2.png"
        thumb3="/inline heading section 3.png"
      />

      {/* ── Milestone Card Stack ── */}
      <MilestoneStack
        card1PhotoSrc="/chocchip pudding.png"
        card1PhotoAlt="Global recognition era — chocchip pudding"
        card2PhotoSrc="/chocolate pudding.png"
        card2PhotoAlt="A new chapter — chocolate pudding"
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
