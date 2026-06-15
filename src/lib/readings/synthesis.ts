import { classifyQuestionContext } from '../ai/prompts';
import type { SpreadPositionMeta } from '../../types/tarot';

export type SignalType = 'proceed' | 'wait' | 'avoid' | 'conditional' | 'unclear' | 'reflection';

/* ── types ── */
export interface PositionAnalysis {
  positionLabel: string;
  positionFunction: string;
  cardName: string;
  cardNameVi: string;
  orientation: 'upright' | 'reversed';
  keywords: string[];
  cardMeaning: string;
  meaningInThisPosition: string;
  meaningForUserQuestion: string;
  psychologicalInsight: string;
  practicalSignal: string;
}

export interface TarotSynthesis {
  overview: string;
  positionAnalyses: PositionAnalysis[];
  /** kept for backward compat with old display */
  cardSummaries: Array<{ position: string; cardName: string; cardNameVi: string; orientation: 'upright'|'reversed'; keywords: string[]; shortMeaning: string; meaningInPosition: string; }>;
  patternSummary: string;
  combinedConclusion: string;
  mainSignal: SignalType;
  keyTension: string;
  keyAdvice: string;
  oneLineSummary: string;
}

interface DrawnCardInput {
  positionName: string;
  isReversed: boolean;
  card: { name: string; nameVi: string; keywordsUpright: string[]; keywordsReversed: string[]; meaningUpright: string; meaningReversed: string; };
}

interface TarotSynthesisInput {
  question: string;
  spreadId: string;
  spreadName: string;
  drawnCards: DrawnCardInput[];
  positionMeta?: SpreadPositionMeta[];
}

/* ── signal ── */
function inferSignal(cards: DrawnCardInput[]): SignalType {
  if (cards.length === 0) return 'unclear';
  const r = cards.filter(c => c.isReversed).length / cards.length;
  if (r >= 0.7) return 'avoid';
  if (r >= 0.4) return 'wait';
  if (r === 0)  return 'proceed';
  return 'conditional';
}

/* ── per-position deep analysis ── */
function buildPositionAnalysis(
  dc: DrawnCardInput,
  meta: SpreadPositionMeta | undefined,
  question: string,
  questionType: string,
  answerMode: string
): PositionAnalysis {
  const kw = dc.isReversed ? dc.card.keywordsReversed : dc.card.keywordsUpright;
  const kw2 = kw.slice(0, 2).join(', ');
  const kw3 = kw.slice(0, 3).join(', ');
  const orient = dc.isReversed ? 'ngược' : 'xuôi';
  const posLabel = meta?.label ?? dc.positionName;
  const posFunc = meta?.functionDescription ?? `Vị trí "${posLabel}" trong trải bài.`;
  const focusArr = meta?.interpretationFocus ?? [];
  const focus = focusArr.slice(0, 2).join(', ');

  /* meaning in position */
  const meaningInThisPosition = dc.isReversed
    ? `${dc.card.nameVi} (ngược) tại vị trí "${posLabel}" cho thấy năng lượng ${kw2} đang bị chặn lại hoặc biểu hiện theo hướng thách thức.`
    : `${dc.card.nameVi} (xuôi) tại vị trí "${posLabel}" mang năng lượng ${kw2} — tích cực và có tác dụng định hướng rõ.`;

  /* meaning for question — specific per position role */
  const pl = posLabel.toLowerCase();
  const meaningForUserQuestion =
    pl.includes('tình huống') || pl.includes('hiện tại') || pl.includes('present')
      ? `Liên quan đến "${question}": ${dc.card.nameVi} ${orient} cho thấy bạn đang ở trạng thái ${kw2}. Đây là nền tảng năng lượng bạn mang vào tình huống này.`
    : pl.includes('cản trở') || pl.includes('obstacle')
      ? `Liên quan đến "${question}": Trở ngại hiện tại là ${kw2}. ${dc.isReversed ? 'Sự chặn đứng này đang làm chậm quá trình tiến triển.' : 'Đây là lực cản cần nhận diện và xử lý.'}`
    : pl.includes('che khuất') || pl.includes('ẩn') || pl.includes('hidden')
      ? `Liên quan đến "${question}": Điều bạn chưa nhìn rõ là ${kw2}. ${dc.isReversed ? 'Rủi ro này đang chìm — cần làm sáng tỏ trước khi quyết định.' : 'Đây là tiềm năng hoặc thông tin quan trọng bị bỏ sót.'}`
    : pl.includes('lời khuyên') || pl.includes('advice')
      ? `Liên quan đến "${question}": Lời khuyên từ trải bài là ${kw2}. ${dc.isReversed ? 'Tránh cứng nhắc hoặc thiếu kế hoạch — cần điều chỉnh cách tiếp cận.' : 'Tiếp tục theo hướng này với sự tỉnh táo.'}`
    : pl.includes('xu hướng') || pl.includes('kết quả') || pl.includes('future') || pl.includes('tương lai')
      ? `Nếu tiếp tục theo hướng hiện tại liên quan đến "${question}": ${kw2} là chiều hướng khả thi. ${dc.isReversed ? 'Kết quả có thể không như mong đợi nếu không thay đổi.' : 'Kết quả tích cực là có thể nếu duy trì nhịp hiện tại.'}`
    : pl.includes('quá khứ') || pl.includes('past')
      ? `Bối cảnh quá khứ ảnh hưởng đến "${question}": ${kw2} — năng lượng cũ này đang định hình hiện tại của bạn.`
    : pl.includes('bạn') && !pl.includes('người ấy')
      ? `Năng lượng của bạn trong "${question}": ${kw2}. ${dc.isReversed ? 'Bạn có thể đang chặn chính mình hoặc chưa rõ ràng về mong muốn.' : 'Bạn đang mang năng lượng tích cực vào mối quan hệ này.'}`
    : pl.includes('người ấy')
      ? `Tín hiệu từ phía người ấy liên quan đến "${question}": ${kw2}. ${dc.isReversed ? 'Họ có thể đang phân vân hoặc chưa sẵn sàng.' : 'Họ mang năng lượng mở và có thể tiếp nhận.'}`
    : pl.includes('kết nối')
      ? `Mối kết nối giữa hai người trong "${question}": ${kw2}. Đây là chất lượng của sợi dây liên kết hiện tại.`
    : pl.includes('câu trả lời') || pl.includes('answer')
      ? (dc.isReversed
      ? `Tín hiệu cho "${question}": Nghiêng về chờ hoặc xem xét lại — ${kw2}.`
      : `Tín hiệu cho "${question}": Nghiêng về có/tiến — ${kw2}.`)
    : `Tại vị trí này trong "${question}": ${dc.card.nameVi} ${orient} mang thông điệp về ${kw3}.`;

  /* psychological insight */
  const psychologicalInsight = answerMode === 'emotional_reading'
    ? (dc.isReversed
      ? `Cảm xúc bên trong có thể đang mâu thuẫn hoặc chưa được xử lý — ${kw2} bị chặn lại.`
      : `Tâm lý ổn định và rõ ràng — ${kw2} đang được biểu hiện lành mạnh.`)
    : answerMode === 'risk_assessment' || questionType === 'money_finance'
    ? (dc.isReversed
      ? `Có thể bạn đang cảm thấy thiếu tự tin về quyết định này, hoặc chưa đủ thông tin để tiến. ${kw2} bị chặn gợi ý cần đánh giá lại.`
      : `Bạn có nền tảng để tiến, nhưng cần kiểm tra kỹ các yếu tố thực tế. ${kw2} là điểm mạnh.`)
    : dc.isReversed
      ? `Tâm lý có thể đang trong trạng thái nghi ngờ hoặc do dự — ${kw2} chưa được phát huy đầy đủ.`
      : `Tâm thế hiện tại phù hợp với chiều hướng tiến — ${kw2} đang hỗ trợ quyết định.`;

  /* practical signal */
  const practicalSignal = dc.isReversed
    ? `Cần xem xét lại — ${kw2} chưa ổn định. ${focus ? `Tập trung vào: ${focus}.` : ''}`
    : `Tín hiệu ủng hộ — ${kw2} là lợi thế. ${focus ? `Áp dụng qua: ${focus}.` : ''}`;

  return {
    positionLabel: posLabel,
    positionFunction: posFunc,
    cardName: dc.card.name,
    cardNameVi: dc.card.nameVi,
    orientation: dc.isReversed ? 'reversed' : 'upright',
    keywords: kw,
    cardMeaning: dc.isReversed ? dc.card.meaningReversed : dc.card.meaningUpright,
    meaningInThisPosition,
    meaningForUserQuestion,
    psychologicalInsight,
    practicalSignal,
  };
}

/* ── combined conclusion ── */
function buildCombinedConclusion(cards: DrawnCardInput[], spreadId: string, question: string, signal: SignalType): string {
  const reversedCount = cards.filter(c => c.isReversed).length;
  const pentacleCards = cards.filter(c => c.card.name.toLowerCase().includes('pentacle') || c.card.name.toLowerCase().includes('coin'));
  const hasPentacles = pentacleCards.length > 0;

  if (spreadId === 'five-cards') {
    const [sit, obs, hid, adv, trend] = cards;
    let conclusion = `Tổng hợp 5 lá cho câu hỏi "${question}": `;
    conclusion += `Tình huống hiện tại (${sit.card.nameVi} ${sit.isReversed?'ngược':'xuôi'}) cho thấy bạn đang ở điểm xuất phát với năng lượng ${sit.card.keywordsUpright.slice(0,2).join('/')}. `;
    conclusion += `Điều đang cản trở (${obs.card.nameVi} ${obs.isReversed?'ngược':'xuôi'}) cho thấy ${obs.isReversed?'rào cản đang hoạt động mạnh':'một trở ngại cần vượt qua'}. `;
    conclusion += `Điều bị che khuất (${hid.card.nameVi} ${hid.isReversed?'ngược':'xuôi'}) tiết lộ ${hid.isReversed?'rủi ro chìm cần làm rõ':'tiềm năng chưa được khai thác'}. `;
    conclusion += `Lời khuyên (${adv.card.nameVi} ${adv.isReversed?'ngược':'xuôi'}) hướng đến ${adv.isReversed?'điều chỉnh cách tiếp cận':'hành động có kế hoạch'}. `;
    conclusion += `Xu hướng kết quả (${trend.card.nameVi} ${trend.isReversed?'ngược':'xuôi'}): ${trend.isReversed?'kết quả chưa chắc chắn nếu không thay đổi':'chiều hướng tích cực nếu duy trì đúng nhịp'}. `;
    if (hasPentacles) conclusion += `Sự xuất hiện của các lá Pentacles nhấn mạnh đây là vấn đề liên quan đến tài chính, tài sản và sự ổn định vật chất. `;
    conclusion += reversedCount >= 3
      ? `Với ${reversedCount}/5 lá ngược, trải bài nghiêng về "${signal}" — cần xem xét kỹ trước khi hành động.`
      : `Với ${reversedCount}/5 lá ngược, tín hiệu là "${signal}" — có thể tiến nếu xử lý được điểm chặn.`;
    return conclusion;
  }
  if (spreadId === 'three-cards') {
    const [p, n, f] = cards;
    let conclusion = `Dòng chảy từ quá khứ đến tương lai cho "${question}": ${p.card.nameVi}(${p.isReversed?'ngược':'xuôi'}) → ${n.card.nameVi}(${n.isReversed?'ngược':'xuôi'}) → ${f.card.nameVi}(${f.isReversed?'ngược':'xuôi'}). `;
    conclusion += f.isReversed ? 'Xu hướng chưa ổn định — cần điều chỉnh từ hiện tại.' : 'Xu hướng nghiêng về hướng tích cực nếu giữ nhịp hiện tại.';
    return conclusion;
  }
  if (spreadId === 'love') {
    const [y, t, c] = cards;
    let conclusion = `Về "${question}": Bạn (${y.card.nameVi} ${y.isReversed?'ngược':'xuôi'}) và người ấy (${t.card.nameVi} ${t.isReversed?'ngược':'xuôi'}) đang tạo ra mối kết nối (${c.card.nameVi} ${c.isReversed?'ngược':'xuôi'}). `;
    conclusion += c.isReversed ? 'Kết nối còn nhiều điều cần làm rõ.' : 'Kết nối có tiềm năng phát triển tích cực.';
    return conclusion;
  }

  const c0 = cards[0];
  if (!c0) return `Chưa có đủ lá bài để tổng hợp cho "${question}".`;
  return `Lá ${c0.card.nameVi} (${c0.isReversed?'ngược':'xuôi'}) trả lời cho "${question}" với tín hiệu "${signal}".`;
}

/* ── pattern summary ── */
function buildPatternSummary(cards: DrawnCardInput[], spreadId: string): string {
  if (spreadId === 'five-cards') {
    const [sit, obs, hid, adv, trend] = cards;
    return `${sit.card.nameVi} → ${obs.card.nameVi} → ${hid.card.nameVi} → ${adv.card.nameVi} → ${trend.card.nameVi}: Năm lá tạo thành chuỗi phân tích từ hiện trạng đến xu hướng.`;
  }
  if (spreadId === 'three-cards') {
    const [p,n,f] = cards;
    return `${p.card.nameVi}(quá khứ) → ${n.card.nameVi}(hiện tại) → ${f.card.nameVi}(xu hướng).`;
  }
  if (spreadId === 'love') {
    const [y,t,c] = cards;
    return `Bạn(${y.card.nameVi}) — Người ấy(${t.card.nameVi}) — Kết nối(${c.card.nameVi}).`;
  }
  const c = cards[0];
  return `${c.card.nameVi} (${c.isReversed?'ngược':'xuôi'}) — tín hiệu trực tiếp cho câu hỏi.`;
}

/* ── key tension ── */
function buildKeyTension(cards: DrawnCardInput[]): string {
  const reversed = cards.filter(c => c.isReversed);
  if (!reversed.length) return 'Không có sự cản trở rõ ràng — năng lượng các lá đang chảy thuận.';
  return `Điểm cần chú ý: ${reversed.map(c=>`${c.card.nameVi}(${c.card.keywordsReversed.slice(0,2).join(', ')})`).join('; ')}.`;
}

/* ── key advice ── */
function buildKeyAdvice(cards: DrawnCardInput[], spreadId: string, signal: SignalType): string {
  if ((spreadId === 'five-cards') && cards[3]) {
    const adv = cards[3];
    const kw = (adv.isReversed ? adv.card.keywordsReversed : adv.card.keywordsUpright).slice(0,2).join(', ');
    return `${adv.card.nameVi} (${adv.isReversed?'ngược':'xuôi'}) khuyên: ${kw}.`;
  }
  const m: Record<SignalType,string> = {
    proceed:'Năng lượng ủng hộ hành động — tiến với sự tỉnh táo.',
    wait:'Cần thêm thông tin hoặc thời gian — kiên nhẫn.',
    avoid:'Thời điểm chưa phù hợp — xem xét lại.',
    conditional:'Có thể tiến nếu giải quyết được điểm còn chưa rõ.',
    unclear:'Tín hiệu chưa đủ rõ — quan sát thêm.',
    reflection:'Lúc nhìn vào trong hơn là hành động ra ngoài.',
  };
  return m[signal];
}

/* ── one-line summary ── */
function buildOneLine(spreadId: string, signal: SignalType, cards: DrawnCardInput[]): string {
  if (spreadId === 'yes-no')
    return signal==='proceed'?'Tín hiệu nghiêng về CÓ — cần xem xét thực tế thêm.'
      :signal==='avoid'?'Tín hiệu nghiêng về KHÔNG — xem xét lại thời điểm.'
      :'Tín hiệu chưa rõ ràng.';
  if (spreadId === 'daily')
    return `${cards[0].card.nameVi} — chủ điệu hôm nay: ${signal==='wait'?'kiên nhẫn và quan sát':'chủ động và chú tâm'}.`;
  return `${cards[0].card.nameVi}(${cards[0].isReversed?'ngược':'xuôi'}) dẫn trải bài — tín hiệu: "${signal}".`;
}

/* ── MAIN EXPORT ── */
export function synthesizeTarotReading(input: TarotSynthesisInput): TarotSynthesis {
  const { question, spreadId, spreadName, drawnCards, positionMeta } = input;
  const ctx = classifyQuestionContext(question);
  const signal = inferSignal(drawnCards);

  const positionAnalyses: PositionAnalysis[] = drawnCards.map((dc, i) =>
    buildPositionAnalysis(dc, positionMeta?.[i], question, ctx.questionType, ctx.answerMode)
  );

  // backward-compat cardSummaries
  const cardSummaries = positionAnalyses.map(pa => ({
    position: pa.positionLabel,
    cardName: pa.cardName,
    cardNameVi: pa.cardNameVi,
    orientation: pa.orientation,
    keywords: pa.keywords,
    shortMeaning: pa.cardMeaning,
    meaningInPosition: pa.meaningInThisPosition,
  }));

  const pattern   = buildPatternSummary(drawnCards, spreadId);
  const tension   = buildKeyTension(drawnCards);
  const advice    = buildKeyAdvice(drawnCards, spreadId, signal);
  const oneLine   = buildOneLine(spreadId, signal, drawnCards);
  const combined  = buildCombinedConclusion(drawnCards, spreadId, question, signal);

  const baseOverview =
    spreadId==='daily' ? `Lá bài hôm nay phản ánh năng lượng chủ đạo bạn sẽ gặp. Đây là tín hiệu để điều chỉnh thái độ trong ngày.`
    : spreadId==='yes-no' ? `Trải bài Có/Không đưa ra tín hiệu định hướng nhanh cho câu hỏi "${question}".`
    : spreadId==='love' ? `Trải bài Tình Yêu phân tích năng lượng của bạn, người ấy và mối kết nối.`
    : spreadId==='five-cards' ? `Trải bài 5 lá phân tích sâu câu hỏi "${question}" theo 5 chiều: hiện trạng, cản trở, điều ẩn, lời khuyên, xu hướng kết quả.`
    : spreadId==='three-cards' ? `Trải bài 3 lá nhìn dòng thời gian: quá khứ → hiện tại → xu hướng tương lai cho "${question}".`
    : `${spreadName} được đọc cho câu hỏi: "${question}".`;

  const overview = ctx.questionType !== 'unclear'
    ? `${baseOverview} Phân loại: ${ctx.questionType.replace(/_/g,' ')}.`
    : baseOverview;

  return { overview, positionAnalyses, cardSummaries, patternSummary:pattern, combinedConclusion:combined, mainSignal:signal, keyTension:tension, keyAdvice:advice, oneLineSummary:oneLine };
}

/* ── Kinh Dich synthesis (unchanged) ── */
export interface KinhDichSynthesis {
  overview: string; primaryHexagramSummary: string; movingLinesSummary: string;
  changedHexagramSummary: string; patternSummary: string; mainSignal: SignalType;
  keyTension: string; keyAdvice: string; oneLineSummary: string;
}

interface KinhDichSynthesisInput {
  question: string; topic: string; primaryHexagram: string; primaryHexagramMeaning?: string;
  changedHexagram: string; changedHexagramMeaning?: string; movingLines: string; sixLines: string;
}

function inferKDSignal(ml: string, ph: string, ch: string): SignalType {
  if (!ml||ml==='Không có'||!ml.trim()) return 'unclear';
  const n=ml.split(',').length;
  if(n>=5)return'avoid';if(n>=3)return'wait';if(ph===ch)return'reflection';return'conditional';
}

export function synthesizeKinhDichReading(input: KinhDichSynthesisInput): KinhDichSynthesis {
  const { question, topic, primaryHexagram, changedHexagram, movingLines, primaryHexagramMeaning, changedHexagramMeaning } = input;
  const ctx = classifyQuestionContext(question, topic);
  const has = movingLines && movingLines!=='Không có' && !!movingLines.trim();
  const n = has ? movingLines.split(',').length : 0;
  const signal = inferKDSignal(movingLines, primaryHexagram, changedHexagram);

  const overview=`Quẻ cho câu hỏi: "${question}" (${topic}). ${primaryHexagram} → ${changedHexagram} qua ${n>0?`${n} hào động`:'không có hào động'}.`;
  const primaryHexagramSummary=primaryHexagramMeaning?`Quẻ ${primaryHexagram}: ${primaryHexagramMeaning}`:`Quẻ ${primaryHexagram} đại diện trạng thái hiện tại liên quan đến "${question}".`;
  const movingLinesSummary=has?`Hào động tại ${movingLines} — điểm biến chuyển${n>=3?' đáng kể':' có kiểm soát'}.`:'Không có hào động — quẻ ở trạng thái tĩnh.';
  const changedHexagramSummary=primaryHexagram===changedHexagram?'Quẻ không biến — tình huống giữ nguyên.':changedHexagramMeaning?`Quẻ biến ${changedHexagram}: ${changedHexagramMeaning}`:`Quẻ biến ${changedHexagram} chỉ xu hướng tương lai.`;
  const patternSummary=has?`${primaryHexagram}→[hào ${movingLines}]→${changedHexagram}: đang chuyển tiếp.`:`${primaryHexagram} (không biến): ổn định.`;
  const keyTension=has?`Điểm căng thẳng tại hào ${movingLines}.`:'Chưa có điểm bùng phát rõ ràng.';
  const m:Record<SignalType,string>={proceed:'Ủng hộ tiến.',wait:'Quan sát thêm.',avoid:'Tránh quyết đoán.',conditional:`Tiến nếu giải quyết hào ${movingLines}.`,unclear:'Chưa đủ tín hiệu.',reflection:'Suy xét nội tâm.'};
  const oneLineSummary=`${primaryHexagram}→${changedHexagram}: "${signal}" — ${ctx.questionType!=='unclear'?ctx.questionType.replace(/_/g,' '):'xem xét thực tế'}.`;

  return { overview, primaryHexagramSummary, movingLinesSummary, changedHexagramSummary, patternSummary, mainSignal:signal, keyTension, keyAdvice:m[signal], oneLineSummary };
}
