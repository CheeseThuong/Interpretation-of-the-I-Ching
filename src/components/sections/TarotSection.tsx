import React, { useState } from 'react';
import '../../styles/tarot.css';
import { SPREADS } from '../../data/tarot';
import type { TarotSpread, TarotCard, DrawnCard } from '../../types/tarot';
import { isWeakTarotAIResponse, mockAITarotReading } from '../../utils/mockAI';
import AIReadingDisplay from '../ui/AIReadingDisplay';
import { createFreshTarotDeck, shuffleTarotDeck, drawTarotCards, pickCardAtIndex } from '../../utils/tarotDeck';
import { synthesizeTarotReading } from '../../lib/readings/synthesis';
import type { TarotSynthesis } from '../../lib/readings/synthesis';
import { TarotSynthesisDisplay } from '../ui/ReadingSynthesis';
import { getZodiacSignFromDate, buildZodiacLens } from '../../lib/astrology/zodiac';
import type { ZodiacLens } from '../../lib/astrology/zodiac';
import TarotLandingPage from '../tarot/TarotLandingPage';
import { saveReadingToLocalMemory, getLocalReadingHistory } from '../../lib/memory/localReadingMemory';
import { buildUserProfileFromHistory, buildMemorySummaryForPrompt } from '../../lib/memory/userProfile';
import type { UnifiedAIReadingResponse } from '../../types/ai';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

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
  // Which grid-card indices (in the current `deck` array) the user has tapped so far,
  // in pick order — used only to render the "already tapped" visual state in the grid.
  const [pickedGridIndices, setPickedGridIndices] = useState<number[]>([]);

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
    setPickedGridIndices([]);
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
      setPickedGridIndices([]);
      setStep('draw');
    }, 2000);
  };

  const runRevealAndSynthesis = (allDrawn: DrawnCard[], spread: TarotSpread) => {
    setIsRevealing(true);
    setTimeout(() => {
      setStep('result');
      spread.positions.forEach((_, idx) => {
        setTimeout(() => {
          setRevealedIndices(prev => [...prev, idx]);
        }, 800 + (idx * 600));
      });
      const revealDone = 800 + (spread.cardCount * 600) + 500;
      setTimeout(() => {
        setIsRevealing(false);
        const syn = synthesizeTarotReading({
          question,
          spreadId: spread.id,
          spreadName: spread.name,
          drawnCards: allDrawn,
          positionMeta: spread.positionMeta,
        });
        setSynthesis(syn);
      }, revealDone);
    }, 1000);
  };

  // User taps one face-down card in the 78-card grid to fill the next spread position.
  const handlePickCard = (gridIndex: number) => {
    if (!selectedSpread) return;
    if (isRevealing || drawnCards.length >= selectedSpread.cardCount) return;
    if (pickedGridIndices.includes(gridIndex)) return;

    const positionName = selectedSpread.positions[drawnCards.length] ?? `Lá ${drawnCards.length + 1}`;
    const { drawnCard } = pickCardAtIndex(deck, gridIndex, positionName);
    const nextDrawn = [...drawnCards, drawnCard];
    setDrawnCards(nextDrawn);
    setPickedGridIndices(prev => [...prev, gridIndex]);

    if (nextDrawn.length >= selectedSpread.cardCount) {
      runRevealAndSynthesis(nextDrawn, selectedSpread);
    }
  };

  // "Rút nhanh tất cả" — atomic shortcut for anyone who wants to skip manual picking.
  const handleQuickDrawAll = () => {
    if (!selectedSpread || isRevealing || drawnCards.length > 0) return;
    const allDrawn = drawTarotCards(deck, selectedSpread.cardCount, selectedSpread);
    setDrawnCards(allDrawn);
    setPickedGridIndices(Array.from({ length: selectedSpread.cardCount }, (_, i) => i));
    runRevealAndSynthesis(allDrawn, selectedSpread);
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
        finalRes = await mockAITarotReading(
          question,
          drawnCards,
          'kinhdichai_signature',
          selectedSpread.name,
          zodiacLens ?? undefined
        );
      }

      if (isWeakTarotAIResponse(finalRes, drawnCards, question)) {
        console.warn('AI Tarot response was too generic; replacing with local synthesis');
        finalRes = await mockAITarotReading(
          question,
          drawnCards,
          'kinhdichai_signature',
          selectedSpread.name,
          zodiacLens ?? undefined
        );
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
    setPickedGridIndices([]);
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
          <div className="fade-in mx-auto max-w-[800px] text-center">
            <h2 className="mb-4 font-heading text-4xl text-gold-soft">Trải Bài Tarot</h2>
            <p className="text-lg text-foreground/70">Chọn một trải bài phù hợp với vấn đề bạn đang tìm kiếm để bắt đầu nghi thức.</p>

            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {SPREADS.map(spread => (
                <Card
                  key={spread.id}
                  className="cursor-pointer border-border-gold/40 bg-card-soft text-left transition-transform hover:-translate-y-1 hover:shadow-[var(--shadow-card)]"
                  onClick={(e) => handleSelectSpread(spread, e)}
                >
                  <CardContent>
                    <h3 className="mb-2 font-heading text-xl text-gold-soft">{spread.name}</h3>
                    <p className="text-sm text-muted-foreground">{spread.description}</p>
                    <p className="mt-2.5 text-[0.8rem] text-[#a0b8ff]">Số lá bài: {spread.cardCount}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {step === 'shuffle' && selectedSpread && (
          <div ref={readingStartRef} className="tarot-reading-flow fade-in mx-auto max-w-[600px] text-center">
            <h3 className="mb-7 font-heading text-3xl text-gold-soft">{selectedSpread.name}</h3>

            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Tập trung ý niệm và nhập câu hỏi của bạn..."
              rows={3}
              className="mx-auto mb-5 max-w-[500px] resize-y border-gold-soft/30 bg-[rgba(10,5,20,0.6)] text-base text-white backdrop-blur-[10px] placeholder:text-white/40"
            />

            {/* Ngày sinh — tuỳ chọn, dùng để xác định cung hoàng đạo */}
            <div className="mx-auto mb-7 max-w-[500px] text-left">
              <label
                htmlFor="tarot-birth-date"
                className="mb-1.5 block text-[0.85rem] tracking-wide text-gold-soft/85"
              >
                Ngày sinh của bạn
              </label>
              {/* Controlled dd/mm/yyyy input — avoids browser locale differences with type="date" */}
              <Input
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
                className="h-auto border-gold-soft/25 bg-[rgba(10,5,20,0.6)] py-2.5 text-[0.95rem] tracking-wider text-white"
              />
              <p className="mt-1.5 text-xs leading-relaxed text-white/40">
                Dùng để xác định cung hoàng đạo và cá nhân hóa luận giải. Bạn có thể bỏ qua nếu không muốn.
              </p>
              {zodiacLens && (
                <div className="mt-2.5 flex items-center gap-2 rounded-lg border border-[rgba(167,139,250,0.2)] bg-[rgba(167,139,250,0.08)] px-3.5 py-2 text-[0.82rem] text-[rgba(167,139,250,0.9)]">
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

              <Button
                onClick={handleShuffle}
                disabled={isShuffling}
                size="lg"
                className="h-12 rounded-2xl bg-gold px-6 text-base font-extrabold text-[#000] hover:bg-gold-soft"
              >
                {isShuffling ? 'Đang tráo bài...' : 'Tráo bài'}
              </Button>
            </div>
          </div>
        )}

        {step === 'draw' && selectedSpread && (
          <div className="fade-in text-center">
            <h3 className="font-heading text-2xl text-gold-soft">Chọn {selectedSpread.cardCount} lá bài</h3>
            <p className="mb-3 text-foreground/60">
              Bạn đã chọn {drawnCards.length} / {selectedSpread.cardCount} — chạm vào một lá úp bất kỳ trong bộ bài đã tráo để bóc.
            </p>

            {drawnCards.length === 0 && (
              <Button
                onClick={handleQuickDrawAll}
                variant="outline"
                size="sm"
                className="mb-6 border-gold-soft/40 text-gold-soft hover:bg-gold-soft/10"
              >
                Rút nhanh tất cả (bỏ qua chọn thủ công)
              </Button>
            )}

            {/* Full 78-card face-down pick grid. Deliberately flat/static (no 3D
                transform-style, no per-cell flip) — the delicate .tarot-card 3D
                flip mechanics only run on the small number of already-picked
                cards below, never on all 78 cells at once, to keep this
                responsive on low-end mobile. */}
            <div
              role="group"
              aria-label="Bộ bài đã tráo, chạm để chọn lá"
              className="mx-auto grid max-h-[46vh] max-w-[720px] grid-cols-[repeat(auto-fill,minmax(34px,1fr))] gap-1.5 overflow-y-auto rounded-2xl border border-border-gold/25 bg-black/20 p-3 motion-reduce:transition-none sm:grid-cols-[repeat(auto-fill,minmax(40px,1fr))]"
            >
              {deck.map((_, gridIndex) => {
                const isPicked = pickedGridIndices.includes(gridIndex);
                return (
                  <button
                    key={gridIndex}
                    type="button"
                    disabled={isPicked || isRevealing || drawnCards.length >= selectedSpread.cardCount}
                    onClick={() => handlePickCard(gridIndex)}
                    aria-label={isPicked ? 'Lá đã chọn' : 'Chọn lá này'}
                    className={cn(
                      'aspect-[2/3] rounded-[4px] border transition-all duration-150',
                      isPicked
                        ? 'scale-90 border-transparent bg-transparent opacity-0'
                        : 'border-gold-soft/25 bg-gradient-to-br from-[#241a35] to-[#120c1c] hover:-translate-y-0.5 hover:border-gold-soft/70 hover:shadow-[0_0_10px_rgba(212,175,55,0.35)] active:translate-y-0',
                    )}
                  />
                );
              })}
            </div>

            <p className="pulse mt-5 text-sm text-gold">
              {isRevealing ? 'Bài đang được mở...' : 'Bộ bài vẫn được tráo ngẫu nhiên an toàn — bạn chỉ chọn vị trí muốn xem.'}
            </p>

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
          <div className="fade-in mx-auto w-full max-w-[960px]">
            <div className="mb-10 text-center">
              <h3 className="mb-2.5 font-heading text-4xl text-gold-soft">Thông Điệp Tarot</h3>
              {question && <p className="text-xl italic text-foreground/80">"{question}"</p>}
            </div>

            <div className="drawn-cards-container mx-auto mb-[60px] justify-center">
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
                    <div className={cn('mt-2 text-[0.85rem] font-bold tracking-wider transition-opacity duration-500 delay-[0.4s]', dc.isReversed ? 'text-red-400' : 'text-green-400')} style={{ opacity: isRevealed ? 1 : 0 }}>
                      {dc.isReversed ? 'NGƯỢC (REVERSED)' : 'XUÔI (UPRIGHT)'}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="panel glass-panel border border-gold-soft/20 bg-[rgba(15,5,25,0.7)]">
              <h3 className="mb-7 border-b border-gold-soft/20 pb-5 text-center font-heading text-2xl text-gold-soft">Giải nghĩa chi tiết</h3>

              <div className="flex flex-col gap-5">
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
                <div className="mb-2.5">
                  <TarotSynthesisDisplay synthesis={synthesis} />
                </div>
              )}

              <div id="ai-tarot-reading" className="mt-10 rounded-2xl border border-gold-soft/20 bg-[rgba(112,66,163,0.05)] p-7">
                {aiState === 'idle' && (
                  <div className="text-center">
                    <h4 className="mb-4 font-heading text-2xl text-gold-soft">Luận Giải Toàn Diện</h4>
                    <p className="mb-5 text-foreground/70">
                      AI sẽ kết nối ý nghĩa của tất cả các lá bài trong trải bài của bạn để đưa ra thông điệp tổng hợp.
                    </p>
                    <Button
                      onClick={handleGetAIReading}
                      size="lg"
                      className="h-12 rounded-2xl bg-gold px-6 text-base font-extrabold text-[#000] hover:bg-gold-soft"
                    >
                      Luận Bài Bằng AI
                    </Button>
                  </div>
                )}

                {aiState === 'loading' && (
                  <div className="py-10 text-center">
                    <div className="pulse-circle mx-auto mb-5 h-[60px] w-[60px]"></div>
                    <p className="text-xl font-bold text-gold">Đang giải mã các biểu tượng...</p>
                  </div>
                )}

                {aiState === 'done' && aiResponse && (
                  <AIReadingDisplay response={aiResponse} readingId={readingId} />
                )}
              </div>

              <div
                className="mt-7 text-center transition-opacity duration-500"
                style={{ opacity: isRevealing ? 0.3 : 1, pointerEvents: isRevealing ? 'none' : 'auto' }}
              >
                <Button
                  onClick={reset}
                  disabled={isRevealing}
                  variant="outline"
                  className="border-gold text-gold hover:bg-gold/10"
                >
                  Kết thúc nghi thức (Trải bài mới)
                </Button>
              </div>
            </div>

          </div>
        )}

      </div>
    </section>
  );
};

export default TarotSection;
