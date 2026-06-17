import type { UnifiedAIReadingResponse } from '../types/ai';
import { buildTarotContextBundle, buildKinhDichContextBundle } from '../lib/ai/contextBundle';
import type { CastingMetadata, ManualHexagramState } from '../types';
import type { DrawnCard } from '../types/tarot';
import type { ZodiacLens } from '../lib/astrology/zodiac';
import { synthesizeKinhDichReading, synthesizeTarotReading } from '../lib/readings/synthesis';
import type { SignalType } from '../lib/readings/synthesis';

// Re-exporting for UI use
export type AIReadingResponse = UnifiedAIReadingResponse;

function inferSpreadForMock(drawnCards: DrawnCard[], spreadType?: string): {
  spreadId: 'one-card' | 'three-cards' | 'love' | 'yes-no' | 'daily' | 'five-cards';
  spreadName: string;
} {
  if (spreadType?.toLowerCase().includes('love') || drawnCards.some((card) => card.positionName.toLowerCase().includes('người ấy'))) {
    return { spreadId: 'love', spreadName: spreadType || 'Tình Yêu' };
  }
  if (drawnCards.length === 5) return { spreadId: 'five-cards', spreadName: spreadType || 'Trải Bài 5 Lá' };
  if (drawnCards.length === 3) return { spreadId: 'three-cards', spreadName: spreadType || 'Ba Lá' };
  return { spreadId: 'one-card', spreadName: spreadType || 'Một Lá Bài' };
}

function signalLabel(signal: SignalType): string {
  const labels: Record<SignalType, string> = {
    proceed: 'Có thể mở ra',
    wait: 'Nên chậm lại',
    avoid: 'Không nên ép tiến',
    conditional: 'Có tiềm năng nếu đủ điều kiện',
    unclear: 'Chưa đủ rõ',
    reflection: 'Cần nhìn lại bên trong',
  };
  return labels[signal];
}

const WEAK_TAROT_PHRASES = [
  'phản ánh năng lượng tình cảm',
  'tâm lý hiện tại cần sự cân bằng',
  'năng lượng tình cảm đang cần sự quan sát',
  'khuyên bạn nên xem xét kỹ các yếu tố thực tế',
  'kiểm tra lại các thông tin',
  'tập trung vào hành động và ý chí',
  'liên hệ câu hỏi: phản ánh năng lượng',
];

function normalizeText(value: string | undefined): string {
  return (value || '').toLowerCase();
}

export function isWeakTarotAIResponse(
  response: UnifiedAIReadingResponse,
  drawnCards: DrawnCard[],
  question = ''
): boolean {
  const text = normalizeText([
    response.directAnswer,
    response.quickSummary,
    response.synthesisSummary,
    response.reasonedInterpretation,
    response.contextualInterpretation,
    response.psychologicalInterpretation,
    response.finalMessage,
    ...(response.positionAnalyses || []).flatMap((position) => [
      position.meaningInThisPosition,
      position.meaningForUserQuestion,
      position.psychologicalInsight,
    ]),
    ...(response.practicalAdvice || []),
    ...(response.thingsToAvoid || []),
    ...(response.riskNotes || []),
  ].join(' '));

  const genericHits = WEAK_TAROT_PHRASES.filter((phrase) => text.includes(phrase)).length;
  const hasSynthesisOnlyPhrase = text.includes('dẫn trải bài');
  const missesMessagingAction = isMessagingQuestion(question) &&
    !/(nhan|gui|goi|mo loi|chu dong|tin nhan|cho|doi)/i.test(normalizeVietnameseText(response.directAnswer || ''));
  const positionAnalyses = response.positionAnalyses || [];
  const hasEnoughPositionWork = positionAnalyses.length >= drawnCards.length;
  const weakPositions = positionAnalyses.filter((position) => {
    const positionText = normalizeText([
      position.meaningInThisPosition,
      position.meaningForUserQuestion,
      position.psychologicalInsight,
    ].join(' '));
    return (
      positionText.length < 140 ||
      WEAK_TAROT_PHRASES.some((phrase) => positionText.includes(phrase)) ||
      !positionText.includes(normalizeText(position.cardName))
    );
  }).length;

  const mentionedCards = drawnCards.filter((drawnCard) => {
    const vi = normalizeText(drawnCard.card.nameVi);
    const en = normalizeText(drawnCard.card.name);
    return (vi && text.includes(vi)) || (en && text.includes(en));
  }).length;

  return (
    missesMessagingAction ||
    hasSynthesisOnlyPhrase ||
    response.qualitySelfCheck?.isTooGeneric === true ||
    response.qualitySelfCheck?.isContextual === false ||
    genericHits >= 2 ||
    !hasEnoughPositionWork ||
    weakPositions >= Math.max(1, Math.ceil(drawnCards.length / 2)) ||
    mentionedCards < Math.min(drawnCards.length, 3) ||
    normalizeText(response.synthesisSummary).length < 120 ||
    normalizeText(response.contextualInterpretation).length < 120
  );
}

function orientationLabel(isReversed: boolean): string {
  return isReversed ? 'ngược' : 'xuôi';
}

function cardKeywords(card: DrawnCard): string {
  return (card.isReversed ? card.card.keywordsReversed : card.card.keywordsUpright)
    .slice(0, 3)
    .join(', ');
}

function cardMeaning(card: DrawnCard): string {
  return card.isReversed ? card.card.meaningReversed : card.card.meaningUpright;
}

function normalizeVietnameseText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

function isMessagingQuestion(question: string): boolean {
  const normalized = normalizeVietnameseText(question);
  return /(nhan tin|goi lai|chu dong|mo loi|reply|inbox|message)/i.test(normalized) ||
    (/\btin\b/i.test(normalized) && /(nhan|nguoi|ay|lai|nen)/i.test(normalized));
}

function buildMessagingAdvice(card: DrawnCard, signal: SignalType): string {
  const cardLabel = `${card.card.nameVi} ${orientationLabel(card.isReversed)}`;
  const keywords = cardKeywords(card);

  if (card.isReversed) {
    return `Chưa nên nhắn vội. ${cardLabel} cho thấy điểm nghẽn là ${keywords}, nên nếu bạn nhắn ngay rất dễ mang theo nhu cầu được xác nhận hoặc kỳ vọng người kia phản hồi đúng ý. Hãy chờ đến khi cảm xúc dịu xuống, rồi chỉ nhắn một câu nhẹ, không chất vấn: "Mình nhớ tới bạn nên hỏi thăm một chút, nếu bạn tiện thì nhắn lại sau cũng được." Sau tin đó, đừng nhắn dồn; nếu họ không phản hồi hoặc vẫn lạnh, đó là dữ kiện để lùi lại chứ không phải lý do để ép thêm.`;
  }

  if (signal === 'proceed' || signal === 'conditional') {
    return `Có thể nhắn, nhưng nên nhắn nhẹ và có đường lui. ${cardLabel} cho thấy ${keywords}, vì vậy mục tiêu không phải kéo họ vào cuộc nói chuyện ngay mà là mở một cánh cửa rõ ràng, bình tĩnh. Hãy dùng một tin ngắn, thân thiện, không kiểm tra hay trách móc; sau đó quan sát chất lượng phản hồi của họ trước khi bước tiếp.`;
  }

  return `Nên chậm lại trước khi nhắn. ${cardLabel} cho thấy ${keywords}; câu trả lời tốt nhất lúc này là đợi thêm tín hiệu rõ hơn hoặc chọn một tin nhắn rất ngắn, không đặt áp lực phản hồi.`;
}

function buildSpecificTarotDirectAnswer(
  question: string,
  drawnCards: DrawnCard[],
  synthesisSignal: SignalType,
  isLove: boolean,
  timeline: string
): string {
  const [current, obstacle, hidden, advice, trend] = drawnCards;
  const timelineText = timeline ? `Trong ${timeline}, ` : '';

  if (isLove && isMessagingQuestion(question) && drawnCards.length <= 2 && current) {
    return buildMessagingAdvice(current, synthesisSignal);
  }

  if (drawnCards.length === 5 && current && obstacle && hidden && advice && trend) {
    const domainText = isLove
      ? 'chuyện tình cảm không đứng yên, nhưng đang cần một lần nói rõ thay vì đoán ý nhau'
      : 'tình huống có thể tiến triển, nhưng chỉ khi xử lý đúng điểm nghẽn hiện tại';

    return `${signalLabel(synthesisSignal)}. Với câu hỏi "${question}", ${timelineText}${domainText}: ${current.card.nameVi} ${orientationLabel(current.isReversed)} cho thấy nền hiện tại là ${cardKeywords(current)}; ${obstacle.card.nameVi} ở vị trí cản trở chỉ ra nút thắt là ${cardKeywords(obstacle)}; ${hidden.card.nameVi} cho thấy phần chưa được nói ra là ${cardKeywords(hidden)}. Lời khuyên nằm ở ${advice.card.nameVi}: ${cardKeywords(advice)}. Xu hướng ${trend.card.nameVi} ${orientationLabel(trend.isReversed)} mở ra khả năng chuyển pha. Ý nghĩa trọng tâm của lá xu hướng: ${cardMeaning(trend)} Kết quả phụ thuộc vào việc bạn có xử lý được nút cản và phần bị che khuất hay không.`;
  }

  const first = drawnCards[0];
  const last = drawnCards[drawnCards.length - 1] || first;
  if (!first) return `${signalLabel(synthesisSignal)}. Chưa đủ lá bài để đưa ra kết luận đáng tin.`;

  return `${signalLabel(synthesisSignal)}. Với câu hỏi "${question}", ${timelineText}${first.card.nameVi} ${orientationLabel(first.isReversed)} đặt nền bằng ${cardKeywords(first)}; ${last.card.nameVi} ${orientationLabel(last.isReversed)} cho thấy hướng tiếp theo là ${cardKeywords(last)}. Ý nghĩa trọng tâm của lá cuối: ${cardMeaning(last)} Trọng tâm là đọc các dấu hiệu thực tế thay vì kết luận một chiều.`;
}

export async function mockAIHexagramReading(
  metadata: CastingMetadata,
  hexagramState: ManualHexagramState,
  tone?: string
): Promise<UnifiedAIReadingResponse> {
  void tone;
  const movingLinesText = hexagramState.movingLines.length > 0
    ? hexagramState.movingLines.join(', ')
    : 'Không có';
  const synthesis = synthesizeKinhDichReading({
    question: metadata.question,
    topic: metadata.topic,
    primaryHexagram: hexagramState.primaryInfo.name,
    changedHexagram: hexagramState.changedInfo.name,
    movingLines: movingLinesText,
    sixLines: hexagramState.primaryLines.join(', '),
  });
  const input = {
    question: metadata.question,
    topic: metadata.topic,
    primaryHexagram: hexagramState.primaryInfo.name,
    changedHexagram: hexagramState.changedInfo.name,
    movingLines: hexagramState.movingLines,
    sixLines: hexagramState.primaryLines,
    synthesisContext: 'Mock synthesis'
  };
  
  const ctx = buildKinhDichContextBundle(input);
  const movingLineSentence = movingLinesText === 'Không có'
    ? 'không có hào động nên trọng tâm là giữ nhịp hiện tại và đọc kỹ bản chất quẻ chính'
    : `hào động ${movingLinesText} là điểm cần xử lý trước khi kỳ vọng tình huống đổi hướng`;
  const domainAdvice = ctx.questionContext.questionType === 'love_relationship'
    ? 'Trong tình cảm, hãy đo bằng chất lượng giao tiếp, mức chủ động lặp lại và ranh giới rõ ràng; tránh tự diễn giải im lặng thành câu trả lời chắc chắn.'
    : ctx.questionContext.questionType === 'career_work'
      ? 'Với công việc/kinh doanh, hãy kiểm tra dòng tiền, nguồn lực, người chịu trách nhiệm và mốc đánh giá trước khi mở rộng.'
      : ctx.questionContext.questionType === 'money_finance'
        ? 'Với tài chính, ưu tiên bảo toàn vốn, kịch bản xấu nhất và khả năng thoát vị thế trước khi quyết định.'
        : 'Hãy chuyển tín hiệu của quẻ thành một bước thử nhỏ, có thời hạn và có tiêu chí kiểm chứng.';

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        directAnswer: `${signalLabel(synthesis.mainSignal)}. Với câu hỏi "${metadata.question}", ${hexagramState.primaryInfo.name} chuyển sang ${hexagramState.changedInfo.name}; ${movingLineSentence}. ${domainAdvice}`,
        decisionSignal: synthesis.mainSignal,
        confidenceLevel: 'medium',
        questionContext: ctx.questionContext as UnifiedAIReadingResponse['questionContext'],
        personalizationUsed: {
          memoryUsed: false,
          zodiacUsed: false,
          referenceUsed: false,
          synthesisUsed: true
        },
        quickSummary: synthesis.oneLineSummary,
        synthesisSummary: synthesis.patternSummary,
        positionAnalyses: [],
        reasonedInterpretation: `${synthesis.keyTension} Vì vậy tín hiệu chính là "${synthesis.mainSignal}", không phải một kết luận tuyệt đối.`,
        psychologicalInterpretation: ctx.questionContext.questionType === 'love_relationship'
          ? 'Tâm lý trọng tâm là phân biệt cảm xúc thật với nhu cầu được trấn an ngay lập tức. Quẻ khuyên quan sát hành động lặp lại hơn là phản ứng nhất thời.'
          : 'Tâm lý trọng tâm là tách mong muốn nhanh có kết quả khỏi dữ kiện thực tế. Quyết định nên đi qua một bước kiểm chứng nhỏ trước.',
        symbolicReading: {
          mainPattern: synthesis.primaryHexagramSummary,
          changingFactor: synthesis.movingLinesSummary,
          futureTrend: synthesis.changedHexagramSummary,
          transformationSummary: synthesis.patternSummary,
        },
        contextualInterpretation: synthesis.changedHexagramSummary,
        decisionChecklist: ctx.questionContext.requiredLens.length > 0
          ? ctx.questionContext.requiredLens.map((l: string) => `Xem xét: ${l}`)
          : ['Xác định dữ kiện đã chắc chắn.', 'Chọn một hành động thử nhỏ.', 'Đặt mốc xem lại kết quả.'],
        practicalAdvice: [
          synthesis.keyAdvice,
          domainAdvice,
          movingLinesText === 'Không có'
            ? 'Không nên đổi chiến lược chỉ vì nóng ruột; hãy nhìn lại nền hiện tại.'
            : `Ưu tiên xử lý điểm biến chuyển ở hào ${movingLinesText} trước khi quyết định bước lớn.`,
        ],
        thingsToAvoid: [
          'Tránh coi quẻ như mệnh lệnh tuyệt đối.',
          'Tránh bỏ qua dữ kiện trái chiều chỉ vì câu trả lời nghe thuận tai.',
        ],
        riskNotes: [synthesis.keyTension],
        finalMessage: 'Quẻ chỉ ra điểm cần nhìn thẳng; phần còn lại phụ thuộc vào cách bạn kiểm chứng và hành động.',
        qualitySelfCheck: {
          isContextual: true,
          isTooGeneric: false,
          isTooLong: false,
          missingImportantInfo: [],
          offTopicWarnings: [],
          needsSecondPass: false,
        },
      });
    }, 2500);
  });
}

export async function mockAITarotReading(
  question: string,
  drawnCards: DrawnCard[],
  tone?: string,
  spreadType?: string,
  zodiacLens?: ZodiacLens
): Promise<UnifiedAIReadingResponse> {
  void tone;
  const inferredSpread = inferSpreadForMock(drawnCards, spreadType);
  const synthesis = synthesizeTarotReading({
    question,
    spreadId: inferredSpread.spreadId,
    spreadName: inferredSpread.spreadName,
    drawnCards,
  });
  const input = {
    question,
    drawnCards,
    spreadType,
    zodiacLens,
    synthesisContext: synthesis,
  };
  
  const ctx = buildTarotContextBundle(input);
  const isLove = ctx.questionContext.questionType === 'love_relationship';
  const firstCard = drawnCards[0];
  const finalCard = drawnCards[drawnCards.length - 1];
  const reversedCount = drawnCards.filter((card) => card.isReversed).length;
  const timeline = ctx.questionContext.timeframe || (question.toLowerCase().includes('3 tháng') ? '3 tháng tới' : '');
  const positionAnalyses = synthesis.positionAnalyses.map((pa) => ({
    positionLabel: pa.positionLabel,
    positionFunction: pa.positionFunction,
    cardName: pa.cardNameVi,
    orientation: pa.orientation,
    meaningInThisPosition: `${pa.cardMeaning} ${pa.meaningInThisPosition}`,
    meaningForUserQuestion: `${pa.meaningForUserQuestion} Tín hiệu thực tế: ${pa.practicalSignal}`,
    psychologicalInsight: `${pa.psychologicalInsight} Điểm cần tự hỏi: phản ứng hiện tại của bạn đang đến từ dữ kiện, nỗi sợ, hay mong muốn được xác nhận?`,
    practicalSignal: pa.orientation === 'reversed' ? 'wait' : 'proceed',
  }));

  const directAnswer = buildSpecificTarotDirectAnswer(
    question,
    drawnCards,
    synthesis.mainSignal,
    isLove,
    timeline
  );

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        directAnswer,
        decisionSignal: synthesis.mainSignal,
        confidenceLevel: 'medium',
        questionContext: ctx.questionContext as UnifiedAIReadingResponse['questionContext'],
        personalizationUsed: {
          memoryUsed: false,
          zodiacUsed: !!zodiacLens,
          referenceUsed: false,
          synthesisUsed: true
        },
        quickSummary: synthesis.oneLineSummary,
        synthesisSummary: synthesis.combinedConclusion,
        reasonedInterpretation: `${synthesis.keyTension} Vì vậy tín hiệu chính là "${synthesis.mainSignal}", không phải kết luận tuyệt đối.`,
        positionAnalyses,
        symbolicReading: {
          mainPattern: synthesis.patternSummary,
          changingFactor: synthesis.keyTension,
          futureTrend: finalCard
            ? `${finalCard.card.nameVi} ở vị trí "${finalCard.positionName}" là xu hướng cuối: ${finalCard.isReversed ? finalCard.card.meaningReversed : finalCard.card.meaningUpright}`
            : synthesis.oneLineSummary,
        },
        psychologicalInterpretation: isLove
          ? 'Các lá ngược trong trải bài tình cảm thường chỉ ra cảm xúc chưa cùng nhịp: một bên cần rõ lòng mình, bên kia có thể còn giữ thế phòng vệ hoặc sợ mất an toàn.'
          : 'Tâm lý hiện tại cần tách trực giác khỏi áp lực nhất thời, rồi kiểm chứng bằng hành động nhỏ.',
        contextualInterpretation: isLove
          ? `${firstCard ? `${firstCard.card.nameVi} ở vị trí của bạn` : 'Lá đầu'} nói về phần bạn đang mang vào mối quan hệ; ${finalCard ? `${finalCard.card.nameVi} ở vị trí kết nối/tương lai` : 'lá cuối'} mới là hướng mở. Vì vậy trọng tâm không phải "có hay không", mà là điều kiện để kết nối sáng rõ hơn.`
          : synthesis.combinedConclusion,
        decisionChecklist: ctx.questionContext.requiredLens.length > 0
          ? ctx.questionContext.requiredLens.map((l: string) => `Kiểm tra: ${l}`)
          : ['Viết ra dữ kiện đã thấy, không chỉ cảm giác.', 'Chọn một bước thử nhỏ trước khi quyết định lớn.'],
        practicalAdvice: [
          synthesis.keyAdvice,
          isLove ? 'Trong 2-4 tuần đầu, ưu tiên quan sát hành động lặp lại và chất lượng giao tiếp thay vì ép cam kết.' : 'Ra quyết định theo từng bước nhỏ có thể đo được.',
          finalCard && !finalCard.isReversed ? `Giữ hướng tích cực của ${finalCard.card.nameVi} bằng sự rõ ràng, vui vẻ và chủ động mở lời đúng lúc.` : 'Chưa nên đẩy nhanh nhịp khi tín hiệu còn đảo chiều.',
        ],
        thingsToAvoid: [
          'Tránh suy diễn im lặng thành câu trả lời chắc chắn.',
          'Tránh kiểm soát hoặc thử lòng người kia để tìm cảm giác an toàn.',
        ],
        riskNotes: [
          reversedCount > 0
            ? `${reversedCount} lá ngược cho thấy rủi ro chính nằm ở nhịp chưa đồng bộ, không nhất thiết là kết quả xấu.`
            : 'Rủi ro thấp hơn, nhưng vẫn cần đối chiếu với hành động thực tế.',
        ],
        finalMessage: finalCard?.card.name === 'The Sun'
          ? 'Mặt Trời không hứa rằng mọi thứ tự sáng lên; nó nhắc bạn chọn sự rõ ràng để tình cảm có chỗ lớn lên.'
          : 'Một trải bài tốt không thay bạn quyết định; nó chỉ chỉ ra nơi cần nhìn thẳng hơn.',
        qualitySelfCheck: {
          isContextual: true,
          isTooGeneric: false,
          isTooLong: false,
          missingImportantInfo: [],
          offTopicWarnings: [],
          needsSecondPass: false,
        },
      });
    }, 800);
  });
}
