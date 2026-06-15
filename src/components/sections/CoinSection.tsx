import React, { useState } from 'react';
import type { CastingMetadata, ManualHexagramState } from '../../types';
import HexagramDisplay from '../ui/HexagramDisplay';
import { computeManualHexagramState } from '../../utils/hexagram';
import { coinLineOptions } from '../../data/shared';
import { heavenlyStems } from '../../data/canchi';
import { mockAIHexagramReading } from '../../utils/mockAI';
import type { AIReadingResponse } from '../../utils/mockAI';
import AIReadingDisplay from '../ui/AIReadingDisplay';
import { saveReadingToLocalMemory, getLocalReadingHistory } from '../../lib/memory/localReadingMemory';
import { buildUserProfileFromHistory, buildMemorySummaryForPrompt } from '../../lib/memory/userProfile';
import { synthesizeKinhDichReading } from '../../lib/readings/synthesis';

const TOPICS = [
  'Tình yêu / Love',
  'Sự nghiệp / Career',
  'Tài chính / Money',
  'Học tập / Study',
  'Gia đình / Family',
  'Quyết định cá nhân / Personal Decision',
  'Chữa lành nội tâm / Inner Healing'
];

const CoinSection: React.FC = () => {
  // Input states
  const [question, setQuestion] = useState('');
  const [topic, setTopic] = useState(TOPICS[0]);
  const [manualDate, setManualDate] = useState('');
  const [manualTime, setManualTime] = useState('');
  const [notes, setNotes] = useState('');
  const [dayStem, setDayStem] = useState('Mậu');
  const [coinLines, setCoinLines] = useState<number[]>([7, 7, 7, 7, 7, 7]); // Defaults to Young Yang
  
  // View states
  const [showResult, setShowResult] = useState(false);
  const [hexagramState, setHexagramState] = useState<ManualHexagramState | null>(null);
  const [metadata, setMetadata] = useState<CastingMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);

  // AI states
  const [aiState, setAiState] = useState<'idle' | 'loading' | 'done'>('idle');
  const [aiResponse, setAiResponse] = useState<AIReadingResponse | null>(null);
  const [readingId, setReadingId] = useState<string | undefined>(undefined);

  const handleUpdateLine = (index: number, value: number) => {
    const next = [...coinLines];
    next[index] = value;
    setCoinLines(next);
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) {
      setError('Vui lòng nhập câu hỏi trước khi lập quẻ.');
      return;
    }

    try {
      const newState = computeManualHexagramState(coinLines, dayStem, question);
      
      const now = new Date();
      const finalDateStr = manualDate || now.toLocaleDateString('vi-VN');
      const finalTimeStr = manualTime || now.toLocaleTimeString('vi-VN');
      
      const meta: CastingMetadata = {
        question,
        topic,
        notes,
        gregorianDate: finalDateStr,
        localTime: finalTimeStr,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        manualOverride: Boolean(manualDate || manualTime),
      };

      setHexagramState(newState);
      setMetadata(meta);
      setError(null);
      setShowResult(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định khi tính toán quẻ.');
    }
  };

  const handleGetAIReading = async () => {
    if (!hexagramState || !metadata) return;
    setAiState('loading');

    const synthesisContext = synthesizeKinhDichReading({
      question: metadata.question,
      topic: metadata.topic,
      primaryHexagram: hexagramState.primaryInfo.name,
      changedHexagram: hexagramState.changedInfo.name,
      movingLines: hexagramState.movingLines.length > 0 ? hexagramState.movingLines.join(', ') : 'Không có',
      sixLines: hexagramState.primaryLines.join(', '),
    });
    
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
      method: 'manual-real-life',
      synthesisContext,
      userMemorySummary: buildMemorySummaryForPrompt(
        buildUserProfileFromHistory(getLocalReadingHistory()),
        getLocalReadingHistory(5)
      )
    };

    try {
      let finalRes: AIReadingResponse;
      try {
        const response = await fetch('/api/read-hexagram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error('API failed');
        }

        finalRes = await response.json();
      } catch (err) {
        console.warn('Backend API failed, using mock:', err);
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
        synthesis: synthesisContext,
        aiAnswer: finalRes
      });
      setReadingId(id);
    } catch (err) {
      console.error(err);
      setAiState('idle');
    }

    // Scroll to AI reading area
    setTimeout(() => {
      const el = document.getElementById('ai-manual-reading');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const reset = () => {
    setShowResult(false);
    setHexagramState(null);
    setMetadata(null);
    setError(null);
    setAiState('idle');
    setAiResponse(null);
    setReadingId(undefined);
  };

  const displayOrder = [5, 4, 3, 2, 1, 0]; // reversed display indices (Hào 6 down to Hào 1)

  return (
    <section className="section dark-section section-anchor" id="coins">
      <div className="container">
        {!showResult ? (
          <div className="panel glass-panel fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="section-title light-title" style={{ textAlign: 'left', marginBottom: '30px' }}>
              <p className="eyebrow">Manual Input</p>
              <h2>Nhập lục hào ngoài đời</h2>
              <p>Nhập kết quả 6 lần gieo đồng xu ngoài đời. Hào 1 là hào dưới cùng, hào 6 là hào trên cùng.</p>
            </div>

            <form onSubmit={handleCalculate} className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
                <div>
                  <label htmlFor="manualTopic">Chủ đề</label>
                  <select id="manualTopic" value={topic} onChange={(e) => setTopic(e.target.value)}>
                    {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="manualDayStem">Thiên can ngày (Tùy chọn)</label>
                  <select id="manualDayStem" value={dayStem} onChange={(e) => setDayStem(e.target.value)}>
                    {heavenlyStems.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="manualQuestion">Câu hỏi của bạn</label>
                <textarea
                  id="manualQuestion"
                  rows={2}
                  placeholder="Ví dụ: Tôi có nên đầu tư vào dự án này không?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
                <div>
                  <label htmlFor="manualDate">Ngày gieo quẻ</label>
                  <input type="date" id="manualDate" value={manualDate} onChange={(e) => setManualDate(e.target.value)} />
                </div>
                <div>
                  <label htmlFor="manualTime">Giờ gieo quẻ</label>
                  <input type="time" id="manualTime" value={manualTime} onChange={(e) => setManualTime(e.target.value)} />
                </div>
              </div>

              <div>
                <label htmlFor="manualNotes">Ghi chú (Tùy chọn)</label>
                <textarea
                  id="manualNotes"
                  rows={2}
                  placeholder="Bối cảnh gieo quẻ..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div style={{ marginTop: '30px', borderTop: '1px solid var(--border-soft)', paddingTop: '30px' }}>
                <h3 style={{ color: 'var(--gold)', marginBottom: '20px', fontSize: '1.2rem' }}>Kết quả gieo 6 hào</h3>
                <div className="line-inputs" style={{ display: 'grid', gap: '12px' }}>
                  {displayOrder.map((index) => (
                    <div key={index} className="line-input-row" style={{ display: 'grid', gridTemplateColumns: '140px 1fr', alignItems: 'center', gap: '15px' }}>
                      <label htmlFor={`manualLine${index}`} style={{ margin: 0, fontSize: '0.85rem' }}>
                        Hào {index + 1}{index === 5 ? ' — trên cùng' : index === 0 ? ' — dưới cùng' : ''}
                      </label>
                      <select
                        id={`manualLine${index}`}
                        value={coinLines[index]}
                        onChange={(e) => handleUpdateLine(index, Number(e.target.value))}
                        style={{ padding: '10px 15px' }}
                      >
                        {coinLineOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.value} — {opt.label} ({opt.note})
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {error && <p style={{ color: '#f87171', fontSize: '0.9rem', marginTop: '15px' }}>{error}</p>}

              <button type="submit" className="button primary-button full-button" style={{ marginTop: '40px' }}>
                Lập quẻ
              </button>
            </form>
          </div>
        ) : (
          <div className="result-summary fade-in">
            {hexagramState && metadata && (
              <div className="panel glass-panel">
                <div style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '20px', marginBottom: '20px' }}>
                  <p className="eyebrow">Kết Quả Lập Quẻ Thủ Công</p>
                  <h3 style={{ color: 'var(--gold)', fontSize: '1.5rem', marginBottom: '10px' }}>Chủ đề: {metadata.topic}</h3>
                  <p style={{ fontSize: '1.1rem' }}><strong>Hỏi:</strong> "{metadata.question}"</p>
                  
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginTop: '15px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <span>Lịch dương: {metadata.gregorianDate}</span>
                    <span>Thời gian: {metadata.localTime}</span>
                    <span>Múi giờ: {metadata.timezone}</span>
                    {dayStem && <span>Thiên can: {dayStem}</span>}
                  </div>
                </div>

                <div className="manual-result-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                  {/* Primary */}
                  <div className="manual-card dark-card" style={{ padding: '24px', borderRadius: '20px' }}>
                    <p className="eyebrow">Quẻ Chính</p>
                    <h3 style={{ color: 'var(--gold)' }}>{hexagramState.primaryInfo.name}</h3>
                    <HexagramDisplay
                      lines={hexagramState.primaryLines}
                      movingLines={hexagramState.movingLines}
                      className="glass-box"
                    />
                    <p style={{ marginTop: '15px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                      Hào động: {hexagramState.movingLines.length > 0 ? hexagramState.movingLines.join(', ') : 'Không có'}
                    </p>
                  </div>

                  {/* Changed */}
                  <div className="manual-card dark-card" style={{ padding: '24px', borderRadius: '20px' }}>
                    <p className="eyebrow" style={{ color: '#a0b8ff' }}>Quẻ Biến</p>
                    <h3 style={{ color: '#a0b8ff' }}>{hexagramState.changedInfo.name}</h3>
                    <HexagramDisplay
                      lines={hexagramState.changedLines}
                      className="glass-box"
                    />
                    {hexagramState.movingLines.length === 0 && (
                      <p style={{ marginTop: '15px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        Quẻ không có hào động.
                      </p>
                    )}
                  </div>
                </div>

                <div className="summary-beginner" style={{ marginTop: '30px', padding: '20px', background: 'rgba(201, 162, 39, 0.05)', borderRadius: '16px', border: '1px solid var(--border-gold)' }}>
                  <h4 style={{ color: 'var(--gold)', marginBottom: '10px' }}>Tóm tắt cho người mới</h4>
                  <p style={{ lineHeight: '1.7', color: 'var(--text-secondary)' }}>
                    Bạn đã lập quẻ <strong>{hexagramState.primaryInfo.name}</strong>. 
                    {hexagramState.movingLines.length > 0 
                      ? ` Quẻ có ${hexagramState.movingLines.length} hào động, chuyển thành quẻ ${hexagramState.changedInfo.name}. Điều này cho thấy sự việc đang trong quá trình biến chuyển.` 
                      : ' Quẻ không có hào động, cho thấy sự việc đang ở trạng thái ổn định hoặc cần tập trung vào bản chất hiện tại.'}
                  </p>
                </div>

                <div className="advanced-placeholder" style={{ marginTop: '20px', fontSize: '0.85rem', color: 'var(--text-subtle)' }}>
                  <details>
                    <summary style={{ cursor: 'pointer', color: 'var(--gold-muted)', fontWeight: 'bold' }}>Thông tin chuyên sâu (Phần mềm Lục Hào chuyên nghiệp)</summary>
                    <div style={{ padding: '20px', marginTop: '10px', border: '1px solid var(--border-soft)', borderRadius: '12px', background: 'rgba(0,0,0,0.2)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div><span style={{ color: 'var(--text-muted)' }}>Âm lịch:</span> <span style={{ color: 'var(--gold-soft)' }}>Sẽ bổ sung sau</span></div>
                        <div><span style={{ color: 'var(--text-muted)' }}>Tiết khí:</span> <span style={{ color: 'var(--gold-soft)' }}>Sẽ bổ sung sau</span></div>
                        <div><span style={{ color: 'var(--text-muted)' }}>Ngày (Can Chi):</span> <span style={{ color: 'var(--gold-soft)' }}>{dayStem} ... (Sẽ bổ sung sau)</span></div>
                        <div><span style={{ color: 'var(--text-muted)' }}>Tháng (Can Chi):</span> <span style={{ color: 'var(--gold-soft)' }}>Sẽ bổ sung sau</span></div>
                        <div><span style={{ color: 'var(--text-muted)' }}>Giờ (Can Chi):</span> <span style={{ color: 'var(--gold-soft)' }}>Sẽ bổ sung sau</span></div>
                        <div><span style={{ color: 'var(--text-muted)' }}>Tuần không:</span> <span style={{ color: 'var(--gold-soft)' }}>Sẽ bổ sung sau</span></div>
                      </div>
                      <p style={{ marginTop: '15px', fontStyle: 'italic', fontSize: '0.75rem' }}>
                        * Các thông số này cần thuật toán chuyển đổi âm dương lịch và định vị địa lý chính xác. Chúng tôi đang phát triển module này.
                      </p>
                    </div>
                  </details>
                </div>

                {/* AI Reading Section */}
                <div id="ai-manual-reading" style={{ marginTop: '40px', padding: '30px', background: 'rgba(112, 66, 163, 0.05)', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                  {aiState === 'idle' && (
                    <div style={{ textAlign: 'center' }}>
                      <h4 style={{ color: '#d4af37', fontSize: '1.2rem', marginBottom: '15px' }}>Nhận Lời Khuyên Từ Vũ Trụ</h4>
                      <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '20px' }}>
                        Kinh Dịch AI sẽ tổng hợp hào động, tượng quẻ và câu hỏi của bạn để đưa ra luận giải chi tiết.
                      </p>
                      <br />
                      <button onClick={handleGetAIReading} className="button primary-button">
                        Luận Quẻ Bằng AI
                      </button>
                    </div>
                  )}

                  {aiState === 'loading' && (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                      <div className="pulse-circle" style={{ margin: '0 auto 20px', width: '60px', height: '60px' }}></div>
                      <p style={{ color: 'var(--gold)', fontSize: '1.2rem', fontWeight: 'bold' }}>Đang kết nối với trí tuệ cổ xưa...</p>
                    </div>
                  )}

                  {aiState === 'done' && aiResponse && (
                    <div className="fade-in">
                      <AIReadingDisplay response={aiResponse} readingId={readingId} />
                    </div>
                  )}
                </div>

                <div className="hero-actions" style={{ marginTop: '40px', justifyContent: 'center' }}>
                  <button onClick={reset} className="button secondary-button">Nhập lại</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default CoinSection;
