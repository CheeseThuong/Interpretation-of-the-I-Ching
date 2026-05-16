import React, { useState, useMemo } from 'react';
import type { RiskLevel, UrgencyLevel } from '../../types';
import { rankChoices } from '../../utils/decision';

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
          <form className="panel glass-panel reveal" id="decisionForm" onSubmit={(e) => e.preventDefault()}>
            <label htmlFor="decisionContext">Việc đang phân vân</label>
            <textarea
              id="decisionContext"
              rows={4}
              value={context}
              onChange={(e) => setContext(e.target.value)}
            />

            <label htmlFor="choices">Các lựa chọn, mỗi dòng một lựa chọn</label>
            <textarea
              id="choices"
              rows={5}
              value={choicesRaw}
              onChange={(e) => setChoicesRaw(e.target.value)}
            />

            <div className="form-grid">
              <div>
                <label htmlFor="riskLevel">Khả năng chịu rủi ro</label>
                <select
                  id="riskLevel"
                  value={riskLevel}
                  onChange={(e) => setRiskLevel(e.target.value as RiskLevel)}
                >
                  <option value="low">Thấp</option>
                  <option value="medium">Trung bình</option>
                  <option value="high">Cao</option>
                </select>
              </div>
              <div>
                <label htmlFor="urgency">Độ gấp</label>
                <select
                  id="urgency"
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
                >
                  <option value="low">Không gấp</option>
                  <option value="medium">Vừa phải</option>
                  <option value="high">Cần quyết nhanh</option>
                </select>
              </div>
            </div>
          </form>

          {/* ── Result ── */}
          <article className="panel decision-result reveal">
            <div className="result-header">
              <div>
                <p className="eyebrow">Gợi ý quyết định</p>
                <h3 id="bestChoice">{results[0]?.choice ?? 'Nhập lựa chọn'}</h3>
              </div>
              <div className="decision-glyph" aria-hidden="true">
                <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
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

            <div className="score-list" id="scoreList">
              {results.map((item, i) => (
                <div key={item.choice} className="score-card">
                  <div className="score-head">
                    <span>{i + 1}. {item.choice}</span>
                    <span className="score-percent">{item.score}%</span>
                  </div>
                  <div className="score-bar">
                    <div className="score-fill" style={{ width: `${item.score}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="note-box">
              <strong>Vì sao hệ thống chọn vậy?</strong>
              <p>
                Thuật toán cân bằng giữa độ gấp, rủi ro, tín hiệu hành động,
                khả năng đảo ngược quyết định và mức rõ ràng của ngữ cảnh.
                Kết quả là bộ lọc suy nghĩ, không phải mệnh lệnh tuyệt đối.
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
};

export default DecisionSection;
