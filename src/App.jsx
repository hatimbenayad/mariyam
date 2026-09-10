import { useState } from 'react';
import SplashScreen from './components/SplashScreen';
import './App.css';

export default function App() {
  const [splashDone, setSplashDone] = useState(false);

  return (
    <>
      {/* Splash gate — onEnter fires after the exit animation completes */}
      {!splashDone && <SplashScreen onEnter={() => setSplashDone(true)} />}

      {/* ── Main landing page ───────────────────────────────── */}
      <main className="landing" aria-hidden={!splashDone}>
        <div className="landing__inner">
          <h1 className="landing__title">Puddi&rsquo;n</h1>
          <p className="landing__sub">by NUGGETSINMYBAG</p>
          <p className="landing__tagline">Your craving called. We picked up.</p>
        </div>
      </main>
    </>
  );
}
