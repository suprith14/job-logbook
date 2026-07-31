import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { verifySession, COOKIE_NAME } from '../../../lib/auth';
import { callGeminiForJSONArray } from '../../lib/gemini';

export const dynamic = 'force-dynamic';

interface SuggestedEntry {
  path: string;
  why: string;
  when: string;
  content: string;
}

export async function POST(request: NextRequest) {
  const token = cookies().get(COOKIE_NAME)?.value;
  const session = verifySession(token);
  if (!session || session.role !== 'admin') {
    return Response.json({ error: 'View-only access cannot run searches.' }, { status: 403 });
  }

  let stackName = '';
  try {
    const body = await request.json();
    stackName = body.stackName || '';
  } catch (e) {
    // no body
  }

  if (!stackName) {
    return Response.json({ error: 'No stack specified.' }, { status: 400 });
  }

  const prompt = `List the realistic folder/file structure for a project built with: "${stackName}".

Give 10 to 16 of the most important files and folders a working developer would actually see in this kind of project — a mix of root config files, source folders, generated/build artifacts, and any stack-specific conventions (e.g. a routes folder for a backend framework, a models folder for an ORM, a components folder for a UI framework).

Use real single file paths, not comma-separated lists or glob patterns — one concrete path per entry (e.g. "src/routes/users.js", not "src/routes/*.js").

For each entry give:
- "path": the file or folder path as it would actually appear (folders end with "/", e.g. "src/routes/")
- "why": 1-2 sentences on why this file/folder exists and what it's responsible for
- "when": when it actually gets created in a real project's life — e.g. "scaffolded automatically by [tool]", "created manually the first time [some need] comes up", "generated automatically by [command], never hand-edited", "added once the project needs [specific capability]"
- "content": a short (5-15 line), realistic, correct example of what this file actually contains. Add a trailing "// comment" (or "# comment" for YAML/shell/Dockerfile, no comments at all for pure JSON) on lines that do something non-obvious. Use "" for folders, and for generated/binary/opaque files nobody hand-reads (e.g. a lockfile, a build cache folder).

Order the list roughly the way these files would appear over a project's life — earliest/foundational first, more specialized/later additions last.

Respond with ONLY a JSON array, no other text, no markdown code fences, in exactly this shape:
[{"path":"...","why":"...","when":"...","content":"..."}]`;

  const { data: entries, error } = await callGeminiForJSONArray<SuggestedEntry>(prompt);
  if (error) {
    return Response.json({ error }, { status: 500 });
  }
  return Response.json({ entries });
}
