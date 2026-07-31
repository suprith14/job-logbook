import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { verifySession, COOKIE_NAME } from '../../../lib/auth';
import { callGeminiForJSONArray } from '../../lib/gemini';

export const dynamic = 'force-dynamic';

interface SuggestedDialogueLine {
  speaker: string;
  line: string;
}

interface SuggestedScenario {
  situation: string;
  dialogue: SuggestedDialogueLine[];
  takeaway: string;
}

const CATEGORY_BRIEF: Record<string, string> = {
  'Office Politics & Influence':
    'Navigating credit-stealing, difficult managers/peers, visibility, alliances, and saying no without burning bridges.',
  'Negotiation':
    'Negotiating scope, deadlines, promotions, headcount, and pushing back on unreasonable asks — not salary negotiation, that lives elsewhere.',
  'How Business Actually Runs':
    'Budget cycles, how promotions/decisions really get made, org hierarchy and who actually has power, how priorities get set above the team level.',
  'Stakeholder Communication':
    'Managing up, presenting to leadership, handling a skip-level, giving bad news to a stakeholder, cross-team conflict.',
};

export async function POST(request: NextRequest) {
  const token = cookies().get(COOKIE_NAME)?.value;
  const session = verifySession(token);
  if (!session || session.role !== 'admin') {
    return Response.json({ error: 'View-only access cannot run searches.' }, { status: 403 });
  }

  let category = '';
  let existingSituations: string[] = [];
  try {
    const body = await request.json();
    category = body.category || '';
    existingSituations = body.existingSituations || [];
  } catch (e) {
    // no body
  }

  if (!category) {
    return Response.json({ error: 'No category specified.' }, { status: 400 });
  }

  const brief = CATEGORY_BRIEF[category] || category;

  const prompt = `Write 3 realistic workplace scenarios under the category "${category}" for a mid-to-senior software engineer (around 5-8 years of experience) at a tech company.

This category covers: ${brief}

Do not repeat any of these situations, they are already covered: ${existingSituations.join(' | ') || '(none yet)'}.

For each scenario give:
- "situation": one sentence describing a specific, realistic workplace situation (not generic — a concrete moment, e.g. "A peer takes credit for your work in a meeting with your skip-level present").
- "dialogue": an array of 3 to 6 lines of an actual back-and-forth conversation for this situation. Each line has:
  - "speaker": who's talking (e.g. "Manager", "You", "Peer", "Skip-level", "Stakeholder") — use "You" for the engineer's own lines.
  - "line": the actual words said, natural and specific, not generic corporate-speak.
- "takeaway": 1-2 sentences explaining why the "You" lines work — the underlying principle, not just a restatement.

Respond with ONLY a JSON array, no other text, no markdown code fences, in exactly this shape:
[{"situation":"...","dialogue":[{"speaker":"...","line":"..."}],"takeaway":"..."}]`;

  const { data: scenarios, error } = await callGeminiForJSONArray<SuggestedScenario>(prompt);
  if (error) {
    return Response.json({ error }, { status: 500 });
  }
  return Response.json({ scenarios });
}
