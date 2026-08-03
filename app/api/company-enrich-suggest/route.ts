import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { verifySession, COOKIE_NAME } from '../../../lib/auth';
import { callGeminiForJSONObject } from '../../lib/gemini';

export const dynamic = 'force-dynamic';

interface EnrichResult {
  industry: string;
  country: string;
  employeeSize: string;
  tier: string;
  workPolicy: string;
  foundedYear: string;
  fundingStage: string;
}

const VALID_TIERS = ['FAANG / Tier-1', 'Product-based Tier-2', 'Service-based / IT-services', 'Startup'];

export async function POST(request: NextRequest) {
  const token = cookies().get(COOKIE_NAME)?.value;
  const session = verifySession(token);
  if (!session || session.role !== 'admin') {
    return Response.json({ error: 'View-only access cannot run searches.' }, { status: 403 });
  }

  let name = '';
  try {
    const body = await request.json();
    name = body.name || '';
  } catch (e) {
    // no body
  }

  if (!name) {
    return Response.json({ error: 'No company specified.' }, { status: 400 });
  }

  const prompt = `Based on your own knowledge of the company "${name}", provide the following details. Use your best reasonable estimate for anything you're not fully certain about rather than leaving a field blank — but do not fabricate wildly implausible specifics.

Produce a JSON object with:
- "industry": a short industry/sector label, e.g. "E-commerce", "Fintech", "Cloud/SaaS", "Ride-hailing" (2-4 words)
- "country": the country of headquarters/origin, e.g. "India", "United States"
- "employeeSize": a rough employee-count bracket, one of: "1-50", "51-500", "501-5,000", "5,000-50,000", "50,000+"
- "tier": interview-difficulty tier, exactly one of: "FAANG / Tier-1", "Product-based Tier-2", "Service-based / IT-services", "Startup"
- "workPolicy": general work policy, exactly one of: "Remote", "Hybrid", "Onsite"
- "foundedYear": the year the company was founded, as a 4-digit string, e.g. "2010"
- "fundingStage": ownership/funding status, e.g. "Public", "Private (Series F)", "Bootstrapped", "Subsidiary"

Respond with ONLY a JSON object, no other text, no markdown code fences, in exactly this shape:
{"industry":"...","country":"...","employeeSize":"...","tier":"...","workPolicy":"...","foundedYear":"...","fundingStage":"..."}`;

  const { data, error } = await callGeminiForJSONObject<EnrichResult>(prompt);
  if (error) {
    return Response.json({ error }, { status: 500 });
  }
  if (data && !VALID_TIERS.includes(data.tier)) {
    data.tier = '';
  }
  return Response.json(data);
}
