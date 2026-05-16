import React from 'react';
import { dataSources } from '../../data/shared';

const DataSection: React.FC = () => (
  <section className="section dark-section section-anchor" id="data">
    <div className="container">
      <div className="section-title reveal">
        <p className="eyebrow">AI data layer</p>
        <h2>Nguồn dữ liệu để AI luận quẻ thông minh hơn</h2>
        <p>
          Nên tách dữ liệu thành nhiều lớp: cổ bản, bản dịch hợp lệ, ontology 64 quẻ,
          384 hào động, tình huống hiện đại và feedback người dùng.
        </p>
      </div>

      <div className="data-grid" id="dataGrid">
        {dataSources.map((source) => (
          <article key={source.title} className="data-card reveal">
            <span className="data-badge">{source.level}</span>
            <h3>{source.title}</h3>
            <p>{source.text}</p>
          </article>
        ))}
      </div>

      <div className="panel schema-panel reveal">
        <h3>Schema gợi ý cho database</h3>
        <div className="schema-grid">
          <div className="schema-card">
            <h4>hexagrams</h4>
            <p>id, king_wen_no, name_han, name_vi, pinyin, symbol, upper_trigram, lower_trigram, keywords, judgment.</p>
          </div>
          <div className="schema-card">
            <h4>lines</h4>
            <p>hexagram_id, line_no, line_value, original_text, translation_vi, modern_advice, warning, reflection_question.</p>
          </div>
          <div className="schema-card">
            <h4>interpretation_cases</h4>
            <p>topic, user_context, hexagram_id, moving_lines, answer_style, helpful_score, user_feedback.</p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default DataSection;
