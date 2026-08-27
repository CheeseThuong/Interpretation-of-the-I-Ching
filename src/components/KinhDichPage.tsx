import React, { useCallback, useMemo, useState } from 'react';
import type { CastingMetadata, ManualHexagramState } from '../types';
import { computeManualHexagramState } from '../utils/hexagram';
import { getHexagramFull } from '../data/hexagramsFull';
import { coinLineOptions } from '../data/shared';
import { heavenlyStems } from '../data/canchi';
import { mockAIHexagramReading } from '../utils/mockAI';
import type { AIReadingResponse } from '../utils/mockAI';
import { synthesizeKinhDichReading } from '../lib/readings/synthesis';
import type { KinhDichSynthesis } from '../lib/readings/synthesis';
import { KinhDichSynthesisDisplay } from './ui/ReadingSynthesis';
import { HexagramChart } from './ui/HexagramChart';
import CoinFlip from './ui/CoinFlip';
import AIReadingDisplay from './ui/AIReadingDisplay';
import ReadingSection from './sections/ReadingSection';
import { saveReadingToLocalMemory, getLocalReadingHistory } from '../lib/memory/localReadingMemory';
import { buildUserProfileFromHistory, buildMemorySummaryForPrompt } from '../lib/memory/userProfile';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import '../styles/kinh-dich-vip.css';

type RitualStep = 'intro' | 'quick' | 'method' | 'casting' | 'result';
type CastingMethod = 'auto' | 'manual';

const TOPICS = [
  'Tình yêu / Love',
  'Sự nghiệp / Career',
  'Tài chính / Money',
  'Học tập / Study',
  'Gia đình / Family',
  'Quyết định cá nhân / Personal Decision',
  'Chữa lành nội tâm / Inner Healing',
];

const DEFAULT_COIN_LINES = [7, 7, 7, 7, 7, 7];
const DISPLAY_ORDER = [5, 4, 3, 2, 1, 0]; // hào 6 (trên) xuống hào 1 (dưới)

interface KinhDichPageProps {
  defaultMode?: 'casting' | 'manual' | 'ai-reading';
  onModeChange?: (mode: 'casting' | 'manual' | 'ai-reading') => void;
}

const KinhDichPage: React.FC<KinhDichPageProps> = ({ defaultMode, onModeChange }) => {
  const [step, setStep] = useState<RitualStep>(
    defaultMode === 'ai-reading' ? 'quick' : 'intro',
  );
  const [method, setMethod] = useState<CastingMethod | null>(
    defaultMode === 'manual' ? 'manual' : defaultMode === 'casting' ? null : null,
  );

  // Shared ritual form state
  const [topic, setTopic] = useState(TOPICS[0]);
  const [question, setQuestion] = useState('');
  const [notes, setNotes] = useState('');
  const [manualDate, setManualDate] = useState('');
  const [manualTime, setManualTime] = useState('');
  const [dayStem, setDayStem] = useState('Mậu');

  // Casting state
  const [coinLines, setCoinLines] = useState<number[]>(DEFAULT_COIN_LINES);
  const [isFlipping, setIsFlipping] = useState(false);
  const [currentFaces, setCurrentFaces] = useState<number[]>([3, 3, 3]);
  const [flipId, setFlipId] = useState(0);

  const [metadata, setMetadata] = useState<CastingMetadata | null>(null);
  const [hexagramState, setHexagramState] = useState<ManualHexagramState | null>(null);

  // AI reading state
  const [aiState, setAiState] = useState<'idle' | 'loading' | 'done'>('idle');
  const [aiResponse, setAiResponse] = useState<AIReadingResponse | null>(null);
  const [readingId, setReadingId] = useState<string | undefined>(undefined);

  const goToMethodStep = () => {
    setStep('method');
    if (onModeChange) onModeChange('casting');
  };

  const goToQuickStep = () => {
    setStep('quick');
    if (onModeChange) onModeChange('ai-reading');
  };

  const buildMetadata = (): CastingMetadata => {
    const now = new Date();
    const manualOverride = Boolean(manualDate || manualTime);
    return {
      question,
      topic,
      notes,
      gregorianDate: manualDate || now.toLocaleDateString('vi-VN'),
      localTime: manualTime || now.toLocaleTimeString('vi-VN'),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      manualOverride,
    };
  };

  const handleChooseMethod = (chosen: CastingMethod) => {
    if (!question.trim()) return;
    setMetadata(buildMetadata());
    setMethod(chosen);
    setCoinLines(chosen === 'auto' ? [] : DEFAULT_COIN_LINES);
    setHexagramState(null);
    setStep('casting');
  };

  // ── Auto-toss branch: one hào at a time, mirrors the original coin-flip ritual ──
  const castSingleLine = useCallback(() => {
    if (isFlipping || coinLines.length >= 6) return;
    setIsFlipping(true);
    setFlipId((id) => id + 1);

    const flip = () => (Math.random() < 0.5 ? 2 : 3); // 2 = Yin, 3 = Yang
    const f1 = flip();
    const f2 = flip();
    const f3 = flip();
    const sum = f1 + f2 + f3; // 6, 7, 8, or 9
    setCurrentFaces([f1, f2, f3]);

    setTimeout(() => {
      setIsFlipping(false);
      setCoinLines((prev) => {
        const next = [...prev, sum];
        if (next.length === 6) {
          try {
            const finalState = computeManualHexagramState(next, dayStem, question);
            setHexagramState(finalState);
          } catch (err) {
            console.error(err);
          }
          setTimeout(() => setStep('result'), 1500);
        }
        return next;
      });
    }, 1400);
  }, [isFlipping, coinLines.length, dayStem, question]);

  // ── Manual-entry branch ──
  const handleUpdateManualLine = (index: number, value: number) => {
    const next = [...coinLines];
    next[index] = value;
    setCoinLines(next);
  };

  const handleSubmitManualLines = () => {
    try {
      const finalState = computeManualHexagramState(coinLines, dayStem, question);
      setHexagramState(finalState);
      setStep('result');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
    }
  };

  const primaryFull = hexagramState ? getHexagramFull(hexagramState.primaryInfo.no) : undefined;
  const changedFull = hexagramState ? getHexagramFull(hexagramState.changedInfo.no) : undefined;

  const synthesis: KinhDichSynthesis | null = useMemo(() => {
    if (!hexagramState || !metadata) return null;
    return synthesizeKinhDichReading({
      question: metadata.question,
      topic: metadata.topic,
      primaryHexagram: hexagramState.primaryInfo.name,
      changedHexagram: hexagramState.changedInfo.name,
      movingLines: hexagramState.movingLines.length > 0 ? hexagramState.movingLines.join(', ') : 'Không có',
      sixLines: hexagramState.primaryLines.join(', '),
    });
  }, [hexagramState, metadata]);

  const handleGetAIReading = async () => {
    if (!hexagramState || !metadata) return;
    setAiState('loading');

    const payload = {
      question: metadata.question,
      topic: metadata.topic,
      userNotes: metadata.notes,
      primaryHexagram: hexagramState.primaryInfo.name,
      changedHexagram: hexagramState.changedInfo.name,
      primaryHexagramNo: hexagramState.primaryInfo.no,
      changedHexagramNo: hexagramState.changedInfo.no,
      movingLines: hexagramState.movingLines.length > 0 ? hexagramState.movingLines.join(', ') : 'Không có',
      sixLines: hexagramState.primaryLines.join(', '),
      castingDateTime: `${metadata.localTime} ${metadata.gregorianDate}`,
      timezone: metadata.timezone,
      readingTone: 'kinhdichai_signature',
      method: method === 'manual' ? 'manual-real-life' : 'auto-casting',
      synthesisContext: synthesis,
      userMemorySummary: buildMemorySummaryForPrompt(
        buildUserProfileFromHistory(getLocalReadingHistory()),
        getLocalReadingHistory(5),
      ),
    };

    try {
      let finalRes: AIReadingResponse;
      try {
        const response = await fetch('/api/read-hexagram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error('API failed');
        finalRes = await response.json();
      } catch (err) {
        console.warn('Backend API failed, using mock:', err);
        finalRes = await mockAIHexagramReading(metadata, hexagramState, 'kinhdichai_signature');
      }

      setAiResponse(finalRes);
      setAiState('done');

      const id = saveReadingToLocalMemory({
        type: 'iching',
        question: metadata.question,
        topic: metadata.topic,
        hexagram: {
          primary: hexagramState.primaryInfo.name,
          changed: hexagramState.changedInfo.name,
          movingLines: hexagramState.movingLines,
        },
        synthesis,
        aiAnswer: finalRes,
      });
      setReadingId(id);
    } catch (err) {
      console.error(err);
      setAiState('idle');
    }

    setTimeout(() => {
      document.getElementById('ai-reading-result')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const reset = () => {
    setStep('intro');
    setMethod(null);
    setTopic(TOPICS[0]);
    setQuestion('');
    setNotes('');
    setManualDate('');
    setManualTime('');
    setDayStem('Mậu');
    setCoinLines(DEFAULT_COIN_LINES);
    setCurrentFaces([3, 3, 3]);
    setMetadata(null);
    setHexagramState(null);
    setAiState('idle');
    setAiResponse(null);
    setReadingId(undefined);
  };

  return (
    <div className="kd-vip-container fade-in">
      <div className="kd-vip-glow" />
      <div className="kd-vip-stars" />

      <div className="kd-motif-left">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
          <path d="M50 10 L50 90 M10 50 L90 50" stroke="currentColor" strokeWidth="1" opacity="0.5" />
        </svg>
      </div>
      <div className="kd-motif-right">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="1" opacity="0.3" />
          <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="2" />
          <circle cx="50" cy="50" r="15" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
        </svg>
      </div>

      <div className="kd-vip-content mx-auto max-w-[960px] px-4 pb-20">
        {step === 'intro' && (
          <div className="fade-in mx-auto max-w-[640px] py-16 text-center">
            <p className="mb-3 text-[0.78rem] font-black uppercase tracking-[0.22em] text-gold">Kinh Dịch</p>
            <h2 className="mb-4 font-heading text-4xl text-gold-soft md:text-5xl">Nghi Lễ Lập Quẻ</h2>
            <p className="mx-auto mb-10 max-w-[520px] text-foreground/70">
              Tập trung vào câu hỏi thật của bạn, chọn cách gieo quẻ, rồi để 64 quẻ và AI cùng soi chiếu tình huống hiện tại.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                size="lg"
                className="h-12 rounded-2xl bg-gold px-6 text-base font-extrabold text-[#000] hover:bg-gold-soft"
                onClick={goToMethodStep}
              >
                Bắt đầu nghi lễ
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 rounded-2xl border-gold-soft/40 px-6 text-base text-gold-soft hover:bg-gold-soft/10"
                onClick={goToQuickStep}
              >
                Xem nhanh (quẻ ngẫu nhiên theo chủ đề)
              </Button>
            </div>
          </div>
        )}

        {step === 'quick' && (
          <div className="fade-in">
            <Button variant="ghost" className="mb-4 text-muted-foreground" onClick={() => setStep('intro')}>
              ← Quay lại
            </Button>
            <ReadingSection />
          </div>
        )}

        {step === 'method' && (
          <Card className="fade-in mx-auto max-w-[640px] border-border-gold/30 bg-card-soft">
            <CardContent className="pt-2">
              <p className="mb-1 text-[0.78rem] font-black uppercase tracking-[0.2em] text-gold">Tập Trung Ý Niệm</p>
              <h2 className="mb-2 font-heading text-2xl text-gold-soft">Chọn chủ đề và đặt câu hỏi</h2>
              <p className="mb-6 text-sm text-muted-foreground">
                Câu hỏi càng rõ, quẻ càng dễ soi đúng trọng tâm. Sau đó chọn cách lập quẻ phù hợp với bạn.
              </p>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm text-muted-foreground">Chủ đề</label>
                  <Select value={topic} onValueChange={(v) => v && setTopic(v)}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TOPICS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-muted-foreground">Thiên can ngày (tùy chọn)</label>
                  <Select value={dayStem} onValueChange={(v) => v && setDayStem(v)}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {heavenlyStems.map((s) => <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-1.5 block text-sm text-muted-foreground">Câu hỏi của bạn</label>
                <Textarea
                  rows={2}
                  placeholder="Ví dụ: Tôi có nên chuyển công việc trong tháng này không?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                />
              </div>

              <div className="mt-4">
                <label className="mb-1.5 block text-sm text-muted-foreground">Ghi chú thêm (tùy chọn)</label>
                <Textarea
                  rows={2}
                  placeholder="Bối cảnh chi tiết..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm text-muted-foreground">Ngày gieo quẻ</label>
                  <Input type="date" value={manualDate} onChange={(e) => setManualDate(e.target.value)} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-muted-foreground">Giờ (tùy chọn)</label>
                  <Input type="time" value={manualTime} onChange={(e) => setManualTime(e.target.value)} />
                </div>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                * Nếu để trống, hệ thống lấy thời gian hiện tại khi bạn bắt đầu gieo.
              </p>

              <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Button
                  disabled={!question.trim()}
                  className="h-12 rounded-2xl bg-gold text-base font-extrabold text-[#000] hover:bg-gold-soft disabled:opacity-40"
                  onClick={() => handleChooseMethod('auto')}
                >
                  Tự gieo (hiệu ứng đồng xu)
                </Button>
                <Button
                  disabled={!question.trim()}
                  variant="outline"
                  className="h-12 rounded-2xl border-gold-soft/40 text-base text-gold-soft hover:bg-gold-soft/10 disabled:opacity-40"
                  onClick={() => handleChooseMethod('manual')}
                >
                  Tôi đã gieo ngoài đời, nhập kết quả
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'casting' && method === 'auto' && (
          <div className="fade-in grid grid-cols-1 items-start gap-7 md:grid-cols-2">
            <Card className="border-border-gold/30 bg-card-soft text-center">
              <CardContent className="pt-2">
                <h3 className="mb-2 font-heading text-xl text-gold-soft">Hào {coinLines.length + 1} / 6</h3>
                <p className="mb-6 italic text-muted-foreground">"{question}"</p>
                <CoinFlip faces={currentFaces} isFlipping={isFlipping} flipId={flipId} />
                <Button
                  onClick={castSingleLine}
                  disabled={isFlipping || coinLines.length >= 6}
                  className="mt-7 h-12 w-full rounded-2xl bg-gold text-base font-extrabold text-[#000] hover:bg-gold-soft disabled:opacity-60"
                >
                  {isFlipping ? 'Đang gieo...' : `Gieo Hào ${coinLines.length + 1}`}
                </Button>
                <div className="mt-4 text-[0.78rem] leading-relaxed text-muted-foreground">
                  <p className="m-0">6 = Lão Âm (Động) &nbsp; 7 = Thiếu Dương</p>
                  <p className="m-0">8 = Thiếu Âm &nbsp; 9 = Lão Dương (Động)</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border-gold/30 bg-card-soft">
              <CardContent className="pt-2">
                <h4 className="mb-5 text-center font-heading text-lg text-gold-soft">Sự Hình Thành Quẻ</h4>
                {coinLines.length === 0 && (
                  <p className="text-center italic text-muted-foreground">Các hào sẽ xuất hiện từ dưới lên trên...</p>
                )}
                <div className="flex min-h-[120px] flex-col-reverse gap-3.5">
                  {coinLines.map((lineVal, index) => {
                    const isYang = lineVal === 7 || lineVal === 9;
                    const isMoving = lineVal === 6 || lineVal === 9;
                    return (
                      <div key={index} className={`hex-line build-line fade-in${isMoving ? ' moving' : ''}`}>
                        {isYang ? (
                          <div className="line-solid" />
                        ) : (
                          <>
                            <div className="line-half" />
                            <div className="line-half" />
                          </>
                        )}
                        {isMoving && (
                          <span className="moving-label">Động ({lineVal === 6 ? 'Lão Âm' : 'Lão Dương'})</span>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-6 flex justify-center gap-2">
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <div
                      key={n}
                      className={cn(
                        'h-2.5 w-2.5 rounded-full transition-colors',
                        n <= coinLines.length ? 'bg-gold' : 'bg-white/15',
                      )}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 'casting' && method === 'manual' && (
          <Card className="fade-in mx-auto max-w-[560px] border-border-gold/30 bg-card-soft">
            <CardContent className="pt-2">
              <h3 className="mb-1 font-heading text-xl text-gold-soft">Nhập kết quả 6 lần gieo đồng xu</h3>
              <p className="mb-6 text-sm text-muted-foreground">
                Hào 1 là hào dưới cùng, hào 6 là hào trên cùng — đúng thứ tự bạn đã gieo ngoài đời.
              </p>
              <div className="grid gap-3">
                {DISPLAY_ORDER.map((index) => (
                  <div key={index} className="grid grid-cols-[140px_1fr] items-center gap-3.5">
                    <label className="text-sm text-muted-foreground">
                      Hào {index + 1}{index === 5 ? ' — trên cùng' : index === 0 ? ' — dưới cùng' : ''}
                    </label>
                    <Select value={String(coinLines[index])} onValueChange={(v) => handleUpdateManualLine(index, Number(v))}>
                      <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {coinLineOptions.map((opt) => (
                          <SelectItem key={opt.value} value={String(opt.value)}>
                            {opt.value} — {opt.label} ({opt.note})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
              <Button
                onClick={handleSubmitManualLines}
                className="mt-8 h-12 w-full rounded-2xl bg-gold text-base font-extrabold text-[#000] hover:bg-gold-soft"
              >
                Lập quẻ
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 'result' && hexagramState && metadata && (
          <div className="fade-in">
            <Card className="mb-6 border-border-gold/30 bg-card-soft">
              <CardContent className="pt-2">
                <p className="text-[0.78rem] font-black uppercase tracking-[0.2em] text-gold">Kết Quả Gieo Quẻ</p>
                <h3 className="mt-1 font-heading text-2xl text-gold-soft">Chủ đề: {metadata.topic}</h3>
                <p className="mt-2 text-lg"><strong>Hỏi:</strong> "{metadata.question}"</p>
                {metadata.notes && (
                  <p className="mt-1 text-sm italic text-muted-foreground">Ghi chú: {metadata.notes}</p>
                )}
                <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span>Lịch dương: {metadata.gregorianDate}{metadata.manualOverride && ' (Thủ công)'}</span>
                  <span>Thời gian: {metadata.localTime}</span>
                  <span>Múi giờ: {metadata.timezone}</span>
                  <span>Thiên can: {dayStem}</span>
                </div>
              </CardContent>
            </Card>

            <HexagramChart state={hexagramState} primaryFull={primaryFull} changedFull={changedFull} />

            {synthesis && (
              <div className="mt-6">
                <KinhDichSynthesisDisplay synthesis={synthesis} />
              </div>
            )}

            <div className="mt-8 rounded-2xl border border-border bg-[rgba(112,66,163,0.05)] p-7">
              {aiState === 'idle' && (
                <div className="text-center">
                  <h3 className="mb-3 font-heading text-2xl text-gold-soft">Nhận Lời Khuyên Từ Vũ Trụ</h3>
                  <p className="mb-5 text-foreground/70">
                    Kinh Dịch AI sẽ tổng hợp hào động, tượng quẻ và câu hỏi của bạn để đưa ra luận giải chi tiết.
                  </p>
                  <Button
                    onClick={handleGetAIReading}
                    size="lg"
                    className="h-12 rounded-2xl px-6 text-base font-extrabold text-white"
                    style={{ background: 'linear-gradient(135deg, #7042a3, #2a4b8d)' }}
                  >
                    Luận Quẻ Bằng AI
                  </Button>
                </div>
              )}

              {aiState === 'loading' && (
                <div className="py-10 text-center">
                  <div className="pulse-circle mx-auto mb-5 h-[60px] w-[60px]" />
                  <p className="text-xl font-bold text-gold">Đang kết nối với trí tuệ cổ xưa...</p>
                  <p className="italic text-foreground/60">Giải mã tượng quẻ theo câu hỏi của bạn.</p>
                </div>
              )}

              {aiState === 'done' && aiResponse && (
                <div id="ai-reading-result">
                  <AIReadingDisplay response={aiResponse} readingId={readingId} />
                </div>
              )}
            </div>

            <div className="mt-8 text-center">
              <Button variant="outline" className="border-gold text-gold hover:bg-gold/10" onClick={reset}>
                Gieo Quẻ Khác
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KinhDichPage;
