TalentFlow AI is deployed to production at **https://talentflow-ai.vercel.app**. I fixed all 15 review findings, added the missing core ATS features, and built an agent that works in a loop. A full browser test (clicking through every page) against the live site found zero page or console errors.

## Vercel vs Netlify
I picked **Vercel** and deleted `netlify.toml`. Neither existing config could have worked: this is a server-rendered TanStack Start app with no `dist/index.html`, and both configs assumed a static single-page site.
- The Nitro build tool detects Vercel automatically and produces its standard output format. I confirmed this with a local Vercel-target build.
- Vercel functions can run for minutes by default. The agent makes several Claude calls in a row, so short function timeouts would cut it off.

## Review findings fixed
| Finding | Fix |
|---|---|
| Storage key rename wiped saved data | Kept the original key and added a versioned migration; existing pipeline work carries over (tested) |
| Fake gender, diversity flag, phone and location on new candidates | These fields are now optional and only filled if the candidate chooses to share them. Diversity charts only count candidates who shared, and the page shows what % shared |
| Sourcing cost used an inline guess | Uses the shared `costBySource` table, set in the store |
| Candidates could be added straight into a late stage with one history entry | New candidates always start in Sourced, so time-to-fill and stage speed are real |
| Résumé "AI parse" invented an email | It only fills a cleaned-up name from the file name; the email stays empty |
| Applicant counts were fixed numbers | Candidates are linked to a job by id and counts are calculated live |
| Invites showed as Active | Invites stay "Invite pending" and can be revoked |
| Route file not regenerated | Regenerated; typecheck passes |
| "Just now" sync time stored forever | Stored as a timestamp and shown relative to the current time |
| Posted date used UTC and a different format | Shown with `formatDate` |
| Form inputs saved untrimmed | Trimmed, plus email checks |
| "N active positions" counted drafts | Now shows "6 jobs · 5 active" |
| Form kept old values after Cancel/Esc | Forms reset every time the dialog closes |
| Duplicated logic and IDs that could collide | Reuses the existing email template, id generator and stage/source lists |
| Hard-coded colours broke the paper-light theme | Theme colour tokens only; checked visually on paper-light |

I also found and fixed things outside the review:
- **Server/browser mismatch:** the server rendered its own demo data, then the browser swapped in saved data. This caused a React error and a flash of demo data. Pages now wait until saved data has loaded.
- **Install failed:** `npm install` crashed without a lockfile. I committed `package-lock.json` and added `.npmrc`.
- **Old branding:** remaining "Qeloma" text on the pages is now TalentFlow AI.

## ATS features added (kept small)
- **Jobs:** Draft → Active → Closed, with a pipeline filtered per job.
- **Rejection:** reject with a reason (logs a rejection email), and reactivate.
- **Data deletion:** permanently delete a candidate to honour a data-erasure request.
- **Duplicates:** the same email can't apply twice to one job.

## The agent loop
Yes, it fits the current setup, and it's built. The loop runs on the server and gives Claude tools to read the pipeline. Claude can only **propose** stage moves, reminder or feedback emails, and notes; you approve each one on the new **Agent** page.
- **Why this design:** all data lives in the browser, so the browser sends a read-only snapshot and applies whatever you approve. The API key never reaches the browser (I checked the browser bundle).
- **Safety limits:**
  - The agent can't reject anyone; it adds a note instead.
  - Contact details and diversity data are never sent to Claude.
  - Each run is capped at 8 steps and 15 proposals.
  - I turned on Anthropic's automatic retry on a fallback model when Claude declines a request.
- **Without an API key:** fixed local triage rules run and the offline banner shows. That is what is live now; it produced 7 sensible proposals in testing.
- **The scorecard "Ask TalentFlow Agent" button** also uses Claude now. The score and verdict stay calculated locally; Claude writes the summary.

**To switch Claude on,** add `ANTHROPIC_API_KEY` in the talentflow-ai project's environment variables on Vercel and redeploy. There's no login, so anyone with the URL could run the agent on your key. Put Vercel Deployment Protection or auth in front first, and set a spend limit on the key.

**Longer term,** once `storage-service.ts` is backed by a real database (Supabase or your NestJS service), the same tools can read the database directly and run on a schedule, for example a nightly triage. That's the step to a truly autonomous agent.

## What's left for you
- The work is committed as `e34d560` on the `feat/ats-hardening-agent` branch. It's **not pushed or merged**. The live site was deployed straight from your machine, so `vercel git connect` is needed for automatic deploys on push.
- Your machine has Node 20, but TanStack needs 22.12 or newer. Builds work with warnings. Vercel builds on Node 24, which is your account default. I didn't add a Node version to `package.json` because your nvm auto-switches on it and blocked `node` entirely.
- Still simulated: job-board integrations (the page now says so), and data only exists in each person's browser.
- Local test data saved under the old "v2" key from the last commit isn't migrated. That build was never deployed, so this only affects your own browser.\


Written for: GitHub visitors and future contributors to the TalentFlow AI repo.

The repo is fully set up and v1.0.0 is published, pointing at the same code that's live on Vercel. GitHub's community profile for the repo now scores **100%**.

**Repo "About" panel** (https://github.com/JawadulHadi/talentflow-ai)
- **Description:** "Lightweight applicant tracking system (ATS) with an AI recruiting agent on Claude, structured STAR scorecards and hiring analytics. TanStack Start + React 19, deployed on Vercel."
- **Website:** https://talentflow-ai.vercel.app
- **Topics (19):** ats, applicant-tracking-system, recruiting, hiring, hr-tech, ai-agent, agentic-ai, llm, claude, anthropic, tanstack-start, tanstack-router, react, typescript, tailwindcss, zustand, vercel, kanban, analytics
- **License:** MIT, and GitHub detects it correctly.

**Release:** [v1.0.0](https://github.com/JawadulHadi/talentflow-ai/releases/tag/v1.0.0) is an annotated tag on `main`, marked Latest. The notes come from the changelog and include the live demo link, how to turn on Claude, and upgrade notes. `package.json` is now at version `1.0.0`.

**Documents added**

| File | Purpose |
|---|---|
| `LICENSE` | MIT, © 2026 Jawad Ul Hadi |
| `CHANGELOG.md` | v1.0.0 entries: Added / Changed / Fixed / Removed / Upgrade notes |
| `CONTRIBUTING.md` | Setup, the 4 checks every PR must pass, architecture rules, commit style, release steps |
| `SECURITY.md` | How to report vulnerabilities privately, plus what deployers are responsible for (no login, key cost exposure) |
| `CODE_OF_CONDUCT.md` | Based on Contributor Covenant 2.1; reports go through your GitHub profile, so no email is published |
| `docs/ARCHITECTURE.md` | Data flow and agent-loop diagrams (Mermaid), tool list, guardrails, deployment, next steps |
| `.github/` | Bug and feature issue forms, PR template with checklist, links to security reporting and the demo |
| `.gitattributes` | Forces LF line endings, which stops the ~4,500 false Prettier errors on Windows checkouts |
| `README.md` | Badges, live demo link, documentation table, license section |

I also turned on **private vulnerability reporting** in the repo settings, so the "Security → Report a vulnerability" steps in SECURITY.md actually work.

**What happened with the merge:** you merged PR #1 before my docs commit reached that branch. I opened [PR #2](https://github.com/JawadulHadi/talentflow-ai/pull/2) with only the docs commit, merged it, and tagged the release after that merge. Tests still pass (15/15). Both feature branches are still on GitHub; delete them whenever you like. My local git remote now points at the renamed repo.

**Still open:**
- An untracked file, `TalentFlow AI.mak`, appeared in the project folder. I didn't create it, and I left it uncommitted.
- Vercel still isn't connected to the repo, so pushes to `main` don't deploy automatically. Run `npx vercel git connect` once if you want that.
- The "Kilo Code Review" check on PRs fails because that account has no credits. Top up Kilo or remove the app.