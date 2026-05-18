import React, { useState, useEffect } from 'react';
import { getLocalReadingHistory, deleteReadingFromLocalMemory, clearLocalReadingHistory } from '../../lib/memory/localReadingMemory';
import type { SavedReading } from '../../lib/memory/localReadingMemory';
import AIReadingDisplay from '../ui/AIReadingDisplay';

const JournalSection: React.FC = () => {
  const [history, setHistory] = useState<SavedReading[]>([]);
  const [filter, setFilter] = useState<'all' | 'tarot' | 'iching'>('all');
  const [search, setSearch] = useState('');
  const [selectedReading, setSelectedReading] = useState<SavedReading | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    setHistory(getLocalReadingHistory());
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Bạn có chắc chắn muốn xóa lượt luận giải này không?')) {
      deleteReadingFromLocalMemory(id);
      loadHistory();
      if (selectedReading?.id === id) {
        setSelectedReading(null);
      }
    }
  };

  const handleClearAll = () => {
    if (confirm('Xóa toàn bộ lịch sử? Hành động này không thể hoàn tác.')) {
      clearLocalReadingHistory();
      loadHistory();
      setSelectedReading(null);
    }
  };

  const filteredHistory = history.filter(h => {
    if (filter !== 'all' && h.type !== filter) return false;
    if (search && !h.question.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="fade-in">
      <div className="tab-header section dark-section" style={{ paddingBottom: '0' }}>
        <div className="container">
          <div className="section-title reveal light-title visible">
            <h2>Nhật ký Tâm linh</h2>
            <p>Lịch sử các lần gieo quẻ và trải bài của bạn.</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px' }}>
              Nhật ký được lưu trên máy của bạn. Dữ liệu này không được gửi về máy chủ.
            </p>
          </div>
        </div>
      </div>

      <section className="section dark-section">
        <div className="container">
          <div className="journal-layout" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            {/* Toolbar */}
            <div className="journal-toolbar glass-panel" style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className={`button ${filter === 'all' ? 'primary-button' : 'secondary-button'}`} onClick={() => setFilter('all')} style={{ padding: '8px 16px', fontSize: '0.9rem' }}>Tất cả</button>
                <button className={`button ${filter === 'tarot' ? 'primary-button' : 'secondary-button'}`} onClick={() => setFilter('tarot')} style={{ padding: '8px 16px', fontSize: '0.9rem' }}>Tarot</button>
                <button className={`button ${filter === 'iching' ? 'primary-button' : 'secondary-button'}`} onClick={() => setFilter('iching')} style={{ padding: '8px 16px', fontSize: '0.9rem' }}>Kinh Dịch</button>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input 
                  type="text" 
                  placeholder="Tìm theo câu hỏi..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-soft)', padding: '8px 12px', borderRadius: '4px', color: 'var(--text-primary)' }}
                />
                {history.length > 0 && (
                  <button className="button outline-button" onClick={handleClearAll} style={{ padding: '8px 16px', fontSize: '0.9rem', color: '#f87171', borderColor: 'rgba(248,113,113,0.3)' }}>Xóa tất cả</button>
                )}
              </div>
            </div>

            <div className="journal-content" style={{ display: 'flex', gap: '20px', flexDirection: 'column' }}>
              
              {/* List */}
              {history.length === 0 ? (
                <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '15px', opacity: 0.5 }}>📖</div>
                  <p>Chưa có lần luận giải nào. Khi bạn rút bài hoặc gieo quẻ, kết quả sẽ được lưu tại đây trên trình duyệt của bạn.</p>
                </div>
              ) : filteredHistory.length === 0 ? (
                <div className="glass-panel" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                  <p>Không tìm thấy kết quả phù hợp với bộ lọc.</p>
                </div>
              ) : (
                <div className="journal-list" style={{ display: 'grid', gap: '15px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                  {filteredHistory.map(item => (
                    <div 
                      key={item.id} 
                      className="glass-box interactive" 
                      style={{ 
                        padding: '20px', 
                        cursor: 'pointer', 
                        border: selectedReading?.id === item.id ? '1px solid var(--gold)' : undefined 
                      }}
                      onClick={() => setSelectedReading(item)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--gold-soft)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                          {item.type === 'tarot' ? 'Tarot' : 'Kinh Dịch'}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <h4 style={{ fontSize: '1.05rem', margin: '0 0 10px 0', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {item.question}
                      </h4>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0 0 15px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {item.aiAnswer?.quickSummary || item.aiAnswer?.directAnswer || 'Đã luận giải'}
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', opacity: 0.7, background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px' }}>
                          {item.type === 'tarot' ? item.spreadType : `${item.hexagram?.primary} ➔ ${item.hexagram?.changed}`}
                        </span>
                        <button 
                          onClick={(e) => handleDelete(item.id, e)}
                          style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '1.1rem', padding: '4px' }}
                          title="Xóa"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Detail view modal/panel */}
              {selectedReading && (
                <div 
                  className="journal-detail-overlay fade-in"
                  style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
                  onClick={() => setSelectedReading(null)}
                >
                  <div 
                    className="journal-detail-content glass-panel"
                    style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', position: 'relative', padding: '0' }}
                    onClick={e => e.stopPropagation()}
                  >
                    <div style={{ position: 'sticky', top: 0, background: 'rgba(20,20,20,0.95)', backdropFilter: 'blur(10px)', padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--gold)' }}>Chi tiết luận giải</h3>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                          {new Date(selectedReading.createdAt).toLocaleString('vi-VN')}
                        </div>
                      </div>
                      <button 
                        onClick={() => setSelectedReading(null)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '1.5rem', cursor: 'pointer' }}
                      >
                        ✕
                      </button>
                    </div>
                    
                    <div style={{ padding: '25px' }}>
                      <div style={{ marginBottom: '30px' }}>
                        <h4 style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '8px' }}>Câu hỏi</h4>
                        <p style={{ fontSize: '1.2rem', lineHeight: '1.6', margin: 0 }}>"{selectedReading.question}"</p>
                      </div>

                      {/* We just reuse the existing AIReadingDisplay component */}
                      {selectedReading.aiAnswer && (
                        <div style={{ margin: '0 -15px' }}>
                          <AIReadingDisplay response={selectedReading.aiAnswer} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default JournalSection;
