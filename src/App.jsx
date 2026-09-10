import { useState } from 'react';
import SplashScreen from './components/SplashScreen';
import HeroSection from './components/HeroSection';
import PanelTransition from './components/PanelTransition';
import MilestoneStack from './components/MilestoneStack';
import { useLenis } from './hooks/useLenis';
import './App.css';

export default function App() {
  const [splashDone, setSplashDone] = useState(false);

  /* Smooth scroll — Lenis, initialised once at root */
  useLenis();

  return (
    <>
      {/* ── Splash gate ─────────────────────────────────── */}
      {!splashDone && (
        <SplashScreen onEnter={() => setSplashDone(true)} />
      )}

      {/* ── Hero — first section (plays on splash exit) ── */}
      <HeroSection isActive={splashDone} />

      {/* ── Panel transition — scroll-scrubbed expansion ── */}
      <PanelTransition
        heading="The Beginning"
        description="From a small kitchen in the heart of the city, Puddi'n was born out of a simple obsession: making the perfect pudding. Every batch is handcrafted fresh each morning, poured with care, and served with the kind of love that lingers long after the last spoonful."
        year="2024"
      />

      {/* ── Card Stack transition — scroll-scrubbed milestones ── */}
      <MilestoneStack />

      {/* ── Future sections ─────────────────────────────── */}
      {/* <FlavorsSection /> */}
      {/* <StorySection />  */}
    </>
  );
}
