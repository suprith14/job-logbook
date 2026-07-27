import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { verifySession, COOKIE_NAME } from '../../../lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const token = cookies().get(COOKIE_NAME)?.value;
  const session = verifySession(token);
  if (!session || session.role !== 'admin') {
    return Response.json({ error: 'View-only access cannot run searches.' }, { status: 403 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json(
      {
        error:
          'GEMINI_API_KEY is not set. Get a free key at aistudio.google.com/apikey, add it in Vercel → Settings → Environment Variables, then redeploy.',
      },
      { status: 500 }
    );
  }

  let existingNames: string[] = [];
  try {
    const body = await request.json();
    existingNames = body.existingNames || [];
  } catch (e) {
    // no body — fine, proceed with empty exclusion list
  }

  const prompt = `List 8 companies (Bangalore-based or remote-friendly, global or Indian) known for hiring frontend or senior frontend developers, and give the DIRECT link to their own careers page — never a job board or aggregator (no LinkedIn, Naukri, Indeed, Glassdoor, Wellfound, foundit, Instahyre, etc). Use your own knowledge of these companies' official career sites — do not invent a URL if you are not confident of it.

Do not repeat any of these companies, they are already in my list: ${existingNames.join(', ') || '(none yet)'}.

Respond with ONLY a JSON array, no other text, no markdown code fences, in exactly this shape:
[{"name":"Company Name","link":"https://company.com/careers","category":"Bangalore product"}]

Pick "category" from: "Bangalore product", "Global tech", "Banking / fintech", "IT services", "Remote-first" — or a new short category (2-3 words) if none of those fit.`;

  try {
    const apiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      return Response.json({ error: `Gemini API error: ${errText}` }, { status: 500 });
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
      return Response.json({ error: 'Could not parse a company list from the response. Try again.' }, { status: 500 });
    }
    const companies = JSON.parse(jsonMatch[0]);
    return Response.json({ companies });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
