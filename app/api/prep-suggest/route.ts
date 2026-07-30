import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { verifySession, COOKIE_NAME } from '../../../lib/auth';
import { callGeminiForJSONArray } from '../../lib/gemini';
import type { CompanyTier, PrepQuestionCategory } from '../../types';

export const dynamic = 'force-dynamic';

interface SuggestedQuestion {
  category: PrepQuestionCategory;
  question: string;
  guidance: string;
}

const VALID_TIERS: CompanyTier[] = [
  'FAANG / Tier-1',
  'Product-based Tier-2',
  'Service-based / IT-services',
  'Startup',
];

const VALID_CATEGORIES: PrepQuestionCategory[] = ['Technical', 'System Design', 'Behavioral', 'Coding/DSA'];

const TIER_BRIEF: Record<CompanyTier, string> = {
  'FAANG / Tier-1':
    'Very high bar. Expect deep JS/browser internals, non-trivial system design, performance/scale tradeoffs, and multiple rigorous rounds — surface-level answers get probed further.',
  'Product-based Tier-2':
    'Solid practical bar. Expect real hands-on depth on the frameworks/tools actually used day-to-day, plus one architecture/system-design-flavored round — less theoretical than FAANG, more "how would you actually build this."',
  'Service-based / IT-services':
    'Broader but shallower technical bar, more emphasis on process, communication, and client-facing scenarios — questions often span multiple technologies rather than going deep on one.',
  'Startup':
    'Hands-on and ownership-focused. Expect fewer, less formal rounds, heavier weight on what you\'ve actually shipped end-to-end, and comfort with ambiguity over textbook correctness.',
};

const CATEGORY_BRIEF: Record<PrepQuestionCategory, string> = {
  Technical: 'Deep JavaScript/TypeScript/React/browser-fundamentals/performance questions, calibrated to the given years of experience.',
  'System Design': 'Frontend system design prompts (e.g. "design a notification system", "design an infinite-scroll feed") — architecture and tradeoffs, not code.',
  Behavioral: 'Behavioral/HR questions flavored to this company tier and experience level — leadership, ownership, conflict, growth.',
  'Coding/DSA': 'Live-coding-style problems, frontend-flavored (e.g. "implement a debounce", "build a virtualized list", array/string manipulation).',
};

export async function POST(request: NextRequest) {
  const token = cookies().get(COOKIE_NAME)?.value;
  const session = verifySession(token);
  if (!session || session.role !== 'admin') {
    return Response.json({ error: 'View-only access cannot run searches.' }, { status: 403 });
  }

  let company = '';
  let tier: CompanyTier = 'Product-based Tier-2';
  let years = 6;
  let categories: PrepQuestionCategory[] = [];
  try {
    const body = await request.json();
    company = body.company || '';
    if (VALID_TIERS.includes(body.tier)) tier = body.tier;
    if (typeof body.years === 'number' && body.years >= 0) years = body.years;
    if (Array.isArray(body.categories)) {
      categories = body.categories.filter((c: string) => VALID_CATEGORIES.includes(c as PrepQuestionCategory));
    }
  } catch (e) {
    // no body
  }

  if (categories.length === 0) {
    return Response.json({ error: 'Select at least one question category.' }, { status: 400 });
  }

  const perCategory = 5;
  const who = company ? `"${company}"` : `a company in the "${tier}" tier`;

  const prompt = `Generate a realistic set of interview questions for a Frontend Developer with ${years} years of experience, interviewing at ${who}${company ? ` (treat it as a "${tier}"-tier company)` : ''}.

Tier guidance for calibrating difficulty and style: ${TIER_BRIEF[tier]}

Cover exactly these categories, about ${perCategory} questions each:
${categories.map((c) => `- "${c}": ${CATEGORY_BRIEF[c]}`).join('\n')}

For each question give:
- "category": exactly one of ${categories.map((c) => `"${c}"`).join(', ')}
- "question": the interview question itself, phrased the way an interviewer would actually ask it out loud
- "guidance": 2-3 sentences on what a strong answer covers and what the interviewer is actually evaluating — key points and structure, not a fully scripted answer

Respond with ONLY a JSON array, no other text, no markdown code fences, in exactly this shape:
[{"category":"...","question":"...","guidance":"..."}]`;

  const { data: questions, error } = await callGeminiForJSONArray<SuggestedQuestion>(prompt);
  if (error) {
    return Response.json({ error }, { status: 500 });
  }
  return Response.json({ questions });
}
