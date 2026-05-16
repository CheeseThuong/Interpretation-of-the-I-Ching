/**
 * src/lib/readings/synthesis.ts
 *
 * Deterministic local synthesis for Tarot and Kinh Dich readings.
 * NO API calls — pure TypeScript logic based on card/hexagram data.
 */

import { classifyQuestionContext } from '../ai/prompts';

export type SignalType = 'proceed' | 'wait' | 'avoid' | 'conditional' | 'unclear' | 'reflection';

/* ── Tarot synthesis ──────────────────────────────────────────── */

export interface TarotCardSummary {
  position: string;
  cardName: string;
  cardNameVi: string;
  orientation: 'upright' | 'reversed';
  keywords: string[];
  shortMeaning: string;
  meaningInPosition: string;
}

export interface TarotSynthesis {
  overview: string;
  cardSummaries: TarotCardSummary[];
  patternSummary: string;
  mainSignal: SignalType;
  keyTension: string;
  keyAdvice: string;
  oneLineSummary: string;
}

interface TarotSynthesisInput {
  question: string;
  spreadId: string;
  spreadName: string;
  drawnCards: Array<{
    positionName: string;
    isReversed: boolean;
    card: {
      name: string;
      nameVi: string;
      keywordsUpright: string[];
      keywordsReversed: string[];
      meaningUpright: string;
      meaningReversed: string;
    };
  }>;
}

/** Infer a simple signal from cards — majority reversed → wait/avoid, else proceed/conditional */
function inferSignalFromCards(cards: TarotSynthesisInput['drawnCards']): SignalType {
  const reversedCount = cards.filter(c => c.isReversed).length;
  const ratio = reversedCount / cards.length;
  if (ratio >= 0.7) return 'avoid';
  if (ratio >= 0.4) return 'wait';
  if (ratio === 0)  return 'proceed';
  return 'conditional';
}

/** Build a position-aware meaning sentence for each card */
function buildPositionMeaning(
  position: string,
  _spreadId: string,
  cardNameVi: string,
  isReversed: boolean,
  keywords: string[],
  question: string
): string {
  const orient = isReversed ? 'ngược' : 'xuôi';
  const kw = keywords.slice(0, 2).join(', ');

  // Spread-specific position framing
  const positionLower = position.toLowerCase();

  if (positionLower.includes('quá khứ'))
    return `${cardNameVi} (${orient}) — Trong quá khứ liên quan đến "${question}": ${kw}.`;
  if (positionLower.includes('hiện tại'))
    return `${cardNameVi} (${orient}) — Tình huống hiện tại: ${kw}.`;
  if (positionLower.includes('tương lai'))
    return `${cardNameVi} (${orient}) — Xu hướng sắp tới: ${kw}.`;
  if (positionLower.includes('bạn'))
    return `${cardNameVi} (${orient}) — Năng lượng của bạn hiện tại: ${kw}.`;
  if (positionLower.includes('người ấy') || positionLower.includes('họ'))
    return `${cardNameVi} (${orient}) — Năng lượng của người ấy: ${kw}.`;
  if (positionLower.includes('kết nối'))
    return `${cardNameVi} (${orient}) — Mối kết nối / hướng đi chung: ${kw}.`;
  if (positionLower.includes('tình huống'))
    return `${cardNameVi} (${orient}) — Đây là tình huống đang diễn ra: ${kw}.`;
  if (positionLower.includes('cản trở'))
    return `${cardNameVi} (${orient}) — Yếu tố đang cản trở hoặc gây trì hoãn: ${kw}.`;
  if (positionLower.includes('che khuất') || positionLower.includes('ẩn'))
    return `${cardNameVi} (${orient}) — Điều chưa được nhìn thấy rõ: ${kw}.`;
  if (positionLower.includes('lời khuyên'))
    return `${cardNameVi} (${orient}) — Hướng hành động được khuyến nghị: ${kw}.`;
  if (positionLower.includes('xu hướng') || positionLower.includes('kết quả'))
    return `${cardNameVi} (${orient}) — Chiều hướng có thể xảy ra: ${kw}.`;
  if (positionLower.includes('câu trả lời'))
    return `${cardNameVi} (${orient}) — Tín hiệu trả lời cho câu hỏi: ${kw}.`;
  if (positionLower.includes('hôm nay') || positionLower.includes('daily'))
    return `${cardNameVi} (${orient}) — Thông điệp năng lượng trong ngày: ${kw}.`;

  // Generic fallback
  return `${cardNameVi} (${orient}) — Ở vị trí "${position}": ${kw}.`;
}

/** Build the pattern summary connecting all cards */
function buildPatternSummary(cards: TarotSynthesisInput['drawnCards'], spreadId: string, _question: string): string {
  if (cards.length === 1) {
    const c = cards[0];
    const kw = (c.isReversed ? c.card.keywordsReversed : c.card.keywordsUpright).slice(0, 3).join(', ');
    return `Lá ${c.card.nameVi} ${c.isReversed ? '(ngược)' : '(xuôi)'} mang năng lượng: ${kw}. Đây là tín hiệu trực tiếp cho câu hỏi của bạn.`;
  }

  if (spreadId === 'three-cards') {
    const [past, present, future] = cards;
    const pastKw  = (past.isReversed    ? past.card.keywordsReversed    : past.card.keywordsUpright).slice(0,2).join(', ');
    const nowKw   = (present.isReversed ? present.card.keywordsReversed : present.card.keywordsUpright).slice(0,2).join(', ');
    const futureKw= (future.isReversed  ? future.card.keywordsReversed  : future.card.keywordsUpright).slice(0,2).join(', ');
    return `Quá khứ (${past.card.nameVi}): ${pastKw} → Hiện tại (${present.card.nameVi}): ${nowKw} → Xu hướng (${future.card.nameVi}): ${futureKw}.`;
  }

  if (spreadId === 'love') {
    const [you, them, conn] = cards;
    return `Bạn (${you.card.nameVi}) — Người ấy (${them.card.nameVi}) — Kết nối (${conn.card.nameVi}): Hai nguồn năng lượng này đang gặp nhau tạo ra một điểm giao thoa.`;
  }

  if (spreadId === 'yes-no') {
    const c = cards[0];
    const signal = c.isReversed ? 'tín hiệu cần cẩn trọng (chưa rõ hoặc không)' : 'tín hiệu tích cực (xu hướng có)';
    return `${c.card.nameVi} ${c.isReversed ? '(ngược)' : '(xuôi)'} đưa ra ${signal} cho câu hỏi của bạn.`;
  }

  if (spreadId === 'five-cards') {
    const [sit, obs, hid, adv, trend] = cards;
    return `Tình huống (${sit.card.nameVi}) — Cản trở (${obs.card.nameVi}) — Ẩn (${hid.card.nameVi}) — Khuyên (${adv.card.nameVi}) — Xu hướng (${trend.card.nameVi}): Năm lá tạo thành một bức tranh toàn cảnh về vấn đề của bạn.`;
  }

  if (spreadId === 'daily') {
    const c = cards[0];
    const kw = (c.isReversed ? c.card.keywordsReversed : c.card.keywordsUpright).slice(0, 3).join(', ');
    return `Lá bài hôm nay ${c.card.nameVi} ${c.isReversed ? '(ngược)' : '(xuôi)'} mang đến: ${kw}. Đây là chủ điệu năng lượng của ngày.`;
  }

  // Generic multi-card
  const names = cards.map(c => c.card.nameVi).join(' → ');
  return `Chuỗi biểu tượng: ${names} — phản ánh dòng chảy tình huống liên quan đến câu hỏi của bạn.`;
}

/** Build key tension from reversed or challenging cards */
function buildKeyTension(cards: TarotSynthesisInput['drawnCards']): string {
  const reversed = cards.filter(c => c.isReversed);
  if (reversed.length === 0)
    return 'Không có sự cản trở rõ ràng nào được nhìn thấy trong trải bài này.';
  const tensionCards = reversed.map(c => `${c.card.nameVi} (${c.card.keywordsReversed.slice(0,2).join(', ')})`);
  return `Điểm cần chú ý: ${tensionCards.join('; ')}.`;
}

/** Build key advice from the advice card or overall trend */
function buildKeyAdvice(cards: TarotSynthesisInput['drawnCards'], spreadId: string, signal: SignalType): string {
  // Five-card: use advice position (index 3)
  if (spreadId === 'five-cards' && cards[3]) {
    const adv = cards[3];
    const kw = (adv.isReversed ? adv.card.keywordsReversed : adv.card.keywordsUpright).slice(0,2).join(', ');
    return `Lá Lời Khuyên (${adv.card.nameVi}): ${kw}.`;
  }
  // Derive from signal
  const adviceMap: Record<SignalType, string> = {
    proceed:     'Năng lượng ủng hộ hành động. Hãy tiến với sự tỉnh táo.',
    wait:        'Cần thêm thời gian hoặc thông tin. Kiên nhẫn là chìa khóa.',
    avoid:       'Thời điểm chưa phù hợp. Xem xét lại trước khi hành động.',
    conditional: 'Có thể tiến nếu bạn giải quyết được điểm còn chưa rõ.',
    unclear:     'Tín hiệu chưa đủ rõ. Hãy quan sát thêm trước khi quyết định.',
    reflection:  'Đây là lúc nhìn lại bên trong hơn là hành động ra bên ngoài.',
  };
  return adviceMap[signal];
}

/** Build one-line summary */
function buildOneLineSummary(spreadId: string, signal: SignalType, _question: string, cards: TarotSynthesisInput['drawnCards']): string {
  const mainCard = cards[0]?.card.nameVi ?? 'Tarot';
  const orient = cards[0]?.isReversed ? 'ngược' : 'xuôi';

  if (spreadId === 'daily')
    return `${mainCard} (${orient}) — Chủ điệu hôm nay: hãy ${signal === 'wait' ? 'kiên nhẫn và quan sát' : 'chủ động và chú tâm'}.`;
  if (spreadId === 'yes-no')
    return signal === 'proceed' ? 'Tín hiệu nghiêng về CÓ — nhưng cần thêm xem xét thực tế.'
      : signal === 'avoid'   ? 'Tín hiệu nghiêng về KHÔNG — xem xét lại thời điểm.'
      : 'Tín hiệu chưa rõ ràng — cần thêm dữ liệu thực tế.';

  return `${mainCard} (${orient}) dẫn đầu trải bài — tín hiệu chính: "${signal}".`;
}

export function synthesizeTarotReading(input: TarotSynthesisInput): TarotSynthesis {
  const { question, spreadId, spreadName, drawnCards } = input;
  const ctx = classifyQuestionContext(question);

  const cardSummaries: TarotCardSummary[] = drawnCards.map(dc => {
    const keywords = dc.isReversed ? dc.card.keywordsReversed : dc.card.keywordsUpright;
    return {
      position:         dc.positionName,
      cardName:         dc.card.name,
      cardNameVi:       dc.card.nameVi,
      orientation:      dc.isReversed ? 'reversed' : 'upright',
      keywords,
      shortMeaning:     dc.isReversed ? dc.card.meaningReversed : dc.card.meaningUpright,
      meaningInPosition: buildPositionMeaning(
        dc.positionName, spreadId, dc.card.nameVi,
        dc.isReversed, keywords, question
      ),
    };
  });

  const signal  = inferSignalFromCards(drawnCards);
  const pattern = buildPatternSummary(drawnCards, spreadId, question);
  const tension = buildKeyTension(drawnCards);
  const advice  = buildKeyAdvice(drawnCards, spreadId, signal);
  const oneLine = buildOneLineSummary(spreadId, signal, question, drawnCards);

  // Build overview based on spread type
  let overview = '';
  if (spreadId === 'daily')
    overview = `Lá bài hôm nay phản ánh năng lượng và chủ điệu bạn sẽ gặp. Đây không phải dự đoán chắc chắn — mà là tín hiệu để bạn chú ý và điều chỉnh thái độ trong ngày.`;
  else if (spreadId === 'yes-no')
    overview = `Trải bài Có/Không đưa ra một tín hiệu định hướng nhanh cho câu hỏi "${question}". Kết quả cần được đặt trong bối cảnh thực tế.`;
  else if (spreadId === 'love')
    overview = `Trải bài Tình Yêu phân tích năng lượng của bạn, người ấy, và mối kết nối chung liên quan đến "${question}".`;
  else if (spreadId === 'five-cards')
    overview = `Trải bài 5 lá phân tích sâu tình huống "${question}" theo 5 chiều: tình trạng hiện tại, cản trở, điều ẩn, lời khuyên, và xu hướng kết quả.`;
  else if (spreadId === 'three-cards')
    overview = `Trải bài 3 lá nhìn theo dòng thời gian: quá khứ ảnh hưởng đến hiện tại, và hiện tại định hình xu hướng tương lai liên quan đến "${question}".`;
  else
    overview = `${spreadName} đang được đọc trong bối cảnh câu hỏi: "${question}". Mỗi lá bài phản ánh một khía cạnh của tình huống.`;

  // Prepend question context if detected
  if (ctx.questionType !== 'unclear' && ctx.questionType !== '')
    overview += ` Phân loại câu hỏi: ${ctx.questionType.replace(/_/g,' ')}.`;

  return {
    overview,
    cardSummaries,
    patternSummary: pattern,
    mainSignal:     signal,
    keyTension:     tension,
    keyAdvice:      advice,
    oneLineSummary: oneLine,
  };
}

/* ── Kinh Dich synthesis ──────────────────────────────────────── */

export interface KinhDichSynthesis {
  overview: string;
  primaryHexagramSummary: string;
  movingLinesSummary: string;
  changedHexagramSummary: string;
  patternSummary: string;
  mainSignal: SignalType;
  keyTension: string;
  keyAdvice: string;
  oneLineSummary: string;
}

interface KinhDichSynthesisInput {
  question: string;
  topic: string;
  primaryHexagram: string;
  primaryHexagramMeaning?: string;
  changedHexagram: string;
  changedHexagramMeaning?: string;
  movingLines: string;   // e.g. "2, 5" or "Không có"
  sixLines: string;      // e.g. "7, 8, 9, 6, 7, 8"
}

/** Infer signal from moving lines count and type */
function inferKinhDichSignal(movingLines: string, primaryHex: string, changedHex: string): SignalType {
  if (movingLines === 'Không có' || movingLines.trim() === '')
    return 'unclear'; // no movement — static, no clear push
  const lineCount = movingLines.split(',').length;
  if (lineCount >= 5)  return 'avoid';      // too much change — chaos
  if (lineCount >= 3)  return 'wait';       // significant shift — caution
  if (primaryHex === changedHex) return 'reflection';
  return 'conditional';
}

export function synthesizeKinhDichReading(input: KinhDichSynthesisInput): KinhDichSynthesis {
  const { question, topic, primaryHexagram, changedHexagram, movingLines, primaryHexagramMeaning, changedHexagramMeaning } = input;
  const ctx = classifyQuestionContext(question, topic);

  const hasMovingLines = movingLines && movingLines !== 'Không có' && movingLines.trim() !== '';
  const lineCount = hasMovingLines ? movingLines.split(',').length : 0;
  const signal = inferKinhDichSignal(movingLines, primaryHexagram, changedHexagram);

  const overview = `Quẻ được gieo cho câu hỏi: "${question}" (Chủ đề: ${topic}). Quẻ chính ${primaryHexagram} biến sang ${changedHexagram} qua ${lineCount > 0 ? `${lineCount} hào động` : 'không có hào động'}. Đây là bức tranh tổng thể về tình huống và xu hướng biến chuyển của bạn.`;

  const primaryHexagramSummary = primaryHexagramMeaning
    ? `Quẻ ${primaryHexagram}: ${primaryHexagramMeaning}`
    : `Quẻ ${primaryHexagram} đại diện cho trạng thái hiện tại và nền tảng cốt lõi của tình huống liên quan đến "${question}".`;

  const movingLinesSummary = hasMovingLines
    ? `Hào động tại vị trí ${movingLines} — đây là điểm đang có sự biến chuyển và áp lực. Số lượng hào động (${lineCount}) cho thấy mức độ biến động${lineCount >= 3 ? ' đáng kể' : ' có kiểm soát'}.`
    : 'Không có hào động — quẻ ở trạng thái tĩnh. Tình huống đang ổn định, chưa có dấu hiệu biến chuyển lớn.';

  const changedHexagramSummary = primaryHexagram === changedHexagram
    ? `Quẻ không biến đổi — năng lượng giữ nguyên. Tình huống sẽ tiếp tục theo hướng hiện tại.`
    : changedHexagramMeaning
    ? `Quẻ biến ${changedHexagram}: ${changedHexagramMeaning}`
    : `Quẻ biến ${changedHexagram} chỉ ra xu hướng tương lai — đây là hướng mà sự việc đang dịch chuyển tới nếu các hào động được giải quyết.`;

  const patternSummary = hasMovingLines
    ? `${primaryHexagram} → [hào ${movingLines} biến] → ${changedHexagram}: Tình huống hiện tại đang chịu áp lực tại điểm cụ thể và sẽ dịch chuyển sang trạng thái mới. Đây không phải kết thúc — đây là chuyển tiếp.`
    : `${primaryHexagram} (không biến): Tình huống đang ổn định. Cần thêm hành động nội tâm hơn là thay đổi bên ngoài.`;

  const keyTension = hasMovingLines
    ? `Điểm căng thẳng chính nằm ở hào ${movingLines} — đây là nơi năng lượng đang tích tụ và cần được xử lý.`
    : 'Không có điểm căng thẳng rõ ràng — tình huống chưa đạt tới điểm bùng phát.';

  const signalAdviceMap: Record<SignalType, string> = {
    proceed:     'Tín hiệu ủng hộ hành động tiếp tục với sự tỉnh táo.',
    wait:        'Nhiều hào động — nên quan sát và chờ thêm trước khi quyết định lớn.',
    avoid:       'Quá nhiều biến chuyển — tránh hành động quyết đoán ngay lúc này.',
    conditional: `Có thể tiến nếu bạn giải quyết được điểm hào động tại ${movingLines}.`,
    unclear:     'Quẻ không động — chưa đủ tín hiệu rõ ràng từ bên ngoài.',
    reflection:  'Đây là lúc suy xét nội tâm hơn là hành động ra ngoài.',
  };
  const keyAdvice = signalAdviceMap[signal];

  const oneLineSummary = `${primaryHexagram} → ${changedHexagram}: Tín hiệu "${signal}" — ${ctx.questionType !== 'unclear' ? ctx.questionType.replace(/_/g,' ') : 'xem xét thực tế'}.`;

  return {
    overview,
    primaryHexagramSummary,
    movingLinesSummary,
    changedHexagramSummary,
    patternSummary,
    mainSignal: signal,
    keyTension,
    keyAdvice,
    oneLineSummary,
  };
}
