import React, { useMemo } from 'react';
import type { ReadingResult } from '../../types';
import HexagramDisplay from '../ui/HexagramDisplay';
import { useReading } from '../../hooks/useReading';
import { Button } from '@/components/ui/button';

const FIELDS = ['Công việc / học tập', 'Tình cảm', 'Tài chính', 'Gia đình', 'Dự án cá nhân'];
const MOODS  = ['Bình tĩnh', 'Lo lắng', 'Đang vội', 'Phân vân', 'Tự tin'];
const DEFAULT_Q = 'Có nên bắt đầu kế hoạch này trong tháng này không?';

interface HeroSectionProps {
  onCastingClick?: () => void;
  onManualClick?: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onCastingClick, onManualClick }) => {
  const { computeReading } = useReading();
  const sample: ReadingResult = useMemo(
    () => computeReading(DEFAULT_Q, FIELDS[0], MOODS[0]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <section
      id="home"
      className="section-anchor relative overflow-hidden border-b border-border py-16 md:py-[88px]"
    >
      <div
        aria-hidden
        className="absolute -top-[110px] left-1/2 h-[540px] w-[540px] -translate-x-1/2 rounded-full bg-amber-500/20 blur-[70px]"
      />
      <div className="relative z-[2] mx-auto grid w-[min(var(--container),calc(100%-32px))] grid-cols-1 items-center gap-12 md:grid-cols-[1.05fr_0.95fr]">
        <div className="reveal">
          <p className="mb-2.5 inline-flex items-center rounded-full border border-[var(--border-gold)] bg-card-soft px-4 py-2 text-[0.8rem] font-bold uppercase tracking-[0.1em] text-gold-soft shadow-[0_2px_12px_rgba(0,0,0,0.4)] backdrop-blur-[10px]">
            Luận quẻ miễn phí · AI decision helper
          </p>
          <h1 className="m-0 max-w-[800px] font-heading text-[clamp(2.8rem,16vw,4.5rem)] leading-[0.93] tracking-[-0.03em] text-foreground md:text-[clamp(3rem,7vw,6.8rem)] md:tracking-[-0.08em]">
            Kinh Dịch AI cho người đang cần một góc nhìn rõ hơn.
          </h1>
          <p className="mt-6 max-w-[680px] text-[1.12rem] leading-[1.8] text-muted-foreground">
            Website kết hợp cấu trúc 64 quẻ, dữ liệu cổ bản, ngữ cảnh câu hỏi,
            lục hào từ đồng xu thật và thuật toán quyết định có trọng số để đưa ra
            lời khuyên dễ hiểu, không mê tín hóa và có thể hành động.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              size="lg"
              className="h-12 rounded-2xl px-6 text-base font-extrabold shadow-[var(--shadow-card)]"
              onClick={() => onCastingClick?.()}
            >
              Gieo quẻ thử →
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="h-12 rounded-2xl px-6 text-base font-extrabold"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onManualClick?.();
              }}
            >
              Nhập lục hào ngoài đời
            </Button>
          </div>
        </div>

        <aside className="reveal rounded-[34px] border border-[var(--border-gold)] bg-[rgba(16,16,26,0.85)] p-4.5 shadow-[var(--shadow-soft)] backdrop-blur-[12px]">
          <div className="rounded-[26px] border border-border bg-card p-7 text-foreground backdrop-blur-[12px]">
            <p className="mb-3 text-[0.78rem] font-black uppercase tracking-[0.2em] text-[#f6d48b]">
              Quẻ mẫu hôm nay
            </p>
            <div className="flex items-start justify-between gap-5 max-[600px]:flex-col">
              <div>
                <h2 className="m-0 font-heading text-2xl">
                  {sample.upper.name} trên {sample.lower.name}
                </h2>
                <p className="mt-1 text-muted-foreground">
                  {sample.upper.nature} / {sample.lower.nature}
                </p>
              </div>
              <div className="text-[3.2rem] leading-none tracking-[-0.02em] text-gold-soft">
                {sample.upper.symbol}{sample.lower.symbol}
              </div>
            </div>
            <HexagramDisplay
              lines={sample.lines}
              ariaLabel="Hình quẻ mẫu"
            />
            <p className="mt-6 text-[1.05rem] leading-[1.7] text-foreground/90">{sample.theme}</p>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default HeroSection;
