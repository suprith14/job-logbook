'use client';

import { Dispatch, SetStateAction, useState } from 'react';
import CodeBlock from '../components/CodeBlock';
import type { StructureEntry, StructureSet } from '../types';

interface StructureGroup {
  group: string;
  brief?: string;
  entries: StructureEntry[];
}

function languageForPath(path: string): string {
  if (path.endsWith('.tsx')) return 'tsx';
  if (path.endsWith('.ts')) return 'typescript';
  if (path.endsWith('.jsx')) return 'jsx';
  return 'javascript';
}

// A canonical modern Next.js/React project — the kind of structure that comes up in
// interviews and onboarding alike. Content is a short, realistic excerpt of what the file
// actually contains, not a full file dump — enough to recognize it and see why it exists.
const GENERIC_STRUCTURE: StructureGroup[] = [
  {
    group: 'Root config & tooling',
    brief: 'The files every project needs before any real feature code is written — dependencies, compiler settings, and what git should ignore.',
    entries: [
      {
        path: 'package.json',
        why: 'Declares dependencies, scripts, and project metadata.',
        when: 'Created by `npm init` or `create-next-app`; edited constantly as dependencies are added.',
        content: '{\n  "name": "my-app",\n  "version": "0.1.0",\n  "scripts": {\n    "dev": "next dev",\n    "build": "next build",\n    "start": "next start",\n    "lint": "next lint"\n  },\n  "dependencies": {\n    "next": "14.2.5",\n    "react": "^18.3.0",\n    "react-dom": "^18.3.0"\n  }\n}',
      },
      {
        path: 'package-lock.json',
        why: 'Locks the exact installed version of every dependency (including transitive ones) for reproducible installs.',
        when: 'Created/updated automatically by `npm install`; never hand-edited.',
      },
      {
        path: 'tsconfig.json',
        why: 'TypeScript compiler configuration — path aliases, strictness, target.',
        when: 'Created by `create-next-app --typescript` or `tsc --init`; edited when adding path aliases or turning on stricter flags.',
        content: '{\n  "compilerOptions": {\n    "target": "ES2017",\n    "lib": ["dom", "dom.iterable", "esnext"],\n    "strict": true,\n    "jsx": "preserve",\n    "moduleResolution": "bundler",\n    "paths": {\n      "@/*": ["./src/*"]\n    }\n  },\n  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"]\n}',
      },
      {
        path: 'next.config.js',
        why: 'Next.js build/runtime configuration — redirects, headers, image domains, env exposure.',
        when: 'Created by create-next-app (often near-empty); edited only when a feature needs custom Next.js behavior.',
        content: '/** @type {import(\'next\').NextConfig} */\nconst nextConfig = {\n  images: {\n    domains: [\'cdn.example.com\'], // allow next/image to load from this external host\n  },\n  async redirects() {\n    return [{ source: \'/old-page\', destination: \'/new-page\', permanent: true }];\n  },\n};\nmodule.exports = nextConfig;',
      },
      {
        path: '.eslintrc.json',
        why: 'Lint rules enforced across the codebase.',
        when: "Created by create-next-app's ESLint prompt; edited when the team adopts a new rule.",
        content: '{\n  "extends": "next/core-web-vitals"\n}',
      },
      {
        path: '.gitignore',
        why: 'Tells git which generated or sensitive files to never commit (node_modules, .next, .env).',
        when: 'Created at project init; edited whenever a new generated-output folder appears.',
        content: '# dependencies\nnode_modules/\n\n# next.js build output\n.next/\nout/\n\n# env files — never commit real secrets\n.env*.local',
      },
      {
        path: '.env.local',
        why: 'Environment variables and secrets — API keys, database URLs.',
        when: "Created manually the first time a secret is needed; should always be in .gitignore, never committed.",
        content: '# Secrets — never commit this file\nDATABASE_URL=postgres://user:pass@localhost:5432/mydb\nGEMINI_API_KEY=your-key-here',
      },
      {
        path: '.prettierrc',
        why: 'Code formatting rules (quotes, semicolons, line width).',
        when: 'Created manually when the team adopts Prettier; rarely edited after that.',
        content: '{\n  "semi": true,\n  "singleQuote": true,\n  "trailingComma": "es5"\n}',
      },
    ],
  },
  {
    group: 'Source code (app/)',
    brief: 'The actual application — pages, styles, and the server-side routes that back them.',
    entries: [
      {
        path: 'app/layout.tsx',
        why: 'The root layout wrapping every page — fonts, global providers, `<html>`/`<body>`.',
        when: 'Created automatically by create-next-app; edited when adding a global provider or metadata.',
        content: 'export default function RootLayout({ children }: { children: React.ReactNode }) {\n  return (\n    <html lang="en">\n      <body>{children}</body>\n    </html>\n  );\n}',
      },
      {
        path: 'app/page.tsx',
        why: 'The homepage route (`/`).',
        when: 'Created automatically at scaffold time; every other page.tsx is added manually as new routes are needed.',
        content: 'export default function HomePage() {\n  return <main>Welcome</main>;\n}',
      },
      {
        path: 'app/globals.css',
        why: 'The global stylesheet, imported once in the root layout.',
        when: 'Created by create-next-app; grows as the app grows.',
        content: ':root {\n  --background: #ffffff;\n  --foreground: #171717;\n}\nbody {\n  background: var(--background);\n  color: var(--foreground);\n}',
      },
      {
        path: 'app/api/hello/route.ts',
        why: "A server-side API endpoint (App Router route handler) — auth checks, database calls, anything that needs a secret the browser can't see.",
        when: 'Created manually, one per backend endpoint, the moment a page needs server-side logic.',
        content: 'import { NextRequest } from \'next/server\';\n\nexport async function GET(request: NextRequest) {\n  return Response.json({ message: \'Hello\' }); // one function per HTTP method\n}',
      },
      {
        path: 'middleware.ts',
        why: 'Runs before a request reaches a route — auth gating, redirects, rewrites, at the edge.',
        when: "Created manually only when route-level logic isn't enough — e.g. protecting a whole section of the site at once.",
        content: 'import { NextResponse } from \'next/server\';\nimport type { NextRequest } from \'next/server\';\n\nexport function middleware(request: NextRequest) {\n  const token = request.cookies.get(\'session\');\n  if (!token) {\n    return NextResponse.redirect(new URL(\'/login\', request.url)); // no session — bounce to login\n  }\n  return NextResponse.next();\n}\n\nexport const config = {\n  matcher: [\'/dashboard/:path*\'], // only runs for these routes, not the whole site\n};',
      },
    ],
  },
  {
    group: 'Build & generated artifacts — never hand-edited',
    brief: 'Output produced automatically by tools you already ran — safe to delete, always regenerated, never worth committing or editing by hand.',
    entries: [
      { path: 'node_modules/', why: "Every installed package's actual code.", when: 'Created by `npm install`; regenerated automatically any time it\'s deleted, never committed.' },
      { path: '.next/', why: "Next.js's compiled build output and dev cache.", when: 'Created by `next dev` or `next build`; safe to delete, regenerated automatically on the next run.' },
      { path: '.vercel/', why: "Vercel's local deployment cache/config linkage.", when: 'Created the first time `vercel` CLI links or deploys the project.' },
      { path: 'tsconfig.tsbuildinfo', why: "TypeScript's incremental build cache, speeding up repeat compiles.", when: 'Created by `tsc` on first compile with incremental mode on; safe to delete.' },
    ],
  },
  {
    group: 'Testing',
    brief: 'Confidence that the app still works — added incrementally, usually unit tests first, browser-level E2E tests later.',
    entries: [
      {
        path: 'jest.config.js',
        why: 'Test runner configuration — what counts as a test file, coverage thresholds, module mocking.',
        when: 'Created manually the first time automated tests are introduced to the project.',
        content: 'module.exports = {\n  testEnvironment: \'jsdom\', // simulates a browser DOM for component tests\n  setupFilesAfterEach: [\'<rootDir>/jest.setup.js\'],\n};',
      },
      {
        path: 'app/components/Button.test.tsx',
        why: 'A unit test for a specific component.',
        when: 'Created alongside — or shortly after — the component it tests.',
        content: 'import { render, screen } from \'@testing-library/react\';\nimport Button from \'./Button\';\n\ntest(\'renders the label\', () => {\n  render(<Button label="Save" />);\n  expect(screen.getByText(\'Save\')).toBeInTheDocument();\n});',
      },
      {
        path: 'playwright.config.ts',
        why: 'End-to-end, real-browser test runner configuration.',
        when: 'Created manually when the project adds browser-level E2E tests, usually later than unit tests.',
        content: 'import { defineConfig } from \'@playwright/test\';\n\nexport default defineConfig({\n  testDir: \'./e2e\',\n  use: { baseURL: \'http://localhost:3000\' },\n});',
      },
    ],
  },
  {
    group: 'CI/CD & deployment',
    brief: 'Automates the "does it still work, and can we ship it" question instead of relying on a human to remember to check.',
    entries: [
      {
        path: '.github/workflows/ci.yml',
        why: 'CI pipeline definition — lint/test/build/deploy triggered on push or PR.',
        when: 'Created manually the first time the team wants automated checks instead of relying purely on manual review.',
        content: 'name: CI\non: [push, pull_request]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: npm ci\n      - run: npm run lint\n      - run: npm run build',
      },
      {
        path: 'Dockerfile',
        why: 'Instructions to build a container image of the app.',
        when: 'Created manually when the app needs to run somewhere beyond a single managed platform — a custom server, Kubernetes.',
        content: 'FROM node:20-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --production\nCOPY . .\nRUN npm run build\nCMD ["npm", "start"]',
      },
      {
        path: 'vercel.json',
        why: "Vercel-specific deployment overrides — redirects, headers, function regions.",
        when: "Created manually only when Vercel's zero-config defaults aren't enough.",
        content: '{\n  "redirects": [\n    { "source": "/old", "destination": "/new", "permanent": true }\n  ]\n}',
      },
    ],
  },
  {
    group: 'Production-grade additions — what a scaled app adds beyond the basics',
    brief: 'None of this is needed to ship v1 — it shows up once real users, a real team, or real infrastructure risk enter the picture.',
    entries: [
      {
        path: '.nvmrc',
        why: 'Pins the exact Node version so every developer machine, CI run, and production server match.',
        when: 'Created once a Node version mismatch has actually caused a bug that only reproduces on one machine.',
        content: '20.11.0',
      },
      {
        path: '.env.production',
        why: 'Production-specific environment values — real database URLs, live API keys — kept separate from local dev values.',
        when: 'Created the first time the app is deployed somewhere with real secrets, distinct from .env.local.',
        content: 'NEXT_PUBLIC_API_URL=https://api.myapp.com\nDATABASE_URL=postgres://prod-user:***@prod-db.internal:5432/app\nSENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0',
      },
      {
        path: '.dockerignore',
        why: 'Excludes node_modules/.git/logs from the Docker build context so images build faster and smaller.',
        when: 'Created alongside the Dockerfile, the first time someone notices a multi-GB build context.',
        content: 'node_modules\n.next\n.git\n*.log',
      },
      {
        path: 'docker-compose.yml',
        why: 'Spins up the app together with its real dependencies (database, cache) for local/staging parity with production.',
        when: 'Created once the app has more than one moving part — a lone frontend rarely needs this, a frontend + DB + cache does.',
        content: "version: '3.8'\nservices:\n  web:\n    build: .\n    ports: ['3000:3000']\n    depends_on: [db, redis]\n  db:\n    image: postgres:16\n    environment:\n      POSTGRES_PASSWORD: devpassword # local-only credential, never the real one\n  redis:\n    image: redis:7",
      },
      {
        path: 'sentry.server.config.ts',
        why: 'Wires up server-side error/exception tracking so production crashes are captured instead of silently disappearing into logs.',
        when: 'Created the first time an untraced production error costs real debugging time — rarely part of the initial scaffold.',
        content: "import * as Sentry from '@sentry/nextjs';\n\nSentry.init({\n  dsn: process.env.SENTRY_DSN,\n  tracesSampleRate: 0.1, // only trace 10% of requests — full tracing is expensive at real scale\n});",
      },
      {
        path: 'next-sitemap.config.js',
        why: 'Generates sitemap.xml and robots.txt automatically at build time so search engines can crawl the site correctly.',
        when: 'Created once the app needs to be discoverable/indexed, not just functional — usually right before a public launch.',
        content: "module.exports = {\n  siteUrl: 'https://myapp.com',\n  generateRobotsTxt: true, // also writes public/robots.txt for you\n};",
      },
      {
        path: 'public/manifest.json',
        why: 'PWA/installability metadata — app name, icons, theme color — needed for "Add to Home Screen" support.',
        when: 'Created when the app wants to be installable like a native app, not required for a plain website.',
        content: '{\n  "name": "My App",\n  "short_name": "MyApp",\n  "icons": [{ "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" }],\n  "theme_color": "#0f172a",\n  "display": "standalone"\n}',
      },
      {
        path: '.well-known/security.txt',
        why: 'A standardized place for security researchers to find your vulnerability-disclosure contact.',
        when: 'Created once the company has an actual security contact/process to point people to — a compliance/trust signal, not a technical necessity.',
        content: 'Contact: mailto:security@myapp.com\nExpires: 2027-01-01T00:00:00.000Z',
      },
      {
        path: 'prisma/migrations/20240501_add_users_table/migration.sql',
        why: 'A versioned, reviewable record of exactly how the database schema changed.',
        when: 'Created the moment more than one person touches the database schema — manual, undocumented schema changes stop being safe past that point.',
        content: 'CREATE TABLE users (\n  id SERIAL PRIMARY KEY,\n  email TEXT UNIQUE NOT NULL,\n  created_at TIMESTAMP DEFAULT now()\n);',
      },
      {
        path: 'scripts/seed.ts',
        why: 'Populates a fresh database with realistic sample data.',
        when: 'Created once local or staging environments need to be spun up from empty and manually re-creating test data becomes tedious.',
        content: "async function seed() {\n  await db.user.createMany({\n    data: [{ email: 'test@example.com' }], // realistic sample data for local/staging, never real user data\n  });\n}\nseed();",
      },
      {
        path: 'CHANGELOG.md',
        why: 'A running, human-readable log of what shipped in each release.',
        when: 'Created once the project starts doing versioned releases that other people (users, other teams) depend on.',
        content: '## [1.4.0] - 2026-03-01\n### Added\n- Silent JWT refresh flow\n### Fixed\n- Race condition in checkout retry logic',
      },
      {
        path: '.github/CODEOWNERS',
        why: 'Auto-assigns the right reviewers based on which files a PR touches.',
        when: 'Created once a team is large enough that "who should review this" stops being obvious from context.',
        content: '/app/api/       @backend-team\n/app/screens/   @frontend-team\n/infra/         @platform-team',
      },
      {
        path: 'load-test/checkout.js',
        why: 'A k6 (or similar) script simulating concurrent user traffic against a critical path.',
        when: 'Created once the team needs confidence the app survives real production traffic, not just that it works for one user at a time.',
        content: "import http from 'k6/http';\n\nexport default function () {\n  http.get('https://myapp.com/api/products'); // simulated concurrent load, not a functional test\n}",
      },
      {
        path: 'infra/main.tf',
        why: 'Infrastructure-as-code — cloud resources defined in version-controlled, reviewable files instead of manual dashboard clicks.',
        when: 'Created once infrastructure changes need to be reproducible and reviewable, usually once more than one environment (staging + prod) exists.',
        content: 'resource "aws_s3_bucket" "assets" {\n  bucket = "myapp-production-assets" // reproducible, reviewable infra instead of manual console clicks\n}',
      },
      {
        path: 'app/lib/flags.ts',
        why: 'Feature-flag helper that gates half-finished or risky features behind a rollout percentage.',
        when: 'Created once "deploy" and "release" need to be decoupled — shipping code to production without exposing it to every user yet.',
        content: 'export function isEnabled(flag: string, userId: string): boolean {\n  return FLAG_ROLLOUT_PERCENT[flag] > hashToPercent(userId); // gradual rollout by user hash, not all-or-nothing\n}',
      },
      {
        path: '.husky/pre-commit',
        why: 'Blocks a bad commit locally, before it even reaches CI.',
        when: 'Created once CI failures from trivial lint/format issues become annoying enough that catching them a step earlier is worth the setup.',
        content: '#!/bin/sh\nnpx lint-staged # blocks the commit if lint-staged reports failures',
      },
    ],
  },
];

// A guided tour of this app's own real structure — grounded in how it was actually built,
// tab by tab, over this project's life. Content shown is a short representative excerpt of
// each file's real shape/patterns, not a byte-for-byte dump of the full file.
const APP_STRUCTURE: StructureGroup[] = [
  {
    group: 'Root',
    brief: 'The handful of files that sit outside app/ entirely — project-wide config and shared auth logic.',
    entries: [
      {
        path: 'package.json',
        why: 'Next.js 14 app dependencies, plus the `type-check` script (`tsc --noEmit`) used to verify every change without running a full build.',
        when: 'Present since the very first commit.',
        content: '{\n  "name": "job-logbook",\n  "version": "1.0.0",\n  "scripts": {\n    "dev": "next dev",\n    "build": "next build",\n    "start": "next start",\n    "type-check": "tsc --noEmit"\n  }\n}',
      },
      {
        path: '.gitignore',
        why: 'Excludes node_modules, .next, and .env from version control.',
        when: 'Added in one of the earliest sessions, specifically to stop secrets and build output from being committed.',
        content: 'node_modules/\n.next/\n.env*.local',
      },
      {
        path: 'lib/auth.ts',
        why: 'Session token verification (verifySession, COOKIE_NAME) shared by every protected API route.',
        when: 'Created once, when session login/logout were first added — sits outside app/ since it\'s infrastructure, not a route or screen.',
        content: 'import jwt from \'jsonwebtoken\';\n\nexport const COOKIE_NAME = \'session\';\n\nexport function verifySession(token?: string) {\n  if (!token) return null;\n  try {\n    return jwt.verify(token, process.env.JWT_SECRET!) as { role: \'admin\' | \'viewer\' };\n  } catch {\n    return null; // invalid/expired token — treat exactly like no session\n  }\n}',
      },
    ],
  },
  {
    group: 'app/ — routing & shell',
    brief: 'The four files every tab and every persisted field ultimately touches — the shell the rest of the app is built inside of.',
    entries: [
      {
        path: 'app/layout.tsx',
        why: 'Root HTML shell wrapping every screen.',
        when: 'Created at project scaffold, essentially untouched since.',
        content: 'export const metadata = { title: \'The Logbook\' };\n\nexport default function RootLayout({ children }: { children: React.ReactNode }) {\n  return (\n    <html lang="en">\n      <body>{children}</body>\n    </html>\n  );\n}',
      },
      {
        path: 'app/page.tsx',
        why: 'The single-page app shell — checks the session, loads persisted state via useAppState, renders the tab bar, and renders whichever screen is active.',
        when: 'Grows by one import + one TABS entry + one conditional render block every time a new tab is added — Flow Builder, Company Prep, and Corporate Playbook all followed this same pattern.',
        content: 'const TABS = [\n  { id: \'directory\', label: \'Career Links\' },\n  { id: \'flows\', label: \'Flow Builder\' },\n  // one entry per tab — added here first, matched by a render block below\n];\n\nexport default function Home() {\n  const [activeTab, setActiveTab] = useState(\'directory\');\n  const { flows, setFlows /* ...every other persisted field */ } = useAppState(authChecked, isAdmin);\n\n  return (\n    <div className="wrap">\n      <div className="tabs">{TABS.map((t) => <button key={t.id}>{t.label}</button>)}</div>\n      {activeTab === \'flows\' && <FlowBuilder flows={flows} setFlows={setFlows} isAdmin={isAdmin} />}\n    </div>\n  );\n}',
      },
      {
        path: 'app/globals.css',
        why: 'One continuously-growing stylesheet for the whole app.',
        when: 'Every new screen or component adds its own class block here, to keep the amber/teal/rose palette and existing patterns (qa-card, cat-group, suggestions-panel) consistent across tabs.',
        content: ':root {\n  --ink: #12161d;\n  --amber: #e8a33d;\n  --teal: #3fa796;\n  --rose: #c96a5e;\n}\n/* every new screen adds its own class block below, reusing these tokens\n   instead of introducing new colors */',
      },
      {
        path: 'app/types.ts',
        why: 'Every persisted data shape lives here, plus the PersistedState interface the whole save/load system is built around.',
        when: 'A new feature always starts here: the interface gets written before any UI exists.',
        content: 'export interface PersistedState {\n  applications?: Application[];\n  hrQuestions?: HRQuestion[];\n  flows?: FlowSequence[];\n  prepSets?: PrepSet[];\n  corporateScenarios?: CorporateScenario[];\n  structureSets?: StructureSet[]; // ...one optional key per feature, added here first\n}',
      },
    ],
  },
  {
    group: 'app/api/ — server routes',
    brief: 'Everything that needs a secret the browser can\'t see — auth, persistence, and every "✦ AI-generate" call.',
    entries: [
      {
        path: 'app/api/state/route.ts',
        why: 'The single GET/POST endpoint everything persists through, backed by Upstash Redis.',
        when: 'Created once, early on; every new persisted field is just another key passed through this same route — never a new route per feature.',
        content: 'export async function GET() {\n  const session = getSession();\n  if (!session) return Response.json({ error: \'Not signed in.\' }, { status: 401 });\n  const data = await redis.get(STATE_KEY);\n  return Response.json(data || EMPTY_STATE);\n}\n\nexport async function POST(request: NextRequest) {\n  const session = getSession();\n  if (!session || session.role !== \'admin\') {\n    return Response.json({ ok: false, error: \'View-only access.\' }, { status: 403 }); // viewers can load, never save\n  }\n  const body = await request.json();\n  await redis.set(STATE_KEY, body); // the whole PersistedState object, overwritten each save\n  return Response.json({ ok: true });\n}',
      },
      {
        path: 'app/api/login/route.ts',
        why: 'Auth endpoint — checks the submitted password and issues the session cookie.',
        when: 'Created the session the login system was first built, alongside session/route.ts and logout/route.ts.',
        content: 'export async function POST(request: NextRequest) {\n  const { password } = await request.json();\n  const role = password === process.env.ADMIN_PASSWORD ? \'admin\' : \'viewer\';\n  const token = signSession({ role });\n  const res = Response.json({ ok: true, role });\n  res.headers.set(\'Set-Cookie\', `${COOKIE_NAME}=${token}; HttpOnly; Path=/`);\n  return res;\n}',
      },
      {
        path: 'app/api/tech-suggest/route.ts',
        why: 'One of several "✦ AI-generate" routes — admin-only check, build a Gemini prompt, return parsed JSON.',
        when: 'Created the same session the Tech Reference tab\'s "✦ Find concepts" button was built; every later AI-generate route (flow-suggest, prep-suggest, corporate-suggest, structure-suggest) copied this exact shape.',
        content: 'export async function POST(request: NextRequest) {\n  const session = verifySession(cookies().get(COOKIE_NAME)?.value);\n  if (!session || session.role !== \'admin\') {\n    return Response.json({ error: \'View-only access cannot run searches.\' }, { status: 403 });\n  }\n  const { category, difficulty } = await request.json();\n  const prompt = `List 5 concepts under "${category}" at "${difficulty}" difficulty...`;\n  const { data: concepts, error } = await callGeminiForJSONArray(prompt); // shared helper, not duplicated per route\n  return Response.json({ concepts, error });\n}',
      },
    ],
  },
  {
    group: 'app/screens/ — one file per tab',
    brief: 'One file per nav-bar tab — this exact Project Structure screen is itself a member of this folder.',
    entries: [
      {
        path: 'app/screens/FlowBuilder.tsx',
        why: 'The Flow Builder tab — seed data, CRUD handlers, and the "✦ Generate with AI" flow.',
        when: 'Created the moment the Flow Builder tab was requested; every screen file follows the same shape: exported seed constant, a Props interface taking the persisted slice + its setter + isAdmin, then the component.',
        content: 'export const DEFAULT_FLOWS: FlowSequence[] = [\n  // seed data — loaded via "+ Load example flows"\n];\n\ninterface FlowBuilderProps {\n  flows: FlowSequence[];\n  setFlows: Dispatch<SetStateAction<FlowSequence[]>>;\n  isAdmin: boolean;\n}\n\nexport default function FlowBuilder({ flows, setFlows, isAdmin }: FlowBuilderProps) {\n  const [draft, setDraft] = useState<FlowDraft>(emptyDraft());\n  // ...add/edit/delete handlers, "✦ Generate with AI" handler\n  return <div className="panel active">{/* seed loader, generate form, flow list */}</div>;\n}',
      },
    ],
  },
  {
    group: 'app/components/ — shared building blocks',
    brief: 'UI that more than one screen needs — created on the second use, not the first, to avoid guessing at an abstraction too early.',
    entries: [
      {
        path: 'app/components/ProcessFlow.tsx',
        why: 'The animated circular diagram + code panel, reused by both Tech Reference and Flow Builder.',
        when: 'Created the moment a piece of UI needed to be shared across more than one screen, instead of being duplicated.',
        content: 'export default function ProcessFlow({ steps, title }: ProcessFlowProps) {\n  const [step, setStep] = useState(0);\n  const actors = actorsFromSteps(steps); // dedupes from/to names into a ring of actors\n  // ...circular position math (trig), snap-then-animate packet effect\n  return <div className="process-flow">{/* circle diagram + code panel side by side */}</div>;\n}',
      },
    ],
  },
  {
    group: 'app/hooks/',
    brief: 'Stateful logic pulled out of components so it can be reused and reasoned about on its own — one hook here holds this entire app\'s persistence.',
    entries: [
      {
        path: 'app/hooks/useAppState.ts',
        why: 'The one hook holding every persisted useState plus the load-on-mount and debounced-save-on-change effects.',
        when: "Every new persisted field requires exactly four edits here — one useState, one line in the load handler, one line in the save body, one entry in the save effect's dependency array.",
        content: '// Holds every persisted field + load-on-mount and debounced-save-on-change effects.\nexport function useAppState(authChecked: boolean, isAdmin: boolean) {\n  const [flows, setFlows] = useState<FlowSequence[]>([]);\n\n  useEffect(() => {\n    if (!authChecked) return;\n    fetch(\'/api/state\')\n      .then((res) => res.json())\n      .then((data) => setFlows(data.flows || []));\n  }, [authChecked]);\n\n  useEffect(() => {\n    if (!loaded || !isAdmin) return; // viewers never write back\n    const t = setTimeout(() => {\n      fetch(\'/api/state\', { method: \'POST\', body: JSON.stringify({ flows /* ...everything */ }) });\n    }, 400); // debounced so rapid edits don\'t fire a save per keystroke\n    return () => clearTimeout(t);\n  }, [flows /* ...every other field */]);\n\n  return { flows, setFlows };\n}',
      },
    ],
  },
  {
    group: 'app/lib/',
    brief: 'Framework-agnostic helper functions — no React, no routes — reused by whichever screen or API route needs them.',
    entries: [
      {
        path: 'app/lib/gemini.ts',
        why: 'Shared Gemini fetch/JSON-parsing helpers (callGeminiForJSONArray/Object).',
        when: 'Created once, reused by every AI-generate route rather than duplicating the fetch logic per route.',
        content: 'export async function callGeminiForJSONArray<T>(prompt: string) {\n  const res = await fetch(`${MODEL_URL}?key=${apiKey}`, {\n    method: \'POST\',\n    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),\n  });\n  const text = extractText(await res.json()); // pulls text out of Gemini\'s nested response shape\n  const jsonMatch = text.match(/\\[[\\s\\S]*\\]/); // Gemini sometimes wraps JSON in prose despite instructions\n  return { data: JSON.parse(jsonMatch![0]) as T[] };\n}',
      },
      {
        path: 'app/lib/status.ts',
        why: 'Application status constants and small date/slug helpers used by Application Log.',
        when: 'Created with the Application Log tab itself.',
        content: 'export const STATUSES = [\n  \'Applied\',\n  \'Online Assessment\',\n  \'Technical Interview\',\n  \'Offer\',\n  \'Rejected\',\n];\n\nexport function todayStr(): string {\n  const d = new Date();\n  return d.getFullYear() + \'-\' + String(d.getMonth() + 1).padStart(2, \'0\') + \'-\' + String(d.getDate()).padStart(2, \'0\');\n}',
      },
    ],
  },
  {
    group: 'app/data/',
    brief: 'Static seed data that exists independently of anything a user has saved — merged with user data at runtime, not replaced by it.',
    entries: [
      {
        path: 'app/data/companies.ts',
        why: 'The seed company directory, merged at runtime with user-added companies and per-company overrides.',
        when: 'Created with the Career Links tab, before any AI-assist features existed for it.',
        content: 'export const SEED_COMPANIES: Company[] = [\n  { id: \'c1\', name: \'Google\', link: \'https://careers.google.com\', category: \'Global tech\' },\n  // ...\n];\n\nexport function mergeCompanies(custom: Company[], overrides: CompanyOverrides) {\n  // seed + user-added, with per-company field overrides applied on top\n}',
      },
    ],
  },
];

const STARTER_STACK_HINTS = [
  'Express + MongoDB backend',
  'A monorepo with Turborepo',
  'A Vite + React SPA',
  'A Django REST backend',
  'A React Native app',
];

interface FlatRow {
  key: string;
  label: string;
  brief?: string;
  depth: number;
  isGroup: boolean;
  entry?: StructureEntry;
}

function buildRows(groups: StructureGroup[]): FlatRow[] {
  const rows: FlatRow[] = [];
  groups.forEach((g) => {
    rows.push({ key: `group-${g.group}`, label: g.group, brief: g.brief, depth: 0, isGroup: true });
    g.entries.forEach((e) => {
      const clean = e.path.replace(/\/$/, '');
      const segs = clean.split('/');
      const isFolder = e.path.endsWith('/');
      rows.push({
        key: e.path,
        label: segs[segs.length - 1] + (isFolder ? '/' : ''),
        depth: segs.length,
        isGroup: false,
        entry: e,
      });
    });
  });
  return rows;
}

function FileTree({
  rows,
  selectedPath,
  onSelect,
}: {
  rows: FlatRow[];
  selectedPath: string | null;
  onSelect: (e: StructureEntry) => void;
}) {
  return (
    <div className="file-tree">
      <div className="file-tree-legend">
        <span><span className="file-tree-glyph">▸</span> folder</span>
        <span><span className="file-tree-glyph">·</span> file</span>
        <span>hover for a quick preview, click for full detail</span>
      </div>
      {rows.map((r) => {
        if (r.isGroup) {
          return (
            <div className="file-tree-group-wrap" key={r.key}>
              <div className="file-tree-group">{r.label}</div>
              {r.brief && <div className="file-tree-group-brief">{r.brief}</div>}
            </div>
          );
        }
        const isFolder = r.entry!.path.endsWith('/');
        return (
          <div
            key={r.key}
            className={`file-tree-row${isFolder ? ' folder' : ' file'}${
              selectedPath === r.entry!.path ? ' active' : ''
            }`}
            style={{ paddingLeft: 8 + r.depth * 16 }}
            onClick={() => onSelect(r.entry!)}
            data-tooltip={r.entry!.why}
          >
            <span className="file-tree-glyph">{isFolder ? '▸' : '·'}</span>
            <span className="file-tree-name">{r.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function StructurePanel({ groups }: { groups: StructureGroup[] }) {
  const rows = buildRows(groups);
  const allEntries = groups.flatMap((g) => g.entries);
  const [selected, setSelected] = useState<StructureEntry | null>(allEntries[0] || null);

  return (
    <div className="pf-system-layout">
      <FileTree rows={rows} selectedPath={selected?.path || null} onSelect={setSelected} />
      <div className="pf-code-panel">
        {selected ? (
          <>
            <div className="qa-question">
              <code>{selected.path}</code>
            </div>
            <p className="tech-explanation">{selected.why}</p>
            <p className="tech-explanation">
              <strong>When:</strong> {selected.when}
            </p>
            {selected.content ? (
              <CodeBlock code={selected.content} language={languageForPath(selected.path)} />
            ) : (
              <div className="empty-state">
                No example content for this one — it&rsquo;s generated or installed automatically, not something
                you&rsquo;d read or hand-edit.
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">Click a file on the left to see what it contains and why.</div>
        )}
      </div>
    </div>
  );
}

interface ProjectStructureProps {
  structureSets: StructureSet[];
  setStructureSets: Dispatch<SetStateAction<StructureSet[]>>;
  isAdmin: boolean;
}

export default function ProjectStructure({ structureSets, setStructureSets, isAdmin }: ProjectStructureProps) {
  const [stackName, setStackName] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState('');
  const [generatedEntries, setGeneratedEntries] = useState<StructureEntry[] | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  function toggleExpanded(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelected(i: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  async function generate() {
    const stack = stackName.trim();
    if (!stack || !isAdmin) return;
    setGenerating(true);
    setGenerateError('');
    setGeneratedEntries(null);
    try {
      const res = await fetch('/api/structure-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stackName: stack }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setGenerateError(data.error || 'Something went wrong. Try again.');
        return;
      }
      const entries: StructureEntry[] = data.entries || [];
      setGeneratedEntries(entries);
      setSelected(new Set(entries.map((_, i) => i)));
    } catch (err) {
      setGenerateError('Network error — try again.');
    } finally {
      setGenerating(false);
    }
  }

  function saveSelected() {
    if (!generatedEntries || !isAdmin) return;
    const entries = generatedEntries.filter((_, i) => selected.has(i));
    if (entries.length === 0) return;
    setStructureSets((prev) => [
      { id: `struct${Date.now()}${Math.random()}`, stackName: stackName.trim(), entries },
      ...prev,
    ]);
    setGeneratedEntries(null);
    setStackName('');
  }

  function discardGenerated() {
    setGeneratedEntries(null);
    setGenerateError('');
  }

  function deleteSet(id: string) {
    if (!isAdmin) return;
    setStructureSets((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <div className="panel active">
      <p className="guide-intro">
        A file-by-file map for understanding any project's shape — click a file to see why it exists, when it
        actually gets created, and a short realistic excerpt of what it contains. Starts with a generic Next.js/React
        reference, then this app's own real structure as a concrete example, then any stack you want to look up
        below.
      </p>

      <div className="cat-group">
        <div className="cat-title">A generic Next.js / React project</div>
        <StructurePanel groups={GENERIC_STRUCTURE} />
      </div>

      <div className="cat-group">
        <div className="cat-title">This app's own structure (job-logbook)</div>
        <p className="guide-subnote">
          The same principles above, applied to the actual codebase this app is built from. Content shown is a short
          representative excerpt of each file's real shape, not a full byte-for-byte dump.
        </p>
        <StructurePanel groups={APP_STRUCTURE} />
      </div>

      {isAdmin && (
        <div className="add-form qa-form" style={{ marginBottom: 24 }}>
          <div className="cat-title">✦ Explain another stack</div>
          <div className="resume-field-grid">
            <input
              type="text"
              placeholder={`Stack (e.g. "${STARTER_STACK_HINTS[0]}")`}
              value={stackName}
              onChange={(e) => setStackName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && generate()}
            />
            <button className="add-concept-btn" onClick={generate} disabled={generating || !stackName.trim()}>
              {generating ? 'Generating…' : '✦ Generate structure'}
            </button>
          </div>
          <p className="tech-explanation">
            Try:{' '}
            {STARTER_STACK_HINTS.map((h, i) => (
              <span key={h}>
                <button className="ghost-btn" style={{ padding: '2px 8px', fontSize: 11.5 }} onClick={() => setStackName(h)}>
                  {h}
                </button>
                {i < STARTER_STACK_HINTS.length - 1 ? ' ' : ''}
              </span>
            ))}
          </p>

          {generateError && <div className="discover-error">{generateError}</div>}

          {generatedEntries && (
            <div className="suggestions-panel">
              <div className="cat-title">{stackName} — review before saving</div>
              <div className="qa-list">
                {generatedEntries.map((e, i) => (
                  <label className="suggestion-card tech-suggestion-card" key={i}>
                    <input type="checkbox" checked={selected.has(i)} onChange={() => toggleSelected(i)} />
                    <div>
                      <div className="qa-question">
                        <code>{e.path}</code>
                      </div>
                      <p className="tech-explanation">{e.why}</p>
                      <p className="tech-explanation">
                        <strong>When:</strong> {e.when}
                      </p>
                      {e.content && <CodeBlock code={e.content} language={languageForPath(e.path)} />}
                    </div>
                  </label>
                ))}
              </div>
              <div className="edit-actions">
                <button onClick={saveSelected}>+ Save selected as new section</button>
                <button className="ghost-btn" onClick={discardGenerated}>
                  Discard
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {structureSets.length > 0 && (
        <div className="qa-list">
          {structureSets.map((set) => {
            const isExpanded = expandedIds.has(set.id);
            return (
              <div className={`qa-card tech-card${isExpanded ? ' expanded' : ''}`} key={set.id}>
                <div className="qa-question-row tech-card-header" onClick={() => toggleExpanded(set.id)}>
                  <div>
                    <span className="qa-category-tag">{set.entries.length} entries</span>
                    <div className="qa-question">{set.stackName}</div>
                  </div>
                  <div className="tech-card-header-right">
                    {isAdmin && (
                      <div className="qa-actions" onClick={(e) => e.stopPropagation()}>
                        <button className="del-btn" onClick={() => deleteSet(set.id)} title="Delete">
                          ✕
                        </button>
                      </div>
                    )}
                    <span className="tech-chevron">{isExpanded ? '▾' : '▸'}</span>
                  </div>
                </div>
                {isExpanded && <StructurePanel groups={[{ group: set.stackName, entries: set.entries }]} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
