import React, { useState } from 'react';
import Header, { type TabType } from './components/Header';
import HeroSection from './components/sections/HeroSection';
import KinhDichPage from './components/KinhDichPage';
import TarotSection from './components/sections/TarotSection';
import DecisionSection from './components/sections/DecisionSection';
import GallerySection from './components/sections/GallerySection';
import JournalSection from './components/sections/JournalSection';
import Footer from './components/Footer';
import { useScrollReveal } from './hooks/useScrollEffects';

const getInitialNavigation = (): {
  activeTab: TabType;
  kinhDichMode: 'casting' | 'manual' | 'ai-reading';
} => {
  const params = new URLSearchParams(window.location.search);
  const mode = params.get('mode');
  const tab = params.get('tab');

  if (tab === 'tarot' || mode === 'tarot') return { activeTab: 'tarot', kinhDichMode: 'casting' };
  if (tab === 'journal') return { activeTab: 'journal', kinhDichMode: 'casting' };
  if (mode === 'manual' || mode === 'ai-reading' || mode === 'casting') {
    return { activeTab: 'kinhdich', kinhDichMode: mode };
  }
  if (tab === 'kinhdich') return { activeTab: 'kinhdich', kinhDichMode: 'casting' };
  return { activeTab: 'home', kinhDichMode: 'casting' };
};

const App: React.FC = () => {
  useScrollReveal();
  const [initialNavigation] = useState(getInitialNavigation);
  const [activeTab, setActiveTab] = useState<TabType>(initialNavigation.activeTab);
  const [kinhDichMode, setKinhDichMode] = useState<'casting' | 'manual' | 'ai-reading'>(initialNavigation.kinhDichMode);

  const handleCastingClick = () => {
    setKinhDichMode('casting');
    setActiveTab('kinhdich');
    window.history.pushState({}, '', '?mode=casting');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleManualClick = () => {
    setKinhDichMode('manual');
    setActiveTab('kinhdich');
    // Update URL without reloading
    window.history.pushState({}, '', '?mode=manual');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <main style={{ minHeight: '80vh' }}>
        {activeTab === 'home' && (
          <div className="fade-in">
            <HeroSection onCastingClick={handleCastingClick} onManualClick={handleManualClick} />
            <GallerySection />
          </div>
        )}

        {activeTab === 'kinhdich' && (
          <KinhDichPage defaultMode={kinhDichMode} onModeChange={setKinhDichMode} />
        )}

        {activeTab === 'tarot' && (
          <div className="fade-in tarot-page-shell">
            <TarotSection />
            <DecisionSection />
          </div>
        )}

        {activeTab === 'journal' && (
          <JournalSection />
        )}
      </main>

      <Footer />
    </>
  );
};

export default App;
