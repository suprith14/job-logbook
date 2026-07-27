import { NextRequest, NextResponse } from 'next/server';
import { checkCredentials, signSession, COOKIE_NAME } from '../../../lib/auth';

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();
  const role = checkCredentials((username || '').trim(), password || '');

  if (!role) {
    return NextResponse.json({ error: 'Incorrect username or password.' }, { status: 401 });
  }

  const token = signSession(role);
  const res = NextResponse.json({ ok: true, role });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return res;
}
