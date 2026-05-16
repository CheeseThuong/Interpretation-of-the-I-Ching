import React, { useState, useMemo } from 'react';
import HexagramDisplay from '../ui/HexagramDisplay';
import { useReading } from '../../hooks/useReading';

const FIELDS = ['Công việc / học tập', 'Tình cảm', 'Tài chính', 'Gia đình', 'Dự án cá nhân'];
const MOODS  = ['Bình tĩnh', 'Lo lắng', 'Đang vội', 'Phân vân', 'Tự tin'];
const DEFAULT_Q = 'Có nên bắt đầu kế hoạch này trong tháng này không?';

const ReadingSection: React.FC = () => {
  const [question, setQuestion] = useState(DEFAULT_Q);
  const [field, setField]       = useState(FIELDS[0]);
  const [mood, setMood]         = useState(MOODS[0]);

  const { computeReading, reroll } = useReading();
  const reading = useMemo(() => computeReading(question, field, mood), [computeReading, question, field, mood]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    reroll();
  };

  return (
    <section className="section dark-section section-anchor" id="reading">
      <div className="container">
        <div className="section-title reveal">
          <p className="eyebrow">Tính năng 01</p>
          <h2>Luận quẻ bằng AI theo ngữ cảnh</h2>
          <p>
            Người dùng không chỉ bấm random. Hệ thống hỏi mục tiêu, lĩnh vực,
            cảm xúc hiện tại và mức rủi ro để diễn giải quẻ sát tình huống hơn.
          </p>
        </div>

        <div className="two-column">
          {/* ── Form ── */}
          <form className="panel reveal" id="readingForm" onSubmit={handleSubmit}>
            <label htmlFor="question">Câu hỏi muốn luận</label>
            <textarea
              id="question"
              rows={4}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />

            <div className="form-grid">
              <div>
                <label htmlFor="field">Lĩnh vực</label>
                <select id="field" value={field} onChange={(e) => setField(e.target.value)}>
                  {FIELDS.map((f) => <option key={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="mood">Tâm trạng</label>
                <select id="mood" value={mood} onChange={(e) => setMood(e.target.value)}>
                  {MOODS.map((m) => <option key={m}>{m}</option>)}
                </select>
              </div>
            </div>

            <button className="button primary-button full-button" type="submit">
              Gieo lại quẻ
            </button>
          </form>

          {/* ── Result ── */}
          <article className="panel reveal">
            <div className="result-header">
              <div>
                <p className="eyebrow">Kết quả luận quẻ</p>
                <h3 id="readingHexName">{reading.upper.name} trên {reading.lower.name}</h3>
                <p className="muted" id="readingMeta">
                  Hào động: hào {reading.movingLine} · Độ phù hợp ngữ cảnh: {reading.confidence}%
                </p>
              </div>
              <div className="symbol-badge" id="readingSymbol">
                {reading.upper.symbol}{reading.lower.symbol}
              </div>
            </div>

            <HexagramDisplay
              lines={reading.lines}
              movingLines={[reading.movingLine]}
              className="light-box"
              ariaLabel="Hình quẻ luận"
            />

            <div className="mini-grid">
              <div className="mini-card dark-card">
                <p className="small-title">Tượng quẻ</p>
                <h4 id="readingNature">{reading.upper.nature} gặp {reading.lower.nature}</h4>
                <p id="readingTone">
                  Năng lượng chính: {reading.upper.tone}. Nền bên trong: {reading.lower.tone}.
                </p>
              </div>
              <div className="mini-card">
                <p className="small-title amber">Diễn giải AI</p>
                <p id="readingSummary">
                  {reading.theme} Với câu hỏi thuộc nhóm "{reading.field}", nên ưu tiên hành động
                  có kiểm soát, ghi rõ điều kiện thành công và tránh quyết định khi cảm xúc đang
                  quá mạnh.
                </p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
};

export default ReadingSection;
