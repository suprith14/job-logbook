const MODEL_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

export const GEMINI_KEY_MISSING_ERROR =
  'GEMINI_API_KEY is not set. Get a free key at aistudio.google.com/apikey, add it in Vercel → Settings → Environment Variables, then redeploy.';

interface GeminiJsonResult<T> {
  data?: T;
  error?: string;
}

// Calls Gemini with a prompt that asks for a JSON array response, and returns the
// parsed array (or an error string) — shared by any feature that asks Gemini to
// generate a list of structured suggestions (companies, tech concepts, etc).
export async function callGeminiForJSONArray<T = unknown>(prompt: string): Promise<GeminiJsonResult<T[]>> {
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

    const cleaned = textBlocks.replace(/```json|```/g, '').trim();
    const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return { error: 'Could not parse a list from the response. Try again.' };
    }
    return { data: JSON.parse(jsonMatch[0]) as T[] };
  } catch (err) {
    return { error: String(err) };
  }
}
