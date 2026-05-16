export type DecisionSignal = 'proceed' | 'wait' | 'avoid' | 'unclear' | 'conditional';
export type ConfidenceLevel = 'low' | 'medium' | 'high';
export type ReadingTone =
  | 'Gentle and healing'
  | 'Direct and honest'
  | 'Mystical and poetic'
  | 'Practical and logical'
  | 'Gen Z spiritual bestie';

export type QuestionType = 
  | 'love_relationship' 
  | 'money_finance' 
  | 'career_work' 
  | 'study' 
  | 'family' 
  | 'vehicle_property_asset' 
  | 'housing_property'
  | 'yes_no_decision' 
  | 'timing' 
  | 'emotional_healing' 
  | 'daily_guidance' 
  | 'risk_assessment' 
  | 'legal_contract'
  | 'unclear';

export type DecisionType = 
  | 'sell_or_keep' 
  | 'buy_or_wait' 
  | 'continue_or_stop' 
  | 'accept_or_decline' 
  | 'confess_or_wait' 
  | 'quit_or_stay' 
  | 'choose_between_options' 
  | 'invest_or_wait' 
  | 'general_guidance' 
  | 'unclear';

export interface QuestionContext {
  questionType: QuestionType;
  decisionType: DecisionType;
  mainObject: string;
  userIntent: string;
  riskLevel: 'low' | 'medium' | 'high';
  answerMode: 'decision_guidance' | 'emotional_reading' | 'risk_assessment' | 'daily_guidance' | 'reflection';
  requiredLens: string[];
}

export interface TarotCardReading {
  position: string;
  cardName: string;
  orientation: 'upright' | 'reversed';
  meaningInThisQuestion: string;
  decisionImpact: DecisionSignal;
  advice: string;
}

export interface HexagramExplanation {
  primaryHexagram: string;
  movingLines: string;
  changedHexagram: string;
}

export interface UnifiedAIReadingResponse {
  directAnswer: string;
  decisionSignal: DecisionSignal;
  confidenceLevel: ConfidenceLevel;
  questionContext: QuestionContext;
  quickSummary: string;
  symbolicReading: {
    mainSymbol: string;
    mainPattern: string;
    changingFactor: string;
    futureTrend: string;
  };
  contextualInterpretation: string;
  decisionChecklist: string[];
  practicalAdvice: string[];
  thingsToAvoid: string[];
  riskNotes: string[];
  
  // Dynamic symbol details based on the reading type
  symbolDetails: {
    cardInterpretations?: TarotCardReading[];
    hexagramExplanation?: HexagramExplanation;
  };
  
  referenceUsed?: string[];
  finalMessage: string;
}

// Legacy compatibility types if needed by other components during transition
export type KinhDichAIReadingResponse = UnifiedAIReadingResponse;
export type TarotAIReadingResponse = UnifiedAIReadingResponse;
