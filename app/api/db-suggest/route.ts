import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { verifySession, COOKIE_NAME } from '../../../lib/auth';
import { callGeminiForJSONArray } from '../../lib/gemini';

export const dynamic = 'force-dynamic';

interface SuggestedRecommendation {
  name: string;
  why: string;
  tradeoffs: string;
  usedBy: string;
}

export async function POST(request: NextRequest) {
  const token = cookies().get(COOKIE_NAME)?.value;
  const session = verifySession(token);
  if (!session || session.role !== 'admin') {
    return Response.json({ error: 'View-only access cannot run searches.' }, { status: 403 });
  }

  let scenario = '';
  try {
    const body = await request.json();
    scenario = body.scenario || '';
  } catch (e) {
    // no body
  }

  if (!scenario) {
    return Response.json({ error: 'Describe a scenario first.' }, { status: 400 });
  }

  const prompt = `A developer is choosing a database for this real production scenario: "${scenario}".

Recommend 2 to 3 database options, ranked best-first for this specific scenario. Consider the actual access patterns implied (read/write ratio, consistency needs, scale, query shape), not just the general category.

For each recommendation give:
- "name": the specific database (e.g. "PostgreSQL", "Redis", "Cassandra", "Elasticsearch") — a real, specific product, not a category like "a NoSQL database"
- "why": 2-3 sentences on why this fits THIS scenario specifically — reference the actual access pattern or constraint implied by the scenario, not a generic description of the database
- "tradeoffs": 1-2 sentences on what you give up by choosing this one, or what would make a different option better instead
- "usedBy": a real, specific company or well-known system known to use this database in production for a similar use case, plus one sentence on what for. Use "" only if you genuinely can't think of a credible one — do not invent a fake example.

Order from best-fit to acceptable-alternative.

Respond with ONLY a JSON array, no other text, no markdown code fences, in exactly this shape:
[{"name":"...","why":"...","tradeoffs":"...","usedBy":"..."}]`;

  const { data: recommendations, error } = await callGeminiForJSONArray<SuggestedRecommendation>(prompt);
  if (error) {
    return Response.json({ error }, { status: 500 });
  }
  return Response.json({ recommendations });
}
