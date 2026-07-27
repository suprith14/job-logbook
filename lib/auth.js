import crypto from 'crypto';

const SECRET = process.env.SESSION_SECRET || 'change-this-secret-in-vercel-env-vars';
export const COOKIE_NAME = 'logbook_session';

export function signSession(role) {
  const payload = `${role}.${Date.now()}`;
  const hmac = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
  return Buffer.from(`${payload}.${hmac}`).toString('base64');
}

export function verifySession(token) {
  if (!token) return null;
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const parts = decoded.split('.');
    if (parts.length !== 3) return null;
    const [role, ts, hmac] = parts;
    const payload = `${role}.${ts}`;
    const expected = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
    if (expected !== hmac) return null;
    return { role };
  } catch (e) {
    return null;
  }
}

export function checkCredentials(username, password) {
  const adminUser = process.env.ADMIN_USERNAME || 'suprith7';
  const adminPass = process.env.ADMIN_PASSWORD || 'Commitment@7';
  const guestUser = process.env.GUEST_USERNAME || 'guest';
  const guestPass = process.env.GUEST_PASSWORD || 'view2026';

  if (username === adminUser && password === adminPass) return 'admin';
  if (username === guestUser && password === guestPass) return 'viewer';
  return null;
}
