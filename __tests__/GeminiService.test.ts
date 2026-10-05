import { safeParseAnalysis } from '../src/services/GeminiService';

describe('safeParseAnalysis', () => {
  it('parses a well-formed JSON response', () => {
    const result = safeParseAnalysis(
      JSON.stringify({
        verdict: 'SUSPICIOUS',
        confidence: 72,
        explanation: 'Object appears to have fallen near the sensor.',
        recommendedAction: 'Review the captured frame manually.',
      }),
    );
    expect(result).not.toBeNull();
    expect(result?.verdict).toBe('SUSPICIOUS');
    expect(result?.confidence).toBe(72);
  });

  it('strips markdown code fences before parsing', () => {
    const raw = '```json\n{"verdict":"NO_ACCIDENT","confidence":10,"explanation":"e","recommendedAction":"a"}\n```';
    const result = safeParseAnalysis(raw);
    expect(result?.verdict).toBe('NO_ACCIDENT');
  });

  it('clamps out-of-range confidence into 0-100', () => {
    const result = safeParseAnalysis(
      JSON.stringify({ verdict: 'ACCIDENT', confidence: 250, explanation: 'e', recommendedAction: 'a' }),
    );
    expect(result?.confidence).toBe(100);
  });

  it('returns null for an invalid verdict', () => {
    const result = safeParseAnalysis(
      JSON.stringify({ verdict: 'MAYBE', confidence: 50, explanation: 'e', recommendedAction: 'a' }),
    );
    expect(result).toBeNull();
  });

  it('returns null for non-JSON garbage', () => {
    expect(safeParseAnalysis('not json at all')).toBeNull();
  });
});
