import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { verifySession, COOKIE_NAME } from '../../../lib/auth';
import { callGeminiForJSONArray } from '../../lib/gemini';

export const dynamic = 'force-dynamic';

interface SuggestedConcept {
  topic: string;
  explanation: string;
  code: string;
}

const DIFFICULTY_BRIEF: Record<string, string> = {
  Easy: 'Fundamental, commonly-known concepts — the kind expected of a junior developer or a quick refresher before any interview.',
  Medium: 'Practical, intermediate concepts that come up in mid-level interviews — require real hands-on understanding, not just definitions.',
  Hard: 'Advanced, tricky, or edge-case-heavy concepts — the kind that trip up experienced engineers, senior-level system design depth, subtle gotchas.',
};

export async function POST(request: NextRequest) {
  const token = cookies().get(COOKIE_NAME)?.value;
  const session = verifySession(token);
  if (!session || session.role !== 'admin') {
    return Response.json({ error: 'View-only access cannot run searches.' }, { status: 403 });
  }

  let category = '';
  let existingTopics: string[] = [];
  let difficulty = 'Medium';
  try {
    const body = await request.json();
    category = body.category || '';
    existingTopics = body.existingTopics || [];
    if (body.difficulty && DIFFICULTY_BRIEF[body.difficulty]) difficulty = body.difficulty;
  } catch (e) {
    // no body
  }

  if (!category) {
    return Response.json({ error: 'No category specified.' }, { status: 400 });
  }

  const prompt = `List 5 concepts under the category "${category}" that come up often in real technical interviews and day-to-day production work for a frontend/full-stack developer role, at a "${difficulty}" difficulty level.

${difficulty} means: ${DIFFICULTY_BRIEF[difficulty]}

Do not repeat any of these, they are already covered: ${existingTopics.join(', ') || '(none yet)'}.

For each concept give:
- "topic": a short concept name (a few words)
- "explanation": 2–3 sentences, written the way a candidate would actually say it out loud in an interview — concrete, not textbook-generic, calibrated to the "${difficulty}" level above
- "code": a short, correct, realistic code example if one is relevant to this concept, otherwise an empty string

Respond with ONLY a JSON array, no other text, no markdown code fences, in exactly this shape:
[{"topic":"...","explanation":"...","code":"..."}]`;

  const { data: concepts, error } = await callGeminiForJSONArray<SuggestedConcept>(prompt);
  if (error) {
    return Response.json({ error }, { status: 500 });
  }
  return Response.json({ concepts });
}
