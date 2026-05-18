import React, { useState } from 'react';
import Header, { type TabType } from './components/Header';
import HeroSection from './components/sections/HeroSection';
import KinhDichPage from './components/KinhDichPage';
import TarotSection from './components/sections/TarotSection';
import DecisionSection from './components/sections/DecisionSection';
import GallerySection from './components/sections/GallerySection';
import Footer from './components/Footer';
import { useScrollReveal } from './hooks/useScrollEffects';

const App: React.FC = () => {
  useScrollReveal();
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [kinhDichMode, setKinhDichMode] = useState<'casting' | 'manual' | 'ai-reading'>('casting');

  // Handle URL query parameters for deep-linking
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    const tab = params.get('tab');
    
    if (tab === 'tarot' || mode === 'tarot') {
      setActiveTab('tarot');
    } else if (tab === 'journal') {
      setActiveTab('journal');
    } else if (mode === 'casting') {
      setKinhDichMode('casting');
      setActiveTab('kinhdich');
    } else if (mode === 'manual') {
      setKinhDichMode('manual');
      setActiveTab('kinhdich');
    } else if (mode === 'ai-reading') {
      setKinhDichMode('ai-reading');
      setActiveTab('kinhdich');
    } else if (tab === 'kinhdich') {
      setActiveTab('kinhdich');
    } else if (tab === 'home') {
      setActiveTab('home');
    }
  }, []);

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
          <div className="fade-in">
            <div className="tab-header section dark-section" style={{ paddingBottom: '0' }}>
              <div className="container">
                <div className="section-title reveal light-title">
                  <h2>Tarot & Quyết Định</h2>
                  <p>Các trải bài Tarot và công cụ hỗ trợ quyết định.</p>
                </div>
              </div>
            </div>
            <TarotSection />
            <DecisionSection />
          </div>
        )}

        {activeTab === 'journal' && (
          <div className="fade-in">
            <div className="tab-header section dark-section">
              <div className="container">
                <div className="section-title reveal light-title">
                  <h2>Nhật ký Tâm linh</h2>
                  <p>Lịch sử các lần gieo quẻ và trải bài của bạn (Sắp ra mắt).</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
};

export default App;
