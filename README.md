# The Logbook — Daily Job Application Tracker

A small Next.js app: direct company career links, a daily 15-application goal
ladder, and an application log. Data is stored in a database (not the browser),
so it syncs across your phone and laptop.

## 1. Push this folder to GitHub

```bash
cd job-logbook
git init
git add .
git commit -m "Initial commit"
```

Create a new empty repo on https://github.com/new, then:

```bash
git remote add origin https://github.com/<your-username>/job-logbook.git
git branch -M main
git push -u origin main
```

## 2. Deploy to Vercel

1. Go to https://vercel.com/new and import the GitHub repo you just pushed.
2. Framework preset should auto-detect as **Next.js** — leave defaults, click **Deploy**.
3. The first deploy will succeed, but the app will show "Not synced" until you
   connect a database (next step) — the career links directory still works fine
   without it.

## 3. Login

The app is now behind a login screen.

- **Admin (full access):** username `suprith7`, password `Commitment@7` —
  can mark applications, add companies, run "Find new companies," edit
  status, and delete entries.
- **Viewer (read-only):** username `guest`, password `view2026` — can see
  everything but every action button is hidden, and the write API rejects
  changes even if someone tries to call it directly.

These are the defaults baked into the code. To change any of them (strongly
recommended before sharing the viewer login with anyone), add these in
Vercel → **Settings → Environment Variables**, then redeploy:

| Variable | Purpose |
|---|---|
| `ADMIN_USERNAME` | overrides `suprith7` |
| `ADMIN_PASSWORD` | overrides `Commitment@7` |
| `GUEST_USERNAME` | overrides `guest` |
| `GUEST_PASSWORD` | overrides `view2026` |
| `SESSION_SECRET` | any random long string — used to sign login sessions, set this to something unique |

## 4. Add a free database (Upstash Redis, via Vercel)

This is what makes your data show up on both your phone and your laptop.

1. In your Vercel project, go to the **Storage** tab.
2. Click **Create Database** → choose **Upstash** → **Redis**.
3. Follow the prompts (free tier is enough for this app), and when asked
   which project to connect it to, select this project.
4. Vercel automatically adds the environment variables
   `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` to your project.
5. Go to **Deployments** → open the latest deployment → click **Redeploy**
   (so the app picks up the new environment variables).

## 5. (Optional) Enable "Find new companies"

The app has a button on the Career Links tab that asks Claude to search the
web and suggest new companies with direct career links, which you then
review and pick which ones to keep. This step is optional — everything else
works without it.

1. Get an API key from https://console.anthropic.com/ (Settings → API Keys).
   This is a pay-as-you-go key; each click of the button costs a small
   amount (a few cents) for the web search + response.
2. In your Vercel project, go to **Settings → Environment Variables**, add:
   - Name: `ANTHROPIC_API_KEY`
   - Value: the key you just copied
3. Go to **Deployments** → latest deployment → **Redeploy**.
4. The button will now work. Suggestions are shown for you to review —
   nothing gets added to your list until you tick the ones you want and
   click "Add selected."

## 6. Use it anywhere

Open the Vercel URL (e.g. `https://job-logbook-yourname.vercel.app`) on your
phone and your laptop — both read and write the same data, so marking a
company "Applied" on your phone shows up on your laptop too.

You can also add it to your phone's home screen (Safari/Chrome → Share/Menu →
"Add to Home Screen") so it opens like an app.

## Notes

- Login is basic by design (one shared admin login, one shared viewer
  login) — good enough for personal/small-scale use, but don't treat it as
  bank-grade security. Anyone with the viewer password can see your log.
- To add more companies later, use the "Add company" form inside the app —
  no redeploy needed, it's saved straight to the database.
- If you ever want to wipe your data, ask me and I'll give you a one-line
  command to clear the Redis key, or just delete/recreate the database from
  the Vercel Storage tab.
