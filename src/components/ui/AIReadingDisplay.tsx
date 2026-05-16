import React from 'react';
import type { UnifiedAIReadingResponse, TarotCardReading } from '../../types/ai';

interface Props { response: UnifiedAIReadingResponse; }

const SIGNAL = {
  proceed:     { label: 'Có thể tiến hành', color: '#4ade80', bg: 'rgba(74,222,128,0.1)' },
  wait:        { label: 'Nên chờ thêm',     color: '#fbbf24', bg: 'rgba(251,191,36,0.1)' },
  avoid:       { label: 'Không nên vội',    color: '#f87171', bg: 'rgba(248,113,113,0.1)' },
  unclear:     { label: 'Chưa đủ rõ',       color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
  conditional: { label: 'Có điều kiện',     color: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
};

/* ── shared primitives ─────────────────────────────────────────── */
const SectionHead: React.FC<{ title: string }> = ({ title }) => (
  <div style={{ display:'flex', alignItems:'center', gap:'15px', marginBottom:'22px' }}>
    <h4 style={{ color:'var(--gold)', margin:0 }}>{title}</h4>
    <div style={{ height:'1px', flex:1, background:'linear-gradient(90deg,var(--glass-border),transparent)' }} />
  </div>
);

const GlassBox: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div className="glass-box" style={{ padding:'25px', ...style }}>{children}</div>
);

const Tag: React.FC<{ color: string; bg: string; label: string }> = ({ color, bg, label }) => (
  <span style={{ fontSize:'0.7rem', padding:'2px 8px', borderRadius:'4px', background:bg, color }}>{label}</span>
);

/* ── DAILY layout ──────────────────────────────────────────────── */
const DailyLayout: React.FC<{ r: UnifiedAIReadingResponse }> = ({ r }) => (
  <div className="fade-in" style={{ display:'flex', flexDirection:'column', gap:'28px' }}>

    {/* Thông điệp chính */}
    <GlassBox style={{ borderLeft:'5px solid var(--gold)', background:'rgba(255,255,255,0.03)' }}>
      <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'12px' }}>
        Thông điệp chính hôm nay
      </div>
      <p style={{ fontSize:'1.3rem', lineHeight:'1.7', color:'#fff', fontWeight:'500', margin:0 }}>
        {r.directAnswer}
      </p>
    </GlassBox>

    {/* Năng lượng / mood */}
    <GlassBox style={{ border:'1px solid rgba(167,139,250,0.2)' }}>
      <div style={{ fontSize:'0.75rem', color:'#a78bfa', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'10px' }}>
        Năng lượng / Mood trong ngày
      </div>
      <p style={{ margin:0, fontSize:'1.05rem', lineHeight:'1.7' }}>{r.quickSummary}</p>
    </GlassBox>

    {/* Diễn giải */}
    <GlassBox>
      <p style={{ fontSize:'1.02rem', lineHeight:'1.8', margin:0 }}>{r.contextualInterpretation}</p>
    </GlassBox>

    {/* Việc nên làm / Điều nên tránh */}
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:'20px' }}>
      <div className="glass-box" style={{ padding:'22px' }}>
        <h5 style={{ color:'#4ade80', marginBottom:'14px', display:'flex', alignItems:'center', gap:'8px' }}>
          <span>✓</span> Việc nên làm
        </h5>
        <ul style={{ margin:0, paddingLeft:'18px', display:'flex', flexDirection:'column', gap:'8px' }}>
          {r.practicalAdvice.map((a,i) => <li key={i} style={{ fontSize:'0.95rem', lineHeight:'1.6' }}>{a}</li>)}
        </ul>
      </div>
      <div className="glass-box" style={{ padding:'22px' }}>
        <h5 style={{ color:'#f87171', marginBottom:'14px', display:'flex', alignItems:'center', gap:'8px' }}>
          <span>✕</span> Điều nên tránh
        </h5>
        <ul style={{ margin:0, paddingLeft:'18px', display:'flex', flexDirection:'column', gap:'8px' }}>
          {r.thingsToAvoid.map((a,i) => <li key={i} style={{ fontSize:'0.95rem', lineHeight:'1.6' }}>{a}</li>)}
        </ul>
      </div>
    </div>

    {/* Điều nên chú ý */}
    {r.decisionChecklist?.length > 0 && (
      <GlassBox style={{ border:'1px solid rgba(251,191,36,0.15)' }}>
        <h5 style={{ color:'#fbbf24', marginBottom:'14px' }}>Điều nên chú ý hôm nay</h5>
        <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
          {r.decisionChecklist.map((item,i) => (
            <div key={i} style={{ display:'flex', gap:'10px', fontSize:'0.92rem', opacity:0.9 }}>
              <span style={{ color:'#fbbf24', flexShrink:0 }}>✦</span> {item}
            </div>
          ))}
        </div>
      </GlassBox>
    )}

    {/* Lưu ý năng lượng */}
    {r.riskNotes?.length > 0 && (
      <GlassBox style={{ background:'rgba(251,191,36,0.04)', border:'1px solid rgba(251,191,36,0.1)' }}>
        <h5 style={{ color:'#fbbf24', marginBottom:'12px' }}>Lưu ý về năng lượng</h5>
        <ul style={{ margin:0, paddingLeft:'18px', display:'flex', flexDirection:'column', gap:'6px' }}>
          {r.riskNotes.map((n,i) => <li key={i} style={{ fontSize:'0.9rem' }}>{n}</li>)}
        </ul>
      </GlassBox>
    )}

    {/* Câu chốt */}
    <div style={{ textAlign:'center', padding:'32px 20px', borderTop:'1px solid var(--glass-border)' }}>
      <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'2px', marginBottom:'14px' }}>
        Câu chốt trong ngày
      </div>
      <p style={{ fontSize:'1.35rem', fontStyle:'italic', color:'var(--gold-soft)', maxWidth:'700px', margin:'0 auto', lineHeight:'1.6', fontFamily:'"Playfair Display",serif' }}>
        "{r.finalMessage}"
      </p>
    </div>
  </div>
);

/* ── FIVE-CARD layout ──────────────────────────────────────────── */
const POSITION_COLORS = ['#a78bfa','#f87171','#fbbf24','#4ade80','#60a5fa'];

const FiveCardLayout: React.FC<{ r: UnifiedAIReadingResponse }> = ({ r }) => {
  const cards: TarotCardReading[] = r.symbolDetails?.cardInterpretations ?? [];
  const sig = SIGNAL[r.decisionSignal];

  return (
    <div className="fade-in" style={{ display:'flex', flexDirection:'column', gap:'32px' }}>

      {/* Tổng quan */}
      <GlassBox style={{ borderLeft:`5px solid ${sig.color}`, background:'rgba(255,255,255,0.03)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px', flexWrap:'wrap', gap:'10px' }}>
          <h4 style={{ color:'var(--gold)', margin:0 }}>Tổng quan trải bài 5 lá</h4>
          <span style={{ padding:'5px 14px', borderRadius:'50px', background:sig.bg, color:sig.color, border:`1px solid ${sig.color}`, fontSize:'0.8rem', fontWeight:'bold' }}>
            {sig.label}
          </span>
        </div>
        <p style={{ fontSize:'1.1rem', lineHeight:'1.7', color:'#fff', margin:0 }}>{r.directAnswer}</p>
      </GlassBox>

      {/* Diễn giải từng vị trí */}
      {cards.length > 0 && (
        <div>
          <SectionHead title="Diễn giải theo từng vị trí" />
          <div style={{ display:'flex', flexDirection:'column', gap:'18px' }}>
            {cards.map((card, i) => (
              <div key={i} className="glass-box" style={{ padding:'22px', borderLeft:`4px solid ${POSITION_COLORS[i] ?? '#a78bfa'}` }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'10px', flexWrap:'wrap', gap:'8px' }}>
                  <div>
                    <span style={{ fontSize:'0.72rem', color:POSITION_COLORS[i], textTransform:'uppercase', letterSpacing:'1px', display:'block', marginBottom:'4px' }}>
                      Vị trí {i+1} — {card.position}
                    </span>
                    <h5 style={{ margin:0, fontSize:'1.05rem', color:'#fff' }}>{card.cardName}</h5>
                  </div>
                  <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
                    <Tag color={SIGNAL[card.decisionImpact].color} bg={SIGNAL[card.decisionImpact].bg} label={SIGNAL[card.decisionImpact].label} />
                    <span style={{ fontSize:'0.78rem', color: card.orientation === 'reversed' ? '#f87171' : '#4ade80', fontWeight:'bold' }}>
                      {card.orientation === 'reversed' ? 'NGƯỢC' : 'XUÔI'}
                    </span>
                  </div>
                </div>
                <p style={{ fontSize:'0.97rem', lineHeight:'1.75', margin:'0 0 10px 0' }}>{card.meaningInThisQuestion}</p>
                {card.advice && (
                  <div style={{ fontSize:'0.87rem', color:'var(--gold-soft)', fontStyle:'italic', borderTop:'1px solid rgba(255,255,255,0.07)', paddingTop:'10px' }}>
                    {card.advice}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mạch kể 5 lá */}
      <div>
        <SectionHead title="Luận giải toàn cảnh" />
        <GlassBox>
          <p style={{ fontSize:'1.02rem', lineHeight:'1.85', margin:0 }}>{r.contextualInterpretation}</p>
        </GlassBox>
      </div>

      {/* Checklist + Advice + Avoid */}
      {r.decisionChecklist?.length > 0 && (
        <div>
          <SectionHead title="Checklist & Hành động" />
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:'20px' }}>
            <GlassBox style={{ border:'1px solid rgba(167,139,250,0.2)' }}>
              <h5 style={{ color:'#a78bfa', marginBottom:'14px' }}>Điểm cần kiểm tra</h5>
              <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                {r.decisionChecklist.map((item,i) => (
                  <div key={i} style={{ display:'flex', gap:'8px', fontSize:'0.9rem' }}>
                    <span style={{ color:'#a78bfa', flexShrink:0 }}>•</span> {item}
                  </div>
                ))}
              </div>
            </GlassBox>
            <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
              <GlassBox style={{ padding:'20px' }}>
                <h5 style={{ color:'#4ade80', marginBottom:'12px' }}>✓ Lời khuyên thực tế</h5>
                <ul style={{ margin:0, paddingLeft:'18px', display:'flex', flexDirection:'column', gap:'6px' }}>
                  {r.practicalAdvice.map((a,i) => <li key={i} style={{ fontSize:'0.9rem', lineHeight:'1.6' }}>{a}</li>)}
                </ul>
              </GlassBox>
              <GlassBox style={{ padding:'20px' }}>
                <h5 style={{ color:'#f87171', marginBottom:'12px' }}>✕ Rủi ro cần tránh</h5>
                <ul style={{ margin:0, paddingLeft:'18px', display:'flex', flexDirection:'column', gap:'6px' }}>
                  {r.thingsToAvoid.map((a,i) => <li key={i} style={{ fontSize:'0.9rem', lineHeight:'1.6' }}>{a}</li>)}
                </ul>
              </GlassBox>
            </div>
          </div>
        </div>
      )}

      {/* Rủi ro từ xu hướng */}
      {r.riskNotes?.length > 0 && (
        <GlassBox style={{ background:'rgba(251,191,36,0.04)', border:'1px solid rgba(251,191,36,0.1)' }}>
          <h5 style={{ color:'#fbbf24', marginBottom:'12px' }}>⚠ Rủi ro từ xu hướng kết quả</h5>
          <ul style={{ margin:0, paddingLeft:'18px', display:'flex', flexDirection:'column', gap:'6px' }}>
            {r.riskNotes.map((n,i) => <li key={i} style={{ fontSize:'0.9rem' }}>{n}</li>)}
          </ul>
        </GlassBox>
      )}

      {/* Final */}
      <div style={{ textAlign:'center', padding:'36px 20px', borderTop:'1px solid var(--glass-border)' }}>
        <p style={{ fontSize:'1.35rem', fontStyle:'italic', color:'var(--gold-soft)', maxWidth:'800px', margin:'0 auto', lineHeight:'1.6', fontFamily:'"Playfair Display",serif' }}>
          "{r.finalMessage}"
        </p>
      </div>
    </div>
  );
};

/* ── STANDARD layout (existing spreads) ────────────────────────── */
const StandardLayout: React.FC<{ r: UnifiedAIReadingResponse }> = ({ r }) => {
  const { questionContext, symbolDetails } = r;
  const sig = SIGNAL[r.decisionSignal];

  return (
    <div className="fade-in" style={{ display:'flex', flexDirection:'column', gap:'32px' }}>

      {/* Direct answer */}
      <GlassBox style={{ borderLeft:`6px solid ${sig.color}`, background:'rgba(255,255,255,0.03)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px', flexWrap:'wrap', gap:'10px' }}>
          <h4 style={{ color:'var(--gold)', margin:0 }}>Trả lời trực tiếp</h4>
          <span style={{ padding:'5px 16px', borderRadius:'50px', background:sig.bg, color:sig.color, border:`1px solid ${sig.color}`, fontWeight:'bold', fontSize:'0.8rem', textTransform:'uppercase' }}>
            {sig.label}
          </span>
        </div>
        <p style={{ fontSize:'1.25rem', lineHeight:'1.65', color:'#fff', fontWeight:'500', margin:0 }}>{r.directAnswer}</p>
      </GlassBox>

      {/* Context tags */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:'10px' }}>
        <Tag color='var(--text-muted)' bg='rgba(255,255,255,0.05)' label={`#${questionContext.questionType}`} />
        <Tag color={questionContext.riskLevel === 'high' ? '#f87171' : '#fbbf24'} bg='rgba(255,255,255,0.05)' label={`Risk: ${questionContext.riskLevel.toUpperCase()}`} />
        <Tag color='var(--text-primary)' bg='rgba(255,255,255,0.05)' label={`Độ tin cậy: ${r.confidenceLevel.toUpperCase()}`} />
      </div>

      {/* Symbolic reading */}
      <div>
        <SectionHead title="Luận Giải Biểu Tượng" />
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:'16px', marginBottom:'20px' }}>
          {[
            { label:'Năng lượng / Mood', val: r.quickSummary },
            { label:'Mô hình hiện tại',  val: r.symbolicReading.mainPattern },
            { label:'Yếu tố then chốt', val: r.symbolicReading.changingFactor },
            { label:'Xu hướng sắp tới', val: r.symbolicReading.futureTrend },
          ].map(({label, val}, i) => (
            <div key={i} className="glass-box" style={{ padding:'18px' }}>
              <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'8px' }}>{label}</div>
              <p style={{ margin:0, fontSize:'0.92rem', lineHeight:'1.65' }}>{val}</p>
            </div>
          ))}
        </div>

        {/* Card interpretations */}
        {symbolDetails?.cardInterpretations && (
          <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            {symbolDetails.cardInterpretations.map((card, i) => (
              <div key={i} className="glass-box" style={{ padding:'20px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px', flexWrap:'wrap', gap:'8px' }}>
                  <span style={{ color:'var(--gold-soft)', fontWeight:'bold' }}>{card.position}</span>
                  <div style={{ display:'flex', gap:'8px' }}>
                    <Tag color={SIGNAL[card.decisionImpact].color} bg={SIGNAL[card.decisionImpact].bg} label={SIGNAL[card.decisionImpact].label} />
                    <span style={{ fontSize:'0.78rem', color: card.orientation === 'reversed' ? '#f87171' : '#4ade80' }}>
                      {card.orientation === 'reversed' ? 'NGƯỢC' : 'XUÔI'}
                    </span>
                  </div>
                </div>
                <h5 style={{ margin:'0 0 8px', fontSize:'1rem' }}>{card.cardName}</h5>
                <p style={{ fontSize:'0.93rem', marginBottom:'8px' }}>{card.meaningInThisQuestion}</p>
                {card.advice && <div style={{ fontSize:'0.83rem', color:'var(--gold-soft)', fontStyle:'italic' }}>Lời khuyên: {card.advice}</div>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contextual interpretation */}
      <div>
        <SectionHead title="Diễn Giải Theo Ngữ Cảnh" />
        <GlassBox style={{ marginBottom:'20px' }}>
          <p style={{ fontSize:'1.03rem', lineHeight:'1.8', margin:0 }}>{r.contextualInterpretation}</p>
        </GlassBox>

        {/* Checklist */}
        {r.decisionChecklist?.length > 0 && (
          <GlassBox style={{ marginBottom:'20px', border:'1px solid rgba(167,139,250,0.2)' }}>
            <h5 style={{ color:'#a78bfa', marginBottom:'14px' }}>
              {questionContext.answerMode === 'emotional_reading' ? '💜 Điểm nên quan sát' : '📋 Checklist quyết định'}
            </h5>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:'8px' }}>
              {r.decisionChecklist.map((item,i) => (
                <div key={i} style={{ display:'flex', gap:'8px', fontSize:'0.9rem' }}>
                  <span style={{ color:'#a78bfa' }}>•</span> {item}
                </div>
              ))}
            </div>
          </GlassBox>
        )}

        {/* Advice / Avoid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:'20px', marginBottom:'20px' }}>
          <div className="glass-box" style={{ padding:'20px' }}>
            <h5 style={{ color:'#4ade80', marginBottom:'14px' }}>✓ Việc nên làm</h5>
            <ul style={{ margin:0, paddingLeft:'18px', display:'flex', flexDirection:'column', gap:'6px' }}>
              {r.practicalAdvice.map((a,i) => <li key={i} style={{ fontSize:'0.9rem', lineHeight:'1.6' }}>{a}</li>)}
            </ul>
          </div>
          <div className="glass-box" style={{ padding:'20px' }}>
            <h5 style={{ color:'#f87171', marginBottom:'14px' }}>✕ Điều cần tránh</h5>
            <ul style={{ margin:0, paddingLeft:'18px', display:'flex', flexDirection:'column', gap:'6px' }}>
              {r.thingsToAvoid.map((a,i) => <li key={i} style={{ fontSize:'0.9rem', lineHeight:'1.6' }}>{a}</li>)}
            </ul>
          </div>
        </div>

        {/* Risk */}
        {r.riskNotes?.length > 0 && (
          <GlassBox style={{ background:'rgba(251,191,36,0.04)', border:'1px solid rgba(251,191,36,0.1)' }}>
            <h5 style={{ color:'#fbbf24', marginBottom:'12px' }}>
              {questionContext.answerMode === 'emotional_reading' ? '💭 Rủi ro cảm xúc' : '⚠️ Rủi ro & Lưu ý'}
            </h5>
            <ul style={{ margin:0, paddingLeft:'18px', display:'flex', flexDirection:'column', gap:'6px' }}>
              {r.riskNotes.map((n,i) => <li key={i} style={{ fontSize:'0.9rem' }}>{n}</li>)}
            </ul>
          </GlassBox>
        )}
      </div>

      {/* Final */}
      <div style={{ textAlign:'center', padding:'36px 20px', borderTop:'1px solid var(--glass-border)' }}>
        <p style={{ fontSize:'1.35rem', fontStyle:'italic', color:'var(--gold-soft)', maxWidth:'800px', margin:'0 auto', lineHeight:'1.6', fontFamily:'"Playfair Display",serif' }}>
          "{r.finalMessage}"
        </p>
      </div>
    </div>
  );
};

/* ── ROOT component ─────────────────────────────────────────────── */
const AIReadingDisplay: React.FC<Props> = ({ response }) => {
  const isDaily    = response.questionContext?.answerMode === 'daily_guidance';
  const isFiveCard = !isDaily && (response.symbolDetails?.cardInterpretations?.length ?? 0) === 5;

  return (
    <div className="ai-reading-premium">
      <div style={{ textAlign:'center', marginBottom:'32px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'14px' }}>
          <div className="line-decorator" />
          <h3 style={{ color:'var(--gold)', fontSize:'1.7rem', margin:0, fontFamily:'"Playfair Display",serif' }}>
            Thông Điệp Từ AI Oracle
          </h3>
          <div className="line-decorator" />
        </div>
      </div>

      {isDaily    && <DailyLayout    r={response} />}
      {isFiveCard && <FiveCardLayout r={response} />}
      {!isDaily && !isFiveCard && <StandardLayout r={response} />}
    </div>
  );
};

export default AIReadingDisplay;
