import React, { useState, useCallback, useMemo } from 'react';
import HexagramDisplay from '../ui/HexagramDisplay';
import CoinFlip from '../ui/CoinFlip';
import { computeManualHexagramState } from '../../utils/hexagram';
import { mockAIHexagramReading } from '../../utils/mockAI';
import type { AIReadingResponse } from '../../utils/mockAI';
import type { ManualHexagramState, CastingMetadata } from '../../types';
import AIReadingDisplay from '../ui/AIReadingDisplay';
import { synthesizeKinhDichReading } from '../../lib/readings/synthesis';
import type { KinhDichSynthesis } from '../../lib/readings/synthesis';
import { KinhDichSynthesisDisplay } from '../ui/ReadingSynthesis';
import { saveReadingToLocalMemory, getLocalReadingHistory } from '../../lib/memory/localReadingMemory';
import { buildUserProfileFromHistory, buildMemorySummaryForPrompt } from '../../lib/memory/userProfile';

type Step = 'intro' | 'casting' | 'result';

const TOPICS = [
  'Tình yêu / Love',
  'Sự nghiệp / Career',
  'Tài chính / Money',
  'Học tập / Study',
  'Gia đình / Family',
  'Quyết định cá nhân / Personal Decision',
  'Chữa lành nội tâm / Inner Healing'
];

const InteractiveCoinSection: React.FC = () => {
  const [step, setStep] = useState<Step>('intro');
  
  // Form State
  const [question, setQuestion] = useState('');
  const [topic, setTopic] = useState(TOPICS[0]);
  const [notes, setNotes] = useState('');
  const [manualDate, setManualDate] = useState('');
  const [manualTime, setManualTime] = useState('');

  
  // Casting State
  const [coinLines, setCoinLines] = useState<number[]>([]);
  const [isFlipping, setIsFlipping] = useState(false);
  const [currentFaces, setCurrentFaces] = useState<number[]>([3, 3, 3]);
  const [flipId, setFlipId] = useState(0);
  
  // Metadata
  const [metadata, setMetadata] = useState<CastingMetadata | null>(null);
  
  // Result State
  const [hexagramState, setHexagramState] = useState<ManualHexagramState | null>(null);

  // AI Reading State
  const [aiState, setAiState] = useState<'idle' | 'loading' | 'done'>('idle');
  const [aiResponse, setAiResponse] = useState<AIReadingResponse | null>(null);
  const [readingId, setReadingId] = useState<string | undefined>(undefined);

  const synthesis: KinhDichSynthesis | null = useMemo(() => {
    if (!hexagramState || !metadata) return null;
    return synthesizeKinhDichReading({
      question:        metadata.question,
      topic:           metadata.topic,
      primaryHexagram: hexagramState.primaryInfo.name,
      changedHexagram: hexagramState.changedInfo.name,
      movingLines:     hexagramState.movingLines.length > 0 ? hexagramState.movingLines.join(', ') : 'Không có',
      sixLines:        hexagramState.primaryLines.join(', '),
    });
  }, [hexagramState, metadata]);

  const handleStartCasting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    const now = new Date();
    const manualOverride = Boolean(manualDate || manualTime);
    const finalDateStr = manualDate ? manualDate : now.toLocaleDateString('vi-VN');
    const finalTimeStr = manualTime ? manualTime : now.toLocaleTimeString('vi-VN');
    
    const newMetadata: CastingMetadata = {
      question,
      topic,
      notes,
      gregorianDate: finalDateStr,
      localTime: finalTimeStr,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      manualOverride,
    };
    
    setMetadata(newMetadata);
    setStep('casting');
  };

  const castSingleLine = useCallback(() => {
    if (isFlipping || coinLines.length >= 6) return;
    
    setIsFlipping(true);
    setFlipId((id) => id + 1);
    
    // Logic: 2 = Yin, 3 = Yang
    const flip = () => (Math.random() < 0.5 ? 2 : 3);
    const f1 = flip();
    const f2 = flip();
    const f3 = flip();
    const sum = f1 + f2 + f3; // Results in 6, 7, 8, 9
    
    setCurrentFaces([f1, f2, f3]);
    
    // Wait for 3D animation to complete (1.4s)
    setTimeout(() => {
      setIsFlipping(false);
      
      setCoinLines((prev) => {
        const next = [...prev, sum];
        if (next.length === 6) {
          try {
            const finalState = computeManualHexagramState(next, 'Mậu', question);
            setHexagramState(finalState);
          } catch (e) {
            console.error(e);
          }
          setTimeout(() => setStep('result'), 1500);
        }
        return next;
      });
    }, 1400);
  }, [coinLines.length, isFlipping, question]);

  const reset = () => {
    setStep('intro');
    setCoinLines([]);
    setQuestion('');
    setNotes('');
    setManualDate('');
    setManualTime('');

    setMetadata(null);
    setHexagramState(null);
    setCurrentFaces([3, 3, 3]);
    setAiState('idle');
    setAiResponse(null);
    setReadingId(undefined);
  };

  const handleGetAIReading = async () => {
    if (!metadata || !hexagramState) return;
    setAiState('loading');
    
    const payload = {
      question: metadata.question,
      topic: metadata.topic,
      userNotes: metadata.notes,
      primaryHexagram: hexagramState.primaryInfo.name,
      changedHexagram: hexagramState.changedInfo.name,
      movingLines: hexagramState.movingLines.length > 0 ? hexagramState.movingLines.join(', ') : 'Không có',
      sixLines: hexagramState.primaryLines.join(', '),
      castingDateTime: `${metadata.localTime} ${metadata.gregorianDate}`,
      timezone: metadata.timezone,
      readingTone: 'kinhdichai_signature',
      synthesisContext: synthesis,
      userMemorySummary: buildMemorySummaryForPrompt(
        buildUserProfileFromHistory(getLocalReadingHistory()),
        getLocalReadingHistory(5)
      )
    };

    try {
      let finalRes: AIReadingResponse;
      // 1. Try real API call securely via Vercel Serverless Function
      try {
        const response = await fetch('/api/read-hexagram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error('Real API failed, falling back to mock.');
        }

        finalRes = await response.json();
      } catch (err) {
        console.warn('Backend API not available or failed. Using fallback mock AI:', err);
        // 2. Fallback to mock AI if server API fails or isn't configured
        finalRes = await mockAIHexagramReading(metadata, hexagramState, 'kinhdichai_signature');
      }

      setAiResponse(finalRes);
      setAiState('done');

      // Save to local memory
      const id = saveReadingToLocalMemory({
        type: 'iching',
        question: metadata.question,
        topic: metadata.topic,
        hexagram: {
          primary: hexagramState.primaryInfo.name,
          changed: hexagramState.changedInfo.name,
          movingLines: hexagramState.movingLines
        },
        synthesis,
        aiAnswer: finalRes
      });
      setReadingId(id);

    } catch (fallbackErr) {
      console.error(fallbackErr);
      setAiState('idle');
    }

    // Scroll smoothly down to the reading
    setTimeout(() => {
      document.getElementById('ai-reading-result')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <section className="section dark-section section-anchor" id="interactive-casting" style={{ minHeight: '70vh' }}>
      <div className="container">
        
        {step === 'intro' && (
          <div className="panel glass-panel fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="section-title light-title" style={{ marginBottom: '30px' }}>
              <p className="eyebrow">Gieo Quẻ Đồng Xu</p>
              <h2>Tập Trung Ý Niệm</h2>
              <p>Hãy chọn chủ đề và đặt câu hỏi rõ ràng trước khi gieo quẻ.</p>
            </div>

            <form onSubmit={handleStartCasting} className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
              <div>
                <label htmlFor="topicSelect">Chủ đề</label>
                <select id="topicSelect" value={topic} onChange={(e) => setTopic(e.target.value)}>
                  {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              
              <div>
                <label htmlFor="questionInput">Câu hỏi của bạn</label>
                <textarea
                  id="questionInput"
                  rows={2}
                  placeholder="Ví dụ: Tôi có nên chuyển công việc trong tháng này không?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="notesInput">Ghi chú thêm (Tùy chọn)</label>
                <textarea
                  id="notesInput"
                  rows={2}
                  placeholder="Bối cảnh chi tiết..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              
              <div className="form-grid" style={{ marginTop: '0', gridTemplateColumns: '1fr 1fr' }}>
                <div>
                  <label htmlFor="manualDate">Ngày giờ gieo quẻ</label>
                  <input 
                    type="date" 
                    id="manualDate" 
                    value={manualDate} 
                    onChange={(e) => setManualDate(e.target.value)} 
                    style={{ background: 'transparent', color: 'var(--text-primary)', borderColor: 'var(--border-soft)', padding: '12px' }}
                  />
                </div>
                <div>
                  <label htmlFor="manualTime">Giờ (Tùy chọn)</label>
                  <input 
                    type="time" 
                    id="manualTime" 
                    value={manualTime} 
                    onChange={(e) => setManualTime(e.target.value)} 
                    style={{ background: 'transparent', color: 'var(--text-primary)', borderColor: 'var(--border-soft)', padding: '12px' }}
                  />
                </div>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '-10px' }}>
                * Nếu để trống, hệ thống sẽ tự động lấy thời gian hiện tại khi bạn bắt đầu tung đồng xu.
              </p>

              <button type="submit" className="button primary-button full-button">
                Bắt đầu nghi thức
              </button>
            </form>
          </div>
        )}

        {step === 'casting' && (
          <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '28px', alignItems: 'start' }}>
            
            <div className="panel glass-panel" style={{ textAlign: 'center', padding: '36px 24px' }}>
              <h3 style={{ color: 'var(--amber)', marginBottom: '8px' }}>Hào {coinLines.length + 1} / 6</h3>
              <p style={{ color: 'var(--t-body)', marginBottom: '24px', fontStyle: 'italic' }}>"{question}"</p>

              <CoinFlip faces={currentFaces} isFlipping={isFlipping} flipId={flipId} />

              <button
                onClick={castSingleLine}
                disabled={isFlipping || coinLines.length >= 6}
                className="button primary-button"
                style={{ marginTop: '28px', width: '100%', opacity: isFlipping ? 0.6 : 1 }}
              >
                {isFlipping ? 'Đang gieo...' : `Gieo Hào ${coinLines.length + 1}`}
              </button>

              <div style={{ marginTop: '18px', fontSize: '0.78rem', color: 'var(--t-muted)', lineHeight: 1.7 }}>
                <p style={{ margin: 0 }}>6 = Lão Âm (Động)&nbsp; 7 = Thiếu Dương</p>
                <p style={{ margin: 0 }}>8 = Thiếu Âm&nbsp; 9 = Lão Dương (Động)</p>
              </div>
            </div>

            <div className="panel glass-panel" style={{ padding: '36px 24px' }}>
              <h4 style={{ textAlign: 'center', marginBottom: '20px', color: 'var(--amber)' }}>Sự Hình Thành Quẻ</h4>
              {coinLines.length === 0 && (
                <p style={{ textAlign: 'center', color: 'var(--t-muted)', fontStyle: 'italic' }}>
                  Các hào sẽ xuất hiện từ dưới lên trên...
                </p>
              )}
              <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: '14px', minHeight: '120px' }}>
                {coinLines.map((lineVal, index) => {
                  const isYang = lineVal === 7 || lineVal === 9;
                  const isMoving = lineVal === 6 || lineVal === 9;
                  return (
                    <div key={index} className={`hex-line build-line fade-in${isMoving ? ' moving' : ''}`}>
                      {isYang ? (
                        <div className="line-solid"></div>
                      ) : (
                        <>
                          <div className="line-half"></div>
                          <div className="line-half"></div>
                        </>
                      )}
                      {isMoving && <span className="moving-label">Động ({lineVal === 6 ? 'Lão Âm' : 'Lão Dương'})</span>}
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                {[1,2,3,4,5,6].map(n => (
                  <div key={n} style={{
                    width: 10, height: 10, borderRadius: '50%',
                    background: n <= coinLines.length ? 'var(--amber)' : 'rgba(255,255,255,0.15)',
                    transition: 'background 0.3s',
                  }} />
                ))}
              </div>
            </div>

          </div>
        )}

        {step === 'result' && (
          <div className="result-summary fade-in">
            {hexagramState && metadata ? (
              <div className="panel glass-panel" style={{ marginBottom: '24px' }}>
                <div style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '20px', marginBottom: '20px' }}>
                  <p className="eyebrow">Kết Quả Gieo Quẻ</p>
                  <h3 style={{ color: 'var(--amber)', fontSize: '1.5rem', marginBottom: '10px' }}>Chủ đề: {metadata.topic}</h3>
                  <p style={{ fontSize: '1.1rem' }}><strong>Hỏi:</strong> "{metadata.question}"</p>
                  {metadata.notes && <p style={{ fontSize: '0.95rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>Ghi chú: {metadata.notes}</p>}
                  
                  <div style={{ display: 'flex', gap: '15px', marginTop: '15px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <span>Lịch dương: {metadata.gregorianDate} {metadata.manualOverride && '(Thủ công)'}</span>
                    <span>Thời gian: {metadata.localTime}</span>
                    <span>Múi giờ: {metadata.timezone}</span>
                  </div>
                </div>

                <div className="manual-result-grid" style={{ marginTop: '30px' }}>
                  {/* Primary */}
                  <div className="manual-card dark-card">
                    <p className="eyebrow">Quẻ Chính</p>
                    <h3 id="primaryHexName" style={{ color: 'var(--amber)' }}>{hexagramState.primaryInfo.name}</h3>
                    <HexagramDisplay
                      lines={hexagramState.primaryLines}
                      movingLines={hexagramState.movingLines}
                      className="glass-box"
                    />
                    <p style={{ marginTop: '15px', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
                      Hào động: {hexagramState.movingLines.length > 0 ? hexagramState.movingLines.join(', ') : 'Không có'}
                    </p>
                  </div>

                  {/* Changed */}
                  <div className="manual-card dark-card">
                    <p className="eyebrow" style={{ color: '#a0b8ff' }}>Quẻ Biến</p>
                    <h3 id="changedHexName" style={{ color: '#a0b8ff' }}>{hexagramState.changedInfo.name}</h3>
                    <HexagramDisplay
                      lines={hexagramState.changedLines}
                      className="glass-box"
                    />
                    {hexagramState.movingLines.length === 0 && (
                      <p style={{ marginTop: '15px', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
                        Quẻ không có hào động, giữ nguyên trạng thái.
                      </p>
                    )}
                  </div>
                </div>

                {/* ── Synthesis layer ── */}
                {synthesis && (
                  <div style={{ marginTop: '30px' }}>
                    <KinhDichSynthesisDisplay synthesis={synthesis} />
                  </div>
                )}

                {/* AI Reading Section Integration */}
                <div style={{ marginTop: '40px', padding: '30px', background: 'rgba(112, 66, 163, 0.05)', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                  {aiState === 'idle' && (
                    <div style={{ textAlign: 'center' }}>
                      <h3 style={{ color: '#d4af37', fontSize: '1.4rem', marginBottom: '15px' }}>Nhận Lời Khuyên Từ Vũ Trụ</h3>
                      <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '20px' }}>
                        Kinh Dịch AI sẽ tổng hợp hào động, tượng quẻ và câu hỏi của bạn để đưa ra luận giải chi tiết.
                      </p>
                      <br />
                      <button onClick={handleGetAIReading} className="button primary-button" style={{ background: 'linear-gradient(135deg, #7042a3, #2a4b8d)', color: '#fff', border: '1px solid #7042a3' }}>
                        Luận Quẻ Bằng AI
                      </button>
                    </div>
                  )}

                  {aiState === 'loading' && (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                      <div className="pulse-circle" style={{ margin: '0 auto 20px', width: '60px', height: '60px' }}></div>
                      <p style={{ color: 'var(--amber)', fontSize: '1.2rem', fontWeight: 'bold' }}>Đang kết nối với trí tuệ cổ xưa...</p>
                      <p style={{ color: 'rgba(255,255,255,0.6)', fontStyle: 'italic' }}>Giải mã tượng quẻ theo câu hỏi của bạn.</p>
                    </div>
                  )}

                  {aiState === 'done' && aiResponse && (
                    <div id="ai-reading-result">
                      <AIReadingDisplay response={aiResponse} readingId={readingId} />
                    </div>
                  )}
                </div>

                <div style={{ textAlign: 'center', marginTop: '40px' }}>
                  <button onClick={reset} className="button secondary-button" style={{ color: 'var(--white)', borderColor: 'var(--glass-border)' }}>
                    Gieo Quẻ Khác
                  </button>
                </div>
              </div>
            ) : (
              <div className="panel glass-panel" style={{ textAlign: 'center', padding: '40px' }}>
                <p>Đã có lỗi xảy ra khi tính toán quẻ. Vui lòng thử lại.</p>
                <button onClick={reset} className="button primary-button">Quay lại</button>
              </div>
            )}
          </div>
        )}

        {/* Fallback for safety */}
        {!['intro', 'casting', 'result'].includes(step) && (
          <div className="panel glass-panel" style={{ textAlign: 'center', padding: '20px' }}>
            <p>Trạng thái không hợp lệ. Đang quay lại màn hình chính...</p>
            <button onClick={reset} className="button primary-button">Khởi động lại</button>
          </div>
        )}

      </div>
    </section>
  );
};

export default InteractiveCoinSection;
