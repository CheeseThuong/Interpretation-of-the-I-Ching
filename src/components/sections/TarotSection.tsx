import React, { useState } from 'react';
import '../../styles/tarot.css';
import { SPREADS } from '../../data/tarot';
import type { TarotSpread, TarotCard, DrawnCard } from '../../types/tarot';
import { mockAITarotReading } from '../../utils/mockAI';
import AIReadingDisplay from '../ui/AIReadingDisplay';
import { createFreshTarotDeck, shuffleTarotDeck, drawTarotCards } from '../../utils/tarotDeck';
import { synthesizeTarotReading } from '../../lib/readings/synthesis';
import type { TarotSynthesis } from '../../lib/readings/synthesis';
import { TarotSynthesisDisplay } from '../ui/ReadingSynthesis';
import { getZodiacSignFromDate, buildZodiacLens } from '../../lib/astrology/zodiac';
import type { ZodiacLens } from '../../lib/astrology/zodiac';
import TarotLandingPage from '../tarot/TarotLandingPage';
import { saveReadingToLocalMemory, getLocalReadingHistory } from '../../lib/memory/localReadingMemory';
import { buildUserProfileFromHistory, buildMemorySummaryForPrompt } from '../../lib/memory/userProfile';
import type { UnifiedAIReadingResponse } from '../../types/ai';

type TarotStep = 'landing' | 'select-spread' | 'shuffle' | 'draw' | 'result';

const getInitialSpread = (): TarotSpread | null => {
  const params = new URLSearchParams(window.location.search);
  const spreadId = params.get('spread');
  return SPREADS.find((spread) => spread.id === spreadId) ?? null;
};

const TarotSection: React.FC = () => {
  const [initialSpread] = useState(getInitialSpread);
  const [step, setStep] = useState<TarotStep>(initialSpread ? 'shuffle' : 'landing');
  const [question, setQuestion] = useState('');
  const [selectedSpread, setSelectedSpread] = useState<TarotSpread | null>(initialSpread);
  
  const readingStartRef = React.useRef<HTMLDivElement>(null);
  
  // Deck state
  const [deck, setDeck] = useState<TarotCard[]>(() => (initialSpread ? createFreshTarotDeck() : []));
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([]);
  const [isShuffling, setIsShuffling] = useState(false);
  
  // AI Reading State
  const [aiState, setAiState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [aiResponse, setAiResponse] = useState<UnifiedAIReadingResponse | null>(null);
  const [readingId, setReadingId] = useState<string | undefined>(undefined);

  // Animation state
  const [isRevealing, setIsRevealing] = useState(false);
  const [revealedIndices, setRevealedIndices] = useState<number[]>([]);

  // Synthesis state
  const [synthesis, setSynthesis] = useState<TarotSynthesis | null>(null);

  // Zodiac state
  const [birthDate, setBirthDate] = useState('');
  const [zodiacLens, setZodiacLens] = useState<ZodiacLens | null>(null);

  const handleSelectSpread = (spread: TarotSpread, e?: React.MouseEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    setSelectedSpread(spread);
    // Start with a fresh full 78-card deck (not shuffled yet — shuffle happens on handleShuffle)
    setDeck(createFreshTarotDeck());
    setDrawnCards([]);
    setStep('shuffle');

    setTimeout(() => {
      readingStartRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }, 50);
  };

  const handleShuffle = () => {
    if (!question.trim()) {
      alert("Hãy nhập câu hỏi hoặc ý niệm của bạn trước khi tráo bài.");
      return;
    }
    setIsShuffling(true);
    setTimeout(() => {
      setIsShuffling(false);
      // Fisher-Yates with crypto-safe random — fresh shuffle every time
      setDeck(shuffleTarotDeck(createFreshTarotDeck()));
      setStep('draw');
    }, 2000);
  };

  const handleDrawCard = () => {
    if (!selectedSpread) return;
    if (drawnCards.length >= selectedSpread.cardCount) return;
    // On first draw, atomically draw ALL required cards at once from the shuffled deck.
    // This prevents duplicate cards and ensures each spread gets a unique set.
    if (drawnCards.length === 0) {
      const allDrawn = drawTarotCards(deck, selectedSpread.cardCount, selectedSpread);
      setDrawnCards(allDrawn);
      setDeck(prev => prev.slice(selectedSpread.cardCount));
      setIsRevealing(true);
      setTimeout(() => {
        setStep('result');
        selectedSpread.positions.forEach((_, idx) => {
          setTimeout(() => {
            setRevealedIndices(prev => [...prev, idx]);
          }, 800 + (idx * 600));
        });
        const revealDone = 800 + (selectedSpread.cardCount * 600) + 500;
        setTimeout(() => {
          setIsRevealing(false);
          // Compute synthesis after all cards are revealed
          const syn = synthesizeTarotReading({
            question,
            spreadId:   selectedSpread.id,
            spreadName: selectedSpread.name,
            drawnCards: allDrawn,
            positionMeta: selectedSpread.positionMeta,
          });
          setSynthesis(syn);
        }, revealDone);
      }, 1000);
      return;
    }
    // Guard: if already drawing, do nothing
    if (drawnCards.length >= selectedSpread.cardCount) return;
  };

  const handleGetAIReading = async () => {
    if (!selectedSpread || drawnCards.length === 0) return;
    setAiState('loading');

    const payload = {
      question,
      topic: 'Tarot Reading',
      readingTone: 'kinhdichai_signature',
      spreadType: selectedSpread.name,
      drawnCards: drawnCards.map(dc => ({
        name: dc.card.name,
        nameVi: dc.card.nameVi,
        position: dc.positionName,
        isReversed: dc.isReversed,
        keywordsUpright: dc.card.keywordsUpright,
        keywordsReversed: dc.card.keywordsReversed,
        meaningUpright: dc.card.meaningUpright,
        meaningReversed: dc.card.meaningReversed
      })),
      timestamp: new Date().toLocaleString('vi-VN'),
      birthDate: birthDate || undefined,
      synthesisContext: synthesis
        ? `Tong quan: ${synthesis.overview}\nMoi lien he: ${synthesis.patternSummary}\nTin hieu: ${synthesis.mainSignal}\nDiem noi bat: ${synthesis.keyTension}\nLoi khuyen tong hop: ${synthesis.keyAdvice}\nTom tat: ${synthesis.oneLineSummary}`
        : undefined,
      zodiacLens: zodiacLens ?? undefined,
      userMemorySummary: buildMemorySummaryForPrompt(
        buildUserProfileFromHistory(getLocalReadingHistory()),
        getLocalReadingHistory(5)
      )
    };

    try {
      let finalRes: UnifiedAIReadingResponse;
      try {
        const response = await fetch('/api/read-tarot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error('Real API failed');
        finalRes = await response.json();
      } catch {
        console.warn('Fallback to mock Tarot AI');
        finalRes = await mockAITarotReading(question, drawnCards, 'kinhdichai_signature');
      }

      setAiResponse(finalRes);
      setAiState('done');

      // Save to local memory
      const id = saveReadingToLocalMemory({
        type: 'tarot',
        question,
        topic: 'Tarot Reading',
        birthDate: birthDate || undefined,
        zodiacSign: zodiacLens?.sign,
        spreadType: selectedSpread.name,
        cards: drawnCards.map(dc => ({
          name: dc.card.name,
          orientation: dc.isReversed ? 'reversed' : 'upright',
          position: dc.positionName
        })),
        synthesis,
        aiAnswer: finalRes
      });
      setReadingId(id);

    } catch (err) {
      console.error('AI Error:', err);
      setAiState('error');
    }

    setTimeout(() => {
      document.getElementById('ai-tarot-reading')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const reset = () => {
    setStep('landing');
    setQuestion('');
    setSelectedSpread(null);
    setDeck([]);
    setDrawnCards([]);
    setRevealedIndices([]);
    setIsRevealing(false);
    setAiState('idle');
    setAiResponse(null);
    setSynthesis(null);
    setBirthDate('');
    setZodiacLens(null);
  };

  return (
    <section className="tarot-section">
      <div className="tarot-stars-bg"></div>
      
      <div className="tarot-container">
        
        {step === 'landing' && (
          <TarotLandingPage 
            onStart={() => setStep('select-spread')}
            onSelectSpread={(spreadId) => {
              const spread = SPREADS.find(s => s.id === spreadId);
              if (spread) {
                handleSelectSpread(spread);
              }
            }}
          />
        )}

        {step === 'select-spread' && (
          <div className="fade-in" style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ color: 'var(--amber)', fontSize: '2.4rem', marginBottom: '15px', fontFamily: '"Playfair Display", serif' }}>Trải Bài Tarot</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem' }}>Chọn một trải bài phù hợp với vấn đề bạn đang tìm kiếm để bắt đầu nghi thức.</p>
            
            <div className="spread-grid">
              {SPREADS.map(spread => (
                <div key={spread.id} className="spread-card" onClick={(e) => handleSelectSpread(spread, e)}>
                  <h3>{spread.name}</h3>
                  <p>{spread.description}</p>
                  <p style={{ color: '#a0b8ff', fontSize: '0.8rem', marginTop: '10px' }}>Số lá bài: {spread.cardCount}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 'shuffle' && selectedSpread && (
          <div ref={readingStartRef} className="tarot-reading-flow fade-in" style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
            <h3 style={{ color: 'var(--amber)', marginBottom: '30px', fontSize: '1.8rem', fontFamily: '"Playfair Display", serif' }}>{selectedSpread.name}</h3>

            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Tập trung ý niệm và nhập câu hỏi của bạn..."
              rows={3}
              style={{ width: '100%', maxWidth: '500px', marginBottom: '20px', background: 'rgba(10,5,20,0.6)', color: '#fff', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '12px', padding: '15px', fontSize: '1rem', backdropFilter: 'blur(10px)', resize: 'vertical' }}
            />

            {/* Ngày sinh — tuỳ chọn, dùng để xác định cung hoàng đạo */}
            <div style={{ maxWidth: '500px', margin: '0 auto 28px', textAlign: 'left' }}>
              <label
                htmlFor="tarot-birth-date"
                style={{ display: 'block', color: 'rgba(212,175,55,0.85)', fontSize: '0.85rem', marginBottom: '6px', letterSpacing: '0.5px' }}
              >
                Ngày sinh của bạn
              </label>
              {/* Controlled dd/mm/yyyy input — avoids browser locale differences with type="date" */}
              <input
                id="tarot-birth-date"
                type="text"
                inputMode="numeric"
                placeholder="dd/mm/yyyy"
                maxLength={10}
                value={birthDate}
                onChange={(e) => {
                  // Auto-insert slashes: 2 digits day, slash, 2 digits month, slash, 4 digits year
                  let v = e.target.value.replace(/[^\d]/g, '');
                  if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2);
                  if (v.length > 5) v = v.slice(0, 5) + '/' + v.slice(5);
                  if (v.length > 10) v = v.slice(0, 10);
                  setBirthDate(v);
                  // Parse dd/mm/yyyy → yyyy-mm-dd for zodiac calculation
                  const parts = v.split('/');
                  if (parts.length === 3 && parts[2].length === 4) {
                    const isoDate = `${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`;
                    const sign = getZodiacSignFromDate(isoDate);
                    if (sign) {
                      import('../../lib/ai/prompts').then(({ classifyQuestionContext }) => {
                        const ctx = classifyQuestionContext(question || '');
                        setZodiacLens(buildZodiacLens(sign, ctx.questionType));
                      }).catch(() => setZodiacLens(buildZodiacLens(sign)));
                    } else {
                      setZodiacLens(null);
                    }
                  } else {
                    setZodiacLens(null);
                  }
                }}
                style={{
                  width: '100%',
                  background: 'rgba(10,5,20,0.6)',
                  color: '#fff',
                  border: '1px solid rgba(212,175,55,0.25)',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  fontSize: '0.95rem',
                  letterSpacing: '1px',
                }}
              />
              <p style={{ margin: '6px 0 0', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>
                Dùng để xác định cung hoàng đạo và cá nhân hóa luận giải. Bạn có thể bỏ qua nếu không muốn.
              </p>
              {zodiacLens && (
                <div style={{ marginTop: '10px', padding: '8px 14px', borderRadius: '8px', background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)', fontSize: '0.82rem', color: 'rgba(167,139,250,0.9)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>&#9885;</span>
                  <span>Cung {zodiacLens.viName} ({zodiacLens.sign}) - {zodiacLens.element === 'fire' ? 'Lửa' : zodiacLens.element === 'earth' ? 'Đất' : zodiacLens.element === 'air' ? 'Khí' : 'Nước'}</span>
                </div>
              )}
            </div>

            <div className="deck-area">
              <div className={`tarot-deck-stack ${isShuffling ? 'shuffling' : ''}`}>
                {/* Render fake stack of cards for 3D effect */}
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="tarot-card" style={{ top: `${i * -2}px`, left: `${i * -2}px`, zIndex: i }}>
                    <div className="tarot-card-inner">
                      <div className="tarot-card-back"></div>
                    </div>
                  </div>
                ))}
              </div>
              
              <button onClick={handleShuffle} disabled={isShuffling} className="button primary-button" style={{ background: 'var(--amber)', color: '#000' }}>
                {isShuffling ? 'Đang tráo bài...' : 'Tráo bài'}
              </button>
            </div>
          </div>
        )}

        {step === 'draw' && selectedSpread && (
          <div className="fade-in" style={{ textAlign: 'center' }}>
            <h3 style={{ color: 'var(--amber)', fontSize: '1.6rem', fontFamily: '"Playfair Display", serif' }}>Rút {selectedSpread.cardCount} lá bài</h3>
            <p style={{ marginBottom: '30px', color: 'rgba(255,255,255,0.6)' }}>Bạn đã rút {drawnCards.length} / {selectedSpread.cardCount}</p>

            <div className="deck-area">
              <button 
                className="tarot-deck-stack" 
                onClick={handleDrawCard} 
                disabled={isRevealing}
                style={{ cursor: isRevealing ? 'wait' : 'pointer', background: 'transparent', border: 'none', padding: 0 }}
              >
                <div className="tarot-card" style={{ top: '-4px', left: '-4px', zIndex: 10, boxShadow: '0 0 25px rgba(212,175,55,0.4)', transition: 'box-shadow 0.3s' }}>
                  <div className="tarot-card-inner">
                    <div className="tarot-card-back"></div>
                  </div>
                </div>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="tarot-card" style={{ top: `${i * -2}px`, left: `${i * -2}px`, zIndex: i }}>
                    <div className="tarot-card-inner">
                      <div className="tarot-card-back"></div>
                    </div>
                  </div>
                ))}
              </button>
              <p className="pulse" style={{ color: 'var(--amber)', fontSize: '0.9rem', marginTop: '20px' }}>
                {isRevealing ? 'Bài đang được mở...' : 'Chạm vào bộ bài để rút'}
              </p>
            </div>

            <div className="drawn-cards-container">
              {drawnCards.map((dc, i) => (
                <div key={i} className="drawn-card-wrapper fade-in">
                  <div className={`tarot-card revealed ${dc.isReversed ? 'reversed' : ''}`} style={{ position: 'relative', width: '120px', height: '210px' }}>
                    <div className="tarot-card-inner">
                      <div className="tarot-card-back"></div>
                      <div className="tarot-card-front">
                        <div className="card-number">{dc.card.value}</div>
                        <div className={`card-artwork ${dc.isReversed ? 'reversed-art' : ''}`}>
                          <img 
                            src={dc.card.image} 
                            alt={dc.card.name}
                            decoding="async"
                            onError={(e) => {
                              // Hide broken image and show fallback
                              e.currentTarget.style.display = 'none';
                              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                          <div className="card-art-placeholder" style={{ display: 'none' }}>
                            <div className="art-symbol">{dc.card.symbol}</div>
                          </div>
                        </div>
                        <div className="card-title">{dc.card.name}</div>
                      </div>
                    </div>
                  </div>
                  <div className="drawn-card-position">{dc.positionName}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 'result' && selectedSpread && (
          <div className="fade-in" style={{ maxWidth: '960px', margin: '0 auto', width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <h3 style={{ color: 'var(--amber)', fontSize: '2.2rem', fontFamily: '"Playfair Display", serif', marginBottom: '10px' }}>Thông Điệp Tarot</h3>
              {question && <p style={{ fontStyle: 'italic', fontSize: '1.2rem', color: 'rgba(255,255,255,0.8)' }}>"{question}"</p>}
            </div>

            <div className="drawn-cards-container" style={{ margin: '0 auto 60px', justifyContent: 'center' }}>
              {drawnCards.map((dc, i) => {
                const isRevealed = revealedIndices.includes(i);
                return (
                  <div key={i} className="drawn-card-wrapper draw-fly-in" style={{ animationDelay: `${i * 0.15}s` }}>
                    <div className={`tarot-card ${isRevealed ? 'revealed' : ''} ${dc.isReversed ? 'reversed' : ''}`} style={{ position: 'relative', width: '160px', height: '272px' }}>
                      <div className="tarot-card-inner">
                        <div className="tarot-card-back"></div>
                        <div className="tarot-card-front">
                          <div className="card-number">{dc.card.value}</div>
                          <div className={`card-artwork ${dc.isReversed ? 'reversed-art' : ''}`}>
                            <img 
                              src={dc.card.image} 
                              alt={dc.card.name}
                              decoding="async"
                              onError={(e) => {
                                // Hide broken image and show fallback
                                e.currentTarget.style.display = 'none';
                                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                if (fallback) fallback.style.display = 'flex';
                              }}
                            />
                            <div className="card-art-placeholder" style={{ display: 'none' }}>
                              <div className="art-symbol">{dc.card.symbol}</div>
                            </div>
                          </div>
                          <div className="card-title">{dc.card.name}</div>
                        </div>
                      </div>
                      <div className="glow-burst"></div>
                    </div>
                    <div className="drawn-card-position" style={{ opacity: isRevealed ? 1 : 0, transition: 'opacity 0.5s ease 0.4s' }}>{dc.positionName}</div>
                    <div style={{ color: dc.isReversed ? '#f87171' : '#4ade80', fontSize: '0.85rem', marginTop: '8px', fontWeight: 'bold', letterSpacing: '1px', opacity: isRevealed ? 1 : 0, transition: 'opacity 0.5s ease 0.4s' }}>
                      {dc.isReversed ? 'NGƯỢC (REVERSED)' : 'XUÔI (UPRIGHT)'}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="panel glass-panel" style={{ background: 'rgba(15, 5, 25, 0.7)', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
              <h3 style={{ borderBottom: '1px solid rgba(212, 175, 55, 0.2)', paddingBottom: '20px', marginBottom: '30px', color: 'var(--amber)', fontFamily: '"Playfair Display", serif', fontSize: '1.5rem', textAlign: 'center' }}>Giải nghĩa chi tiết</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {drawnCards.map((dc, i) => (
                  <div key={i} className="tarot-result-card glass-box">
                    <h4>{dc.positionName}: {dc.card.nameVi} ({dc.card.name})</h4>
                    <div className="keywords">
                      Từ khóa: {dc.isReversed ? dc.card.keywordsReversed.join(', ') : dc.card.keywordsUpright.join(', ')}
                    </div>
                    <p>{dc.isReversed ? dc.card.meaningReversed : dc.card.meaningUpright}</p>
                  </div>
                ))}
              </div>

              {/* ── Synthesis layer (shown after reveal completes) ── */}
              {synthesis && !isRevealing && (
                <div style={{ marginBottom: '10px' }}>
                  <TarotSynthesisDisplay synthesis={synthesis} />
                </div>
              )}

              <div id="ai-tarot-reading" style={{ marginTop: '40px', padding: '30px', background: 'rgba(112, 66, 163, 0.05)', borderRadius: '16px', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
                {aiState === 'idle' && (
                  <div style={{ textAlign: 'center' }}>
                    <h4 style={{ color: 'var(--amber)', fontSize: '1.4rem', marginBottom: '15px' }}>Luận Giải Toàn Diện</h4>
                    <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '20px' }}>
                      AI sẽ kết nối ý nghĩa của tất cả các lá bài trong trải bài của bạn để đưa ra thông điệp tổng hợp.
                    </p>
                    <br />
                    <button onClick={handleGetAIReading} className="button primary-button" style={{ background: 'var(--amber)', color: '#000' }}>
                      Luận Bài Bằng AI
                    </button>
                  </div>
                )}

                {aiState === 'loading' && (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <div className="pulse-circle" style={{ margin: '0 auto 20px', width: '60px', height: '60px' }}></div>
                    <p style={{ color: 'var(--amber)', fontSize: '1.2rem', fontWeight: 'bold' }}>Đang giải mã các biểu tượng...</p>
                  </div>
                )}

                {aiState === 'done' && aiResponse && (
                  <AIReadingDisplay response={aiResponse} readingId={readingId} />
                )}
              </div>

              <div style={{ marginTop: '30px', textAlign: 'center', opacity: isRevealing ? 0.3 : 1, transition: 'opacity 0.5s', pointerEvents: isRevealing ? 'none' : 'auto' }}>

                <button onClick={reset} disabled={isRevealing} className="button secondary-button" style={{ border: '1px solid var(--amber)', color: 'var(--amber)' }}>
                  Kết thúc nghi thức (Trải bài mới)
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </section>
  );
};

export default TarotSection;
