import React from 'react';
import Header from './components/Header';
import HeroSection from './components/sections/HeroSection';
import ReadingSection from './components/sections/ReadingSection';
import CoinSection from './components/sections/CoinSection';
import DecisionSection from './components/sections/DecisionSection';
import DataSection from './components/sections/DataSection';
import FoundationSection from './components/sections/FoundationSection';
import GallerySection from './components/sections/GallerySection';
import Footer from './components/Footer';
import { useScrollReveal, useActiveNav } from './hooks/useScrollEffects';

const App: React.FC = () => {
  useScrollReveal();
  useActiveNav();

  return (
    <>
      <Header />

      <main>
        <HeroSection />
        <ReadingSection />
        <CoinSection />
        <DecisionSection />
        <DataSection />
        <FoundationSection />
        <GallerySection />

        {/* UI checklist */}
        <section className="section">
          <div className="container">
            <div className="section-title reveal">
              <p className="eyebrow">UI/UX checklist</p>
              <h2>Các tiêu chuẩn đã thêm vào prototype</h2>
              <p>
                Responsive desktop/tablet/mobile, sticky navigation, hamburger menu,
                focus state, alt text, image loading placeholder, scroll reveal,
                smooth scroll và modal animation.
              </p>
            </div>
            <div className="checklist-grid">
              {[
                '✅ Responsive layout',
                '✅ Sticky header + mobile menu',
                '✅ Scroll reveal animation',
                '✅ Active navigation state',
                '✅ Image loading placeholder',
                '✅ Accessibility cơ bản',
              ].map((item) => (
                <div key={item} className="check-card reveal">{item}</div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default App;
