import React, { useMemo } from 'react';
import type { ReadingResult } from '../../types';
import HexagramDisplay from '../ui/HexagramDisplay';
import { useReading } from '../../hooks/useReading';

const FIELDS = ['Công việc / học tập', 'Tình cảm', 'Tài chính', 'Gia đình', 'Dự án cá nhân'];
const MOODS  = ['Bình tĩnh', 'Lo lắng', 'Đang vội', 'Phân vân', 'Tự tin'];
const DEFAULT_Q = 'Có nên bắt đầu kế hoạch này trong tháng này không?';

interface HeroSectionProps {
  onManualClick?: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onManualClick }) => {
  const { computeReading } = useReading();
  const sample: ReadingResult = useMemo(
    () => computeReading(DEFAULT_Q, FIELDS[0], MOODS[0]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <section className="hero section-anchor" id="home">
      <div className="hero-glow" />
      <div className="container hero-grid">
        <div className="hero-content reveal">
          <p className="eyebrow pill">Luận quẻ miễn phí · AI decision helper</p>
          <h1>Kinh Dịch AI cho người đang cần một góc nhìn rõ hơn.</h1>
          <p className="hero-text">
            Website kết hợp cấu trúc 64 quẻ, dữ liệu cổ bản, ngữ cảnh câu hỏi,
            lục hào từ đồng xu thật và thuật toán quyết định có trọng số để đưa ra
            lời khuyên dễ hiểu, không mê tín hóa và có thể hành động.
          </p>
          <div className="hero-actions">
            <a className="button primary-button" href="#reading">Gieo quẻ thử →</a>
            <button 
              type="button"
              className="button secondary-button" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onManualClick) onManualClick();
              }}
            >
              Nhập lục hào ngoài đời
            </button>
          </div>
        </div>

        <aside className="hero-card reveal">
          <div className="oracle-card dark-card">
            <p className="small-title">Quẻ mẫu hôm nay</p>
            <div className="oracle-header">
              <div>
                <h2 id="heroHexName">{sample.upper.name} trên {sample.lower.name}</h2>
                <p id="heroHexNature">{sample.upper.nature} / {sample.lower.nature}</p>
              </div>
              <div className="big-symbol" id="heroHexSymbol">
                {sample.upper.symbol}{sample.lower.symbol}
              </div>
            </div>
            <HexagramDisplay
              lines={sample.lines}
              ariaLabel="Hình quẻ mẫu"
            />
            <p className="oracle-summary" id="heroHexSummary">{sample.theme}</p>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default HeroSection;
