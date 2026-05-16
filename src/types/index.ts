// ============================================================
// TRIGRAM (Quẻ đơn / Bát Quái)
// ============================================================

export interface Trigram {
  /** Bit string key: "111", "110", "101", "100", "011", "010", "001", "000" */
  bits: string;
  name: string;
  symbol: string;
  nature: string;
  tone: string;
  element: FiveElement;
}

// ============================================================
// HEXAGRAM (Quẻ kép / 64 quẻ)
// ============================================================

export interface Hexagram {
  no: number;
  name: string;
  /** Upper trigram bit string */
  upper: string;
  /** Lower trigram bit string */
  lower: string;
  /** Concatenated code: lower + upper (6 bits, bottom-to-top) */
  code?: string;
  /** Palace family (Cung / Họ) */
  palace?: string;
  palaceElement?: FiveElement | string;
  palaceStage?: string;
}

/** Extended hexagram with full interpretation data */
export interface HexagramFull extends Hexagram {
  chineseName?: string;
  pinyin?: string;
  symbol?: string; // Unicode glyph like ䷀
  keywords?: string[];
  judgment?: string;
  image?: string;
  overallMeaning?: string;
  workMeaning?: string;
  loveMeaning?: string;
  financeMeaning?: string;
  /** Health reference only — non-definitive */
  healthNote?: string;
  lines?: HexagramLine[];
  relatedElement?: FiveElement;
}

export interface HexagramLine {
  lineNo: 1 | 2 | 3 | 4 | 5 | 6;
  originalText?: string;
  translationVi?: string;
  modernAdvice?: string;
  warning?: string;
  reflectionQuestion?: string;
}

// ============================================================
// LINE / HAO
// ============================================================

export type LineValue = 6 | 7 | 8 | 9;
export type LineType = 'yang' | 'yin';

export interface CoinLineOption {
  value: LineValue;
  label: string;
  type: LineType;
  changingTo: LineType;
  note: string;
}

export interface LineDetail {
  lineNo: number;
  lineType: LineType;
  moving: boolean;
  selfOrResponse: string;
  lucThan: string;
  canChi: string;
  lucThu: string;
}

// ============================================================
// MANUAL HEXAGRAM STATE
// ============================================================

export interface ManualHexagramState {
  dayStem: string;
  manualQuestion: string;
  lineObjects: CoinLineOption[];
  primaryLines: LineType[];
  changedLines: LineType[];
  movingLines: number[];
  lower: Trigram;
  upper: Trigram;
  changedLower: Trigram;
  changedUpper: Trigram;
  primaryInfo: Hexagram;
  changedInfo: Hexagram;
  primaryDetails: LineDetail[];
  changedDetails: LineDetail[];
}

// ============================================================
// READING
// ============================================================

export interface ReadingResult {
  field: string;
  lower: Trigram;
  upper: Trigram;
  lines: LineType[];
  movingLine: number;
  theme: string;
  confidence: number;
}

// ============================================================
// DECISION
// ============================================================

export type RiskLevel = 'low' | 'medium' | 'high';
export type UrgencyLevel = 'low' | 'medium' | 'high';

export interface ScoredChoice {
  choice: string;
  score: number;
}

// ============================================================
// FIVE ELEMENTS (Ngũ Hành)
// ============================================================

export type FiveElement = 'Kim' | 'Mộc' | 'Thủy' | 'Hỏa' | 'Thổ';

export interface FiveElementData {
  name: FiveElement;
  generates: FiveElement;   // tương sinh: sinh ra
  controls: FiveElement;    // tương khắc: khắc
  color: string;
  direction: string;
  season: string;
  nature: string;
  shortInterpretation: string;
}

// ============================================================
// CAN CHI (Thiên Can / Địa Chi)
// ============================================================

export type Polarity = 'Dương' | 'Âm';

export interface HeavenlyStem {
  name: string;
  polarity: Polarity;
  element: FiveElement;
}

export interface EarthlyBranch {
  name: string;
  polarity: Polarity;
  element: FiveElement;
  zodiac?: string;
}

// ============================================================
// BÁT TỰ (Four Pillars of Destiny)
// ============================================================

export interface BatTuPillar {
  stem: HeavenlyStem;
  branch: EarthlyBranch;
  element: FiveElement;
  polarity: Polarity;
}

export interface BatTuChart {
  year: BatTuPillar;
  month: BatTuPillar;
  day: BatTuPillar;
  hour: BatTuPillar;
  /** Ngày chủ — the Day Master */
  dayMaster: HeavenlyStem;
  /** Balance of five elements in the chart */
  elementBalance: Record<FiveElement, number>;
  /** General interpretation summary — placeholder until algorithm is complete */
  generalInterpretation?: string;
}

// TODO: Implement full BatTu calculation algorithm
// Currently only data structure is defined.
// Accurate calculation requires:
// 1. Solar calendar ↔ Chinese lunisolar calendar conversion
// 2. Accurate month pillar lookup tables
// 3. Hour pillar based on local time and longitude

// ============================================================
// TỬ VI (Purple Star Astrology)
// ============================================================

export type TuViPalaceName =
  | 'Mệnh'
  | 'Phụ Mẫu'
  | 'Phúc Đức'
  | 'Điền Trạch'
  | 'Quan Lộc'
  | 'Nô Bộc'
  | 'Thiên Di'
  | 'Tật Ách'
  | 'Tài Bạch'
  | 'Tử Tức'
  | 'Phu Thê'
  | 'Huynh Đệ';

export type StarCategory = 'Chính tinh' | 'Phụ tinh' | 'Sát tinh' | 'Cát tinh';

export interface TuViStar {
  name: string;
  category: StarCategory;
  element: FiveElement;
  polarity: Polarity;
  meaning: string;
  positiveMeaning: string;
  negativeMeaning: string;
  relatedPalaces: TuViPalaceName[];
}

export interface TuViPalace {
  name: TuViPalaceName;
  meaning: string;
  stars: TuViStar[];
  element?: FiveElement;
  interpretation?: string;
}

// ============================================================
// DATA SOURCES
// ============================================================

export interface DataSource {
  title: string;
  level: string;
  text: string;
}

export interface GalleryProject {
  title: string;
  tag: string;
  image: string;
  alt: string;
  description: string;
}
