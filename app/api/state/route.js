import { Redis } from '@upstash/redis';
import { cookies } from 'next/headers';
import { verifySession, COOKIE_NAME } from '../../../lib/auth';

export const dynamic = 'force-dynamic';

const STATE_KEY = 'jobtracker:state';
const EMPTY_STATE = { applications: [], customCompanies: [] };

function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    return null;
  }
  return new Redis({ url, token });
}

function getSession() {
  const token = cookies().get(COOKIE_NAME)?.value;
  return verifySession(token);
}

export async function GET() {
  const session = getSession();
  if (!session) {
    return Response.json({ error: 'Not signed in.' }, { status: 401 });
  }
  const redis = getRedis();
  if (!redis) {
    return Response.json(EMPTY_STATE);
  }
  try {
    const data = await redis.get(STATE_KEY);
    return Response.json(data || EMPTY_STATE);
  } catch (err) {
    return Response.json(EMPTY_STATE);
  }
}

export async function POST(request) {
  const session = getSession();
  if (!session || session.role !== 'admin') {
    return Response.json({ ok: false, error: 'View-only access — changes are not saved.' }, { status: 403 });
  }
  const redis = getRedis();
  const body = await request.json();
  if (!redis) {
    return Response.json({ ok: false, error: 'No database connected. Add Upstash Redis in the Vercel Storage tab.' }, { status: 500 });
  }
  try {
    await redis.set(STATE_KEY, body);
    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
