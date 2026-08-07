import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { verifySession, COOKIE_NAME } from '../../../lib/auth';
import { callGeminiForJSONArray } from '../../lib/gemini';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const token = cookies().get(COOKIE_NAME)?.value;
  const session = verifySession(token);
  if (!session || session.role !== 'admin') {
    return Response.json({ error: 'View-only access cannot run searches.' }, { status: 403 });
  }

  let existingNames: string[] = [];
  let category = '';
  try {
    const body = await request.json();
    existingNames = body.existingNames || [];
    category = (body.category || '').trim();
  } catch (e) {
    // no body — fine, proceed with empty exclusion list
  }

  const prompt = `List 8 companies (Bangalore-based or remote-friendly, global or Indian) known for hiring frontend or senior frontend developers, and give the DIRECT link to their own careers page — never a job board or aggregator (no LinkedIn, Naukri, Indeed, Glassdoor, Wellfound, foundit, Instahyre, etc). Use your own knowledge of these companies' official career sites — do not invent a URL if you are not confident of it.

${category ? `Focus specifically on companies that fit the category "${category}" — every result should belong to this category.` : 'Pick a mix across different categories rather than clustering around just one.'}

Do not repeat any of these companies, they are already in my list: ${existingNames.join(', ') || '(none yet)'}.

Respond with ONLY a JSON array, no other text, no markdown code fences, in exactly this shape:
[{"name":"Company Name","link":"https://company.com/careers","category":"Bangalore product"}]

${
  category
    ? `Set "category" to exactly "${category}" for every result.`
    : 'Pick "category" from: "Bangalore product", "Global tech", "Banking / fintech", "IT services", "Remote-first" — or a new short category (2-3 words) if none of those fit.'
}`;

  const { data: companies, error } = await callGeminiForJSONArray(prompt);
  if (error) {
    return Response.json({ error }, { status: 500 });
  }
  return Response.json({ companies });
}
