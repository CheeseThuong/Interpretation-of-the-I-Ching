/**
 * src/components/ui/ReadingSynthesis.tsx
 *
 * Displays a structured synthesis summary before AI interpretation.
 * Used by both TarotSection and InteractiveCoinSection.
 */
import React from 'react';
import type { TarotSynthesis, KinhDichSynthesis, SignalType } from '../../lib/readings/synthesis';

/* ── signal badge config ─────────────────────────────────────── */
const SIGNAL_CONFIG: Record<SignalType, { label: string; color: string; bg: string }> = {
  proceed:     { label: 'Tiến hành',    color: '#4ade80', bg: 'rgba(74,222,128,0.12)'   },
  wait:        { label: 'Nên chờ',      color: '#fbbf24', bg: 'rgba(251,191,36,0.12)'   },
  avoid:       { label: 'Cần thận trọng', color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
  conditional: { label: 'Có điều kiện', color: '#a78bfa', bg: 'rgba(167,139,250,0.12)'  },
  unclear:     { label: 'Chưa rõ',      color: '#94a3b8', bg: 'rgba(148,163,184,0.12)'  },
  reflection:  { label: 'Chiêm nghiệm', color: '#67e8f9', bg: 'rgba(103,232,249,0.12)'  },
};

/* ── shared primitives ───────────────────────────────────────── */
const Divider = () => (
  <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent)', margin: '20px 0' }} />
);

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'rgba(212,175,55,0.6)', marginBottom: '6px' }}>
    {children}
  </div>
);

const SignalBadge: React.FC<{ signal: SignalType }> = ({ signal }) => {
  const cfg = SIGNAL_CONFIG[signal];
  return (
    <span style={{
      display: 'inline-block',
      padding: '5px 18px',
      borderRadius: '50px',
      background: cfg.bg,
      color: cfg.color,
      border: `1px solid ${cfg.color}`,
      fontWeight: 700,
      fontSize: '0.82rem',
      letterSpacing: '0.5px',
    }}>
      {cfg.label}
    </span>
  );
};

const SectionWrap: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{
    background: 'rgba(10, 5, 20, 0.65)',
    border: '1px solid rgba(212,175,55,0.18)',
    borderRadius: '16px',
    padding: '28px 30px',
    marginBottom: '32px',
    backdropFilter: 'blur(12px)',
  }}>
    {children}
  </div>
);

/* ── TAROT synthesis display ─────────────────────────────────── */
interface TarotSynthesisProps { synthesis: TarotSynthesis; }

export const TarotSynthesisDisplay: React.FC<TarotSynthesisProps> = ({ synthesis }) => (
  <SectionWrap>
    {/* Header */}
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '22px' }}>
      <h4 style={{ margin: 0, color: 'var(--amber, #d4af37)', fontFamily: '"Playfair Display", serif', fontSize: '1.35rem' }}>
        Tong Hop Trai Bai
      </h4>
      <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(212,175,55,0.4), transparent)' }} />
      <SignalBadge signal={synthesis.mainSignal} />
    </div>

    {/* Overview */}
    <div style={{ marginBottom: '20px' }}>
      <Label>Tong quan</Label>
      <p style={{ margin: 0, lineHeight: 1.75, fontSize: '1rem', color: 'rgba(255,255,255,0.88)' }}>
        {synthesis.overview}
      </p>
    </div>

    <Divider />

    {/* Card summaries */}
    <div style={{ marginBottom: '20px' }}>
      <Label>Y nghia tung la theo vi tri</Label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
        {synthesis.cardSummaries.map((cs, i) => (
          <div key={i} style={{
            padding: '14px 16px',
            borderRadius: '10px',
            background: 'rgba(255,255,255,0.03)',
            borderLeft: `3px solid ${cs.orientation === 'reversed' ? '#f87171' : 'rgba(212,175,55,0.5)'}`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap', gap: '6px' }}>
              <span style={{ color: 'rgba(212,175,55,0.9)', fontWeight: 600, fontSize: '0.9rem' }}>{cs.position}</span>
              <span style={{ fontSize: '0.75rem', color: cs.orientation === 'reversed' ? '#f87171' : '#4ade80', fontWeight: 700 }}>
                {cs.cardNameVi} — {cs.orientation === 'reversed' ? 'NGUOC' : 'XUOI'}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.92rem', lineHeight: 1.65, color: 'rgba(255,255,255,0.8)' }}>
              {cs.meaningInPosition}
            </p>
          </div>
        ))}
      </div>
    </div>

    <Divider />

    {/* Pattern + Tension */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '20px' }}>
      <div>
        <Label>Moi lien he giua cac la</Label>
        <p style={{ margin: 0, fontSize: '0.92rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.82)' }}>{synthesis.patternSummary}</p>
      </div>
      <div>
        <Label>Diem can chu y</Label>
        <p style={{ margin: 0, fontSize: '0.92rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.82)' }}>{synthesis.keyTension}</p>
      </div>
    </div>

    <Divider />

    {/* Key advice */}
    <div style={{ marginBottom: '18px' }}>
      <Label>Loi khuyen tu tong hop</Label>
      <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.9)' }}>{synthesis.keyAdvice}</p>
    </div>

    {/* One-line summary */}
    <div style={{ marginTop: '20px', padding: '14px 18px', borderRadius: '10px', background: 'rgba(212,175,55,0.07)', border: '1px solid rgba(212,175,55,0.2)' }}>
      <Label>Tom tat 1 dong</Label>
      <p style={{ margin: 0, fontStyle: 'italic', color: 'rgba(212,175,55,0.9)', fontSize: '1rem', lineHeight: 1.5 }}>
        {synthesis.oneLineSummary}
      </p>
    </div>
  </SectionWrap>
);

/* ── KINH DICH synthesis display ─────────────────────────────── */
interface KinhDichSynthesisProps { synthesis: KinhDichSynthesis; }

export const KinhDichSynthesisDisplay: React.FC<KinhDichSynthesisProps> = ({ synthesis }) => (
  <SectionWrap>
    {/* Header */}
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '22px' }}>
      <h4 style={{ margin: 0, color: 'var(--amber, #d4af37)', fontFamily: '"Playfair Display", serif', fontSize: '1.35rem' }}>
        Tong Hop Que
      </h4>
      <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(212,175,55,0.4), transparent)' }} />
      <SignalBadge signal={synthesis.mainSignal} />
    </div>

    {/* Overview */}
    <div style={{ marginBottom: '20px' }}>
      <Label>Tong quan</Label>
      <p style={{ margin: 0, lineHeight: 1.75, fontSize: '1rem', color: 'rgba(255,255,255,0.88)' }}>
        {synthesis.overview}
      </p>
    </div>

    <Divider />

    {/* Three hexagram blocks */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
      {[
        { label: 'Que chinh — tinh huong hien tai',  text: synthesis.primaryHexagramSummary,   color: 'rgba(212,175,55,0.5)' },
        { label: 'Hao dong — diem dang bien chuyen', text: synthesis.movingLinesSummary,        color: 'rgba(167,139,250,0.5)' },
        { label: 'Que bien — xu huong tiep theo',    text: synthesis.changedHexagramSummary,    color: 'rgba(103,232,249,0.4)' },
      ].map(({ label, text, color }, i) => (
        <div key={i} style={{ padding: '14px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', borderLeft: `3px solid ${color}` }}>
          <Label>{label}</Label>
          <p style={{ margin: 0, fontSize: '0.92rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.85)' }}>{text}</p>
        </div>
      ))}
    </div>

    <Divider />

    {/* Pattern + Tension */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '20px' }}>
      <div>
        <Label>Tong hop que chu + hao dong + que bien</Label>
        <p style={{ margin: 0, fontSize: '0.92rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.82)' }}>{synthesis.patternSummary}</p>
      </div>
      <div>
        <Label>Diem can luu y</Label>
        <p style={{ margin: 0, fontSize: '0.92rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.82)' }}>{synthesis.keyTension}</p>
      </div>
    </div>

    <Divider />

    {/* Key advice */}
    <div style={{ marginBottom: '18px' }}>
      <Label>Loi khuyen tu tong hop</Label>
      <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.9)' }}>{synthesis.keyAdvice}</p>
    </div>

    {/* One-line summary */}
    <div style={{ marginTop: '20px', padding: '14px 18px', borderRadius: '10px', background: 'rgba(212,175,55,0.07)', border: '1px solid rgba(212,175,55,0.2)' }}>
      <Label>Tom tat 1 dong</Label>
      <p style={{ margin: 0, fontStyle: 'italic', color: 'rgba(212,175,55,0.9)', fontSize: '1rem', lineHeight: 1.5 }}>
        {synthesis.oneLineSummary}
      </p>
    </div>
  </SectionWrap>
);
