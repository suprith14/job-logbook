const MODEL_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

export const GEMINI_KEY_MISSING_ERROR =
  'GEMINI_API_KEY is not set. Get a free key at aistudio.google.com/apikey, add it in Vercel → Settings → Environment Variables, then redeploy.';

interface GeminiJsonResult<T> {
  data?: T;
  error?: string;
}

// Calls Gemini with a prompt and returns the raw, fence-stripped text response (or an
// error) — the shared fetch logic behind both the array and object JSON helpers below.
async function callGeminiRaw(prompt: string): Promise<{ text?: string; error?: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { error: GEMINI_KEY_MISSING_ERROR };
  }

  try {
    const apiRes = await fetch(`${MODEL_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      return { error: `Gemini API error: ${errText}` };
    }

    const data = await apiRes.json();
    const parts: Array<{ text?: string }> = data.candidates?.[0]?.content?.parts || [];
    const textBlocks = parts
      .filter((p) => p.text)
      .map((p) => p.text)
      .join('\n');

    return { text: textBlocks.replace(/```json|```/g, '').trim() };
  } catch (err) {
    return { error: String(err) };
  }
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
