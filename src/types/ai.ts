export type DecisionSignal = 'proceed' | 'wait' | 'avoid' | 'unclear' | 'conditional' | 'reflection';
export type ConfidenceLevel = 'low' | 'medium' | 'high';

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
  answerMode: 'decision_guidance' | 'emotional_reading' | 'risk_assessment' | 'daily_guidance' | 'reflection' | 'weekly_relationship_forecast';
  requiredLens: string[];
  psychologicalNeed?: string;
}

export interface ZodiacContext {
  birthDate?: string;
  zodiacSign?: string;
  viName?: string;
  element?: string;
  modality?: string;
  personalizationLens?: string;
  psychologicalTendency?: string;
  decisionStyle?: string;
  adviceStyle?: string;
}

export interface TarotCardReading {
  positionLabel: string;
  positionFunction: string;
  cardName: string;
  orientation: 'upright' | 'reversed';
  meaningInThisPosition: string;
  meaningForUserQuestion: string;
  psychologicalInsight: string;
  practicalSignal: string;
}

export interface UnifiedAIReadingResponse {
  questionEcho?: string;
  directAnswer: string;
  decisionSignal: DecisionSignal;
  confidenceLevel: ConfidenceLevel;
  questionContext: QuestionContext;
  personalizationUsed: {
    memoryUsed: boolean;
    zodiacUsed: boolean;
    referenceUsed: boolean;
    synthesisUsed: boolean;
  };
  quickSummary: string;
  synthesis?: string;
  synthesisSummary: string;
  reasonedInterpretation?: string;
  positionAnalyses: TarotCardReading[];
  symbolicReading: {
    // Both
    mainPattern?: string;
    changingFactor?: string;
    futureTrend?: string; // maybe missing in new schema, but okay to keep optional
    // Kinh Dich
    primaryHexagram?: string;
    movingLines?: string;
    changedHexagram?: string;
    transformationSummary?: string;
  };
  psychologicalInterpretation: string;
  contextualInterpretation: string;
  actionableAdvice?: string[];
  decisionChecklist: string[];
  practicalAdvice: string[];
  thingsToAvoid: string[];
  riskNotes: string[];
  
  zodiacContext?: ZodiacContext; // added back by API route if birthDate provided
  finalMessage: string;
  qualitySelfCheck?: {
    directlyAnswersQuestion?: boolean;
    isContextual: boolean;
    isTooGeneric: boolean;
    isTooLong: boolean;
    missingImportantInfo: string[];
    offTopicWarnings: string[];
    needsSecondPass: boolean;
  };
}

// Legacy compatibility types
export type KinhDichAIReadingResponse = UnifiedAIReadingResponse;
export type TarotAIReadingResponse = UnifiedAIReadingResponse;
