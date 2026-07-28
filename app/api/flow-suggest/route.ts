import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { verifySession, COOKIE_NAME } from '../../../lib/auth';
import { callGeminiForJSONObject } from '../../lib/gemini';
import type { Difficulty } from '../../types';

export const dynamic = 'force-dynamic';

interface GeneratedStep {
  title: string;
  detail: string;
  from?: string;
  to?: string;
  payload?: string;
  latency?: string;
  code?: string;
}

interface GeneratedFlow {
  title: string;
  steps: GeneratedStep[];
}

type Depth = 'Short' | 'Standard' | 'Deep';

const STEP_RANGE: Record<Depth, string> = {
  Short: '4 to 5',
  Standard: '6 to 8',
  Deep: '9 to 12',
};

const DIFFICULTY_GUIDANCE: Record<Difficulty, string> = {
  Easy: 'Keep explanations beginner-friendly and avoid edge cases — this is someone\'s first exposure to the topic.',
  Medium: 'Assume familiarity with the basics — go one level deeper than a beginner explanation, mentioning at least one common edge case or gotcha.',
  Hard: 'Write for someone preparing for a senior-level interview — cover non-obvious edge cases, failure modes, and tradeoffs, not just the happy path.',
};

export async function POST(request: NextRequest) {
  const token = cookies().get(COOKIE_NAME)?.value;
  const session = verifySession(token);
  if (!session || session.role !== 'admin') {
    return Response.json({ error: 'View-only access cannot run searches.' }, { status: 403 });
  }

  let topic = '';
  let difficulty: Difficulty = 'Medium';
  let depth: Depth = 'Standard';
  let focus = '';
  let includeCode = true;
  try {
    const body = await request.json();
    topic = body.topic || '';
    if (body.difficulty === 'Easy' || body.difficulty === 'Medium' || body.difficulty === 'Hard') {
      difficulty = body.difficulty;
    }
    if (body.depth === 'Short' || body.depth === 'Standard' || body.depth === 'Deep') {
      depth = body.depth;
    }
    focus = body.focus || '';
    includeCode = body.includeCode !== false;
  } catch (e) {
    // no body
  }

  if (!topic) {
    return Response.json({ error: 'No topic specified.' }, { status: 400 });
  }

  const codeInstruction = includeCode
    ? '"code": optional — a short, correct, realistic code snippet implementing this step. Add a "// comment" on every line that does something non-obvious, explaining what it does. Use "" if this step has no natural code (e.g. a purely human or postal step like "email is delivered").'
    : '"code": always use "" — this flow should stay conceptual, with no code snippets at all.';

  const prompt = `Design a "what happens when..." style animated sequence-diagram flow for this topic: "${topic}".

Difficulty level: ${difficulty}. ${DIFFICULTY_GUIDANCE[difficulty]}
${focus ? `Pay special attention to and spend more steps on this aspect: "${focus}".` : ''}

Produce a JSON object with:
- "title": a clear title for this flow (e.g. "How OAuth login works")
- "steps": an array of ${STEP_RANGE[depth]} steps, in order. Each step has:
  - "title": a short step name
  - "detail": 1-2 sentences explaining what happens and why, written for someone at the "${difficulty}" level — concrete, not textbook-generic
  - "from": the actor sending this step's message (e.g. "Browser", "Server", "Database", "OAuth Provider")
  - "to": the actor receiving it. Use the exact same actor name for "from" and "to" when the step is internal processing rather than a message sent anywhere (e.g. a server validating something on its own).
  - "payload": optional — what's actually sent, e.g. "POST /login", "200 OK", a short JSON snippet. Use "" if not applicable.
  - "latency": optional — a rough illustrative time like "~40ms". Use "" if not meaningful for this step.
  - ${codeInstruction}

Keep actor names spelled exactly the same across every step that involves them (e.g. always "Browser", never mix in "Client" or "browser" for the same actor) — the diagram groups steps by exact actor name.

Respond with ONLY a JSON object, no other text, no markdown code fences, in exactly this shape:
{"title":"...","steps":[{"title":"...","detail":"...","from":"...","to":"...","payload":"...","latency":"...","code":"..."}]}`;

  const { data: flow, error } = await callGeminiForJSONObject<GeneratedFlow>(prompt);
  if (error) {
    return Response.json({ error }, { status: 500 });
  }
  return Response.json({ flow });
}
