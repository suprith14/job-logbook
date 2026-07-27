import { cookies } from 'next/headers';
import { verifySession, COOKIE_NAME } from '../../../lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const token = cookies().get(COOKIE_NAME)?.value;
  const session = verifySession(token);
  if (!session) {
    return Response.json({ authenticated: false });
  }
  return Response.json({ authenticated: true, role: session.role });
}
