import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { verifySession, COOKIE_NAME } from '../../../lib/auth';
import { callGeminiForJSONObject } from '../../lib/gemini';

export const dynamic = 'force-dynamic';

interface TailorResult {
  missingKeywords: string[];
  matchingStrengths: string[];
  suggestions: string;
}

export async function POST(request: NextRequest) {
  const token = cookies().get(COOKIE_NAME)?.value;
  const session = verifySession(token);
  if (!session || session.role !== 'admin') {
    return Response.json({ error: 'View-only access cannot run searches.' }, { status: 403 });
  }

  let jobDescription = '';
  let skills = '';
  let bullets = '';
  let summary = '';
  try {
    const body = await request.json();
    jobDescription = body.jobDescription || '';
    skills = body.skills || '';
    bullets = body.bullets || '';
    summary = body.summary || '';
  } catch (e) {
    // no body
  }

  if (!jobDescription.trim()) {
    return Response.json({ error: 'Paste a job description first.' }, { status: 400 });
  }

  const prompt = `Compare this candidate's resume content against a target job description, and identify the gap.

JOB DESCRIPTION:
${jobDescription}

CANDIDATE'S CURRENT SKILLS:
${skills || '(none listed)'}

CANDIDATE'S CURRENT EXPERIENCE BULLETS:
${bullets || '(none listed)'}

CANDIDATE'S CURRENT SUMMARY:
${summary || '(none written)'}

Produce a JSON object with:
- "missingKeywords": an array of 4-10 specific skills/technologies/terms that appear in the job description but are NOT already present (even implicitly) in the candidate's skills or bullets — real, specific terms from the JD, not generic ones.
- "matchingStrengths": an array of 2-5 short notes on which existing bullets or skills already align well with this job description, referencing the actual bullet content.
- "suggestions": 2-4 sentences of concrete advice on how to adjust the resume for this specific job — which keywords to work into the skills line, which bullet to lead with, anything to reprioritize. Do not rewrite the resume, just advise.

Respond with ONLY a JSON object, no other text, no markdown code fences, in exactly this shape:
{"missingKeywords":["..."],"matchingStrengths":["..."],"suggestions":"..."}`;

  const { data, error } = await callGeminiForJSONObject<TailorResult>(prompt);
  if (error) {
    return Response.json({ error }, { status: 500 });
  }
  return Response.json(data);
}
