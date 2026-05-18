import type { SavedReading } from './localReadingMemory';

export interface UserProfile {
  commonTopics: string[];
  recurringConcerns: string[];
  questionStyle: string;
  preferredAnswerStyle: string;
  emotionalPattern: string;
  decisionPattern: string;
  riskPreference: string;
  zodiacSign?: string;
  lastUpdated: string;
}

export function buildUserProfileFromHistory(history: SavedReading[]): UserProfile {
  // Simple heuristic builder. In the future, this could be processed by an AI agent periodically.
  // For now, we will extract some basic signals based on simple NLP/keywords.

  let zodiacSign = undefined;
  for (const h of history) {
    if (h.zodiacSign) {
      zodiacSign = h.zodiacSign;
      break; // assume the latest valid sign is the user's
    }
  }

  const topicsCount: Record<string, number> = {};
  const concerns: string[] = [];
  let financeQuestions = 0;
  let loveQuestions = 0;
  let workQuestions = 0;

  history.forEach(r => {
    const q = r.question.toLowerCase();
    
    // Topic counting
    if (r.topic) {
      topicsCount[r.topic] = (topicsCount[r.topic] || 0) + 1;
    }

    // Pattern recognition
    if (/(đầu tư|tiền|vay|nợ|cổ phiếu|chứng khoán|tài chính|giá)/.test(q)) financeQuestions++;
    if (/(tình duyên|người yêu|chia tay|yêu|quay lại)/.test(q)) loveQuestions++;
    if (/(công việc|nghỉ việc|sự nghiệp|thăng chức)/.test(q)) workQuestions++;
    if (/(sợ|lo lắng|phân vân|không biết|mơ hồ)/.test(q)) concerns.push('sự rõ ràng và định hướng');
    if (/(rủi ro|an toàn|chắc chắn)/.test(q)) concerns.push('sự an toàn');
  });

  const sortedTopics = Object.entries(topicsCount).sort((a, b) => b[1] - a[1]).map(e => e[0]);
  
  let riskPreference = 'medium';
  if (financeQuestions > loveQuestions) riskPreference = 'conservative (cẩn trọng với tài sản)';
  
  let emotionalPattern = 'Đang tìm kiếm giải pháp thực tế.';
  if (loveQuestions > financeQuestions && loveQuestions > workQuestions) {
    emotionalPattern = 'Thường xuyên quan tâm đến các vấn đề cảm xúc và kết nối.';
  }

  return {
    commonTopics: sortedTopics.slice(0, 3),
    recurringConcerns: Array.from(new Set(concerns)).slice(0, 2),
    questionStyle: 'Trực tiếp',
    preferredAnswerStyle: 'Rõ ràng, thực tế, có checklist hành động',
    emotionalPattern,
    decisionPattern: financeQuestions > 0 ? 'Thường phân vân về thời điểm hành động' : 'Đang tìm kiếm tín hiệu xác nhận',
    riskPreference,
    zodiacSign,
    lastUpdated: new Date().toISOString()
  };
}

export function buildMemorySummaryForPrompt(profile: UserProfile, recentHistory: SavedReading[]): string {
  if (recentHistory.length === 0) return '';

  const summary = [
    `Người dùng thường hỏi về ${profile.commonTopics.join(', ') || 'các vấn đề chung'}.`,
    `Họ thích câu trả lời: ${profile.preferredAnswerStyle}.`,
    `Gần đây hay băn khoăn về: ${profile.recurringConcerns.join(', ') || 'định hướng sắp tới'}.`,
    `Khi trả lời, nên kết hợp phân tích tâm lý với lời khuyên thực tế phù hợp với xu hướng quyết định của họ: ${profile.decisionPattern}.`
  ].filter(Boolean).join(' ');

  // Truncate to max 1000 characters just to be safe
  return summary.substring(0, 1000);
}

export function clearLocalUserProfile(): void {
  // Not strictly stored separate from history yet (it's derived), 
  // but we can expose this for future if we cache the profile object in localStorage.
  localStorage.removeItem('kinhdichai_user_profile');
}
