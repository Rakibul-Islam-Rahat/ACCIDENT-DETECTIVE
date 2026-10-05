/**
 * GeminiService
 *
 * Sends captured evidence (a still frame, base64 JPEG) to the Gemini
 * API for a structured accident-analysis verdict. Isolated here so the
 * API key only ever appears in this file + appConfig.ts.
 *
 * PRODUCTION NOTE: shipping an AI API key inside a mobile binary is not
 * safe for a real deployment. A production build should proxy this
 * call through your own backend, which holds the key server-side.
 */
import { GEMINI_API_KEY, GEMINI_MODEL } from '../config/appConfig';
import { AccidentAnalysis, WAITING_ANALYSIS } from '../types';

const REQUEST_TIMEOUT_MS = 20000;

const ANALYSIS_PROMPT = `You are assisting a prototype accident-monitoring camera system.
Look at the attached image, captured because a sensor event (motion/sonar change)
was flagged as potentially suspicious.

Respond with ONLY a JSON object, no prose, no markdown fences, matching exactly:
{
  "verdict": "NO_ACCIDENT" | "SUSPICIOUS" | "ACCIDENT",
  "confidence": <integer 0-100>,
  "explanation": "<one or two sentence plain-language explanation>",
  "recommendedAction": "<short suggested next step, non-medical, non-legal>"
}

Rules:
- Do not make medical or legal claims or diagnoses.
- If the image is unclear, ambiguous, or shows nothing unusual, prefer NO_ACCIDENT or SUSPICIOUS over ACCIDENT.
- This is a prototype heuristic aid, not a certified safety system — reflect appropriate caution in "explanation".`;

interface GeminiCallResult {
  ok: boolean;
  analysis?: AccidentAnalysis;
  error?: string;
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Gemini request timed out')), ms),
    ),
  ]);
}

export function safeParseAnalysis(text: string): AccidentAnalysis | null {
  try {
    const cleaned = text.trim().replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '');
    const parsed = JSON.parse(cleaned);
    const validVerdicts = ['NO_ACCIDENT', 'SUSPICIOUS', 'ACCIDENT'];
    if (!validVerdicts.includes(parsed.verdict)) return null;
    return {
      verdict: parsed.verdict,
      confidence: typeof parsed.confidence === 'number' ? Math.max(0, Math.min(100, parsed.confidence)) : 0,
      explanation: typeof parsed.explanation === 'string' ? parsed.explanation : 'No explanation provided.',
      recommendedAction: typeof parsed.recommendedAction === 'string' ? parsed.recommendedAction : 'Review manually.',
      timestamp: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

class GeminiServiceImpl {
  /**
   * Analyzes a base64-encoded JPEG frame and returns a normalized
   * AccidentAnalysis. Never throws — always resolves with a result,
   * falling back to a WAITING/error-flavored analysis on failure.
   */
  async analyzeEvidence(base64Jpeg: string): Promise<GeminiCallResult> {
    if (!GEMINI_API_KEY) {
      return { ok: false, error: 'GEMINI_API_KEY is empty. Add your key in src/config/appConfig.ts.' };
    }
    if (!GEMINI_MODEL) {
      return { ok: false, error: 'GEMINI_MODEL is empty. Add a valid model name in src/config/appConfig.ts.' };
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    const body = {
      contents: [
        {
          parts: [
            { text: ANALYSIS_PROMPT },
            { inline_data: { mime_type: 'image/jpeg', data: base64Jpeg } },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json',
      },
    };

    try {
      const response = await withTimeout(
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }),
        REQUEST_TIMEOUT_MS,
      );

      if (!response.ok) {
        return { ok: false, error: `Gemini API returned HTTP ${response.status}` };
      }

      const json = await response.json();
      const text: string | undefined = json?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        return { ok: false, error: 'Gemini response had no usable text content' };
      }

      const analysis = safeParseAnalysis(text);
      if (!analysis) {
        return { ok: false, error: 'Could not parse Gemini response into AccidentAnalysis' };
      }

      return { ok: true, analysis };
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : 'Unknown network/Gemini error',
      };
    }
  }

  waitingAnalysis(): AccidentAnalysis {
    return { ...WAITING_ANALYSIS, timestamp: new Date().toISOString() };
  }
}

export const GeminiService = new GeminiServiceImpl();
