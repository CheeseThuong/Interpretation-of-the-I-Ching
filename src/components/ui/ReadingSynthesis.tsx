import React, { useState } from 'react';
import type { TarotSynthesis, KinhDichSynthesis, SignalType, PositionAnalysis } from '../../lib/readings/synthesis';

const SIGNAL: Record<SignalType, { label: string; color: string; bg: string }> = {
  proceed:     { label: 'Tiến hành',      color: '#4ade80', bg: 'rgba(74,222,128,0.12)'   },
  wait:        { label: 'Nên chờ',        color: '#fbbf24', bg: 'rgba(251,191,36,0.12)'   },
  avoid:       { label: 'Cần thận trọng', color: '#f87171', bg: 'rgba(248,113,113,0.12)'  },
  conditional: { label: 'Có điều kiện',   color: '#a78bfa', bg: 'rgba(167,139,250,0.12)'  },
  unclear:     { label: 'Chưa rõ',        color: '#94a3b8', bg: 'rgba(148,163,184,0.12)'  },
  reflection:  { label: 'Chiêm nghiệm',   color: '#67e8f9', bg: 'rgba(103,232,249,0.12)'  },
};

const POSITION_COLORS = ['#a78bfa','#f87171','#fbbf24','#4ade80','#60a5fa'];

const Div = () => <div style={{ height:'1px', background:'linear-gradient(90deg,transparent,rgba(212,175,55,0.3),transparent)', margin:'18px 0' }} />;
const Lbl: React.FC<{ t: string }> = ({ t }) => <div style={{ fontSize:'0.68rem', textTransform:'uppercase', letterSpacing:'1.5px', color:'rgba(212,175,55,0.55)', marginBottom:'5px' }}>{t}</div>;
const Wrap: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ background:'rgba(10,5,20,0.65)', border:'1px solid rgba(212,175,55,0.18)', borderRadius:'16px', padding:'26px 28px', marginBottom:'28px', backdropFilter:'blur(12px)' }}>{children}</div>
);
const Badge: React.FC<{ s: SignalType }> = ({ s }) => {
  const c = SIGNAL[s];
  return <span style={{ display:'inline-block', padding:'4px 16px', borderRadius:'50px', background:c.bg, color:c.color, border:`1px solid ${c.color}`, fontWeight:700, fontSize:'0.8rem' }}>{c.label}</span>;
};

/* single position card */
const PositionCard: React.FC<{ pa: PositionAnalysis; idx: number; defaultOpen: boolean }> = ({ pa, idx, defaultOpen }) => {
  const [open, setOpen] = useState(defaultOpen);
  const accentColor = POSITION_COLORS[idx % POSITION_COLORS.length];
  return (
    <div style={{ borderRadius:'12px', background:'rgba(255,255,255,0.025)', border:`1px solid rgba(255,255,255,0.08)`, borderLeft:`4px solid ${accentColor}`, marginBottom:'14px', overflow:'hidden' }}>
      {/* header — always visible */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width:'100%', background:'none', border:'none', cursor:'pointer', padding:'16px 20px', display:'flex', justifyContent:'space-between', alignItems:'center', textAlign:'left', gap:'12px' }}
      >
        <div style={{ flex:1 }}>
          <div style={{ fontSize:'0.68rem', color:accentColor, textTransform:'uppercase', letterSpacing:'1.2px', marginBottom:'3px' }}>
            Vị trí {idx+1} — {pa.positionLabel}
          </div>
          <div style={{ fontSize:'1rem', color:'#fff', fontWeight:600 }}>
            {pa.cardNameVi} <span style={{ fontWeight:400, fontSize:'0.85rem', color: pa.orientation==='reversed'?'#f87171':'#4ade80' }}>({pa.orientation==='reversed'?'NGƯỢC':'XUÔI'})</span>
          </div>
        </div>
        <span style={{ color:'rgba(212,175,55,0.6)', fontSize:'0.85rem', flexShrink:0 }}>{open?'▲':'▼'}</span>
      </button>

      {open && (
        <div style={{ padding:'0 20px 18px' }}>
          {/* position function */}
          <div style={{ padding:'10px 14px', borderRadius:'8px', background:'rgba(255,255,255,0.04)', marginBottom:'14px' }}>
            <Lbl t="Vai trò của vị trí này" />
            <p style={{ margin:0, fontSize:'0.88rem', lineHeight:1.65, color:'rgba(255,255,255,0.7)', fontStyle:'italic' }}>{pa.positionFunction}</p>
          </div>

          {/* keywords */}
          <div style={{ marginBottom:'12px' }}>
            <Lbl t="Từ khóa lá bài" />
            <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
              {pa.keywords.slice(0,5).map((k,i) => (
                <span key={i} style={{ fontSize:'0.72rem', padding:'2px 10px', borderRadius:'20px', background:'rgba(255,255,255,0.05)', color:'rgba(255,255,255,0.65)', border:'1px solid rgba(255,255,255,0.1)' }}>{k}</span>
              ))}
            </div>
          </div>

          {/* meaning in position */}
          <div style={{ marginBottom:'12px' }}>
            <Lbl t="Ý nghĩa trong vị trí này" />
            <p style={{ margin:0, fontSize:'0.92rem', lineHeight:1.7, color:'rgba(255,255,255,0.85)' }}>{pa.meaningInThisPosition}</p>
          </div>

          {/* meaning for question */}
          <div style={{ padding:'12px 14px', borderRadius:'8px', background:`rgba(${accentColor.replace('#','').match(/../g)!.map(x=>parseInt(x,16)).join(',')},0.08)`, marginBottom:'12px', border:`1px solid rgba(${accentColor.replace('#','').match(/../g)!.map(x=>parseInt(x,16)).join(',')},0.2)` }}>
            <Lbl t="Liên quan đến câu hỏi của bạn" />
            <p style={{ margin:0, fontSize:'0.93rem', lineHeight:1.75, color:'rgba(255,255,255,0.9)', fontWeight:500 }}>{pa.meaningForUserQuestion}</p>
          </div>

          {/* psychological + practical */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:'12px' }}>
            <div>
              <Lbl t="Trạng thái tâm lý / cảm xúc" />
              <p style={{ margin:0, fontSize:'0.88rem', lineHeight:1.65, color:'rgba(255,255,255,0.78)' }}>{pa.psychologicalInsight}</p>
            </div>
            <div>
              <Lbl t="Tín hiệu thực tế" />
              <p style={{ margin:0, fontSize:'0.88rem', lineHeight:1.65, color:'rgba(255,255,255,0.78)' }}>{pa.practicalSignal}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ── TAROT SYNTHESIS DISPLAY ── */
export const TarotSynthesisDisplay: React.FC<{ synthesis: TarotSynthesis }> = ({ synthesis }) => {
  const hasFull = synthesis.positionAnalyses && synthesis.positionAnalyses.length > 0;

  return (
    <>
      {/* Section 1: overview + signal */}
      <Wrap>
        <div style={{ display:'flex', alignItems:'center', gap:'14px', marginBottom:'18px' }}>
          <h4 style={{ margin:0, color:'var(--amber,#d4af37)', fontFamily:'"Playfair Display",serif', fontSize:'1.3rem' }}>Tong Hop Trai Bai</h4>
          <div style={{ flex:1, height:'1px', background:'linear-gradient(90deg,rgba(212,175,55,0.4),transparent)' }} />
          <Badge s={synthesis.mainSignal} />
        </div>

        <Lbl t="Tong quan" />
        <p style={{ margin:'0 0 14px', lineHeight:1.75, fontSize:'0.97rem', color:'rgba(255,255,255,0.88)' }}>{synthesis.overview}</p>

        <Div />

        <Lbl t="Tom tat 1 dong" />
        <p style={{ margin:'0 0 14px', fontStyle:'italic', color:'rgba(212,175,55,0.9)', fontSize:'0.97rem' }}>{synthesis.oneLineSummary}</p>

        {synthesis.combinedConclusion && (
          <>
            <Div />
            <Lbl t="Ket luan tong hop" />
            <p style={{ margin:0, lineHeight:1.78, fontSize:'0.95rem', color:'rgba(255,255,255,0.88)' }}>{synthesis.combinedConclusion}</p>
          </>
        )}
      </Wrap>

      {/* Section 2: per-position */}
      {hasFull && (
        <Wrap>
          <div style={{ display:'flex', alignItems:'center', gap:'14px', marginBottom:'18px' }}>
            <h4 style={{ margin:0, color:'var(--amber,#d4af37)', fontFamily:'"Playfair Display",serif', fontSize:'1.2rem' }}>Vai Tro Tung La</h4>
            <div style={{ flex:1, height:'1px', background:'linear-gradient(90deg,rgba(212,175,55,0.3),transparent)' }} />
          </div>
          {synthesis.positionAnalyses.map((pa, i) => (
            <PositionCard key={i} pa={pa} idx={i} defaultOpen={synthesis.positionAnalyses.length <= 2} />
          ))}
        </Wrap>
      )}

      {/* Section 3: advice + tension */}
      <Wrap>
        <div style={{ display:'flex', alignItems:'center', gap:'14px', marginBottom:'18px' }}>
          <h4 style={{ margin:0, color:'var(--amber,#d4af37)', fontFamily:'"Playfair Display",serif', fontSize:'1.2rem' }}>Loi Khuyen Phu Hop</h4>
          <div style={{ flex:1, height:'1px', background:'linear-gradient(90deg,rgba(212,175,55,0.3),transparent)' }} />
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:'16px' }}>
          <div>
            <Lbl t="Loi khuyen chinh" />
            <p style={{ margin:0, fontSize:'0.93rem', lineHeight:1.7, color:'rgba(255,255,255,0.88)' }}>{synthesis.keyAdvice}</p>
          </div>
          <div>
            <Lbl t="Diem can chu y / cang thang" />
            <p style={{ margin:0, fontSize:'0.93rem', lineHeight:1.7, color:'rgba(255,255,255,0.82)' }}>{synthesis.keyTension}</p>
          </div>
        </div>
      </Wrap>
    </>
  );
};

/* ── KINH DICH SYNTHESIS DISPLAY (unchanged) ── */
export const KinhDichSynthesisDisplay: React.FC<{ synthesis: KinhDichSynthesis }> = ({ synthesis }) => (
  <Wrap>
    <div style={{ display:'flex', alignItems:'center', gap:'14px', marginBottom:'18px' }}>
      <h4 style={{ margin:0, color:'var(--amber,#d4af37)', fontFamily:'"Playfair Display",serif', fontSize:'1.3rem' }}>Tong Hop Que</h4>
      <div style={{ flex:1, height:'1px', background:'linear-gradient(90deg,rgba(212,175,55,0.4),transparent)' }} />
      <Badge s={synthesis.mainSignal} />
    </div>

    <Lbl t="Tong quan" />
    <p style={{ margin:'0 0 14px', lineHeight:1.75, fontSize:'0.97rem', color:'rgba(255,255,255,0.88)' }}>{synthesis.overview}</p>
    <Div />

    {[
      { label:'Que chinh — tinh huong hien tai', text:synthesis.primaryHexagramSummary, color:'rgba(212,175,55,0.5)' },
      { label:'Hao dong — diem bien chuyen',    text:synthesis.movingLinesSummary,      color:'rgba(167,139,250,0.5)' },
      { label:'Que bien — xu huong tiep theo',  text:synthesis.changedHexagramSummary,  color:'rgba(103,232,249,0.4)' },
    ].map(({ label, text, color }, i) => (
      <div key={i} style={{ padding:'12px 14px', borderRadius:'8px', background:'rgba(255,255,255,0.03)', borderLeft:`3px solid ${color}`, marginBottom:'12px' }}>
        <Lbl t={label} />
        <p style={{ margin:0, fontSize:'0.9rem', lineHeight:1.7, color:'rgba(255,255,255,0.85)' }}>{text}</p>
      </div>
    ))}

    <Div />
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:'14px' }}>
      <div><Lbl t="Tong hop xu huong" /><p style={{ margin:0, fontSize:'0.9rem', lineHeight:1.7, color:'rgba(255,255,255,0.82)' }}>{synthesis.patternSummary}</p></div>
      <div><Lbl t="Diem can luu y" /><p style={{ margin:0, fontSize:'0.9rem', lineHeight:1.7, color:'rgba(255,255,255,0.82)' }}>{synthesis.keyTension}</p></div>
    </div>
    <Div />
    <Lbl t="Loi khuyen tong hop" />
    <p style={{ margin:'0 0 14px', fontSize:'0.93rem', lineHeight:1.7, color:'rgba(255,255,255,0.9)' }}>{synthesis.keyAdvice}</p>
    <div style={{ padding:'12px 16px', borderRadius:'8px', background:'rgba(212,175,55,0.07)', border:'1px solid rgba(212,175,55,0.2)' }}>
      <Lbl t="Tom tat 1 dong" />
      <p style={{ margin:0, fontStyle:'italic', color:'rgba(212,175,55,0.9)', fontSize:'0.95rem' }}>{synthesis.oneLineSummary}</p>
    </div>
  </Wrap>
);
