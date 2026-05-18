import React, { useState } from 'react';
import '../styles/kinh-dich-vip.css';
import InteractiveCoinSection from './sections/InteractiveCoinSection';
import ReadingSection from './sections/ReadingSection';
import FoundationSection from './sections/FoundationSection';
import CoinSection from './sections/CoinSection';

interface KinhDichPageProps {
  defaultMode?: 'casting' | 'manual' | 'ai-reading';
  onModeChange?: (mode: 'casting' | 'manual' | 'ai-reading') => void;
}

const KinhDichPage: React.FC<KinhDichPageProps> = ({ defaultMode = 'casting', onModeChange }) => {
  const [kdTab, setKdTab] = useState<'casting' | 'manual' | 'ai-reading'>(defaultMode);

  // Sync state with prop if it changes externally (e.g. from homepage hero button)
  React.useEffect(() => {
    // Only update if it's a valid mode
    if (defaultMode === 'casting' || defaultMode === 'manual' || defaultMode === 'ai-reading') {
      setKdTab(defaultMode);
    }
  }, [defaultMode]);

  const handleTabChange = (newTab: 'casting' | 'manual' | 'ai-reading') => {
    setKdTab(newTab);
    if (onModeChange) onModeChange(newTab);
    
    // Also update URL for consistency if user manually switches tabs
    const url = new URL(window.location.href);
    url.searchParams.set('mode', newTab);
    window.history.replaceState({}, '', url.toString());
  };

  // Determine what to render based on current tab
  const renderContent = () => {
    switch (kdTab) {
      case 'casting':
        return <InteractiveCoinSection />;
      case 'manual':
        return <CoinSection />;
      case 'ai-reading':
        return (
          <>
            <ReadingSection />
            <FoundationSection />
          </>
        );
      default:
        return (
          <div className="panel dark-panel" style={{ textAlign: 'center', padding: '60px' }}>
            <h3 style={{ color: 'var(--gold)' }}>Không tìm thấy chế độ yêu cầu</h3>
            <p>Đang quay lại chế độ tự gieo quẻ truyền thống...</p>
            <button className="button primary-button" onClick={() => handleTabChange('casting')}>
              Quay lại
            </button>
          </div>
        );
    }
  };

  return (
    <div className="kd-vip-container fade-in">
      <div className="kd-vip-glow" />
      <div className="kd-vip-stars" />
      
      <div className="kd-motif-left">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
          <path d="M50 10 L50 90 M10 50 L90 50" stroke="currentColor" strokeWidth="1" opacity="0.5" />
        </svg>
      </div>
      <div className="kd-motif-right">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="1" opacity="0.3" />
          <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="2" />
          <circle cx="50" cy="50" r="15" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
        </svg>
      </div>

      <div className="kd-vip-content">
        <div className="kd-vip-header">
          <div className="kd-eyebrow">Kinh Dịch</div>
          <h2 className="kd-vip-title">Kinh Dịch Truyền Thống</h2>
          <p className="kd-vip-subtitle">Lập quẻ, giải đoán với năng lượng AI, và chiêm nghiệm đạo lý của 64 quẻ.</p>
          
          <div className="kd-vip-tabs" role="tablist" aria-label="Chọn chế độ Kinh Dịch">
            <button
              role="tab"
              aria-selected={kdTab === 'casting'}
              className={`kd-vip-tab${kdTab === 'casting' ? ' active' : ''}`}
              onClick={() => handleTabChange('casting')}
              id="kd-tab-casting"
              aria-controls="kd-panel-casting"
            >
              <svg width="16" height="12" viewBox="0 0 16 12" fill="none" style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} aria-hidden="true">
                <line x1="0" y1="1" x2="16" y2="1" stroke="currentColor" strokeWidth="1.6"/>
                <line x1="0" y1="6" x2="6" y2="6" stroke="currentColor" strokeWidth="1.6"/>
                <line x1="10" y1="6" x2="16" y2="6" stroke="currentColor" strokeWidth="1.6"/>
                <line x1="0" y1="11" x2="16" y2="11" stroke="currentColor" strokeWidth="1.6"/>
              </svg>
              Tự Gieo Quẻ
            </button>

            <button
              role="tab"
              aria-selected={kdTab === 'manual'}
              className={`kd-vip-tab${kdTab === 'manual' ? ' active' : ''}`}
              onClick={() => handleTabChange('manual')}
              id="kd-tab-manual"
              aria-controls="kd-panel-manual"
            >
              <svg width="16" height="12" viewBox="0 0 16 12" fill="none" style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} aria-hidden="true">
                <circle cx="2.5" cy="6" r="2" fill="currentColor"/>
                <circle cx="8" cy="6" r="2" fill="currentColor"/>
                <circle cx="13.5" cy="6" r="2" fill="currentColor"/>
              </svg>
              Nhập Quẻ Thủ Công
            </button>

            <button
              role="tab"
              aria-selected={kdTab === 'ai-reading'}
              className={`kd-vip-tab${kdTab === 'ai-reading' ? ' active' : ''}`}
              onClick={() => handleTabChange('ai-reading')}
              id="kd-tab-ai"
              aria-controls="kd-panel-ai"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} aria-hidden="true">
                <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4"/>
                <circle cx="8" cy="8" r="2" fill="currentColor"/>
                <line x1="8" y1="1" x2="8" y2="4.5" stroke="currentColor" strokeWidth="1.4"/>
                <line x1="8" y1="11.5" x2="8" y2="15" stroke="currentColor" strokeWidth="1.4"/>
              </svg>
              Luận Quẻ AI
            </button>
          </div>
        </div>

        <div className="kd-vip-card-wrapper" style={{ paddingBottom: '80px' }}>
          <div className="kd-vip-card">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KinhDichPage;
