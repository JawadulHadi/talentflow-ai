# Changelog

All notable changes to TalentFlow AI are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Branding page** (`/brand`): employer branding the way an ATS ships it — company name, tagline,
  website, logo upload (downscaled to 256 px), brand and accent colour with presets, heading/body
  font pairing, candidate-email signature and reply-to, and the "via TalentFlow AI" attribution
  switch. A live candidate view previews the job post, the application-received email and the
  scorecard PDF header at desktop or phone width. Saved branding is applied to outbound candidate
  emails (`logEmail`) and to every PDF exported from Deliverables and Scorecard, and persists
  through the shared storage adapter (`qeloma-brand-v1`, versioned with a defaults merge).
- **Hiring plan** (`/deliverables`): the requisition's working plan instead of a bare editor. It
  reads the real job, team and pipeline data — status, department, location, pay, posting date,
  hiring manager and candidate count — and shows document readiness (job description, interview
  plan, scorecards), scorecard completion, the weighted STAR interview plan grouped by competency,
  and the job description with the same branded candidate preview used on the Branding page. Each
  document exports to PDF with the saved branding applied.

### Changed

- The `/deliverables` page is now labelled **Hiring plan** in the sidebar and page header, which is
  the ATS-native name for a requisition's job description, interview plan and scorecard set.
- `npm run build` now targets a Node server outside Vercel (`node-server` preset) and
  `npm start` serves it, so the app can be deployed to any container or VM. Vercel builds
  still emit the Build Output API via the `vercel` preset.
- `package.json` declares `engines.node >= 22.12`, matching the documented prerequisite.
- README banner and logo assets renamed to drop the duplicated `.svg.svg` / `.svg.png`
  suffixes.

### Fixed

- README and issue-template links pointed at `https://talentflow-ai.vercel.app`, which is an
  unrelated site. They point at the real deployment again.
- The favicon returned 404 on every page: `/repo-logo.png` was referenced but never published.
  It now ships from `public/` with the correct `image/png` type.
- Removed the unused `sharp` dependency (it was never imported) from `package.json`.

## [1.0.0] - 2026-09-30

First production release, deployed at <https://talntflow-ai.vercel.app>.

### Added

- **TalentFlow Agent** (`/agent`): a tool-use loop on Claude (`claude-opus-5-5`) that reads a
  read-only pipeline snapshot and returns proposals (stage moves, reminder or feedback emails,
  notes). Each proposal applies only after a recruiter approves it. Without `ANTHROPIC_API_KEY`,
  local triage rules produce the same kind of proposals.
- Claude-written scorecard summaries. The weighted score and verdict stay deterministic.
- Job lifecycle: Draft → Active → Closed, with live applicant counts and a per-job pipeline filter.
- Candidate management: add with résumé attachment, optional contact details and voluntary
  self-identification; duplicate detection per job; reject with reason (logs a rejection email);
  reactivate; permanent deletion for data-erasure requests.
- Team invites start as pending and can be revoked.
- Unit tests for scoring, analytics, store actions, persistence migration and the agent (15 tests).

### Changed

- Deployment targets Vercel only. Nitro emits the Build Output API; `vercel.json` pins
  `npm ci` and `npm run build`.
- Diversity analytics count only candidates who disclosed the attribute and show the disclosure rate.
- Integration sync times are stored as ISO timestamps and shown relative to now.
- Pages render after browser data loads, which removes a hydration mismatch and a flash of demo data.
- Remaining "Qeloma Agent for Recruiter" text renamed to TalentFlow AI.

### Fixed

- Saved browser data was discarded by a storage-key rename. The original key is back, with a
  versioned migration.
- New candidates were given a hard-coded gender, diversity flag, phone number and location.
- Sourcing cost for new candidates disagreed with the shared cost table.
- Candidates added directly at a late stage had a one-entry history, which skewed time-to-fill.
- Résumé "parsing" invented an invalid email from the file name.
- Applicant counts were static and never matched the pipeline.
- Invited team members showed as Active before accepting.
- The generated route tree was missing the Jobs, Team and Integrations routes.
- Posted dates used UTC and an inconsistent format.
- Form inputs were validated trimmed but saved untrimmed.
- The job counter labelled drafts as active positions.
- Dialog forms kept stale values after Cancel or Esc.
- Hard-coded palette colours ignored the active theme.
- `npm install` failed without a lockfile; `package-lock.json` and `.npmrc` are now committed.

### Removed

- `netlify.toml`. Its SPA redirect could not serve this server-rendered app.

### Upgrade notes

- Browser data saved under `qeloma-ats-v1` migrates automatically on first load.
- Data created with the unreleased build from commit `28bac4c` (key `qeloma-ats-v2`) is not migrated.

[Unreleased]: https://github.com/JawadulHadi/talentflow-ai/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/JawadulHadi/talentflow-ai/releases/tag/v1.0.0
