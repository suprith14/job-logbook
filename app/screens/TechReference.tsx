'use client';

import { Dispatch, SetStateAction, useState, useMemo } from 'react';
import CodeBlock from '../components/CodeBlock';
import ProcessFlow from '../components/ProcessFlow';
import type { Difficulty, TechRefEntry, TechRefStep } from '../types';

export const DIFFICULTIES: Difficulty[] = ['Easy', 'Medium', 'Hard'];

// Picks a Prism language so code blocks get relevant syntax highlighting per category.
function languageForCategory(category: string): string {
  if (category === 'TypeScript') return 'typescript';
  if (category === 'React' || category === 'Next.js') return 'jsx';
  return 'javascript';
}

// A short glyph per category so a section is identifiable before reading its label.
// React's atom and Next.js's triangle are their actual logomarks; the rest are short codes.
const CATEGORY_ICON: Record<string, string> = {
  JavaScript: 'JS',
  TypeScript: 'TS',
  React: '⚛',
  'Next.js': '▲',
  'Browser & Web APIs': 'WEB',
  'System Design': 'SYS',
  'Production & Real-World': 'PROD',
};

// Add new topic areas here as they come up — the rest of the screen (filter, add-form,
// starter-pack loader) picks up new categories automatically.
export const TECH_CATEGORIES = [
  'JavaScript',
  'TypeScript',
  'React',
  'Next.js',
  'Browser & Web APIs',
  'System Design',
  'Production & Real-World',
];

export const DEFAULT_TECH_REFS: TechRefEntry[] = [
  // --- JavaScript ---
  {
    id: 'seed-js1',
    category: 'JavaScript',
    topic: 'Closures',
    explanation: 'A function retains access to its outer lexical scope even after the outer function has returned. This is how private state and factory functions work.',
    code: 'function counter() {\n  let count = 0;                 // private variable — not reachable from outside counter()\n  return () => ++count;         // this inner function "closes over" count and keeps it alive\n}\nconst inc = counter();          // counter() runs once and returns the inner function\ninc(); // 1                     // count is remembered between calls, not reset\ninc(); // 2                     // still the same count variable as before',
  },
  {
    id: 'seed-js2',
    category: 'JavaScript',
    topic: 'Event loop: microtasks vs macrotasks',
    explanation: 'The call stack runs synchronous code first. Microtasks (Promises, queueMicrotask) fully drain before the next macrotask (setTimeout, I/O, UI events) runs.',
    code: "console.log('1');                                // synchronous — runs immediately\nsetTimeout(() => console.log('2'), 0);           // macrotask — queued, waits for its turn\nPromise.resolve().then(() => console.log('3'));  // microtask — runs before any macrotask\nconsole.log('4');                                // still synchronous, runs before callbacks\n// Output order: 1 4 3 2 — sync code, then all microtasks, then macrotasks",
  },
  {
    id: 'seed-js3',
    category: 'JavaScript',
    topic: '"this" binding: arrow vs regular functions',
    explanation: 'Regular functions get "this" from the call site (how they were invoked). Arrow functions have no own "this" — they inherit it lexically from where they were defined.',
    code: 'const obj = {\n  name: "A",                          // a plain property\n  regular() { return this.name; },   // "this" depends on how regular() is called (obj.regular())\n  arrow: () => this?.name,           // "this" is inherited from where obj itself was defined, not from the caller\n};',
  },
  {
    id: 'seed-js4',
    category: 'JavaScript',
    topic: 'Prototypal inheritance',
    explanation: 'Objects delegate property lookups to a prototype chain instead of copying from a class. "class" syntax, Object.create, and __proto__ are all sugar over the same prototype chain.',
    code: '',
  },
  {
    id: 'seed-js5',
    category: 'JavaScript',
    topic: 'Debounce vs throttle',
    explanation: 'Debounce delays execution until calls stop happening for a period (good for search-as-you-type). Throttle guarantees execution at most once per interval (good for scroll/resize handlers).',
    code: 'function debounce(fn, ms) {\n  let t; // holds the pending timer so later calls can cancel it\n  return (...args) => {\n    clearTimeout(t);                       // cancel whatever was previously scheduled\n    t = setTimeout(() => fn(...args), ms); // schedule a fresh call, ms after this last call\n  };\n}',
  },
  {
    id: 'seed-js-common1',
    category: 'JavaScript',
    topic: 'Deep clone an object',
    explanation: 'structuredClone() natively deep-clones any structured-cloneable value (objects, arrays, Maps, Dates) with no library needed. The JSON fallback works for plain data but silently drops functions/undefined and turns Dates into strings.',
    code: 'const clone = structuredClone(original); // native deep clone — keeps Dates, Maps, Sets intact\n\n// fallback for older environments (plain data only):\nconst clone2 = JSON.parse(JSON.stringify(original)); // stringify then reparse — loses functions/undefined, Dates become strings',
  },
  {
    id: 'seed-js-common2',
    category: 'JavaScript',
    topic: 'Remove duplicates from an array',
    explanation: 'A Set only stores unique values, so spreading it back into an array is the shortest way to dedupe a list of primitives.',
    code: 'const unique = [...new Set(arr)]; // Set keeps only unique values; spread turns it back into an array',
  },
  {
    id: 'seed-js-common3',
    category: 'JavaScript',
    topic: 'Flatten a nested array',
    explanation: 'flat(Infinity) collapses an array nested to any depth down to one flat array in a single call.',
    code: 'const flat = nested.flat(Infinity); // Infinity as the depth flattens any level of nesting',
  },
  {
    id: 'seed-js-common4',
    category: 'JavaScript',
    topic: 'Group array items by a key',
    explanation: 'A reduce that buckets items into an object keyed by whatever function you pass in — probably the most-reused array utility beyond map/filter/reduce themselves.',
    code: 'function groupBy(arr, keyFn) {\n  return arr.reduce((acc, item) => {\n    const key = keyFn(item);       // which bucket this item belongs to\n    (acc[key] ||= []).push(item);  // create the bucket array if it doesn\'t exist yet, then push into it\n    return acc;                    // carry the growing object into the next iteration\n  }, {});                          // {} is the starting (empty) accumulator\n}',
  },
  {
    id: 'seed-js-common5',
    category: 'JavaScript',
    topic: 'Sleep / delay inside async code',
    explanation: 'Wrapping setTimeout in a Promise lets you "await" a pause anywhere inside an async function — used for polling, staggered retries, or simulating latency.',
    code: 'const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)); // resolves after ms milliseconds\n\nawait sleep(1000); // pauses this async function here for 1 second',
  },
  {
    id: 'seed-js-common6',
    category: 'JavaScript',
    topic: 'Retry an async function with backoff',
    explanation: 'Wraps a flaky async call (a network request, a third-party API) so it retries a few times with an increasing delay before finally throwing.',
    code: 'async function retry(fn, attempts = 3, delay = 300) {\n  for (let i = 0; i < attempts; i++) {    // try up to `attempts` times\n    try {\n      return await fn();                  // success — stop here and return the result\n    } catch (err) {\n      if (i === attempts - 1) throw err;    // out of attempts — give up and rethrow\n      await sleep(delay * 2 ** i);          // wait longer after each failure (exponential backoff)\n    }\n  }\n}',
  },
  {
    id: 'seed-js-common7',
    category: 'JavaScript',
    topic: 'Throttle a function',
    explanation: 'Guarantees a function runs at most once per interval, dropping extra calls in between — used for scroll/resize/mousemove handlers where debounce would feel laggy.',
    code: 'function throttle(fn, ms) {\n  let last = 0;                    // timestamp of the last time fn actually ran\n  return (...args) => {\n    const now = Date.now();\n    if (now - last >= ms) {        // enough time has passed since the last run\n      last = now;                 // record this run\'s time\n      fn(...args);                // actually call the function\n    }                             // otherwise: silently drop this call\n  };\n}',
  },
  {
    id: 'seed-js-common8',
    category: 'JavaScript',
    topic: 'Memoize a function',
    explanation: "Caches a pure function's return value by its arguments so repeated calls with the same input skip recomputation entirely — only safe for deterministic, side-effect-free functions.",
    code: 'function memoize(fn) {\n  const cache = new Map();                  // stores past results keyed by their arguments\n  return (...args) => {\n    const key = JSON.stringify(args);       // turn the arguments into a lookup key\n    if (!cache.has(key)) cache.set(key, fn(...args)); // only compute if we haven\'t seen this input before\n    return cache.get(key);                  // return the cached (or just-computed) result\n  };\n}',
  },
  {
    id: 'seed-js-common9',
    category: 'JavaScript',
    topic: 'Chunk an array into groups of N',
    explanation: 'Splits one flat array into an array of fixed-size sub-arrays — common for batching API calls or paginating a UI grid.',
    code: 'function chunk(arr, size) {\n  return Array.from(\n    { length: Math.ceil(arr.length / size) }, // how many chunks we\'ll end up with\n    (_, i) => arr.slice(i * size, i * size + size) // slice out the i-th chunk of `size` items\n  );\n}',
  },
  {
    id: 'seed-js-common10',
    category: 'JavaScript',
    topic: 'Shuffle an array (Fisher–Yates)',
    explanation: 'The correct, unbiased way to shuffle in place. arr.sort(() => Math.random() - 0.5) is a common shortcut but is not actually uniformly random.',
    code: 'function shuffle(arr) {\n  for (let i = arr.length - 1; i > 0; i--) {        // walk backwards from the last index\n    const j = Math.floor(Math.random() * (i + 1)); // pick a random index from 0..i (inclusive)\n    [arr[i], arr[j]] = [arr[j], arr[i]];            // swap the two elements in place\n  }\n  return arr; // same array reference, now shuffled\n}',
  },
  {
    id: 'seed-js-common11',
    category: 'JavaScript',
    topic: 'Curry a function',
    explanation: 'Turns a function that takes multiple arguments into a chain of single-argument functions, so you can partially apply arguments ahead of time.',
    code: 'const curry = (fn) => (...args) =>\n  args.length >= fn.length            // do we already have as many args as fn expects?\n    ? fn(...args)                      // yes — call it for real now\n    : curry(fn.bind(null, ...args));   // no — lock in these args and return a function waiting for more',
  },
  {
    id: 'seed-js-common12',
    category: 'JavaScript',
    topic: 'Compose / pipe functions',
    explanation: 'Combines several single-argument functions into one. pipe runs left-to-right, compose runs right-to-left — the basis of functional-style data transforms.',
    code: 'const pipe = (...fns) => (x) => fns.reduce((v, fn) => fn(v), x);        // runs fns left-to-right, x is the starting value\nconst compose = (...fns) => (x) => fns.reduceRight((v, fn) => fn(v), x); // runs fns right-to-left',
  },
  {
    id: 'seed-js-common13',
    category: 'JavaScript',
    topic: 'Deep merge two objects',
    explanation: 'Object.assign / spread only merge one level deep — a nested object gets overwritten wholesale instead of combined. A recursive merge is needed for nested config-style objects.',
    code: 'function deepMerge(target, source) {\n  for (const key in source) {\n    if (source[key] instanceof Object && key in target) {\n      // both sides have an object at this key — merge those nested objects recursively first\n      Object.assign(source[key], deepMerge(target[key], source[key]));\n    }\n  }\n  return { ...target, ...source }; // shallow merge on top; source\'s primitive values win\n}',
  },
  {
    id: 'seed-js-common14',
    category: 'JavaScript',
    topic: 'Fetch with a timeout',
    explanation: "fetch has no built-in timeout option — pair it with AbortController so a hung request doesn't wait forever.",
    code: 'async function fetchWithTimeout(url, ms = 5000) {\n  const controller = new AbortController();           // lets us cancel the request manually\n  const id = setTimeout(() => controller.abort(), ms); // auto-cancel after ms milliseconds\n  try {\n    return await fetch(url, { signal: controller.signal }); // fetch listens for the abort signal\n  } finally {\n    clearTimeout(id); // request finished in time — cancel the pending abort\n  }\n}',
  },
  {
    id: 'seed-js-common15',
    category: 'JavaScript',
    topic: 'Generate a unique ID',
    explanation: 'crypto.randomUUID() gives a spec-compliant UUID natively in modern browsers and Node — no library needed for most use cases.',
    code: 'const id = crypto.randomUUID(); // e.g. "3f9a1e2b-6c4d-4a3b-9f21-3d8e7c1a2b90" — spec-compliant, no library needed',
  },
  {
    id: 'seed-js-common16',
    category: 'JavaScript',
    topic: 'Array intersection, union, and difference',
    explanation: 'Converting both arrays to Sets makes these O(n) instead of nested loops, and reads clearly as what it is doing.',
    code: 'const intersection = (a, b) => [...new Set(a)].filter((x) => new Set(b).has(x)); // items present in both arrays\nconst union = (a, b) => [...new Set([...a, ...b])];                              // all items, duplicates removed\nconst difference = (a, b) => a.filter((x) => !new Set(b).has(x));               // items in a that are not in b',
  },

  // --- TypeScript ---
  {
    id: 'seed-ts1',
    category: 'TypeScript',
    topic: 'interface vs type',
    explanation: 'Interfaces can be merged (declaration merging) and are the conventional choice for object shapes. "type" can express unions, intersections, and mapped types that interfaces cannot.',
    code: 'type Status = "idle" | "loading" | "error"; // union — only "type" can do this\ninterface User { name: string; }             // mergeable object shape',
  },
  {
    id: 'seed-ts2',
    category: 'TypeScript',
    topic: 'Generics',
    explanation: 'Write a function or component once so it works across many types while still preserving the specific type information at each call site.',
    code: 'function identity<T>(value: T): T {  // T is a placeholder for whatever type gets passed in\n  return value;                       // the return type matches the input type exactly\n}\nidentity<string>("hi"); // T inferred as string, so this returns a string, not "any"',
  },
  {
    id: 'seed-ts3',
    category: 'TypeScript',
    topic: 'Utility types: Partial, Pick, Omit, Record',
    explanation: 'Partial<T> makes every property optional. Pick<T, K> keeps only the listed keys. Omit<T, K> removes them. Record<K, V> builds an object type from a union of keys.',
    code: 'interface User { id: string; name: string; email: string; }\ntype UserPreview = Pick<User, "id" | "name">;  // only { id, name } — email is dropped\ntype UserUpdate = Partial<Omit<User, "id">>;   // { name?, email? } — id removed, the rest made optional',
  },
  {
    id: 'seed-ts4',
    category: 'TypeScript',
    topic: 'Discriminated unions',
    explanation: 'A shared literal field (e.g. "kind") lets TypeScript narrow to the exact matching shape inside each branch of a switch or if — no manual casting needed.',
    code: 'type Shape =\n  | { kind: "circle"; radius: number }  // "kind" is the discriminant field\n  | { kind: "square"; side: number };\n\nfunction area(s: Shape) {\n  if (s.kind === "circle") return Math.PI * s.radius ** 2; // TS narrows s to have .radius here\n  return s.side ** 2;                                      // and narrows s to have .side here\n}',
  },
  {
    id: 'seed-ts5',
    category: 'TypeScript',
    topic: 'unknown vs any',
    explanation: '"any" disables type checking entirely — it spreads silently through your code. "unknown" is the type-safe counterpart: you must narrow or assert it before you can use it, so it is the safer default for untyped input like API responses.',
    code: '',
  },

  // --- React ---
  {
    id: 'seed-react1',
    category: 'React',
    topic: 'useEffect cleanup',
    explanation: 'Returning a function from useEffect cleans up subscriptions, timers, or listeners before the effect re-runs or the component unmounts — the most common source of memory leaks when skipped.',
    code: 'useEffect(() => {\n  const id = setInterval(tick, 1000);  // start the interval when the component mounts\n  return () => clearInterval(id);      // cleanup — stop it before unmount or before this effect re-runs\n}, []); // empty deps array — run once on mount, clean up once on unmount',
  },
  {
    id: 'seed-react2',
    category: 'React',
    topic: 'useMemo vs useCallback',
    explanation: 'useMemo memoizes a computed value; useCallback memoizes a function reference. Both exist to avoid unnecessary re-renders in children or unstable dependency-array entries — not to make plain computations "faster."',
    code: 'const total = useMemo(() => items.reduce((a, b) => a + b.price, 0), [items]); // only recompute when items changes\nconst onClick = useCallback(() => doThing(id), [id]); // same function reference unless id changes',
  },
  {
    id: 'seed-react3',
    category: 'React',
    topic: 'Controlled vs uncontrolled components',
    explanation: 'Controlled: React state is the single source of truth (value + onChange together). Uncontrolled: the DOM itself holds the value, read via a ref when needed.',
    code: '',
  },
  {
    id: 'seed-react4',
    category: 'React',
    topic: 'Reconciliation and keys',
    explanation: 'React diffs list children by "key", not by position. A stable, unique key (never array index for reorderable lists) prevents state and DOM nodes from leaking between items when the list changes.',
    code: '',
  },
  {
    id: 'seed-react5',
    category: 'React',
    topic: 'Context re-render pitfall',
    explanation: 'Every consumer of a Context re-renders whenever the Provider value changes, even if a consumer only reads part of it. Split contexts by concern, or memoize the provided value, to avoid unnecessary re-renders.',
    code: '',
  },

  // --- Next.js ---
  {
    id: 'seed-next1',
    category: 'Next.js',
    topic: 'Server vs Client Components (App Router)',
    explanation: 'Server Components render on the server and ship no JS to the client by default. Add "use client" only on the components that actually need state, effects, or browser APIs — keeping the rest server-only cuts bundle size.',
    code: "'use client'; // opts this file into the client bundle\n// only needed here because this component uses useState — everything else can stay a Server Component",
  },
  {
    id: 'seed-next2',
    category: 'Next.js',
    topic: 'Data fetching and caching',
    explanation: 'fetch() inside a Server Component is cached and deduplicated by default in the App Router. Opt out with { cache: "no-store" } for always-fresh data, or use { next: { revalidate: N } } for time-based revalidation.',
    code: 'await fetch(url, { cache: "no-store" });        // never cache — always hit the network\nawait fetch(url, { next: { revalidate: 60 } });  // cache the response, refresh it at most every 60 seconds',
  },
  {
    id: 'seed-next3',
    category: 'Next.js',
    topic: 'Route handlers replace API routes',
    explanation: 'app/api/*/route.ts exports one function per HTTP verb (GET, POST, etc.) instead of a single default handler with a method switch, like the old pages/api style.',
    code: 'export async function GET() { ... }          // handles GET requests to this route\nexport async function POST(request) { ... }  // handles POST requests, receives the Request object',
  },
  {
    id: 'seed-next4',
    category: 'Next.js',
    topic: 'Rendering strategies',
    explanation: 'Static (built once at build time), Server-side rendered (per request, always fresh), and ISR (static but revalidated on an interval) — pick per route based on how fresh the data actually needs to be.',
    code: '',
  },

  // --- Browser & Web APIs ---
  {
    id: 'seed-b1',
    category: 'Browser & Web APIs',
    topic: 'Event delegation',
    explanation: 'Attach one listener to a parent element and read event.target instead of attaching a listener to every child. Fewer listeners, and it automatically works for children added later.',
    code: 'list.addEventListener("click", (e) => {                  // one listener on the parent, not one per <li>\n  if (e.target.matches("li")) handleItemClick(e.target); // check which element was actually clicked\n});',
  },
  {
    id: 'seed-b2',
    category: 'Browser & Web APIs',
    topic: 'localStorage vs sessionStorage vs cookies',
    explanation: 'localStorage persists across tabs and browser restarts. sessionStorage is scoped to one tab. Cookies are the only one of the three sent to the server automatically on every request, and have an expiry/size model of their own.',
    code: '',
  },
  {
    id: 'seed-b3',
    category: 'Browser & Web APIs',
    topic: 'Critical rendering path',
    explanation: 'The browser parses HTML into the DOM, CSS into the CSSOM, combines them into a render tree, computes layout, then paints. Render-blocking CSS/JS placed in <head> delays first paint.',
    code: '',
  },
  {
    id: 'seed-b4',
    category: 'Browser & Web APIs',
    topic: 'CORS',
    explanation: 'The browser — not the server — blocks reading a cross-origin response unless the server sends matching Access-Control-Allow-* headers. The request often still reaches the server; the response just gets withheld from JS.',
    code: '',
  },
  {
    id: 'seed-b5',
    category: 'Browser & Web APIs',
    topic: 'What happens when you type a URL and press Enter',
    explanation: 'One of the most common interview questions there is — walks through DNS, the TCP/TLS handshakes, the actual HTTP exchange, and how the browser turns the response into a rendered page. Play through the sequence below.',
    code: '',
    difficulty: 'Medium',
    steps: [
      {
        title: 'DNS Lookup',
        detail: 'The browser asks a DNS resolver to translate the domain name into an IP address — checking its own cache first, then the OS cache, then a recursive resolver (often your ISP\'s, or a public one like 8.8.8.8).',
        from: 'Browser',
        to: 'DNS Resolver',
      },
      {
        title: 'TCP Handshake',
        detail: 'The browser opens a TCP connection to that IP (usually port 443) via a three-way handshake: SYN, SYN-ACK, ACK — before any actual data is exchanged.',
        from: 'Browser',
        to: 'Server',
      },
      {
        title: 'TLS Handshake',
        detail: 'For HTTPS, browser and server negotiate encryption: exchanging certificates, verifying identity, and agreeing on a shared session key — all before a single byte of HTTP is sent.',
        from: 'Browser',
        to: 'Server',
      },
      {
        title: 'HTTP Request Sent',
        detail: 'The browser sends an HTTP request — method, headers, cookies — over the now-encrypted connection, asking for the page.',
        from: 'Browser',
        to: 'Server',
      },
      {
        title: 'Server Processes the Request',
        detail: 'The server (or a CDN/edge cache in front of it) runs its logic — querying a database, rendering a template, or simply returning something already cached — and builds an HTTP response.',
        from: 'Server',
        to: 'Server',
      },
      {
        title: 'HTTP Response Returned',
        detail: 'The server sends back a status code, headers, and a response body (typically HTML) over that same connection.',
        from: 'Server',
        to: 'Browser',
      },
      {
        title: 'Browser Parses and Renders',
        detail: 'The browser parses HTML into the DOM and CSS into the CSSOM, combines them into a render tree, computes layout, and paints pixels — fetching any additional CSS, JS, or images it discovers along the way.',
        from: 'Browser',
        to: 'Browser',
      },
    ],
  },

  // --- System Design ---
  {
    id: 'seed-sd1',
    category: 'System Design',
    topic: 'Caching layers',
    explanation: 'Browser cache → CDN → server-side cache (Redis) → database, each layer trading freshness for speed. In practice the invalidation strategy matters more than picking the cache technology.',
    code: '',
  },
  {
    id: 'seed-sd2',
    category: 'System Design',
    topic: 'Horizontal vs vertical scaling',
    explanation: 'Vertical scaling means a bigger machine — simple, but has a ceiling and stays a single point of failure. Horizontal scaling means more machines behind a load balancer — needs stateless services and shared session/data storage to work.',
    code: '',
  },
  {
    id: 'seed-sd3',
    category: 'System Design',
    topic: 'Rate limiting',
    explanation: 'Token-bucket or sliding-window counters at the API gateway or middleware layer protect backend services from abuse or traffic spikes — usually backed by Redis so the count is shared across instances.',
    code: '',
  },
  {
    id: 'seed-sd4',
    category: 'System Design',
    topic: 'Database indexing tradeoffs',
    explanation: 'Indexes speed up reads but slow down writes and use extra storage. Index the columns you actually filter, sort, or join on — not every column "just in case."',
    code: '',
  },

  // --- Production & Real-World ---
  {
    id: 'seed-pr1',
    category: 'Production & Real-World',
    topic: 'Race conditions on concurrent writes',
    explanation: 'Two requests reading, then writing, the same record can silently overwrite each other. Fix with optimistic locking (a version column checked on write) or an atomic DB operation instead of read-modify-write in application code.',
    code: '',
  },
  {
    id: 'seed-pr2',
    category: 'Production & Real-World',
    topic: 'Memory leaks from event listeners',
    explanation: 'Forgetting to remove a listener or subscription on unmount (or on an SPA route change) keeps components alive in memory indefinitely. Always pair addEventListener with removeEventListener in a cleanup function.',
    code: '',
  },
  {
    id: 'seed-pr3',
    category: 'Production & Real-World',
    topic: 'Silent failures behind try/catch',
    explanation: 'A catch block that only logs to the console (or does nothing) hides real production incidents. Report caught errors to an error tracker and fail loudly enough that someone notices, instead of swallowing them.',
    code: '',
  },
  {
    id: 'seed-pr4',
    category: 'Production & Real-World',
    topic: 'Cache invalidation bugs',
    explanation: 'Stale cached data after a write is one of the most common production bugs. Decide explicitly whether to invalidate, update the cache in place, or rely on a short TTL — don\'t leave it to chance.',
    code: '',
  },
];

interface TechReferenceProps {
  techRefs: TechRefEntry[];
  setTechRefs: Dispatch<SetStateAction<TechRefEntry[]>>;
  isAdmin: boolean;
}

interface EntryDraft {
  topic: string;
  explanation: string;
  code: string;
  difficulty: Difficulty;
  stepsText: string;
}

interface EditDraft extends EntryDraft {
  category: string;
}

const EMPTY_DRAFT: EntryDraft = { topic: '', explanation: '', code: '', difficulty: 'Medium', stepsText: '' };

// One step per line, written as "Title | what happens in this step".
// One step per line: "Title | what happens" or, to draw an actor diagram,
// "Title | From -> To | what happens" (From === To marks an internal/self step).
function parseStepsText(text: string): TechRefStep[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split('|').map((p) => p.trim());
      const title = parts[0] || '';
      if (parts.length >= 3 && parts[1].includes('->')) {
        const [from, to] = parts[1].split('->').map((p) => p.trim());
        return { title, detail: parts.slice(2).join('|').trim(), from: from || undefined, to: to || undefined };
      }
      return { title, detail: parts.slice(1).join('|').trim() };
    })
    .filter((s) => s.title);
}

function stepsToText(steps?: TechRefStep[]): string {
  return (steps || [])
    .map((s) => {
      const parts = [s.title];
      if (s.from && s.to) parts.push(`${s.from} -> ${s.to}`);
      if (s.detail) parts.push(s.detail);
      return parts.join(' | ');
    })
    .join('\n');
}

interface SuggestedConcept {
  topic: string;
  explanation: string;
  code: string;
}

export default function TechReference({ techRefs, setTechRefs, isAdmin }: TechReferenceProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [addingCategory, setAddingCategory] = useState<string | null>(null);
  const [newEntry, setNewEntry] = useState<EntryDraft>(EMPTY_DRAFT);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBuffer, setEditBuffer] = useState<EditDraft>({ ...EMPTY_DRAFT, category: TECH_CATEGORIES[0] });
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  function toggleExpanded(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const [suggestingCategory, setSuggestingCategory] = useState<string | null>(null);
  const [suggestDifficulty, setSuggestDifficulty] = useState<Difficulty>('Medium');
  const [suggestions, setSuggestions] = useState<SuggestedConcept[] | null>(null);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(new Set());
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [suggestError, setSuggestError] = useState('');

  function openAddForm(category: string) {
    if (!isAdmin) return;
    setAddingCategory(category);
    setNewEntry(EMPTY_DRAFT);
  }

  function cancelAdd() {
    setAddingCategory(null);
    setNewEntry(EMPTY_DRAFT);
  }

  async function findConcepts(category: string) {
    if (!isAdmin) return;
    setSuggestingCategory(category);
    setSuggestDifficulty(difficulty);
    setSuggestLoading(true);
    setSuggestError('');
    setSuggestions(null);
    try {
      const existingTopics = techRefs.filter((e) => e.category === category).map((e) => e.topic);
      const res = await fetch('/api/tech-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, existingTopics, difficulty }),
      });
      const data = await res.json();
      if (data.error) {
        setSuggestError(data.error);
      } else {
        const concepts: SuggestedConcept[] = data.concepts || [];
        setSuggestions(concepts);
        setSelectedSuggestions(new Set(concepts.map((c) => c.topic)));
      }
    } catch (err) {
      setSuggestError(String(err));
    } finally {
      setSuggestLoading(false);
    }
  }

  function toggleSuggestion(topic: string) {
    setSelectedSuggestions((prev) => {
      const next = new Set(prev);
      if (next.has(topic)) next.delete(topic);
      else next.add(topic);
      return next;
    });
  }

  function dismissSuggestions() {
    setSuggestingCategory(null);
    setSuggestions(null);
    setSuggestError('');
  }

  function addSelectedSuggestions(category: string) {
    if (!isAdmin || !suggestions) return;
    const toAdd = suggestions
      .filter((c) => selectedSuggestions.has(c.topic))
      .map((c) => ({
        id: `t${Date.now()}${Math.random()}`,
        category,
        topic: c.topic,
        explanation: c.explanation,
        code: c.code || '',
        difficulty: suggestDifficulty,
      }));
    setTechRefs((prev) => [...toAdd, ...prev]);
    dismissSuggestions();
  }

  function submitAdd(category: string) {
    if (!isAdmin) return;
    const topic = newEntry.topic.trim();
    const explanation = newEntry.explanation.trim();
    if (!topic || !explanation) return;
    setTechRefs((prev) => [
      {
        id: `t${Date.now()}${Math.random()}`,
        category,
        topic,
        explanation,
        code: newEntry.code.trim(),
        difficulty: newEntry.difficulty,
        steps: parseStepsText(newEntry.stepsText),
      },
      ...prev,
    ]);
    setNewEntry(EMPTY_DRAFT);
    setAddingCategory(null);
  }

  function deleteEntry(id: string) {
    if (!isAdmin) return;
    setTechRefs((prev) => prev.filter((e) => e.id !== id));
  }

  function startEdit(entry: TechRefEntry) {
    if (!isAdmin) return;
    setEditingId(entry.id);
    setEditBuffer({
      category: entry.category,
      topic: entry.topic,
      explanation: entry.explanation,
      code: entry.code,
      difficulty: entry.difficulty || 'Medium',
      stepsText: stepsToText(entry.steps),
    });
  }

  function saveEdit(id: string) {
    const topic = editBuffer.topic.trim();
    const explanation = editBuffer.explanation.trim();
    if (!topic || !explanation) return;
    setTechRefs((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              category: editBuffer.category,
              topic,
              explanation,
              code: editBuffer.code.trim(),
              difficulty: editBuffer.difficulty,
              steps: parseStepsText(editBuffer.stepsText),
            }
          : e
      )
    );
    setEditingId(null);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  function loadStarterPack() {
    if (!isAdmin) return;
    const existing = new Set(techRefs.map((e) => e.topic.trim().toLowerCase()));
    const toAdd = DEFAULT_TECH_REFS.filter((e) => !existing.has(e.topic.trim().toLowerCase()));
    if (toAdd.length === 0) return;
    setTechRefs((prev) => [...toAdd, ...prev]);
  }

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return techRefs.filter((e) => !s || e.topic.toLowerCase().includes(s) || e.explanation.toLowerCase().includes(s));
  }, [techRefs, search]);

  const categoriesToShow = categoryFilter ? [categoryFilter] : TECH_CATEGORIES;

  return (
    <div className="panel active">
      <p className="guide-intro">
        A fast-scan reference across the areas that come up most in technical interviews. Click "✦ Find concepts"
        under any category to have Gemini suggest new ones — review and pick which to keep, nothing is added until
        you confirm. "+ Add concept" is still there if you'd rather write one yourself.
      </p>

      <div className="dir-controls">
        <input
          type="text"
          placeholder="Search topics…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="">All categories</option>
          {TECH_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        {isAdmin && (
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            title="Difficulty used the next time you click Find concepts"
          >
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>
                {d} concepts
              </option>
            ))}
          </select>
        )}
      </div>

      {isAdmin && (
        <button className="ghost-btn resume-add-btn" onClick={loadStarterPack} style={{ marginBottom: 20 }}>
          {techRefs.length === 0
            ? `+ Load starter pack (${DEFAULT_TECH_REFS.length} entries across ${TECH_CATEGORIES.length} topics)`
            : '+ Add any missing starter-pack entries'}
        </button>
      )}

      {categoriesToShow.map((category) => {
        const entries = filtered.filter((e) => e.category === category);
        return (
          <div className="cat-group" key={category}>
            <div className="cat-title-row">
              <div className="cat-title">
                <span className="cat-icon">{CATEGORY_ICON[category] || category.slice(0, 2).toUpperCase()}</span>
                {category}
              </div>
              {isAdmin && (
                <div className="cat-title-actions">
                  <button
                    className="add-concept-btn"
                    onClick={() => findConcepts(category)}
                    disabled={suggestLoading && suggestingCategory === category}
                  >
                    {suggestLoading && suggestingCategory === category ? 'Searching…' : `✦ Find ${difficulty} concepts`}
                  </button>
                  <button className="add-concept-btn" onClick={() => openAddForm(category)}>
                    + Add concept
                  </button>
                </div>
              )}
            </div>

            {suggestingCategory === category && suggestError && (
              <div className="discover-error">{suggestError}</div>
            )}

            {suggestingCategory === category && suggestions && suggestions.length > 0 && (
              <div className="suggestions-panel">
                <div className="cat-title">Suggested {suggestDifficulty} concepts — review before adding</div>
                <div className="qa-list">
                  {suggestions.map((c) => (
                    <label className="suggestion-card tech-suggestion-card" key={c.topic}>
                      <input
                        type="checkbox"
                        checked={selectedSuggestions.has(c.topic)}
                        onChange={() => toggleSuggestion(c.topic)}
                      />
                      <div>
                        <span className={`difficulty-tag difficulty-${suggestDifficulty.toLowerCase()}`}>{suggestDifficulty}</span>
                        <div className="qa-question">{c.topic}</div>
                        <p className="tech-explanation">{c.explanation}</p>
                        {c.code && <CodeBlock code={c.code} language={languageForCategory(category)} />}
                      </div>
                    </label>
                  ))}
                </div>
                <div className="suggestions-actions">
                  <button onClick={() => addSelectedSuggestions(category)}>
                    Add selected ({selectedSuggestions.size})
                  </button>
                  <button className="ghost-btn" onClick={dismissSuggestions}>
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {suggestingCategory === category && suggestions && suggestions.length === 0 && (
              <div className="empty-state">No new suggestions this time — try again in a bit.</div>
            )}

            {isAdmin && addingCategory === category && (
              <div className="add-form qa-form">
                <select value={newEntry.difficulty} onChange={(e) => setNewEntry({ ...newEntry, difficulty: e.target.value as Difficulty })}>
                  {DIFFICULTIES.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Topic (e.g. Closures, useEffect cleanup, Rate limiting)…"
                  value={newEntry.topic}
                  onChange={(e) => setNewEntry({ ...newEntry, topic: e.target.value })}
                  autoFocus
                />
                <textarea
                  className="qa-textarea"
                  rows={2}
                  placeholder="Short explanation — the part you'd actually say out loud"
                  value={newEntry.explanation}
                  onChange={(e) => setNewEntry({ ...newEntry, explanation: e.target.value })}
                />
                <textarea
                  className="qa-textarea mono-textarea"
                  rows={3}
                  placeholder="Code example (optional) — add a // comment on each line explaining what it does"
                  value={newEntry.code}
                  onChange={(e) => setNewEntry({ ...newEntry, code: e.target.value })}
                />
                <textarea
                  className="qa-textarea"
                  rows={3}
                  placeholder={'Process flow steps (optional) — one per line:\nTitle | what happens\nor, for an animated actor diagram: Title | From -> To | what happens\ne.g. DNS Lookup | Browser -> DNS Resolver | Resolves the domain to an IP address'}
                  value={newEntry.stepsText}
                  onChange={(e) => setNewEntry({ ...newEntry, stepsText: e.target.value })}
                />
                <div className="edit-actions">
                  <button onClick={() => submitAdd(category)}>Add to {category}</button>
                  <button className="ghost-btn" onClick={cancelAdd}>Cancel</button>
                </div>
              </div>
            )}

            {entries.length === 0 ? (
              <div className="empty-state">
                {search ? 'No entries match that search in this category.' : 'Nothing here yet.'}
              </div>
            ) : (
              <div className="qa-list">
                {entries.map((entry) => {
                  const isEditing = editingId === entry.id;
                  if (isEditing) {
                    return (
                      <div className="qa-card editing" key={entry.id}>
                        <select value={editBuffer.category} onChange={(e) => setEditBuffer({ ...editBuffer, category: e.target.value })}>
                          {TECH_CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                        <select value={editBuffer.difficulty} onChange={(e) => setEditBuffer({ ...editBuffer, difficulty: e.target.value as Difficulty })}>
                          {DIFFICULTIES.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={editBuffer.topic}
                          onChange={(e) => setEditBuffer({ ...editBuffer, topic: e.target.value })}
                          placeholder="Topic"
                        />
                        <textarea
                          className="qa-textarea"
                          rows={2}
                          value={editBuffer.explanation}
                          onChange={(e) => setEditBuffer({ ...editBuffer, explanation: e.target.value })}
                          placeholder="Explanation"
                        />
                        <textarea
                          className="qa-textarea mono-textarea"
                          rows={3}
                          value={editBuffer.code}
                          onChange={(e) => setEditBuffer({ ...editBuffer, code: e.target.value })}
                          placeholder="Code example (optional) — add a // comment on each line explaining what it does"
                        />
                        <textarea
                          className="qa-textarea"
                          rows={3}
                          value={editBuffer.stepsText}
                          onChange={(e) => setEditBuffer({ ...editBuffer, stepsText: e.target.value })}
                          placeholder={'Process flow steps (optional) — Title | what happens, or Title | From -> To | what happens'}
                        />
                        <div className="edit-actions">
                          <button onClick={() => saveEdit(entry.id)}>Save</button>
                          <button className="ghost-btn" onClick={cancelEdit}>Cancel</button>
                        </div>
                      </div>
                    );
                  }
                  const isExpanded = expandedIds.has(entry.id);
                  return (
                    <div className={`qa-card tech-card${isExpanded ? ' expanded' : ''}`} key={entry.id}>
                      <div className="qa-question-row tech-card-header" onClick={() => toggleExpanded(entry.id)}>
                        <div>
                          {entry.difficulty && (
                            <span className={`difficulty-tag difficulty-${entry.difficulty.toLowerCase()}`}>{entry.difficulty}</span>
                          )}
                          <div className="qa-question">{entry.topic}</div>
                        </div>
                        <div className="tech-card-header-right">
                          {isAdmin && (
                            <div className="qa-actions" onClick={(e) => e.stopPropagation()}>
                              <button className="edit-icon" onClick={() => startEdit(entry)} title="Edit">
                                ✎
                              </button>
                              <button className="del-btn" onClick={() => deleteEntry(entry.id)} title="Delete">
                                ✕
                              </button>
                            </div>
                          )}
                          <span className="tech-chevron">{isExpanded ? '▾' : '▸'}</span>
                        </div>
                      </div>
                      {isExpanded && (
                        <>
                          <p className="tech-explanation">{entry.explanation}</p>
                          {entry.steps && entry.steps.length > 0 && <ProcessFlow steps={entry.steps} title={entry.topic} />}
                          {entry.code && <CodeBlock code={entry.code} language={languageForCategory(entry.category)} />}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
