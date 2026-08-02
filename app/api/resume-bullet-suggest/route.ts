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

  let bullets = '';
  let role = '';
  let company = '';
  try {
    const body = await request.json();
    bullets = body.bullets || '';
    role = body.role || '';
    company = body.company || '';
  } catch (e) {
    // no body
  }

  if (!bullets.trim()) {
    return Response.json({ error: 'Add at least one bullet first.' }, { status: 400 });
  }

  const prompt = `Rewrite these resume bullet points for a "${role || 'this'}" role at "${company || 'this company'}" to be stronger and more compelling, while staying truthful to what's actually described — do not invent achievements, numbers, or scope that aren't implied by the original.

ORIGINAL BULLETS (one per line):
${bullets}

For each bullet, rewrite it to:
- Start with a strong action verb (Led, Built, Reduced, Improved, Architected, etc.)
- Include a specific, plausible measurable outcome if the original implies one — do not fabricate a number that isn't grounded in what's written
- Cut filler words ("responsible for", "worked on", "helped with")
- Stay roughly the same length — this is a rewrite, not an expansion

Return the same NUMBER of bullets as the input, in the same order, each as a plain string with no leading dash or bullet symbol.

Respond with ONLY a JSON array of strings, no other text, no markdown code fences, in exactly this shape:
["rewritten bullet one", "rewritten bullet two"]`;

  const { data: improved, error } = await callGeminiForJSONArray<string>(prompt);
  if (error) {
    return Response.json({ error }, { status: 500 });
  }
  return Response.json({ bullets: improved });
}
