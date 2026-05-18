import React from 'react';
import '../../styles/tarot.css';

interface TarotLandingPageProps {
  onStart: () => void;
  onSelectSpread: (spreadId: string) => void;
}

const TarotLandingPage: React.FC<TarotLandingPageProps> = ({ onStart, onSelectSpread }) => {
  const spreads = [
    {
      id: 'daily',
      title: 'Lá Bài Hôm Nay',
      text: 'Rút một lá để nhận thông điệp, năng lượng và điều nên chú ý trong ngày.',
      cards: 1
    },
    {
      id: 'one-card',
      title: 'Một Lá Bài',
      text: 'Câu trả lời nhanh cho một vấn đề đang hiện diện rõ trong tâm trí.',
      cards: 1
    },
    {
      id: 'three-cards',
      title: 'Quá Khứ – Hiện Tại – Tương Lai',
      text: 'Nhìn dòng chảy của một tình huống từ nguyên nhân đến xu hướng tiếp theo.',
      cards: 3
    },
    {
      id: 'love',
      title: 'Tình Yêu',
      text: 'Đọc năng lượng giữa bạn, người kia và kết nối đang hình thành.',
      cards: 3
    },
    {
      id: 'yes-no',
      title: 'Có hoặc Không',
      text: 'Dành cho câu hỏi cần một tín hiệu quyết định, nhưng không phán tuyệt đối.',
      cards: 1
    },
    {
      id: 'five-cards',
      title: 'Trải Bài 5 Lá',
      text: 'Phân tích sâu tình huống, trở ngại, điều bị che khuất, lời khuyên và xu hướng kết quả.',
      cards: 5
    }
  ];

  const scrollToSpreads = () => {
    document.getElementById('tarot-spread-preview')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="tarot-landing fade-in">
      {/* SECTION 1 — Hero */}
      <section className="hero-section" style={{ textAlign: 'center', padding: '60px 20px', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div className="pill" style={{ marginBottom: '24px' }}>TAROT AI READING</div>
        <h1 style={{ fontFamily: '"Instrument Serif", serif', fontSize: 'clamp(2.8rem, 8vw, 4.5rem)', color: 'var(--amber)', marginBottom: '20px', lineHeight: 1.1 }}>
          Rút bài Tarot theo đúng câu hỏi của bạn
        </h1>
        <p style={{ maxWidth: '600px', fontSize: '1.1rem', color: 'rgba(255,255,255,0.8)', margin: '0 auto 40px', lineHeight: 1.6 }}>
          Chọn một trải bài, tập trung vào điều bạn đang băn khoăn, rồi để AI kết nối ý nghĩa lá bài, vị trí trải bài, cung hoàng đạo và ngữ cảnh câu hỏi thành một lời luận dễ hiểu.
        </p>

        <div className="tarot-hero-visual">
          <div className="tarot-hero-glow"></div>
          <div className="tarot-hero-deck">
            {[...Array(5)].map((_, i) => (
               <div key={i} className={`tarot-hero-card card-${i}`}>
                  <div className="tarot-hero-card-back">
                    <div className="tarot-hero-orbit"></div>
                  </div>
               </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button onClick={onStart} className="button primary-button">Bắt đầu trải bài</button>
          <button onClick={() => onSelectSpread('daily')} className="button secondary-button">Lá bài hôm nay</button>
          <button onClick={scrollToSpreads} className="button ghost-button" style={{ border: '1px solid rgba(255,255,255,0.2)' }}>Xem các kiểu trải bài</button>
        </div>
      </section>

      {/* SECTION 2 — Tarot AI là gì? */}
      <section style={{ padding: '80px 20px', maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontFamily: '"Instrument Serif", serif', fontSize: '2.5rem', color: 'var(--amber)', marginBottom: '40px' }}>Không chỉ rút bài — mà là đọc đúng vấn đề của bạn</h2>
        <p style={{ maxWidth: '700px', margin: '0 auto 50px', color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem' }}>
          Web sẽ tổng hợp câu hỏi, vị trí lá bài, chiều xuôi/ngược, cung hoàng đạo nếu bạn cung cấp ngày sinh, và dữ liệu biểu tượng Tarot để đưa ra lời luận phù hợp hơn với ngữ cảnh thật.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          <div className="liquid-glass" style={{ padding: '30px', borderRadius: '20px', textAlign: 'left' }}>
            <h3 style={{ color: 'var(--gold-soft)', fontSize: '1.3rem', marginBottom: '12px' }}>Hiểu câu hỏi</h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, fontSize: '0.95rem' }}>AI phân loại câu hỏi của bạn: tình cảm, tài chính, công việc, quyết định cá nhân hoặc định hướng hằng ngày.</p>
          </div>
          <div className="liquid-glass" style={{ padding: '30px', borderRadius: '20px', textAlign: 'left' }}>
            <h3 style={{ color: 'var(--gold-soft)', fontSize: '1.3rem', marginBottom: '12px' }}>Đọc biểu tượng</h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, fontSize: '0.95rem' }}>Mỗi lá bài được đọc theo đúng vị trí trong trải bài, không chỉ giải thích ý nghĩa chung chung.</p>
          </div>
          <div className="liquid-glass" style={{ padding: '30px', borderRadius: '20px', textAlign: 'left' }}>
            <h3 style={{ color: 'var(--gold-soft)', fontSize: '1.3rem', marginBottom: '12px' }}>Tổng hợp lời khuyên</h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, fontSize: '0.95rem' }}>Kết quả cuối cùng gồm tín hiệu chính, điều nên làm, điều cần tránh và phần tổng hợp dễ hiểu.</p>
          </div>
        </div>
      </section>

      {/* SECTION 3 — Spread Preview */}
      <section id="tarot-spread-preview" style={{ padding: '80px 20px', maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontFamily: '"Instrument Serif", serif', fontSize: '2.5rem', color: 'var(--amber)', marginBottom: '50px' }}>Chọn kiểu trải bài phù hợp</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {spreads.map((spread) => (
            <div key={spread.id} className="liquid-glass spread-preview-card" style={{ padding: '30px 20px', borderRadius: '20px', transition: 'transform 0.3s ease', cursor: 'pointer', display: 'flex', flexDirection: 'column' }} onClick={() => onSelectSpread(spread.id)}>
              <h3 style={{ color: 'var(--gold-soft)', fontSize: '1.3rem', margin: '0 0 10px' }}>{spread.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', minHeight: '60px', marginBottom: '20px', flex: 1 }}>{spread.text}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                 <span style={{ fontSize: '0.8rem', color: '#a0b8ff' }}>Số lá bài: {spread.cards}</span>
                 <button className="button" style={{ background: 'transparent', border: '1px solid var(--amber)', color: 'var(--amber)', padding: '6px 12px', fontSize: '0.85rem', minHeight: '32px' }}>Chọn trải bài</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 4 — Nghi thức hoạt động như thế nào? */}
      <section style={{ padding: '80px 20px', maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ fontFamily: '"Instrument Serif", serif', fontSize: '2.5rem', color: 'var(--amber)', marginBottom: '40px', textAlign: 'center' }}>Nghi thức rút bài hoạt động như thế nào?</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {[
            { step: 1, title: 'Nhập câu hỏi', desc: 'Hỏi càng rõ, phần luận càng đúng trọng tâm.' },
            { step: 2, title: 'Cá nhân hóa', desc: 'Bạn có thể nhập ngày sinh để xác định cung hoàng đạo và điều chỉnh góc nhìn tâm lý.' },
            { step: 3, title: 'Xào và rút bài', desc: 'Bộ bài được xáo ngẫu nhiên, sau đó bạn chọn lá bài theo trải bài đã chọn.' },
            { step: 4, title: 'Tổng hợp và luận giải', desc: 'Hệ thống tổng hợp vai trò từng lá, rồi AI đưa ra phần diễn giải theo ngữ cảnh.' }
          ].map((item) => (
            <div key={item.step} className="liquid-glass" style={{ display: 'flex', gap: '20px', padding: '24px', borderRadius: '16px', alignItems: 'center' }}>
               <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--amber-light)', color: 'var(--amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0, border: '1px solid rgba(212, 175, 55, 0.3)' }}>
                 {item.step}
               </div>
               <div>
                 <h4 style={{ color: 'var(--gold-soft)', margin: '0 0 5px', fontSize: '1.1rem' }}>{item.title}</h4>
                 <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0, fontSize: '0.95rem' }}>{item.desc}</p>
               </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 5 — Final CTA */}
      <section style={{ padding: '80px 20px 120px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: '"Instrument Serif", serif', fontSize: '2.5rem', color: 'var(--amber)', margin: '0 auto 20px' }}>Sẵn sàng mở trải bài của bạn?</h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: '600px', margin: '0 auto 40px' }}>
          Tập trung vào câu hỏi, chọn trải bài, và để các biểu tượng trả lời theo cách rõ ràng hơn.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={onStart} className="button primary-button">Bắt đầu ngay</button>
          <button onClick={() => onSelectSpread('daily')} className="button secondary-button">Lá bài hôm nay</button>
        </div>
      </section>

      <style>{`
        .spread-preview-card:hover {
          transform: translateY(-5px) !important;
          box-shadow: 0 12px 40px rgba(0,0,0,0.5), 0 0 20px rgba(218, 180, 62, 0.2) !important;
          border-color: rgba(218, 180, 62, 0.4) !important;
        }
      `}</style>
    </div>
  );
};

export default TarotLandingPage;
