import type { CoinLineOption, DataSource, GalleryProject } from '../types';

// ============================================================
// COIN LINE OPTIONS (Lục Hào Coin Values)
// ============================================================

export const coinLineOptions: CoinLineOption[] = [
  { value: 6, label: '6 — Lão Âm',     type: 'yin',  changingTo: 'yang', note: 'Âm động, đổi thành Dương' },
  { value: 7, label: '7 — Thiếu Dương', type: 'yang', changingTo: 'yang', note: 'Dương tĩnh' },
  { value: 8, label: '8 — Thiếu Âm',   type: 'yin',  changingTo: 'yin',  note: 'Âm tĩnh' },
  { value: 9, label: '9 — Lão Dương',  type: 'yang', changingTo: 'yin',  note: 'Dương động, đổi thành Âm' },
];

// ============================================================
// DATA SOURCES LAYER
// ============================================================

export const dataSources: DataSource[] = [
  {
    title: 'Cổ bản chữ Hán',
    level: 'Core data',
    text: 'Lưu quẻ từ, hào từ, thoán truyện, tượng truyện, văn ngôn và hệ từ. Đây là nền gốc để AI không luận quá xa văn bản.',
  },
  {
    title: 'Bản dịch public-domain',
    level: 'Legal-safe',
    text: 'Dùng các bản dịch hết hạn bản quyền hoặc có giấy phép rõ ràng để tạo English/Vietnamese explanation layer.',
  },
  {
    title: 'Ontology 64 quẻ',
    level: 'Structured DB',
    text: 'Mỗi quẻ cần có số quẻ, tên Hán, pinyin, Unicode, thượng quái, hạ quái, ngũ hành, từ khóa, tình huống, rủi ro.',
  },
  {
    title: '384 hào động',
    level: 'Deep reading',
    text: 'Mỗi hào nên có nghĩa gốc, nghĩa hiện đại, lời khuyên, cảnh báo, câu hỏi phản tư và ví dụ ứng dụng.',
  },
  {
    title: 'Tình huống hiện đại',
    level: 'AI context',
    text: 'Tách theo công việc, học tập, tình cảm, tiền bạc, gia đình, dự án, sức khỏe tinh thần, quan hệ xã hội.',
  },
  {
    title: 'Decision framework',
    level: 'Reasoning layer',
    text: 'Bổ sung scoring theo rủi ro, độ gấp, khả năng đảo ngược, chi phí cơ hội, dữ kiện thiếu và hậu quả xấu nhất.',
  },
  {
    title: 'Feedback người dùng',
    level: 'Learning loop',
    text: 'Cho người dùng đánh giá kết quả: đúng trọng tâm, dễ hiểu, có ích, quá chung chung. Dữ liệu này giúp cải thiện prompt/RAG.',
  },
  {
    title: 'Safety rules',
    level: 'Guardrail',
    text: 'AI luôn nhắc đây là công cụ phản tư, không thay thế chuyên gia trong pháp lý, y tế, tài chính hoặc an toàn cá nhân.',
  },
];

// ============================================================
// GALLERY PROJECTS
// ============================================================

export const galleryProjects: GalleryProject[] = [
  {
    title: 'AI Oracle Reading',
    tag: 'Luận quẻ',
    image: '/assets/oracle-reading.svg',
    alt: 'Hình minh họa Kinh Dịch AI với biểu tượng chữ Dịch, bầu trời sao và các hào âm dương',
    description: 'Màn hình luận quẻ AI với câu hỏi, ngữ cảnh, quẻ chính, hào động và lời khuyên thực tế.',
  },
  {
    title: 'Manual Coin Casting',
    tag: 'Lục hào',
    image: '/assets/coin-casting.svg',
    alt: 'Hình minh họa các đồng xu dùng để gieo lục hào Kinh Dịch',
    description: 'Người dùng gieo ba đồng xu sáu lần ngoài đời, nhập 6/7/8/9 và hệ thống tự vẽ quẻ.',
  },
  {
    title: 'Decision Randomizer',
    tag: 'Quyết định',
    image: '/assets/decision-randomizer.svg',
    alt: 'Hình minh họa la bàn quyết định với các lựa chọn và thanh đánh giá rủi ro',
    description: 'Không random máy móc, mà chấm điểm lựa chọn theo ngữ cảnh, rủi ro và độ gấp.',
  },
  {
    title: 'Knowledge Base',
    tag: 'Data AI',
    image: '/assets/knowledge-base.svg',
    alt: 'Hình minh họa kho dữ liệu Kinh Dịch gồm 64 quẻ, 384 hào và dữ liệu ngữ cảnh',
    description: 'Tổ chức dữ liệu theo quẻ, hào, trigram, chủ đề hiện đại và feedback người dùng.',
  },
  {
    title: 'Reading History',
    tag: 'Journal',
    image: '/assets/reading-journal.svg',
    alt: 'Hình minh họa sổ nhật ký luận quẻ để lưu lịch sử câu hỏi',
    description: 'Lưu lịch sử câu hỏi để người dùng tự nhìn lại kết quả và quá trình ra quyết định.',
  },
];

// ============================================================
// DECISION KEYWORDS
// ============================================================

export const decisionKeywords: Record<string, string[]> = {
  safe: ['ổn', 'an toàn', 'chắc', 'tiết kiệm', 'giữ', 'chờ', 'học', 'gia đình'],
  bold: ['thử', 'đổi', 'mua', 'đầu tư', 'nhảy', 'đi', 'mở', 'bắt đầu', 'apply', 'nộp'],
  social: ['gặp', 'nói', 'nhắn', 'team', 'bạn', 'người yêu', 'khách', 'gia đình'],
  risk: ['vay', 'nợ', 'nguy', 'rủi ro', 'mất', 'đắt', 'deadline', 'gấp'],
};
