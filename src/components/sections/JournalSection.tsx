import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { getLocalReadingHistory, deleteReadingFromLocalMemory, clearLocalReadingHistory } from '../../lib/memory/localReadingMemory';
import type { SavedReading } from '../../lib/memory/localReadingMemory';
import AIReadingDisplay from '../ui/AIReadingDisplay';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

const JournalSection: React.FC = () => {
  const [history, setHistory] = useState<SavedReading[]>(getLocalReadingHistory);
  const [filter, setFilter] = useState<'all' | 'tarot' | 'iching'>('all');
  const [search, setSearch] = useState('');
  const [selectedReading, setSelectedReading] = useState<SavedReading | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SavedReading | null>(null);
  const [clearAllOpen, setClearAllOpen] = useState(false);

  const loadHistory = () => {
    setHistory(getLocalReadingHistory());
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteReadingFromLocalMemory(deleteTarget.id);
    loadHistory();
    if (selectedReading?.id === deleteTarget.id) {
      setSelectedReading(null);
    }
    setDeleteTarget(null);
  };

  const handleClearAll = () => {
    clearLocalReadingHistory();
    loadHistory();
    setSelectedReading(null);
    setClearAllOpen(false);
  };

  const filteredHistory = history.filter(h => {
    if (filter !== 'all' && h.type !== filter) return false;
    if (search && !h.question.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="fade-in">
      <div className="tab-header section dark-section pb-0">
        <div className="container">
          <div className="section-title reveal light-title visible">
            <h2>Nhật ký Tâm linh</h2>
            <p>Lịch sử các lần gieo quẻ và trải bài của bạn.</p>
            <p className="mt-2 text-[0.85rem] text-muted-foreground">
              Nhật ký được lưu trên máy của bạn. Dữ liệu này không được gửi về máy chủ.
            </p>
          </div>
        </div>
      </div>

      <section className="section dark-section">
        <div className="container">
          <div className="flex flex-col gap-[30px]">

            {/* Toolbar */}
            <div className="glass-panel flex flex-wrap items-center justify-between gap-[15px] rounded-xl px-5 py-[15px]">
              <div className="flex gap-2.5">
                <Button variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>
                  Tất cả
                </Button>
                <Button variant={filter === 'tarot' ? 'default' : 'outline'} onClick={() => setFilter('tarot')}>
                  Tarot
                </Button>
                <Button variant={filter === 'iching' ? 'default' : 'outline'} onClick={() => setFilter('iching')}>
                  Kinh Dịch
                </Button>
              </div>
              <div className="flex items-center gap-2.5">
                <Input
                  type="text"
                  placeholder="Tìm theo câu hỏi..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-auto min-w-[200px]"
                />
                {history.length > 0 && (
                  <AlertDialog open={clearAllOpen} onOpenChange={setClearAllOpen}>
                    <AlertDialogTrigger
                      render={
                        <Button
                          variant="outline"
                          className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        />
                      }
                    >
                      Xóa tất cả
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Xóa toàn bộ lịch sử?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction variant="destructive" onClick={handleClearAll}>
                          Xóa tất cả
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-5">

              {/* List */}
              {history.length === 0 ? (
                <div className="glass-panel rounded-xl px-5 py-[60px] text-center text-muted-foreground">
                  <div className="mb-[15px] text-[3rem] opacity-50">📖</div>
                  <p>Chưa có lần luận giải nào. Khi bạn rút bài hoặc gieo quẻ, kết quả sẽ được lưu tại đây trên trình duyệt của bạn.</p>
                </div>
              ) : filteredHistory.length === 0 ? (
                <div className="glass-panel rounded-xl px-5 py-10 text-center text-muted-foreground">
                  <p>Không tìm thấy kết quả phù hợp với bộ lọc.</p>
                </div>
              ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-[15px]">
                  {filteredHistory.map(item => (
                    <Card
                      key={item.id}
                      onClick={() => setSelectedReading(item)}
                      className={cn(
                        'cursor-pointer p-5 transition-shadow hover:ring-foreground/20',
                        selectedReading?.id === item.id && 'ring-2 ring-[var(--gold)]'
                      )}
                    >
                      <div className="mb-2.5 flex items-start justify-between">
                        <span className="text-[0.75rem] uppercase tracking-[1px] text-gold-soft">
                          {item.type === 'tarot' ? 'Tarot' : 'Kinh Dịch'}
                        </span>
                        <span className="text-[0.8rem] text-muted-foreground">
                          {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <h4 className="mb-2.5 line-clamp-2 text-[1.05rem] leading-normal">
                        {item.question}
                      </h4>
                      <p className="mb-[15px] line-clamp-2 text-[0.9rem] text-muted-foreground">
                        {item.aiAnswer?.quickSummary || item.aiAnswer?.directAnswer || 'Đã luận giải'}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="font-normal">
                          {item.type === 'tarot' ? item.spreadType : `${item.hexagram?.primary} ➔ ${item.hexagram?.changed}`}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(item);
                          }}
                          title="Xóa"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* Per-item delete confirm */}
              <AlertDialog
                open={!!deleteTarget}
                onOpenChange={(open) => {
                  if (!open) setDeleteTarget(null);
                }}
              >
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Xóa lượt luận giải này?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Bạn có chắc chắn muốn xóa lượt luận giải này không? Hành động này không thể hoàn tác.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                    <AlertDialogAction variant="destructive" onClick={confirmDelete}>
                      Xóa
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              {/* Detail view */}
              <Dialog
                open={!!selectedReading}
                onOpenChange={(open) => {
                  if (!open) setSelectedReading(null);
                }}
              >
                <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
                  {selectedReading && (
                    <>
                      <DialogHeader>
                        <DialogTitle className="text-gold">Chi tiết luận giải</DialogTitle>
                        <DialogDescription>
                          {new Date(selectedReading.createdAt).toLocaleString('vi-VN')}
                        </DialogDescription>
                      </DialogHeader>

                      <div className="mb-2">
                        <h4 className="mb-2 text-[0.85rem] uppercase text-muted-foreground">Câu hỏi</h4>
                        <p className="m-0 text-[1.2rem] leading-relaxed">&ldquo;{selectedReading.question}&rdquo;</p>
                      </div>

                      {selectedReading.aiAnswer && (
                        <AIReadingDisplay response={selectedReading.aiAnswer} />
                      )}
                    </>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default JournalSection;
