export type TarotSuit = 'Major' | 'Wands' | 'Cups' | 'Swords' | 'Pentacles';

export interface TarotCard {
  id: string;
  name: string;
  nameVi: string;
  suit: TarotSuit;
  value: number;
  imageSlug: string; // e.g. "the-fool"
  image: string;     // e.g. "/tarot/rws/the-fool.jpg"
  symbol: string;    // Fallback symbol e.g. "✧"
  keywordsUpright: string[];
  keywordsReversed: string[];
  meaningUpright: string;
  meaningReversed: string;
}

export type SpreadType = 'one-card' | 'three-cards' | 'love' | 'yes-no';

export interface TarotSpread {
  id: SpreadType;
  name: string;
  description: string;
  cardCount: number;
  positions: string[];
}

export interface DrawnCard {
  card: TarotCard;
  isReversed: boolean;
  positionName: string;
}
