import React from 'react';
import type { UnifiedAIReadingResponse } from '../../types/ai';

interface AIReadingDisplayProps {
  response: UnifiedAIReadingResponse;
}

const AIReadingDisplay: React.FC<AIReadingDisplayProps> = ({ response }) => {
  const signalConfig = {
    proceed: { label: 'Có thể tiến hành', color: '#4ade80', bg: 'rgba(74, 222, 128, 0.1)' },
    wait: { label: 'Nên chờ thêm', color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.1)' },
    avoid: { label: 'Không nên vội', color: '#f87171', bg: 'rgba(248, 113, 113, 0.1)' },
    unclear: { label: 'Chưa đủ rõ', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.1)' },
    conditional: { label: 'Có điều kiện', color: '#a78bfa', bg: 'rgba(167, 139, 250, 0.1)' },
  };

  const currentSignal = signalConfig[response.decisionSignal];
  const { questionContext, symbolDetails } = response;

  return (
    <div className="ai-reading-premium fade-in">
      {/* Layer 1 & Header: Direct Answer & Decision Signal */}
      <div className="ai-header" style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', marginBottom: '20px' }}>
          <div className="line-decorator"></div>
          <h3 style={{ color: 'var(--gold)', fontSize: '1.8rem', margin: 0, fontFamily: '"Playfair Display", serif' }}>
            Thông Điệp Từ AI Oracle
          </h3>
          <div className="line-decorator"></div>
        </div>

        <div className="direct-answer-box glass-box" style={{ 
          padding: '30px', 
          marginBottom: '20px', 
          borderLeft: `6px solid ${currentSignal.color}`,
          textAlign: 'left',
          background: 'rgba(255,255,255,0.03)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h4 style={{ color: 'var(--gold)', margin: 0, fontSize: '1.1rem' }}>Trả lời trực tiếp</h4>
            <div className="signal-badge" style={{ 
              padding: '6px 16px', 
              borderRadius: '50px', 
              background: currentSignal.bg, 
              color: currentSignal.color, 
              border: `1px solid ${currentSignal.color}`,
              fontWeight: 'bold',
              fontSize: '0.8rem',
              textTransform: 'uppercase'
            }}>
              {currentSignal.label}
            </div>
          </div>
          <p style={{ fontSize: '1.3rem', lineHeight: '1.6', color: '#fff', fontWeight: '500', margin: 0 }}>
            {response.directAnswer}
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '15px', alignItems: 'center' }}>
          <div style={{ padding: '4px 12px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
            #{questionContext.questionType}
          </div>
          <div style={{ padding: '4px 12px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
            Risk: <span style={{ color: questionContext.riskLevel === 'high' ? '#f87171' : '#fbbf24' }}>{questionContext.riskLevel.toUpperCase()}</span>
          </div>
          <div className="confidence-label" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Độ tin cậy: <span style={{ color: 'var(--text-primary)' }}>{response.confidenceLevel.toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* Question Understanding Section */}
      <div className="understanding-section glass-box" style={{ padding: '25px', marginBottom: '40px', border: '1px solid rgba(212, 175, 55, 0.1)' }}>
        <h5 style={{ color: 'var(--gold-soft)', textTransform: 'uppercase', fontSize: '0.8rem', marginBottom: '15px', letterSpacing: '1px' }}>
          AI hiểu câu hỏi của bạn
        </h5>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Ý định người dùng</div>
            <p style={{ margin: 0, fontSize: '0.95rem' }}>{questionContext.userIntent}</p>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Đối tượng chính</div>
            <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--gold)' }}>{questionContext.mainObject}</p>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Yếu tố cần cân nhắc</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {questionContext.requiredLens.map((lens, i) => (
                <span key={i} style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)' }}>
                  {lens}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Layer 2: Symbolic Reading */}
      <div className="symbolic-section" style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
          <h4 style={{ color: 'var(--gold)', margin: 0 }}>Luận Giải Biểu Tượng</h4>
          <div style={{ height: '1px', flex: 1, background: 'linear-gradient(90deg, var(--glass-border), transparent)' }}></div>
        </div>

        <div className="symbolic-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div className="symbol-item glass-box">
            <div className="symbol-label">Mô hình hiện tại</div>
            <p style={{ margin: 0 }}>{response.symbolicReading.mainPattern}</p>
          </div>
          <div className="symbol-item glass-box">
            <div className="symbol-label">Yếu tố then chốt</div>
            <p style={{ margin: 0 }}>{response.symbolicReading.changingFactor}</p>
          </div>
          <div className="symbol-item glass-box">
            <div className="symbol-label">Xu hướng sắp tới</div>
            <p style={{ margin: 0 }}>{response.symbolicReading.futureTrend}</p>
          </div>
        </div>

        <div className="detailed-explanation glass-panel" style={{ padding: '30px' }}>
          {symbolDetails.hexagramExplanation && (
            <div className="kinh-dich-details">
              <div className="detail-row">
                <span className="detail-tag">Quẻ chính</span>
                <p>{symbolDetails.hexagramExplanation.primaryHexagram}</p>
              </div>
              <div className="detail-row">
                <span className="detail-tag">Hào động</span>
                <p>{symbolDetails.hexagramExplanation.movingLines}</p>
              </div>
              <div className="detail-row">
                <span className="detail-tag">Quẻ biến</span>
                <p>{symbolDetails.hexagramExplanation.changedHexagram}</p>
              </div>
            </div>
          )}

          {symbolDetails.cardInterpretations && (
            <div className="tarot-details" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {symbolDetails.cardInterpretations.map((card, i) => (
                <div key={i} className="tarot-detail-card glass-box">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ color: 'var(--gold-soft)', fontWeight: 'bold' }}>{card.position}</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: signalConfig[card.decisionImpact].bg, color: signalConfig[card.decisionImpact].color }}>
                        {signalConfig[card.decisionImpact].label}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: card.orientation === 'reversed' ? '#f87171' : '#4ade80' }}>
                        {card.orientation === 'reversed' ? 'NGƯỢC' : 'XUÔI'}
                      </span>
                    </div>
                  </div>
                  <h5 style={{ margin: '0 0 10px 0', fontSize: '1.1rem' }}>{card.cardName}</h5>
                  <p style={{ fontSize: '0.95rem', marginBottom: '10px' }}>{card.meaningInThisQuestion}</p>
                  <div style={{ fontSize: '0.85rem', color: 'var(--gold-muted)', fontStyle: 'italic' }}>
                    Lời khuyên: {card.advice}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Layer 3: Contextual Guidance */}
      <div className="contextual-guidance" style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
          <h4 style={{ color: 'var(--gold)', margin: 0 }}>Diễn Giải Theo Ngữ Cảnh</h4>
          <div style={{ height: '1px', flex: 1, background: 'linear-gradient(90deg, var(--glass-border), transparent)' }}></div>
        </div>

        <div className="glass-box" style={{ padding: '30px', marginBottom: '30px' }}>
          <p style={{ fontSize: '1.05rem', lineHeight: '1.8', margin: 0 }}>{response.contextualInterpretation}</p>
        </div>

        {response.decisionChecklist && response.decisionChecklist.length > 0 && (
          <div className="checklist-section glass-box" style={{ padding: '25px', marginBottom: '30px', border: '1px solid rgba(167, 139, 250, 0.2)' }}>
            <h5 style={{ color: '#a78bfa', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.2rem' }}>
                {questionContext.answerMode === 'emotional_reading' ? '💜' :
                 questionContext.answerMode === 'daily_guidance' ? '✦' : '📋'}
              </span>
              {questionContext.answerMode === 'emotional_reading'
                ? 'Điểm nên quan sát'
                : questionContext.answerMode === 'daily_guidance'
                ? 'Điều nên chú ý hôm nay'
                : 'Checklist quyết định'}
            </h5>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '10px' }}>
              {response.decisionChecklist.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', fontSize: '0.9rem', opacity: 0.9 }}>
                  <span style={{ color: '#a78bfa' }}>•</span> {item}
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '30px' }}>
          <div className="advice-column">
            <h4 style={{ color: '#4ade80', marginBottom: '20px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.4rem' }}>✓</span> Việc nên làm
            </h4>
            <ul className="advice-list">
              {response.practicalAdvice.map((a, i) => <li key={i}>{a}</li>)}
            </ul>
          </div>
          <div className="advice-column">
            <h4 style={{ color: '#f87171', marginBottom: '20px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.4rem' }}>✕</span> Điều cần tránh
            </h4>
            <ul className="advice-list danger">
              {response.thingsToAvoid.map((a, i) => <li key={i}>{a}</li>)}
            </ul>
          </div>
        </div>

        <div className="info-panel" style={{ padding: '20px', background: 'rgba(251, 191, 36, 0.05)', border: '1px solid rgba(251, 191, 36, 0.1)' }}>
          <h5 style={{ color: '#fbbf24', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.1rem' }}>
              {questionContext.answerMode === 'emotional_reading' ? '💭' :
               questionContext.answerMode === 'daily_guidance' ? '✦' : '⚠️'}
            </span>
            {questionContext.answerMode === 'emotional_reading'
              ? 'Rủi ro cảm xúc'
              : questionContext.answerMode === 'daily_guidance'
              ? 'Điều cần lưu ý về năng lượng'
              : 'Rủi ro & Lưu ý'}
          </h5>
          <ul className="dot-list" style={{ margin: 0 }}>
            {response.riskNotes.map((r, i) => <li key={i} style={{ fontSize: '0.9rem' }}>{r}</li>)}
          </ul>
        </div>
      </div>

      {/* Final Message */}
      <div className="final-message-container" style={{ textAlign: 'center', padding: '40px 20px', borderTop: '1px solid var(--glass-border)' }}>
        <p className="final-quote" style={{ 
          fontSize: '1.4rem', 
          fontStyle: 'italic', 
          color: 'var(--gold-soft)', 
          maxWidth: '800px', 
          margin: '0 auto',
          lineHeight: '1.6',
          fontFamily: '"Playfair Display", serif'
        }}>
          "{response.finalMessage}"
        </p>
      </div>
    </div>
  );
};

export default AIReadingDisplay;
