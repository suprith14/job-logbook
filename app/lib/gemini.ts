// Tried in order. gemini-2.5-pro and gemini-2.0-flash were tested and turned out to have
// a hard 0 free-tier quota on this project (RESOURCE_EXHAUSTED, limit: 0) — not a transient
// issue, so they're deliberately left out rather than wasting a request on every call.
// gemini-flash-latest is the model this app used successfully all along; gemini-2.5-flash
// is a real second option with its own separate free-tier quota bucket.
const MODEL_CHAIN = ['gemini-flash-latest', 'gemini-2.5-flash'];

function modelUrl(model: string): string {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
}

export const GEMINI_KEY_MISSING_ERROR =
  'GEMINI_API_KEY is not set. Get a free key at aistudio.google.com/apikey, add it in Vercel → Settings → Environment Variables, then redeploy.';

const GEMINI_ALL_MODELS_DOWN_ERROR =
  "Gemini is temporarily unavailable on Google's side across every model this app tries — wait a bit and try again.";

interface GeminiJsonResult<T> {
  data?: T;
  error?: string;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractText(data: unknown): { text: string } {
  const parts: Array<{ text?: string }> = (data as any)?.candidates?.[0]?.content?.parts || [];
  const textBlocks = parts
    .filter((p) => p.text)
    .map((p) => p.text)
    .join('\n');
  return { text: textBlocks.replace(/```json|```/g, '').trim() };
}

// Calls a single model. A 503 (overloaded) can genuinely clear within a second, so that
// gets one quick retry. A 429 (rate/quota limited) almost never clears that fast — Google's
// own suggested retry delay for that is typically tens of seconds — so there's no point
// retrying the same model; the caller just moves on to the next model in the chain instead.
async function callModel(apiKey: string, model: string, prompt: string, isRetry = false): Promise<{ text?: string; error?: string }> {
  try {
    const apiRes = await fetch(`${modelUrl(model)}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    if (!apiRes.ok) {
      if (apiRes.status === 503 && !isRetry) {
        await sleep(700);
        return callModel(apiKey, model, prompt, true);
      }
      const errText = await apiRes.text();
      return { error: `Gemini API error (${model}): ${errText}` };
    }

    return extractText(await apiRes.json());
  } catch (err) {
    return { error: String(err) };
  }
}

// Calls Gemini with a prompt and returns the raw, fence-stripped text response (or an
// error) — the shared fetch logic behind both the array and object JSON helpers below.
// Walks MODEL_CHAIN in order, falling through to the next model on any failure, so one
// model being overloaded, quota-exhausted, or renamed/retired doesn't take the feature down.
async function callGeminiRaw(prompt: string): Promise<{ text?: string; error?: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { error: GEMINI_KEY_MISSING_ERROR };
  }

  let lastError = GEMINI_ALL_MODELS_DOWN_ERROR;
  for (const model of MODEL_CHAIN) {
    const result = await callModel(apiKey, model, prompt);
    if (result.text !== undefined) return { text: result.text };
    lastError = result.error || lastError;
  }
  return { error: lastError };
}

// For prompts that ask Gemini for a JSON array response (a list of suggestions).
export async function callGeminiForJSONArray<T = unknown>(prompt: string): Promise<GeminiJsonResult<T[]>> {
  const { text, error } = await callGeminiRaw(prompt);
  if (error) return { error };
  const jsonMatch = (text || '').match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    return { error: 'Could not parse a list from the response. Try again.' };
  }
  return { data: JSON.parse(jsonMatch[0]) as T[] };
}

// For prompts that ask Gemini for a single JSON object response (e.g. a whole flow:
// title + steps).
export async function callGeminiForJSONObject<T = unknown>(prompt: string): Promise<GeminiJsonResult<T>> {
  const { text, error } = await callGeminiRaw(prompt);
  if (error) return { error };
  const jsonMatch = (text || '').match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return { error: 'Could not parse a result from the response. Try again.' };
  }
  return { data: JSON.parse(jsonMatch[0]) as T };
}
