import React from 'react';
import type { LineDetail, LineType } from '../../types';
import HexagramDisplay from '../ui/HexagramDisplay';
import { useManualHexagram } from '../../hooks/useManualHexagram';
import { coinLineOptions } from '../../data/shared';
import { heavenlyStems } from '../../data/canchi';
import { downloadPng, downloadSvg } from '../../utils/hexagram';

// ── Line symbol for table ──────────────────────────────────────────────────────
const TableLineSymbol: React.FC<{ type: LineType }> = ({ type }) =>
  type === 'yang' ? (
    <span className="table-line-symbol">
      <span className="table-line-solid" />
    </span>
  ) : (
    <span className="table-line-symbol">
      <span className="table-line-half-wrap">
        <span className="table-line-half" />
        <span className="table-line-half" />
      </span>
    </span>
  );

// ── Detail table ───────────────────────────────────────────────────────────────
const DetailTable: React.FC<{ title: string; details: LineDetail[] }> = ({ title, details }) => (
  <article className="luc-hao-table-card">
    <div className="luc-hao-table-title">{title}</div>
    <table className="luc-hao-table">
      <thead>
        <tr>
          <th>Hào</th><th>Dòng</th><th>T/Ứ</th>
          <th>Lục Thân</th><th>Can Chi</th><th>Lục Thú</th>
        </tr>
      </thead>
      <tbody>
        {[...details].reverse().map((item) => (
          <tr key={item.lineNo} className={item.moving ? 'moving-row' : ''}>
            <td>{item.lineNo}</td>
            <td><TableLineSymbol type={item.lineType} /></td>
            <td>{item.selfOrResponse}</td>
            <td>{item.lucThan}</td>
            <td>{item.canChi}</td>
            <td>{item.lucThu}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </article>
);

// ── Main CoinSection ───────────────────────────────────────────────────────────
const CoinSection: React.FC = () => {
  const {
    state,
    coinLines,
    dayStem,
    question,
    error,
    setDayStem,
    setQuestion,
    updateLine,
  } = useManualHexagram();

  // Phase 4: Inputs displayed top-to-bottom (hào 6 → hào 1) for visual clarity.
  // The underlying coinLines array remains bottom-to-top (index 0 = hào 1).
  const displayOrder = [5, 4, 3, 2, 1, 0]; // reversed display indices

  return (
    <section className="section white-section section-anchor" id="coins">
      <div className="container">
        <div className="section-title reveal">
          <p className="eyebrow">Tính năng 02</p>
          <h2>Lập quẻ từ đồng xu ngoài đời</h2>
          <p>
            Người dùng gieo 3 đồng xu ngoài đời 6 lần, ghi kết quả từ hào 1 ở dưới cùng
            đến hào 6 ở trên cùng. Website tự vẽ quẻ chính, quẻ hỗ, quẻ biến và đánh dấu hào động.
          </p>
        </div>

        <div className="two-column">
          {/* ── Input panel ── */}
          <div className="panel beige-panel reveal">
            <div className="inline-heading">
              <span className="icon-circle">🪙</span>
              <div>
                <h3>Nhập 6 hào</h3>
                <p>Quy ước: 6 lão âm, 7 thiếu dương, 8 thiếu âm, 9 lão dương.</p>
              </div>
            </div>

            {/* Phase 4: clear instruction text */}
            <p className="input-instruction">
              📌 Nhập 6 hào theo thứ tự từ dưới lên trên.
              <br />
              <strong>Hào 1</strong> là hào dưới cùng — <strong>Hào 6</strong> là hào trên cùng.
              <br />
              Form hiển thị từ <em>hào 6 (trên)</em> xuống <em>hào 1 (dưới)</em> để dễ hình dung quẻ.
            </p>

            <div className="form-grid compact-form-grid">
              <div>
                <label htmlFor="dayStem">Thiên can ngày</label>
                <select id="dayStem" value={dayStem} onChange={(e) => setDayStem(e.target.value)}>
                  {heavenlyStems.map((s) => (
                    <option key={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="manualQuestion">Việc cần xem</label>
                <input
                  id="manualQuestion"
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                />
              </div>
            </div>

            {/* Phase 4: display hào 6 → hào 1 (visual top-to-bottom) */}
            <div className="line-inputs" id="coinLineInputs">
              {displayOrder.map((index) => (
                <div key={index} className="line-input-row">
                  <label htmlFor={`coinLine${index}`}>
                    Hào {index + 1}{index === 5 ? ' — trên cùng' : index === 0 ? ' — dưới cùng' : ''}
                  </label>
                  <select
                    id={`coinLine${index}`}
                    value={coinLines[index]}
                    onChange={(e) => updateLine(index, Number(e.target.value))}
                  >
                    {coinLineOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label} — {opt.note}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            {/* Phase 3: validation error display */}
            {error && (
              <div className="input-error" role="alert">
                ⚠️ {error}
              </div>
            )}
          </div>

          {/* ── Result panel ── */}
          <article className="panel dark-panel reveal">
            <div className="manual-result-grid">
              {/* Quẻ chính */}
              <div className="manual-card">
                <p className="eyebrow">Quẻ chính</p>
                <h3 id="primaryHexName">{state.primaryInfo.name}</h3>
                <p className="muted" id="primaryHexCode">
                  Số {state.primaryInfo.no} · Họ {state.primaryInfo.palace} · {state.primaryInfo.palaceStage}
                </p>
                <HexagramDisplay
                  lines={state.primaryLines}
                  movingLines={state.movingLines}
                  className="light-box"
                />
              </div>

              {/* Phase 5: Quẻ hỗ */}
              <div className="manual-card nuclear-card">
                <p className="eyebrow">Quẻ hỗ</p>
                <h3 id="nuclearHexName">{state.nuclearInfo.name}</h3>
                <p className="muted" id="nuclearHexCode">
                  Số {state.nuclearInfo.no} · Họ {state.nuclearInfo.palace} · {state.nuclearInfo.palaceStage}
                </p>
                <HexagramDisplay
                  lines={state.nuclearLines}
                  className="light-box"
                />
                <p className="nuclear-note">
                  Quẻ hỗ lấy từ hào 2-3-4 (hạ quái) và hào 3-4-5 (thượng quái).
                </p>
              </div>

              {/* Quẻ biến */}
              <div className="manual-card amber-card">
                <p className="eyebrow dark-eyebrow">Quẻ biến</p>
                <h3 id="changedHexName">{state.changedInfo.name}</h3>
                <p className="muted" id="changedHexCode">
                  Số {state.changedInfo.no} · Họ {state.changedInfo.palace} · {state.changedInfo.palaceStage}
                </p>
                <HexagramDisplay
                  lines={state.changedLines}
                  className="white-box"
                />
                {state.movingLines.length === 0 && (
                  <p className="no-moving-note">Không có hào động — quẻ biến trùng quẻ chính.</p>
                )}
              </div>
            </div>

            {/* Moving lines info */}
            <div className="moving-info">
              <p className="small-title">Hào động</p>
              <p id="movingLineText">
                {state.movingLines.length > 0
                  ? `Có hào động tại: ${state.movingLines.join(', ')}. Khi luận, AI nên đọc quẻ chính trước, sau đó đọc riêng các hào động và cuối cùng dùng quẻ biến để hiểu xu hướng tiếp theo.`
                  : 'Không có hào động. Khi luận, AI tập trung vào quẻ chính và bối cảnh câu hỏi.'}
              </p>
            </div>

            {/* Download buttons */}
            <div className="download-actions">
              <button
                className="button amber-button"
                id="downloadPngButton"
                type="button"
                onClick={() => downloadPng(state)}
              >
                Tải hình PNG
              </button>
              <button
                className="button ghost-button"
                id="downloadSvgButton"
                type="button"
                onClick={() => downloadSvg(state)}
              >
                Tải SVG
              </button>
            </div>

            {/* Palace comparison */}
            <div className="palace-comparison" id="palaceComparison">
              {[
                { label: 'Quẻ chính', info: state.primaryInfo, upper: state.upper, lower: state.lower },
                { label: 'Quẻ hỗ',   info: state.nuclearInfo,  upper: state.nuclearUpper, lower: state.nuclearLower },
                { label: 'Quẻ biến', info: state.changedInfo,  upper: state.changedUpper, lower: state.changedLower },
              ].map(({ label, info, upper, lower }) => (
                <article key={label} className="palace-card">
                  <span className="palace-tag">{label}</span>
                  <h4>{info.name}</h4>
                  <p><strong>Cung / Họ:</strong> Họ {info.palace} · {info.palaceStage}</p>
                  <p><strong>Ngũ hành cung:</strong> {info.palaceElement}</p>
                  <p><strong>Thượng / Hạ:</strong> {upper.name} / {lower.name}</p>
                </article>
              ))}
            </div>

            {/* Lục hào tables */}
            <div className="manual-tables" id="manualTables">
              <DetailTable title="Bảng lục hào quẻ chính" details={state.primaryDetails} />
              <DetailTable title="Bảng lục hào quẻ biến"  details={state.changedDetails} />
            </div>
          </article>
        </div>
      </div>
    </section>
  );
};

export default CoinSection;
