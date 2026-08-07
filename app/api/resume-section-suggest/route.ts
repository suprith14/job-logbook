import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { verifySession, COOKIE_NAME } from '../../../lib/auth';
import { callGeminiForJSONArray } from '../../lib/gemini';

export const dynamic = 'force-dynamic';

type Section = 'summary' | 'skills' | 'projectDescription' | 'educationDetails' | 'certifications';

// "Rewrite" sections return exactly one improved string to review/apply in place.
// "Additions" sections return several new items to review/select before merging in.
const PROMPTS: Record<Section, (content: string, context: string) => string> = {
  summary: (content, context) => `Rewrite this resume professional summary to be stronger, more specific, and more compelling — 2-3 sentences, roughly 15-60 words, no fabricated claims beyond what's implied.

Candidate context (title/role): ${context || '(not provided)'}

Current summary:
"${content || '(empty)'}"

Respond with ONLY a JSON array containing exactly one string — the rewritten summary. No other text, no markdown fences.
["rewritten summary here"]`,

  skills: (content, context) => `Suggest 5 to 8 additional relevant technical skills or tools for this candidate's resume that are NOT already in their list, based on their role and existing skills — real, specific, commonly-used technologies, not generic buzzwords.

Candidate context (title/role): ${context || '(not provided)'}

Current skills: ${content || '(none listed)'}

Respond with ONLY a JSON array of skill name strings, no other text, no markdown fences.
["Skill A", "Skill B"]`,

  projectDescription: (content, context) => `Rewrite this resume project description to be more compelling and specific — 1-2 sentences, no fabricated claims beyond what's implied.

Project context (name): ${context || '(not provided)'}

Current description:
"${content || '(empty)'}"

Respond with ONLY a JSON array containing exactly one string — the rewritten description. No other text, no markdown fences.
["rewritten description here"]`,

  educationDetails: (content, context) => `Suggest an improved "details" line for this resume education entry (e.g. honors, GPA, relevant coursework, thesis topic) — one short line, no fabricated claims, incorporate any real details already given rather than discarding them.

Education context (degree, school): ${context || '(not provided)'}

Current details:
"${content || '(empty)'}"

Respond with ONLY a JSON array containing exactly one string — the improved details line. No other text, no markdown fences.
["improved details here"]`,

  certifications: (content, context) => `Suggest 3 to 5 additional certifications relevant to this candidate's role and skills that are NOT already listed — real, recognized certifications, not made up ones.

Candidate context (title/role): ${context || '(not provided)'}

Current certifications: ${content || '(none listed)'}

Respond with ONLY a JSON array of certification name strings, no other text, no markdown fences.
["Certification A", "Certification B"]`,
};

export async function POST(request: NextRequest) {
  const token = cookies().get(COOKIE_NAME)?.value;
  const session = verifySession(token);
  if (!session || session.role !== 'admin') {
    return Response.json({ error: 'View-only access cannot run searches.' }, { status: 403 });
  }

  let section = '';
  let content = '';
  let context = '';
  try {
    const body = await request.json();
    section = body.section || '';
    content = body.content || '';
    context = body.context || '';
  } catch (e) {
    // no body
  }

  if (!section || !(section in PROMPTS)) {
    return Response.json({ error: 'Unknown section.' }, { status: 400 });
  }

  const prompt = PROMPTS[section as Section](content, context);
  const { data: suggestions, error } = await callGeminiForJSONArray<string>(prompt);
  if (error) {
    return Response.json({ error }, { status: 500 });
  }
  return Response.json({ suggestions });
}
