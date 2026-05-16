import React from 'react';
import { fiveElements } from '../../data/canchi';
import { heavenlyStems, earthlyBranches } from '../../data/canchi';
import { tuViStars, tuViPalaces } from '../../data/tuvi';
import { MOCK_BAT_TU_CHART } from '../../data/battu';

// ── Five Elements card ─────────────────────────────────────────────────────────
const FiveElementsPanel: React.FC = () => (
  <div className="found-panel">
    <h3 className="found-panel-title">Ngũ Hành</h3>
    <div className="found-grid five-element-grid">
      {fiveElements.map((el) => (
        <div key={el.name} className="found-card" style={{ '--accent': el.color } as React.CSSProperties}>
          <div className="found-badge" style={{ background: el.color + '22', color: el.color }}>
            {el.name}
          </div>
          <p className="found-meta">Sinh → {el.generates} · Khắc → {el.controls}</p>
          <p className="found-desc">{el.shortInterpretation}</p>
          <div className="found-tags">
            <span>{el.direction}</span>
            <span>{el.season}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ── Can Chi panel ──────────────────────────────────────────────────────────────
const CanChiPanel: React.FC = () => (
  <div className="found-panel">
    <h3 className="found-panel-title">Can Chi</h3>
    <div className="found-subgrid">
      <div>
        <p className="found-sublabel">Thiên Can (10)</p>
        <div className="tag-grid">
          {heavenlyStems.map((s) => (
            <span key={s.name} className={`cc-tag ${s.polarity === 'Dương' ? 'yang-tag' : 'yin-tag'}`}>
              {s.name} <em>{s.element}</em>
            </span>
          ))}
        </div>
      </div>
      <div>
        <p className="found-sublabel">Địa Chi (12)</p>
        <div className="tag-grid">
          {earthlyBranches.map((b) => (
            <span key={b.name} className={`cc-tag ${b.polarity === 'Dương' ? 'yang-tag' : 'yin-tag'}`}>
              {b.name} <em>{b.element}</em>
            </span>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// ── Bát Tự panel ──────────────────────────────────────────────────────────────
const BatTuPanel: React.FC = () => {
  const chart = MOCK_BAT_TU_CHART;
  const pillars = [
    { label: 'Năm', data: chart.year },
    { label: 'Tháng', data: chart.month },
    { label: 'Ngày', data: chart.day },
    { label: 'Giờ', data: chart.hour },
  ];

  return (
    <div className="found-panel">
      <h3 className="found-panel-title">Bát Tự (Tứ Trụ)</h3>
      <p className="found-note">Dữ liệu mẫu — thuật toán tính Bát Tự chính xác đang được phát triển.</p>
      <div className="four-pillars-grid">
        {pillars.map(({ label, data }) => (
          <div key={label} className="pillar-card">
            <p className="pillar-label">{label}</p>
            <div className="pillar-stem">{data.stem.name}</div>
            <div className="pillar-branch">{data.branch.name}</div>
            <p className="pillar-element">{data.element} · {data.polarity}</p>
          </div>
        ))}
      </div>
      <p className="found-desc" style={{ marginTop: 16 }}>
        Nhật chủ: <strong>{chart.dayMaster.name}</strong> ({chart.dayMaster.element})
      </p>
      <div className="element-balance">
        {Object.entries(chart.elementBalance).map(([el, count]) => (
          <span key={el} className="balance-tag">{el}: {count}</span>
        ))}
      </div>
      {chart.generalInterpretation && (
        <p className="found-desc">{chart.generalInterpretation}</p>
      )}
    </div>
  );
};

// ── Tử Vi panel ──────────────────────────────────────────────────────────────
const TuViPanel: React.FC = () => (
  <div className="found-panel">
    <h3 className="found-panel-title">Tử Vi</h3>
    <div className="found-subgrid">
      <div>
        <p className="found-sublabel">12 Cung</p>
        <div className="tag-grid">
          {tuViPalaces.map((p) => (
            <span key={p.name} className="cc-tag palace-tag-item" title={p.meaning}>{p.name}</span>
          ))}
        </div>
      </div>
      <div>
        <p className="found-sublabel">14 Chính tinh</p>
        <div className="stars-grid">
          {tuViStars.map((s) => (
            <div key={s.name} className="star-card">
              <strong>{s.name}</strong>
              <span className={`star-element el-${s.element}`}>{s.element}</span>
              <p>{s.meaning}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// ── Main Foundation Section ────────────────────────────────────────────────────
const FoundationSection: React.FC = () => (
  <section className="section foundation-section section-anchor" id="foundation">
    <div className="container">
      <div className="section-title reveal">
        <p className="eyebrow">Dữ liệu nền tảng</p>
        <h2>Hệ thống dữ liệu huyền học phương Đông</h2>
        <p>
          Nền tảng dữ liệu có cấu trúc để AI luận giải thông minh hơn.
          Các module bên dưới sẽ được bổ sung thuật toán đầy đủ theo từng giai đoạn.
        </p>
      </div>

      <div className="foundation-grid">
        <div className="reveal"><FiveElementsPanel /></div>
        <div className="reveal"><CanChiPanel /></div>
        <div className="reveal"><BatTuPanel /></div>
        <div className="reveal"><TuViPanel /></div>
      </div>
    </div>
  </section>
);

export default FoundationSection;
