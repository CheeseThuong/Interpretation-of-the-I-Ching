import React, { useState, useMemo } from 'react';
import type { RiskLevel, UrgencyLevel } from '../../types';
import { rankChoices } from '../../utils/decision';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';

const DEFAULT_CONTEXT = 'Tôi đang phân vân vì cơ hội này có lợi lâu dài nhưng cần thời gian, tiền bạc và sự tập trung.';
const DEFAULT_CHOICES = 'Làm ngay trong tuần này\nChờ thêm thông tin rồi quyết\nTừ chối để tập trung việc khác';

const DecisionSection: React.FC = () => {
  const [context,    setContext]    = useState(DEFAULT_CONTEXT);
  const [choicesRaw, setChoicesRaw] = useState(DEFAULT_CHOICES);
  const [riskLevel,  setRiskLevel]  = useState<RiskLevel>('medium');
  const [urgency,    setUrgency]    = useState<UrgencyLevel>('medium');

  const choices = useMemo(
    () => choicesRaw.split('\n').map((c) => c.trim()).filter(Boolean),
    [choicesRaw],
  );

  const results = useMemo(
    () => rankChoices(choices, context, riskLevel, urgency),
    [choices, context, riskLevel, urgency],
  );

  return (
    <section className="section dark-section section-anchor" id="decision">
      <div className="container">
        <div className="section-title reveal light-title">
          <p className="eyebrow">Tính năng 03</p>
          <h2>Random quyết định nhưng có thuật toán</h2>
          <p>
            Hợp cho người đang phân vân. Hệ thống vẫn có yếu tố random nhẹ,
            nhưng quyết định chính dựa trên scoring theo dữ kiện người dùng nhập.
          </p>
        </div>

        <div className="two-column">
          {/* ── Form ── */}
          <Card className="reveal border border-border-gold bg-card text-card-foreground">
            <form id="decisionForm" onSubmit={(e) => e.preventDefault()}>
              <CardContent className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label htmlFor="decisionContext" className="text-sm font-bold text-gold-soft">
                    Việc đang phân vân
                  </label>
                  <Textarea
                    id="decisionContext"
                    rows={4}
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="choices" className="text-sm font-bold text-gold-soft">
                    Các lựa chọn, mỗi dòng một lựa chọn
                  </label>
                  <Textarea
                    id="choices"
                    rows={5}
                    value={choicesRaw}
                    onChange={(e) => setChoicesRaw(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="riskLevel" className="text-sm font-bold text-gold-soft">
                      Khả năng chịu rủi ro
                    </label>
                    <Select value={riskLevel} onValueChange={(value) => setRiskLevel(value as RiskLevel)}>
                      <SelectTrigger id="riskLevel" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Thấp</SelectItem>
                        <SelectItem value="medium">Trung bình</SelectItem>
                        <SelectItem value="high">Cao</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="urgency" className="text-sm font-bold text-gold-soft">
                      Độ gấp
                    </label>
                    <Select value={urgency} onValueChange={(value) => setUrgency(value as UrgencyLevel)}>
                      <SelectTrigger id="urgency" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Không gấp</SelectItem>
                        <SelectItem value="medium">Vừa phải</SelectItem>
                        <SelectItem value="high">Cần quyết nhanh</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </form>
          </Card>

          {/* ── Result ── */}
          <Card className="reveal border border-border-gold bg-card text-card-foreground">
            <CardContent className="flex flex-col gap-5">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <p className="eyebrow">Gợi ý quyết định</p>
                  <h3 id="bestChoice" className="m-0 font-heading text-2xl text-foreground">
                    {results[0]?.choice ?? 'Nhập lựa chọn'}
                  </h3>
                </div>
                <div
                  className="grid size-[52px] shrink-0 place-items-center rounded-2xl border border-gold-soft/30 bg-gold-soft/[0.07]"
                  aria-hidden="true"
                >
                  <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="block size-7">
                    {/* Abstract decision / balance sigil */}
                    <circle cx="14" cy="14" r="11" stroke="#d4af37" strokeWidth="1.2" opacity="0.6"/>
                    <line x1="14" y1="3" x2="14" y2="25" stroke="#d4af37" strokeWidth="1.2"/>
                    <line x1="3" y1="14" x2="25" y2="14" stroke="#d4af37" strokeWidth="1.2"/>
                    <circle cx="14" cy="14" r="2.5" fill="#d4af37" opacity="0.9"/>
                    <circle cx="14" cy="7" r="1.2" fill="#d4af37" opacity="0.5"/>
                    <circle cx="14" cy="21" r="1.2" fill="#d4af37" opacity="0.5"/>
                    <circle cx="7" cy="14" r="1.2" fill="#d4af37" opacity="0.5"/>
                    <circle cx="21" cy="14" r="1.2" fill="#d4af37" opacity="0.5"/>
                  </svg>
                </div>
              </div>

              <div className="flex flex-col gap-3" id="scoreList">
                {results.map((item, i) => (
                  <div
                    key={item.choice}
                    className="rounded-[22px] border border-border-gold/40 bg-card-soft/50 p-4"
                  >
                    <div className="flex items-center justify-between gap-3 font-extrabold text-foreground">
                      <span>{i + 1}. {item.choice}</span>
                      <span className="shrink-0 rounded-full border border-border-gold/50 bg-accent px-2.5 py-1 text-sm text-gold-soft">
                        {item.score}%
                      </span>
                    </div>
                    <Progress value={item.score} className="mt-3" />
                  </div>
                ))}
              </div>

              <div className="rounded-3xl border border-border-gold/45 bg-accent/70 p-5 leading-relaxed text-muted-foreground">
                <strong className="text-foreground">Vì sao hệ thống chọn vậy?</strong>
                <p className="mb-0 mt-2">
                  Thuật toán cân bằng giữa độ gấp, rủi ro, tín hiệu hành động,
                  khả năng đảo ngược quyết định và mức rõ ràng của ngữ cảnh.
                  Kết quả là bộ lọc suy nghĩ, không phải mệnh lệnh tuyệt đối.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default DecisionSection;
