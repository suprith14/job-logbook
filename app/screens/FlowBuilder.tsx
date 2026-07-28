'use client';

import { Dispatch, SetStateAction, useState } from 'react';
import ProcessFlow from '../components/ProcessFlow';
import type { Difficulty, FlowSequence, TechRefStep } from '../types';

export const FLOW_CATEGORIES = [
  'Networking & Browser',
  'Auth & Security',
  'Frontend / React',
  'Backend & APIs',
  'DevOps & Deployment',
  'General',
];

const DIFFICULTIES: Difficulty[] = ['Easy', 'Medium', 'Hard'];
const DEPTHS = ['Short', 'Standard', 'Deep'] as const;
type Depth = (typeof DEPTHS)[number];

export const DEFAULT_FLOWS: FlowSequence[] = [
  {
    id: 'seed-flow1',
    title: 'What happens when you type a URL and press Enter',
    category: 'Networking & Browser',
    steps: [
      { title: 'DNS Lookup', detail: 'The browser asks a DNS resolver to translate the domain name into an IP address.', from: 'Browser', to: 'DNS Resolver', payload: 'A? example.com', latency: '~20ms' },
      { title: 'TCP Handshake', detail: 'The browser opens a TCP connection to that IP via a three-way handshake: SYN, SYN-ACK, ACK.', from: 'Browser', to: 'Server', payload: 'SYN / SYN-ACK / ACK', latency: '~30ms' },
      { title: 'TLS Handshake', detail: 'For HTTPS, browser and server negotiate encryption — exchanging certificates and agreeing on a shared session key — before any HTTP data is sent.', from: 'Browser', to: 'Server', payload: 'ClientHello / ServerHello', latency: '~50ms' },
      { title: 'HTTP Request Sent', detail: 'The browser sends an HTTP request (method, headers, cookies) over the now-encrypted connection.', from: 'Browser', to: 'Server', payload: 'GET / HTTP/1.1', latency: '~40ms' },
      { title: 'Server Processes the Request', detail: 'The server (or a CDN/edge cache in front of it) runs its logic and builds an HTTP response.', from: 'Server', to: 'Server', latency: '~80ms' },
      { title: 'HTTP Response Returned', detail: 'The server sends back a status code, headers, and a response body over that same connection.', from: 'Server', to: 'Browser', payload: '200 OK', latency: '~40ms' },
      {
        title: 'Parse HTML → DOM',
        detail: 'The HTML parser tokenizes the raw markup character-by-character and builds the DOM tree — a live, in-memory object for every tag, attribute, and text node.',
        from: 'Browser', to: 'Browser', latency: '~15ms',
        code: '<body>\n  <h1>Hi</h1>          <!-- tokenized into an Element("h1") node -->\n</body>\n<!-- the parser blocks on <script> tags it meets along the way, unless they\'re async/defer -->',
      },
      {
        title: 'Parse CSS → CSSOM',
        detail: 'Every stylesheet and <style> block is parsed into the CSSOM — a tree of matched selectors and computed property values, separate from the DOM.',
        from: 'Browser', to: 'Browser', latency: '~10ms',
        code: 'h1 { color: red; font-size: 24px; }\n/* becomes: { selector: "h1", color: "red", fontSize: "24px" } */\n// CSS is render-blocking — the page won\'t paint until this finishes',
      },
      {
        title: 'Build the Render Tree',
        detail: 'DOM and CSSOM are combined into a render tree — only the nodes that will actually be visible, each paired with its computed style.',
        from: 'Browser', to: 'Browser', latency: '~10ms',
        code: 'if (node.style.display === "none") return;   // <head>, display:none — skipped entirely\nrenderTree.attach(node, computedStyleFor(node)); // everything else gets a computed style',
      },
      {
        title: 'Layout (Reflow)',
        detail: 'The browser walks the render tree and computes the exact box — x, y, width, height — for every visible node, resolving percentages, flex, and grid along the way.',
        from: 'Browser', to: 'Browser', latency: '~25ms',
        code: 'renderTree.forEach((node) => {\n  node.box = computeGeometry(node, parentBox); // % widths, flex-grow, grid tracks resolved here\n});',
      },
      {
        title: 'Paint',
        detail: 'Colors, borders, shadows, text glyphs, and images are rasterized onto layers, in the correct stacking order — this is filling in pixels, not deciding positions.',
        from: 'Browser', to: 'Browser', latency: '~30ms',
        code: 'paint(node.box, { backgroundColor, borderColor, textGlyphs, boxShadow });\n// each stacking-context layer is painted independently',
      },
      {
        title: 'Composite Layers',
        detail: 'The GPU combines the painted layers into the final on-screen frame — this is why transform/opacity animations are cheap: they skip layout and paint entirely and only re-run this step.',
        from: 'Browser', to: 'Browser', latency: '~10ms',
        code: 'compositor.combine(layers); // transform/opacity changes only touch this step — no reflow, no repaint',
      },
    ],
  },
  {
    id: 'seed-flow2',
    title: 'A typical CI/CD deployment pipeline',
    category: 'DevOps & Deployment',
    steps: [
      {
        title: 'Code Pushed',
        detail: 'A developer pushes a commit or opens a pull request, triggering the pipeline.',
        from: 'Developer', to: 'Pipeline', payload: 'git push origin feature/x', latency: '~1s',
        code: '# .github/workflows/ci.yml\non:\n  push:                // runs the pipeline on every push\n    branches: ["**"]',
      },
      {
        title: 'CI Runs Tests',
        detail: 'Automated checks run — linting, unit tests, type-checking — against the new code.',
        from: 'Pipeline', to: 'Pipeline', latency: '~90s',
        code: 'jobs:\n  test:\n    steps:\n      - run: npm ci\n      - run: npm run lint        # fails fast on style issues\n      - run: npm test             # unit + integration tests\n      - run: npm run type-check',
      },
      {
        title: 'Build Artifact Created',
        detail: 'If checks pass, the app is built into a deployable artifact (a Docker image, a static bundle, etc.).',
        from: 'Pipeline', to: 'Pipeline', latency: '~60s',
        code: 'jobs:\n  build:\n    needs: test                 # only runs if the test job succeeded\n    steps:\n      - run: docker build -t app:${{ github.sha }} . # tagged with the commit SHA',
      },
      {
        title: 'Deploy to Staging',
        detail: 'The artifact is deployed to a staging environment that mirrors production for a final check.',
        from: 'Pipeline', to: 'Staging', latency: '~30s',
        code: 'jobs:\n  deploy-staging:\n    steps:\n      - run: kubectl set image deployment/app app=app:${{ github.sha }} -n staging',
      },
      {
        title: 'Approval Gate',
        detail: 'A manual approval or automated smoke test decides whether this build is safe to release.',
        from: 'Staging', to: 'Developer', latency: 'varies',
      },
      {
        title: 'Deploy to Production',
        detail: 'The artifact rolls out to production — often gradually (canary or blue-green) rather than all at once.',
        from: 'Pipeline', to: 'Production', latency: '~45s',
        code: '# shift 10% of traffic first, watch error rates, then complete the rollout\nkubectl argo rollouts set-weight app 10',
      },
      {
        title: 'Monitor & Rollback if Needed',
        detail: 'Error rates and metrics are watched post-deploy; a bad release gets rolled back automatically or by an on-call engineer.',
        from: 'Production', to: 'Pipeline', latency: 'ongoing',
        code: 'if (errorRate > threshold) {\n  triggerRollback();  // tied directly to the monitoring/alerting system, not a human noticing first\n}',
      },
    ],
  },
  {
    id: 'seed-flow3',
    title: 'How a login request is authenticated',
    category: 'Auth & Security',
    steps: [
      {
        title: 'Credentials Submitted',
        detail: 'The user submits an email and password through a login form.',
        from: 'Browser', to: 'Server', payload: 'POST /login {email, password}', latency: '~30ms',
        code: 'const { email, password } = req.body; // raw input from the login form\nif (!email || !password) return res.status(400).send("Missing fields");',
      },
      {
        title: 'Server Validates Input',
        detail: 'The server checks the request is well-formed and rate-limits repeated attempts before doing anything expensive.',
        from: 'Server', to: 'Server', latency: '~5ms',
        code: 'const attempts = await redis.incr(`login-attempts:${email}`); // count this attempt\nawait redis.expire(`login-attempts:${email}`, 60);         // window resets every 60s\nif (attempts > 5) return res.status(429).send("Too many attempts");',
      },
      {
        title: 'Password Checked Against Database',
        detail: 'The server looks up the user record and compares the submitted password\'s hash against the stored one.',
        from: 'Server', to: 'Database', payload: 'SELECT * FROM users WHERE email = ?', latency: '~15ms',
        code: 'const user = await db.query(\n  "SELECT * FROM users WHERE email = $1", // parameterized — never string-concat SQL\n  [email]\n);',
      },
      {
        title: 'Database Returns Match',
        detail: 'The database confirms whether the hash matches — the plain password itself is never stored or compared directly.',
        from: 'Database', to: 'Server', payload: '1 row found, hash OK', latency: '~10ms',
        code: 'const ok = await bcrypt.compare(password, user.password_hash); // compares against the stored hash, not plaintext\nif (!ok) return res.status(401).send("Invalid credentials");',
      },
      {
        title: 'Session Token Issued',
        detail: 'On success, the server generates a session token or signed JWT representing this logged-in session.',
        from: 'Server', to: 'Server', latency: '~5ms',
        code: 'const token = jwt.sign(\n  { userId: user.id },      // payload — keep this minimal, it\'s not encrypted, only signed\n  process.env.JWT_SECRET,\n  { expiresIn: "30d" }\n);',
      },
      {
        title: 'Token Sent to Browser',
        detail: 'The token is returned, usually as an HTTP-only cookie so client-side JavaScript can\'t read it directly.',
        from: 'Server', to: 'Browser', payload: 'Set-Cookie: session=…', latency: '~20ms',
        code: 'res.cookie("session", token, {\n  httpOnly: true,   // client-side JS cannot read this cookie — blocks XSS token theft\n  secure: true,     // only sent over HTTPS\n  sameSite: "lax",\n  maxAge: 30 * 24 * 60 * 60 * 1000,\n});',
      },
      {
        title: 'Browser Reuses Token',
        detail: 'The browser automatically attaches the token to future requests, keeping the user authenticated without logging in again.',
        from: 'Browser', to: 'Browser', latency: 'ongoing',
        code: '// Nothing to write — the browser sends the cookie automatically\n// on every request to this domain, no JS needed on the client side.',
      },
    ],
  },
  {
    id: 'seed-flow4',
    title: 'How a CDN serves cached content',
    category: 'Networking & Browser',
    steps: [
      {
        title: 'Browser Requests a File',
        detail: 'The browser asks the nearest CDN edge location for the asset, instead of going straight to the origin server.',
        from: 'Browser', to: 'CDN Cache', payload: 'GET /logo.png', latency: '~10ms',
        code: '<img src="https://cdn.example.com/logo.png" /> // DNS resolves this to the nearest edge location',
      },
      {
        title: 'Cache Hit Check',
        detail: 'The CDN checks whether it already has a fresh, unexpired copy of this file at this edge location.',
        from: 'CDN Cache', to: 'CDN Cache', latency: '~1ms',
        code: 'if (cache.has(key) && !cache.isExpired(key, maxAge)) {\n  return cache.get(key); // cache HIT — the origin server is never contacted\n}',
      },
      {
        title: 'Cache Miss — Fetch from Origin',
        detail: 'If it\'s not cached (or has expired), the CDN requests the file from the origin server on the browser\'s behalf.',
        from: 'CDN Cache', to: 'Origin Server', payload: 'GET /logo.png', latency: '~120ms',
        code: 'const response = await fetch(originUrl); // only runs on a cache MISS or an expired entry',
      },
      {
        title: 'Origin Returns the File',
        detail: 'The origin server sends back the file, which the CDN stores at that edge location for next time.',
        from: 'Origin Server', to: 'CDN Cache', payload: '200 OK, Cache-Control: max-age=86400', latency: '~90ms',
        code: 'res.setHeader("Cache-Control", "public, max-age=86400"); // tells the CDN how long it may keep this',
      },
      {
        title: 'CDN Serves the Browser',
        detail: 'The CDN returns the file to the browser — on future requests from nearby users, this step alone is enough.',
        from: 'CDN Cache', to: 'Browser', payload: '200 OK (from cache)', latency: '~10ms',
      },
    ],
  },
  {
    id: 'seed-flow5',
    title: 'How a React component fetches and renders data',
    category: 'Frontend / React',
    steps: [
      {
        title: 'Component Mounts',
        detail: 'React renders the component for the first time — typically showing a loading state, since no data has arrived yet.',
        from: 'Browser', to: 'Browser', latency: '~1ms',
        code: 'const [data, setData] = useState(null);\nconst [loading, setLoading] = useState(true); // true until the fetch resolves',
      },
      {
        title: 'useEffect Fires',
        detail: 'After that first render, useEffect runs and kicks off a request to an API endpoint.',
        from: 'Browser', to: 'Server', payload: 'GET /api/user', latency: '~5ms',
        code: 'useEffect(() => {\n  fetch("/api/user")             // runs once, after the first render\n    .then((r) => r.json())\n    .then(setData)\n    .finally(() => setLoading(false));\n}, []);                          // empty deps — do not refetch on every render',
      },
      {
        title: 'Server Prepares a Response',
        detail: 'The server queries whatever it needs and builds a JSON response.',
        from: 'Server', to: 'Server', latency: '~40ms',
        code: 'app.get("/api/user", async (req, res) => {\n  const user = await db.users.findById(req.userId);\n  res.json(user);\n});',
      },
      {
        title: 'Response Returned',
        detail: 'The server sends the data back to the browser.',
        from: 'Server', to: 'Browser', payload: '200 OK { name, email }', latency: '~10ms',
      },
      {
        title: 'State Updates',
        detail: 'The component calls its state setter with the new data, which schedules a re-render rather than updating anything on screen immediately.',
        from: 'Browser', to: 'Browser', latency: '~1ms',
        code: 'setData(json);      // schedules a re-render with the fetched data\nsetLoading(false);   // hides the loading state on that same re-render',
      },
      {
        title: 'Component Function Re-runs',
        detail: 'React calls the component function again with the new state, producing a brand-new tree of React elements (the "virtual DOM") — nothing on the real page has changed yet.',
        from: 'Browser', to: 'Browser', latency: '~1ms',
        code: 'function Profile() {\n  return loading ? <Spinner /> : <ProfileCard user={data} />; // just builds a new element tree in memory\n}',
      },
      {
        title: 'Reconciliation (Diffing)',
        detail: 'React compares the new element tree against the previous one, node by node, and works out the minimal set of real DOM changes needed — this is the "diff" in "virtual DOM diffing."',
        from: 'Browser', to: 'Browser', latency: '~2ms',
        code: '// old tree: <Spinner />        new tree: <ProfileCard user={data} />\n// different element type at the same position -> old node is unmounted, new one mounted\n// (same type, different props -> props are just patched, node is reused)',
      },
      {
        title: 'Commit to the Real DOM',
        detail: 'React applies exactly that diff to the actual DOM — swapping the spinner element for the profile card, without touching anything else on the page.',
        from: 'Browser', to: 'Browser', latency: '~1ms',
        code: 'domNode.replaceChild(newProfileCardNode, oldSpinnerNode); // React does this, not your code directly',
      },
      {
        title: 'Browser Repaints Only What Changed',
        detail: 'Because only the swapped-in DOM nodes are new, the browser only re-runs layout/paint for that region — the rest of the page is untouched, which is why this feels instant.',
        from: 'Browser', to: 'Browser', latency: '~5ms',
      },
    ],
  },
  {
    id: 'seed-flow6',
    title: 'Code review and merge workflow',
    category: 'DevOps & Deployment',
    steps: [
      {
        title: 'Pull Request Opened',
        detail: 'A developer opens a PR, which automatically triggers CI checks against the proposed change.',
        from: 'Developer', to: 'Pipeline', payload: 'gh pr create', latency: '~2s',
        code: 'git push origin feature/checkout-fix\ngh pr create --title "Fix checkout bug" --body "Fixes #482"',
      },
      {
        title: 'CI Checks Run',
        detail: 'Automated tests and linting run against the branch before any human looks at it.',
        from: 'Pipeline', to: 'Pipeline', latency: '~90s',
      },
      {
        title: 'Reviewer Requested',
        detail: 'Once checks pass, a teammate is automatically or manually asked to review the code.',
        from: 'Pipeline', to: 'Reviewer', latency: 'varies',
      },
      {
        title: 'Feedback Given',
        detail: 'The reviewer leaves comments or explicitly requests changes before they\'ll approve it.',
        from: 'Reviewer', to: 'Developer', payload: '"Add a test for the empty-cart case?"', latency: 'varies',
      },
      {
        title: 'Changes Addressed',
        detail: 'The developer updates the PR based on feedback and asks for another look.',
        from: 'Developer', to: 'Reviewer', payload: 'git push (updates the open PR)', latency: 'varies',
        code: 'git add .\ngit commit -m "Add empty-cart test case"\ngit push          // updates the existing PR automatically, no new PR needed',
      },
      {
        title: 'Approved and Merged',
        detail: 'Once approved, the PR is merged into the main branch — often automatically triggering the deployment pipeline.',
        from: 'Reviewer', to: 'Pipeline', payload: 'Squash and merge', latency: '~5s',
      },
    ],
  },
  {
    id: 'seed-flow7',
    title: 'How server-side rendering (SSR) works',
    category: 'Frontend / React',
    steps: [
      {
        title: 'Page Requested',
        detail: 'The browser requests a page — a normal-looking HTTP request, same as any other.',
        from: 'Browser', to: 'Server', payload: 'GET /products/42', latency: '~20ms',
      },
      {
        title: 'Server Renders React to HTML',
        detail: 'Instead of sending an empty shell, the server actually runs the React components on this request and renders them into real HTML.',
        from: 'Server', to: 'Server', latency: '~60ms',
        code: '// app/products/[id]/page.js — a React Server Component\nexport default async function ProductPage({ params }) {\n  const product = await db.products.findById(params.id); // runs per-request, on the server\n  return <ProductDetail product={product} />;\n}',
      },
      {
        title: 'HTML Sent to Browser',
        detail: 'The browser receives fully-formed HTML — content is visible immediately, before any JavaScript has even loaded.',
        from: 'Server', to: 'Browser', payload: '200 OK, full HTML', latency: '~40ms',
      },
      {
        title: 'Browser Downloads the JS Bundle',
        detail: 'In parallel, the browser fetches the JavaScript needed to make the already-visible page interactive.',
        from: 'Browser', to: 'Browser', latency: '~80ms',
      },
      {
        title: 'React Walks the Existing HTML',
        detail: 'Instead of building fresh DOM nodes, React walks the server-rendered HTML that\'s already on the page and matches it against the component tree it would have produced — node by node.',
        from: 'Browser', to: 'Browser', latency: '~10ms',
        code: 'hydrateRoot(document.getElementById("root"), <App />);\n// React expects the existing HTML to match <App />\'s output exactly, node for node',
      },
      {
        title: 'Event Listeners Attached',
        detail: 'For each matched node, React attaches its click/input/etc. handlers directly onto the existing DOM element — no new elements are created or replaced.',
        from: 'Browser', to: 'Browser', latency: '~15ms',
        code: '// conceptually: existingButtonNode.addEventListener("click", onAddToCart);\n// the <button> the server sent stays exactly as-is — only its behavior is wired up',
      },
      {
        title: 'Page Becomes Interactive',
        detail: 'Once listeners are attached, the already-visible page responds to clicks and input with no visible flash or re-render — the content the user saw immediately is now also the content they can use.',
        from: 'Browser', to: 'Browser', latency: '~5ms',
      },
    ],
  },
  {
    id: 'seed-flow8',
    title: 'How rate limiting protects an API',
    category: 'Backend & APIs',
    steps: [
      {
        title: 'Request Arrives',
        detail: 'A request hits the API, identified by IP address, API key, or logged-in user ID.',
        from: 'Client', to: 'API Server', payload: 'GET /api/data',
        code: 'const identity = req.user?.id || req.ip; // prefer a stable user ID over IP when available',
      },
      {
        title: 'Server Checks the Bucket',
        detail: 'The server checks a counter (often kept in Redis) for how many requests this identity has made in the current time window.',
        from: 'API Server', to: 'API Server', latency: '~3ms',
        code: 'const key = `rate:${identity}`;\nconst count = await redis.incr(key);       // increments and returns the new count\nif (count === 1) await redis.expire(key, 60); // start a fresh 60s window on the first request',
      },
      {
        title: 'Decision: Allow or Reject',
        detail: 'If under the limit, the counter increments and the request proceeds normally. If over, the server immediately returns 429 Too Many Requests, skipping any real work.',
        from: 'API Server', to: 'API Server', latency: '~1ms',
        code: 'const LIMIT = 100; // requests per window\nif (count > LIMIT) {\n  return res.status(429).json({ error: "Too Many Requests" }); // cheap — no real work done\n}\n// otherwise: fall through to the actual handler',
      },
      {
        title: 'Response Sent',
        detail: 'Either the actual response or the 429 rejection goes back to the client — a fast reply either way, since rejections are cheap to produce.',
        from: 'API Server', to: 'Client', payload: '200 OK or 429',
      },
    ],
  },
  {
    id: 'seed-flow9',
    title: 'How a WebSocket keeps a real-time connection open',
    category: 'Networking & Browser',
    steps: [
      {
        title: 'HTTP Handshake with Upgrade Header',
        detail: 'The browser sends a normal-looking HTTP request, but with an "Upgrade: websocket" header, asking to switch protocols.',
        from: 'Browser', to: 'Server', payload: 'Upgrade: websocket', latency: '~30ms',
        code: 'const ws = new WebSocket("wss://example.com/chat"); // the browser handles the handshake internally',
      },
      {
        title: 'Server Agrees to Upgrade',
        detail: 'The server responds with 101 Switching Protocols — the same TCP connection now speaks WebSocket instead of HTTP.',
        from: 'Server', to: 'Browser', payload: '101 Switching Protocols', latency: '~10ms',
        code: 'wss.on("connection", (socket) => {\n  console.log("client connected"); // fires once per accepted upgrade\n});',
      },
      {
        title: 'Connection Stays Open',
        detail: 'Unlike a request/response cycle, this connection is kept alive indefinitely rather than closing after one exchange.',
        from: 'Server', to: 'Server', latency: 'ongoing',
      },
      {
        title: 'Server Pushes a Message',
        detail: 'Whenever something happens — a new chat message, a live update — the server pushes it to the browser immediately, with no polling required.',
        from: 'Server', to: 'Browser', payload: '{"type":"chat","text":"hi"}', latency: '~5ms',
        code: 'socket.send(JSON.stringify({ type: "chat", text: "hi" })); // pushed with no request from the client',
      },
      {
        title: 'Browser Sends a Message Back',
        detail: 'The browser can also send data over that same open connection at any time, in either direction.',
        from: 'Browser', to: 'Server', payload: '{"type":"chat","text":"hey!"}', latency: '~5ms',
        code: 'ws.send(JSON.stringify({ type: "chat", text: "hey!" }));\nws.onmessage = (e) => console.log(JSON.parse(e.data)); // listens for server pushes at any time',
      },
    ],
  },
  {
    id: 'seed-flow10',
    title: 'How a "forgot password" email flow works',
    category: 'Auth & Security',
    steps: [
      {
        title: '"Forgot Password" Submitted',
        detail: 'The user enters their email address and requests a password reset.',
        from: 'Browser', to: 'Server', payload: 'POST /forgot-password {email}', latency: '~20ms',
      },
      {
        title: 'Token Generated and Stored',
        detail: 'The server creates a single-use, time-limited reset token and stores it against that user\'s record.',
        from: 'Server', to: 'Database', payload: 'INSERT INTO reset_tokens', latency: '~15ms',
        code: 'const token = crypto.randomBytes(32).toString("hex"); // unguessable, single-use\nawait db.query(\n  "INSERT INTO reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)",\n  [user.id, token, Date.now() + 15 * 60 * 1000] // valid for 15 minutes only\n);',
      },
      {
        title: 'Reset Email Queued',
        detail: 'The server hands off an email containing a reset link (with the token embedded) to an email-sending service.',
        from: 'Server', to: 'Email Service', payload: 'send({ to, resetUrl })', latency: '~50ms',
        code: 'await emailService.send({\n  to: user.email,\n  subject: "Reset your password",\n  body: `Click here: https://app.com/reset?token=${token}`, // token embedded directly in the link\n});',
      },
      {
        title: 'Email Delivered',
        detail: 'The email lands in the user\'s inbox with a link back to the app.',
        from: 'Email Service', to: 'Browser', latency: '~2-30s',
      },
      {
        title: 'User Clicks the Link',
        detail: 'The link includes the token; the browser sends it back to the server to be checked.',
        from: 'Browser', to: 'Server', payload: 'GET /reset?token=…', latency: '~20ms',
      },
      {
        title: 'Token Verified Against Database',
        detail: 'The server checks the token matches a valid entry that hasn\'t expired and hasn\'t already been used.',
        from: 'Server', to: 'Database', payload: 'SELECT * FROM reset_tokens WHERE token = ?', latency: '~10ms',
        code: 'const row = await db.query("SELECT * FROM reset_tokens WHERE token = $1", [token]);\nif (!row || row.expires_at < Date.now() || row.used) {\n  return res.status(400).send("Invalid or expired link"); // rejects reused or expired tokens\n}',
      },
      {
        title: 'New Password Saved',
        detail: 'Once verified, the server hashes and saves the new password, and invalidates the token so it can never be reused.',
        from: 'Server', to: 'Database', payload: 'UPDATE users SET password_hash', latency: '~15ms',
        code: 'const newHash = await bcrypt.hash(newPassword, 12);\nawait db.query("UPDATE users SET password_hash = $1 WHERE id = $2", [newHash, row.user_id]);\nawait db.query("UPDATE reset_tokens SET used = true WHERE token = $1", [token]); // can never be reused again',
      },
    ],
  },
  {
    id: 'seed-flow11',
    title: 'How a failed login attempt is rejected',
    category: 'Auth & Security',
    steps: [
      {
        title: 'Credentials Submitted',
        detail: 'The user submits an email and password — same request shape as a successful login.',
        from: 'Browser', to: 'Server', payload: 'POST /login {email, password}', latency: '~30ms',
      },
      {
        title: 'Server Looks Up the User',
        detail: 'The server queries for a user matching that email.',
        from: 'Server', to: 'Database', payload: 'SELECT * FROM users WHERE email = ?', latency: '~15ms',
      },
      {
        title: 'Password Hash Does Not Match',
        detail: 'The database returns the stored hash, but it does not match the submitted password — this is the actual failure point.',
        from: 'Database', to: 'Server', payload: 'hash mismatch', latency: '~10ms', status: 'error',
        code: 'const ok = await bcrypt.compare(password, user.password_hash);\n// ok === false here — the hash genuinely does not match',
      },
      {
        title: 'Server Responds with 401',
        detail: 'The server returns a generic "invalid credentials" error — deliberately not revealing whether the email or the password was wrong, to avoid leaking which emails are registered.',
        from: 'Server', to: 'Browser', payload: '401 Unauthorized', latency: '~15ms', status: 'error',
        code: 'if (!ok) {\n  return res.status(401).json({ error: "Invalid email or password" }); // same message either way — never reveal which one was wrong\n}',
      },
      {
        title: 'Browser Shows an Error Message',
        detail: 'The UI shows a generic error rather than blaming the email or password specifically, and does not lock the account after just one attempt.',
        from: 'Browser', to: 'Browser', status: 'error',
        code: 'setError("Invalid email or password"); // no account lockout on a single failed attempt',
      },
    ],
  },
  {
    id: 'seed-flow12',
    title: 'How autocomplete search suggestions are fetched as you type',
    category: 'Frontend / React',
    steps: [
      {
        title: 'User Types a Character',
        detail: 'Each keystroke updates the input\'s local state — nothing is sent to the server yet.',
        from: 'Browser', to: 'Browser', latency: '~1ms',
        code: 'const [query, setQuery] = useState("");\n<input onChange={(e) => setQuery(e.target.value)} />',
      },
      {
        title: 'Debounce Timer Waits',
        detail: 'A debounce (commonly ~300ms) waits for typing to pause before firing a request — otherwise every keystroke would trigger its own network call.',
        from: 'Browser', to: 'Browser', latency: '~300ms',
        code: 'useEffect(() => {\n  const t = setTimeout(() => setDebouncedQuery(query), 300); // waits for a pause in typing\n  return () => clearTimeout(t);                              // cancels if the user types again first\n}, [query]);',
      },
      {
        title: 'Request Sent for Current Query',
        detail: 'Once typing pauses, the browser requests suggestions for whatever text is currently in the box.',
        from: 'Browser', to: 'Server', payload: 'GET /suggest?q=reac', latency: '~25ms',
        code: 'fetch(`/suggest?q=${debouncedQuery}`) // only fires once debouncedQuery actually changes\n  .then((r) => r.json())\n  .then(setResults);',
      },
      {
        title: 'Server Queries Suggestions',
        detail: 'The server (often backed by a search index rather than a plain database table) looks up likely completions.',
        from: 'Server', to: 'Server', latency: '~20ms',
      },
      {
        title: 'Suggestions Returned',
        detail: 'A short list of suggestions comes back as JSON.',
        from: 'Server', to: 'Browser', payload: '200 OK [ "react", "reactjs"… ]', latency: '~25ms',
      },
      {
        title: 'Stale Responses Are Discarded',
        detail: 'If the user kept typing, an earlier in-flight request could resolve after a newer one — the UI needs to ignore any response that isn\'t for the latest query.',
        from: 'Browser', to: 'Browser', latency: '~1ms',
        code: 'if (queryForThisResponse !== latestQueryRef.current) return; // a newer request has already superseded this one\nsetSuggestions(results);',
      },
    ],
  },
  {
    id: 'seed-flow13',
    title: 'How infinite scroll loads more data as you scroll',
    category: 'Frontend / React',
    steps: [
      {
        title: 'User Scrolls Near the Bottom',
        detail: 'An IntersectionObserver watches an invisible "sentinel" element near the bottom of the list and fires when it enters the viewport — no scroll-event listeners or manual position math needed.',
        from: 'Browser', to: 'Browser', latency: '~1ms',
        code: 'const observer = new IntersectionObserver((entries) => {\n  if (entries[0].isIntersecting) loadMore(); // fires once the sentinel becomes visible\n});\nobserver.observe(sentinelRef.current);',
      },
      {
        title: 'Next Page Requested',
        detail: 'The browser asks only for the next page of results, not the whole list again.',
        from: 'Browser', to: 'Server', payload: 'GET /posts?page=3', latency: '~20ms',
        code: 'function loadMore() {\n  fetch(`/posts?page=${page + 1}`)\n    .then((r) => r.json())\n    .then((newPosts) => setPosts((prev) => [...prev, ...newPosts])); // appended, not replaced\n}',
      },
      {
        title: 'Server Returns the Next Page',
        detail: 'The server skips past the already-seen rows and returns just the next batch.',
        from: 'Server', to: 'Server', latency: '~30ms',
        code: 'const posts = await db.posts.find().skip((page - 1) * 20).limit(20); // offset-based pagination\nres.json(posts);',
      },
      {
        title: 'Response Appended to the List',
        detail: 'The new batch of items arrives as plain JSON.',
        from: 'Server', to: 'Browser', payload: '200 OK [20 posts]', latency: '~15ms',
      },
      {
        title: 'New Items Appended to State',
        detail: 'The new batch is concatenated onto the end of the existing array — the posts already rendered are never replaced or recreated, only added to.',
        from: 'Browser', to: 'Browser', latency: '~1ms',
        code: 'setPosts((prev) => [...prev, ...newPosts]); // appended, not replaced — existing array entries keep their identity',
      },
      {
        title: 'React Renders Only the New Items',
        detail: 'Because each post has a stable key, React\'s diffing recognizes the existing items as unchanged and only creates DOM nodes for the newly appended ones.',
        from: 'Browser', to: 'Browser', latency: '~10ms',
        code: '{posts.map((p) => <Post key={p.id} {...p} />)} // stable key -> React reuses existing DOM nodes, creates only the new ones',
      },
      {
        title: 'Scroll Position Stays Put',
        detail: 'Since the DOM nodes above the fold were never touched or resized, the browser has no reason to move the scroll position — no manual scroll-restoration code is needed.',
        from: 'Browser', to: 'Browser', latency: '~1ms',
      },
    ],
  },
  {
    id: 'seed-flow14',
    title: 'How a file upload with a progress bar works',
    category: 'Frontend / React',
    steps: [
      {
        title: 'User Selects a File',
        detail: 'The browser reads the chosen file from a file input, entirely client-side so far.',
        from: 'Browser', to: 'Browser', latency: '~1ms',
        code: 'const file = e.target.files[0]; // from <input type="file" onChange={...} />',
      },
      {
        title: 'Upload Starts with Progress Tracking',
        detail: 'Plain fetch() has no upload-progress event, which is why XMLHttpRequest is still commonly used here — its upload.onprogress fires repeatedly as bytes actually leave the browser.',
        from: 'Browser', to: 'Server', payload: 'POST /upload (multipart)', latency: 'varies',
        code: 'const xhr = new XMLHttpRequest();\nxhr.upload.onprogress = (e) => {\n  setProgress(Math.round((e.loaded / e.total) * 100)); // drives the progress bar\n};\nxhr.open("POST", "/upload");\nxhr.send(formData);',
      },
      {
        title: 'Server Streams the File to Storage',
        detail: 'The server pipes the incoming data straight to disk or object storage instead of buffering the whole file in memory first.',
        from: 'Server', to: 'Server', latency: 'varies',
        code: 'req.pipe(uploadStream); // streamed, not fully buffered in memory',
      },
      {
        title: 'Server Confirms Completion',
        detail: 'Only once the file is fully written does the server respond — the client should treat "upload finished" and "server confirmed" as two different moments.',
        from: 'Server', to: 'Browser', payload: '200 OK { url }', latency: '~10ms',
      },
      {
        title: 'Progress Bar Reaches 100%',
        detail: 'The bar is driven by the server\'s actual confirmation, not just the browser finishing the upload — the two can be milliseconds apart but are conceptually different events.',
        from: 'Browser', to: 'Browser', latency: '~1ms',
        code: 'if (xhr.status === 200) setProgress(100); // tied to server confirmation, not xhr.upload finishing alone',
      },
    ],
  },
  {
    id: 'seed-flow15',
    title: 'How a JWT access token silently refreshes',
    category: 'Auth & Security',
    steps: [
      {
        title: 'Access Token Expires',
        detail: 'Access tokens are deliberately short-lived (often ~15 minutes) to limit the damage if one is ever stolen — the tradeoff is that they need to be refreshed constantly and invisibly.',
        from: 'Browser', to: 'Browser', latency: 'ongoing',
      },
      {
        title: 'API Call Returns 401',
        detail: 'The browser makes a normal API call using the now-expired token and gets rejected.',
        from: 'Browser', to: 'Server', payload: 'GET /api/data (expired token)', latency: '~10ms',
        code: 'const res = await fetch("/api/data", {\n  headers: { Authorization: `Bearer ${accessToken}` },\n});\nif (res.status === 401) return refreshAndRetry(); // triggers a silent refresh instead of logging the user out',
      },
      {
        title: 'Refresh Token Exchanged',
        detail: 'A separate, longer-lived refresh token (stored more carefully than the access token) is sent to get a new access token.',
        from: 'Browser', to: 'Server', payload: 'POST /refresh {refreshToken}', latency: '~20ms',
        code: 'const { accessToken } = await fetch("/refresh", {\n  method: "POST",\n  body: JSON.stringify({ refreshToken }),\n}).then((r) => r.json());',
      },
      {
        title: 'Server Issues a New Access Token',
        detail: 'The server validates the refresh token and mints a fresh, short-lived access token.',
        from: 'Server', to: 'Browser', payload: '200 OK { accessToken }', latency: '~15ms',
        code: 'if (isValidRefreshToken(refreshToken)) {\n  const accessToken = jwt.sign({ userId }, SECRET, { expiresIn: "15m" });\n  res.json({ accessToken });\n}',
      },
      {
        title: 'Original Request Retried Automatically',
        detail: 'The originally-failed request is replayed with the new token — the user never sees an interruption or has to log in again.',
        from: 'Browser', to: 'Server', payload: 'GET /api/data (new token)', latency: '~10ms',
        code: 'return fetch("/api/data", {\n  headers: { Authorization: `Bearer ${newAccessToken}` }, // same request, new token\n});',
      },
    ],
  },
];

interface FlowBuilderProps {
  flows: FlowSequence[];
  setFlows: Dispatch<SetStateAction<FlowSequence[]>>;
  isAdmin: boolean;
}

interface StepDraft extends TechRefStep {
  key: string;
}

interface FlowDraft {
  title: string;
  category: string;
  steps: StepDraft[];
}

function emptyDraft(): FlowDraft {
  return {
    title: '',
    category: FLOW_CATEGORIES[0],
    steps: [{ key: `s${Date.now()}${Math.random()}`, title: '', detail: '' }],
  };
}

function toDraft(flow: FlowSequence): FlowDraft {
  return {
    title: flow.title,
    category: flow.category || FLOW_CATEGORIES[0],
    steps: flow.steps.map((s) => ({ ...s, key: `s${Date.now()}${Math.random()}` })),
  };
}

interface GeneratedFlowPreview {
  title: string;
  steps: TechRefStep[];
}

export default function FlowBuilder({ flows, setFlows, isAdmin }: FlowBuilderProps) {
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<FlowDraft>(emptyDraft());
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const [generateTopic, setGenerateTopic] = useState('');
  const [generateDifficulty, setGenerateDifficulty] = useState<Difficulty>('Medium');
  const [generateDepth, setGenerateDepth] = useState<Depth>('Standard');
  const [generateFocus, setGenerateFocus] = useState('');
  const [generateIncludeCode, setGenerateIncludeCode] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState('');
  const [generatedFlow, setGeneratedFlow] = useState<GeneratedFlowPreview | null>(null);
  const [generatedCategory, setGeneratedCategory] = useState(FLOW_CATEGORIES[0]);

  const filteredFlows = flows.filter((flow) => {
    const matchesCategory = categoryFilter === 'All' || (flow.category || 'General') === categoryFilter;
    const matchesSearch = !search.trim() || flow.title.toLowerCase().includes(search.trim().toLowerCase());
    return matchesCategory && matchesSearch;
  });

  async function generateFlow() {
    const topic = generateTopic.trim();
    if (!topic || !isAdmin) return;
    setGenerating(true);
    setGenerateError('');
    setGeneratedFlow(null);
    try {
      const res = await fetch('/api/flow-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          difficulty: generateDifficulty,
          depth: generateDepth,
          focus: generateFocus.trim(),
          includeCode: generateIncludeCode,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setGenerateError(data.error || 'Something went wrong. Try again.');
        return;
      }
      const flow = data.flow;
      const steps: TechRefStep[] = (flow.steps || []).map((s: TechRefStep) => ({
        title: s.title,
        detail: s.detail,
        from: s.from || undefined,
        to: s.to || undefined,
        payload: s.payload || undefined,
        latency: s.latency || undefined,
        code: s.code || undefined,
      }));
      setGeneratedFlow({ title: flow.title, steps });
      setGeneratedCategory(FLOW_CATEGORIES[0]);
    } catch (err) {
      setGenerateError('Network error — try again.');
    } finally {
      setGenerating(false);
    }
  }

  function acceptGeneratedFlow() {
    if (!generatedFlow || !isAdmin) return;
    setFlows((prev) => [
      { id: `flow${Date.now()}${Math.random()}`, title: generatedFlow.title, category: generatedCategory, steps: generatedFlow.steps },
      ...prev,
    ]);
    setGeneratedFlow(null);
    setGenerateTopic('');
  }

  function discardGeneratedFlow() {
    setGeneratedFlow(null);
    setGenerateError('');
  }

  function toggleExpanded(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function startCreate() {
    if (!isAdmin) return;
    setDraft(emptyDraft());
    setEditingId(null);
    setCreating(true);
  }

  function startEdit(flow: FlowSequence) {
    if (!isAdmin) return;
    setDraft(toDraft(flow));
    setEditingId(flow.id);
    setCreating(true);
  }

  function cancelDraft() {
    setCreating(false);
    setEditingId(null);
  }

  function addStep() {
    setDraft((prev) => ({
      ...prev,
      steps: [...prev.steps, { key: `s${Date.now()}${Math.random()}`, title: '', detail: '' }],
    }));
  }

  function removeStep(key: string) {
    setDraft((prev) => ({ ...prev, steps: prev.steps.filter((s) => s.key !== key) }));
  }

  function updateStep(key: string, field: 'title' | 'detail' | 'from' | 'to' | 'payload' | 'latency' | 'status' | 'code', value: string) {
    setDraft((prev) => ({
      ...prev,
      steps: prev.steps.map((s) => (s.key === key ? { ...s, [field]: value } : s)),
    }));
  }

  function moveStep(key: string, dir: -1 | 1) {
    setDraft((prev) => {
      const idx = prev.steps.findIndex((s) => s.key === key);
      const swapWith = idx + dir;
      if (idx === -1 || swapWith < 0 || swapWith >= prev.steps.length) return prev;
      const steps = [...prev.steps];
      [steps[idx], steps[swapWith]] = [steps[swapWith], steps[idx]];
      return { ...prev, steps };
    });
  }

  function saveDraft() {
    if (!isAdmin) return;
    const title = draft.title.trim();
    const steps = draft.steps
      .map((s) => ({
        title: s.title.trim(),
        detail: s.detail.trim(),
        from: s.from?.trim() || undefined,
        to: s.to?.trim() || undefined,
        payload: s.payload?.trim() || undefined,
        latency: s.latency?.trim() || undefined,
        status: s.status === 'error' ? ('error' as const) : undefined,
        code: s.code?.trim() || undefined,
      }))
      .filter((s) => s.title);
    if (!title || steps.length === 0) return;
    const category = draft.category || FLOW_CATEGORIES[0];

    if (editingId) {
      setFlows((prev) => prev.map((f) => (f.id === editingId ? { ...f, title, category, steps } : f)));
    } else {
      setFlows((prev) => [{ id: `flow${Date.now()}${Math.random()}`, title, category, steps }, ...prev]);
    }
    setCreating(false);
    setEditingId(null);
  }

  function deleteFlow(id: string) {
    if (!isAdmin) return;
    setFlows((prev) => prev.filter((f) => f.id !== id));
  }

  function loadExampleFlows() {
    if (!isAdmin) return;
    const existing = new Set(flows.map((f) => f.title.trim().toLowerCase()));
    const toAdd = DEFAULT_FLOWS.filter((f) => !existing.has(f.title.trim().toLowerCase()));
    if (toAdd.length === 0) return;
    setFlows((prev) => [...toAdd, ...prev]);
  }

  return (
    <div className="panel active">
      <p className="guide-intro">
        Build an animated step-by-step sequence for any "what happens when..." topic — a request lifecycle, a
        deployment pipeline, a rendering process, anything that's really a chain of named stages. Add steps in order,
        save, then press play.
      </p>

      {isAdmin && (
        <div className="resume-actions no-print">
          <button className="copy-btn" onClick={startCreate}>
            + New flow
          </button>
          <button className="ghost-btn resume-add-btn" onClick={loadExampleFlows}>
            {flows.length === 0 ? '+ Load example flows' : '+ Add missing example flows'}
          </button>
        </div>
      )}

      {isAdmin && (
        <div className="add-form qa-form" style={{ marginBottom: 24 }}>
          <div className="cat-title">✦ Generate a flow with AI</div>
          <div className="resume-field-grid">
            <input
              type="text"
              placeholder='Topic (e.g. "How OAuth login works")'
              value={generateTopic}
              onChange={(e) => setGenerateTopic(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && generateFlow()}
            />
            <input
              type="text"
              placeholder='Focus on (optional) — e.g. "the caching layer"'
              value={generateFocus}
              onChange={(e) => setGenerateFocus(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && generateFlow()}
            />
          </div>
          <div className="resume-field-grid">
            <select value={generateDifficulty} onChange={(e) => setGenerateDifficulty(e.target.value as Difficulty)}>
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>
                  {d} difficulty
                </option>
              ))}
            </select>
            <select value={generateDepth} onChange={(e) => setGenerateDepth(e.target.value as Depth)}>
              {DEPTHS.map((d) => (
                <option key={d} value={d}>
                  {d} ({d === 'Short' ? '4-5' : d === 'Standard' ? '6-8' : '9-12'} steps)
                </option>
              ))}
            </select>
            <label className="hide-toggle">
              <input
                type="checkbox"
                checked={generateIncludeCode}
                onChange={(e) => setGenerateIncludeCode(e.target.checked)}
              />
              Include code snippets
            </label>
          </div>
          <button className="add-concept-btn" onClick={generateFlow} disabled={generating || !generateTopic.trim()}>
            {generating ? 'Generating…' : '✦ Generate with AI'}
          </button>

          {generateError && <div className="discover-error">{generateError}</div>}

          {generatedFlow && (
            <div className="suggestions-panel">
              <div className="cat-title">{generatedFlow.title} — review before adding</div>
              <ProcessFlow steps={generatedFlow.steps} title={generatedFlow.title} />
              <div className="resume-field-grid" style={{ marginTop: 12 }}>
                <label className="hide-toggle" style={{ gridColumn: 'span 1' }}>
                  Category
                  <select value={generatedCategory} onChange={(e) => setGeneratedCategory(e.target.value)}>
                    {FLOW_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="edit-actions">
                <button onClick={acceptGeneratedFlow}>+ Add this flow</button>
                <button className="ghost-btn" onClick={discardGeneratedFlow}>
                  Discard
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {flows.length > 0 && (
        <div className="dir-controls">
          <input
            type="text"
            placeholder="Search flows…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="All">All categories</option>
            {FLOW_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      )}

      {isAdmin && creating && (
        <div className="add-form qa-form" style={{ marginBottom: 24 }}>
          <div className="resume-field-grid">
            <input
              type="text"
              placeholder='Flow title (e.g. "What happens when a login request is submitted")'
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              autoFocus
            />
            <select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })}>
              {FLOW_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="resume-entries">
            {draft.steps.map((step, i) => (
              <div className="resume-entry" key={step.key}>
                <div className="resume-field-grid">
                  <input
                    type="text"
                    placeholder={`Step ${i + 1} title (e.g. DNS Lookup)`}
                    value={step.title}
                    onChange={(e) => updateStep(step.key, 'title', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="From (e.g. Browser) — optional"
                    value={step.from || ''}
                    onChange={(e) => updateStep(step.key, 'from', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="To (e.g. Server) — optional, same as From = internal step"
                    value={step.to || ''}
                    onChange={(e) => updateStep(step.key, 'to', e.target.value)}
                  />
                </div>
                <textarea
                  className="qa-textarea"
                  rows={2}
                  placeholder="What happens in this step"
                  value={step.detail}
                  onChange={(e) => updateStep(step.key, 'detail', e.target.value)}
                />
                <div className="resume-field-grid">
                  <input
                    type="text"
                    placeholder='Data sent (e.g. "POST /login", "200 OK") — optional'
                    value={step.payload || ''}
                    onChange={(e) => updateStep(step.key, 'payload', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder='Latency (e.g. "~40ms") — optional'
                    value={step.latency || ''}
                    onChange={(e) => updateStep(step.key, 'latency', e.target.value)}
                  />
                  <label className="hide-toggle">
                    <input
                      type="checkbox"
                      checked={step.status === 'error'}
                      onChange={(e) => updateStep(step.key, 'status', e.target.checked ? 'error' : 'success')}
                    />
                    Mark as error/failure step
                  </label>
                </div>
                <textarea
                  className="qa-textarea mono-textarea"
                  rows={3}
                  placeholder="Code behind this step (optional) — shown in the code panel in Circular view"
                  value={step.code || ''}
                  onChange={(e) => updateStep(step.key, 'code', e.target.value)}
                />
                <div className="flow-step-actions">
                  <button className="ghost-btn" onClick={() => moveStep(step.key, -1)} disabled={i === 0}>
                    ↑ Move up
                  </button>
                  <button className="ghost-btn" onClick={() => moveStep(step.key, 1)} disabled={i === draft.steps.length - 1}>
                    ↓ Move down
                  </button>
                  <button className="del-btn resume-remove" onClick={() => removeStep(step.key)}>
                    ✕ Remove step
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button className="ghost-btn resume-add-btn" onClick={addStep}>
            + Add step
          </button>

          <div className="edit-actions">
            <button onClick={saveDraft}>{editingId ? 'Save changes' : 'Save flow'}</button>
            <button className="ghost-btn" onClick={cancelDraft}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {flows.length === 0 && !creating && (
        <div className="empty-state">
          No flows yet — {isAdmin ? 'click "+ New flow" or "+ Load example flows" above to get started.' : 'nothing has been added yet.'}
        </div>
      )}

      {flows.length > 0 && filteredFlows.length === 0 && (
        <div className="empty-state">No flows match your search/filter.</div>
      )}

      <div className="qa-list">
        {filteredFlows.map((flow) => {
          const isExpanded = expandedIds.has(flow.id);
          return (
            <div className={`qa-card tech-card${isExpanded ? ' expanded' : ''}`} key={flow.id}>
              <div className="qa-question-row tech-card-header" onClick={() => toggleExpanded(flow.id)}>
                <div>
                  <span className="qa-category-tag">{flow.category || 'General'}</span>
                  <span className="qa-category-tag">{flow.steps.length} steps</span>
                  <div className="qa-question">{flow.title}</div>
                </div>
                <div className="tech-card-header-right">
                  {isAdmin && (
                    <div className="qa-actions" onClick={(e) => e.stopPropagation()}>
                      <button className="edit-icon" onClick={() => startEdit(flow)} title="Edit">
                        ✎
                      </button>
                      <button className="del-btn" onClick={() => deleteFlow(flow.id)} title="Delete">
                        ✕
                      </button>
                    </div>
                  )}
                  <span className="tech-chevron">{isExpanded ? '▾' : '▸'}</span>
                </div>
              </div>
              {isExpanded && <ProcessFlow steps={flow.steps} title={flow.title} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
