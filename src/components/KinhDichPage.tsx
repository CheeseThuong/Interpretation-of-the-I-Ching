import React, { useState } from 'react';
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
    <div className="fade-in">
      {/* Page header */}
      <div className="tab-header section dark-section" style={{ paddingBottom: '0' }}>
        <div className="container">
          <div className="section-title reveal light-title" style={{ marginBottom: '36px' }}>
            <p className="eyebrow">Kinh Dịch</p>
            <h2>Kinh Dịch Truyền Thống</h2>
            <p>Lập quẻ, luận giải bằng AI và tra cứu 64 quẻ.</p>
          </div>

          {/* Internal sub-tab selector */}
          <div className="kd-sub-tabs" role="tablist" aria-label="Chọn chế độ Kinh Dịch">
            <button
              role="tab"
              aria-selected={kdTab === 'casting'}
              className={`kd-sub-tab${kdTab === 'casting' ? ' active' : ''}`}
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
              className={`kd-sub-tab${kdTab === 'manual' ? ' active' : ''}`}
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
              className={`kd-sub-tab${kdTab === 'ai-reading' ? ' active' : ''}`}
              onClick={() => handleTabChange('ai-reading')}
              id="kd-tab-ai"
              aria-controls="kd-panel-ai"
            >
              {/* Orbit / AI sigil */}
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
      </div>

      {/* Tab panels */}
      <div className="container" style={{ paddingBottom: '80px' }}>
        {renderContent()}
      </div>
    </div>
  );
};

export default KinhDichPage;
