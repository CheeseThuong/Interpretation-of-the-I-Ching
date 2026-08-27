import React from 'react';
import { fiveElements } from '../../data/canchi';
import { heavenlyStems, earthlyBranches } from '../../data/canchi';
import { tuViStars, tuViPalaces } from '../../data/tuvi';
import { MOCK_BAT_TU_CHART } from '../../data/battu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// ── Five Elements card ─────────────────────────────────────────────────────────
const FiveElementsPanel: React.FC = () => (
  <Card className="border border-white/10 bg-white/[0.04]">
    <CardHeader>
      <CardTitle className="text-xl text-gold-soft">Ngũ Hành</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {fiveElements.map((el) => (
          <div
            key={el.name}
            className="rounded-2xl border border-white/10 bg-white/5 p-4.5 transition-transform duration-200 hover:-translate-y-1"
            style={{ '--accent': el.color } as React.CSSProperties}
          >
            <div className="mb-2.5 inline-flex rounded-full border border-[var(--accent)]/40 bg-[var(--accent)]/15 px-3 py-1.5 text-sm font-black text-[var(--accent)]">
              {el.name}
            </div>
            <p className="m-0 text-xs text-foreground/60">Sinh → {el.generates} · Khắc → {el.controls}</p>
            <p className="mt-2 text-[0.86rem] leading-relaxed text-foreground/80">{el.shortInterpretation}</p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/8 px-2 py-1 text-xs text-foreground/70">{el.direction}</span>
              <span className="rounded-full bg-white/8 px-2 py-1 text-xs text-foreground/70">{el.season}</span>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// ── Can Chi panel ──────────────────────────────────────────────────────────────
const CanChiPanel: React.FC = () => (
  <Card className="border border-white/10 bg-white/[0.04]">
    <CardHeader>
      <CardTitle className="text-xl text-gold-soft">Can Chi</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <p className="mb-3 text-xs font-black uppercase tracking-[0.15em] text-gold-soft">Thiên Can (10)</p>
          <div className="flex flex-wrap gap-2">
            {heavenlyStems.map((s) => (
              <span
                key={s.name}
                className={cn(
                  'rounded-xl border border-white/10 px-2.5 py-1.5 text-sm font-bold',
                  s.polarity === 'Dương'
                    ? 'bg-gold-soft/15 text-gold-soft'
                    : 'bg-[rgba(120,160,255,0.12)] text-[#a0b8ff]',
                )}
              >
                {s.name} <em className="ml-1 text-xs font-normal not-italic opacity-70">{s.element}</em>
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-3 text-xs font-black uppercase tracking-[0.15em] text-gold-soft">Địa Chi (12)</p>
          <div className="flex flex-wrap gap-2">
            {earthlyBranches.map((b) => (
              <span
                key={b.name}
                className={cn(
                  'rounded-xl border border-white/10 px-2.5 py-1.5 text-sm font-bold',
                  b.polarity === 'Dương'
                    ? 'bg-gold-soft/15 text-gold-soft'
                    : 'bg-[rgba(120,160,255,0.12)] text-[#a0b8ff]',
                )}
              >
                {b.name} <em className="ml-1 text-xs font-normal not-italic opacity-70">{b.element}</em>
              </span>
            ))}
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// ── Bát Tự panel ──────────────────────────────────────────────────────────────
const BatTuPanel: React.FC = () => {
  const chart = MOCK_BAT_TU_CHART;
  const pillars = [
    { label: 'Năm', data: chart.year },
    { label: 'Tháng', data: chart.month },
    { label: 'Ngày', data: chart.day },
    { label: 'Giờ', data: chart.hour },
  ];

  return (
    <Card className="border border-white/10 bg-white/[0.04]">
      <CardHeader>
        <CardTitle className="text-xl text-gold-soft">Bát Tự (Tứ Trụ)</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="m-0 rounded-2xl border border-gold-soft/20 bg-gold-soft/10 px-4 py-3 text-sm text-gold-soft/90">
          Dữ liệu mẫu — thuật toán tính Bát Tự chính xác đang được phát triển.
        </p>
        <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4">
          {pillars.map(({ label, data }) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4.5 text-center">
              <p className="m-0 mb-2.5 text-xs font-black uppercase tracking-[0.12em] text-gold-soft/70">{label}</p>
              <div className="text-2xl font-black leading-tight text-gold-soft">{data.stem.name}</div>
              <div className="my-1.5 text-xl font-bold text-foreground">{data.branch.name}</div>
              <p className="m-0 text-xs text-foreground/60">{data.element} · {data.polarity}</p>
            </div>
          ))}
        </div>
        <p className="m-0 text-[0.86rem] leading-relaxed text-foreground/80">
          Nhật chủ: <strong className="text-foreground">{chart.dayMaster.name}</strong> ({chart.dayMaster.element})
        </p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(chart.elementBalance).map(([el, count]) => (
            <span key={el} className="rounded-full bg-white/8 px-3 py-1.5 text-sm text-foreground/80">
              {el}: {count}
            </span>
          ))}
        </div>
        {chart.generalInterpretation && (
          <p className="m-0 text-[0.86rem] leading-relaxed text-foreground/80">{chart.generalInterpretation}</p>
        )}
      </CardContent>
    </Card>
  );
};

// ── Tử Vi panel ──────────────────────────────────────────────────────────────
const TuViPanel: React.FC = () => (
  <Card className="border border-white/10 bg-white/[0.04]">
    <CardHeader>
      <CardTitle className="text-xl text-gold-soft">Tử Vi</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <p className="mb-3 text-xs font-black uppercase tracking-[0.15em] text-gold-soft">12 Cung</p>
          <div className="flex flex-wrap gap-2">
            {tuViPalaces.map((p) => (
              <span
                key={p.name}
                title={p.meaning}
                className="rounded-xl border border-white/10 bg-white/8 px-2.5 py-1.5 text-sm font-bold text-foreground/85"
              >
                {p.name}
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-3 text-xs font-black uppercase tracking-[0.15em] text-gold-soft">14 Chính tinh</p>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {tuViStars.map((s) => (
              <div key={s.name} className="rounded-xl border border-white/10 bg-white/5 p-3">
                <strong className="mb-1 block text-sm text-gold-soft">{s.name}</strong>
                <span className="inline-flex rounded-full bg-white/10 px-1.5 py-0.5 text-xs font-bold text-foreground/80">
                  {s.element}
                </span>
                <p className="m-0 mt-1 text-xs leading-relaxed text-foreground/65">{s.meaning}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// ── Main Foundation Section ────────────────────────────────────────────────────
const FoundationSection: React.FC = () => (
  <section className="section foundation-section section-anchor" id="foundation">
    <div className="container">
      <div className="section-title reveal">
        <p className="eyebrow">Dữ liệu nền tảng</p>
        <h2>Hệ thống dữ liệu huyền học phương Đông</h2>
        <p>
          Nền tảng dữ liệu có cấu trúc để AI luận giải thông minh hơn.
          Các module bên dưới sẽ được bổ sung thuật toán đầy đủ theo từng giai đoạn.
        </p>
      </div>

      <div className="grid gap-7">
        <div className="reveal"><FiveElementsPanel /></div>
        <div className="reveal"><CanChiPanel /></div>
        <div className="reveal"><BatTuPanel /></div>
        <div className="reveal"><TuViPanel /></div>
      </div>
    </div>
  </section>
);

export default FoundationSection;
