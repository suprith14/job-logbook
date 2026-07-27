import { cookies } from 'next/headers';
import { verifySession, COOKIE_NAME } from '../../../lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const token = cookies().get(COOKIE_NAME)?.value;
  const session = verifySession(token);
  if (!session || session.role !== 'admin') {
    return Response.json({ error: 'View-only access cannot run searches.' }, { status: 403 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: 'ANTHROPIC_API_KEY is not set. Add it in Vercel → Settings → Environment Variables, then redeploy.' },
      { status: 500 }
    );
  }

  let existingNames = [];
  try {
    const body = await request.json();
    existingNames = body.existingNames || [];
  } catch (e) {
    // no body — fine, proceed with empty exclusion list
  }

  const prompt = `Find 8 companies (Bangalore-based or remote-friendly, global or Indian) that currently have open frontend or senior frontend developer roles, and give me the DIRECT link to their own careers page — never a job board or aggregator (no LinkedIn, Naukri, Indeed, Glassdoor, Wellfound, foundit, Instahyre, etc).

Do not repeat any of these companies, they are already in my list: ${existingNames.join(', ') || '(none yet)'}.

Respond with ONLY a JSON array, no other text, no markdown code fences, in exactly this shape:
[{"name":"Company Name","link":"https://company.com/careers","category":"Bangalore product"}]

Pick "category" from: "Bangalore product", "Global tech", "Banking / fintech", "IT services", "Remote-first" — or a new short category (2-3 words) if none of those fit.`;

  try {
    const apiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      }),
    });

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      return Response.json({ error: `Anthropic API error: ${errText}` }, { status: 500 });
    }

    const data = await apiRes.json();
    const textBlocks = (data.content || [])
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
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
