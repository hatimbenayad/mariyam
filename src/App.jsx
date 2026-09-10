import { useState } from 'react';
import SplashScreen from './components/SplashScreen';
import HeroSection from './components/HeroSection';
import { useLenis } from './hooks/useLenis';
import './App.css';

export default function App() {
  const [splashDone, setSplashDone] = useState(false);

  /* Smooth scroll — initialised once, always active */
  useLenis();

  return (
    <>
      {/* ── Splash gate ────────────────────────────────── */}
      {!splashDone && (
        <SplashScreen onEnter={() => setSplashDone(true)} />
      )}

      {/* ── Landing content ────────────────────────────── */}
      {/*
          isActive becomes true the moment the splash callback fires,
          so the hero's entrance animations begin right as the splash
          fades out — no extra delay, no second click needed.
      */}
      <HeroSection isActive={splashDone} />

      {/* ── Future sections ────────────────────────────── */}
      {/* e.g. <StorySection />, <FlavorsSection />, etc. */}
    </>
  );
}
