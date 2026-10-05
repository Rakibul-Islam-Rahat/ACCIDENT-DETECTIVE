export type AccidentVerdict = 'WAITING_FOR_EVENT' | 'NO_ACCIDENT' | 'SUSPICIOUS' | 'ACCIDENT';

export interface AccidentAnalysis {
  verdict: AccidentVerdict;
  confidence: number; // 0-100
  explanation: string;
  recommendedAction: string;
  timestamp: string;
}

export const WAITING_ANALYSIS: AccidentAnalysis = {
  verdict: 'WAITING_FOR_EVENT',
  confidence: 0,
  explanation: 'No suspicious event has triggered AI analysis yet.',
  recommendedAction: 'No action required.',
  timestamp: new Date(0).toISOString(),
};
