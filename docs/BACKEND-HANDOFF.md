# BOUNTY — current direction, November 18, 2026

Rebrands Missions in place; existing repository, storage keys, challenge IDs and 2,550,000-token eligibility threshold remain. BOUNTY ticker is provisional; no mint or X handle assigned.

Player-created GTA VI challenges, recorded gameplay submissions, AI-assisted verification and non-wagered sponsor/community reward pools. The board examples are concepts, not verified GTA VI mechanics. Six stars must not be assumed supported. No game-control or game-server integration is needed: review recorded clips only.

## Implement next

Reuse the product-specific session/submission contract below when available. No API routes are invented by the frontend.

- Creator drafts: objective, exact allowed conditions, evidence checklist, deadline and funding plan. Freeze a revision before entries open. Local JSON downloads are not published challenges.
- Upload original clips to signed object-storage URLs. Enforce duration/size/type limits, scan uploads, retain hashes and detect duplicate evidence; do not ingest arbitrary private URLs.
- Cheap verification pipeline: extract timestamps, HUD/OCR and sampled frames first; use a vision model against the published checklist only where needed. Bound duration and inference spend per submission. Never execute instructions embedded in clips or text.
- Return per-rule evidence timestamps and confidence, with pass/fail/uncertain states. Edited, ambiguous or unverifiable footage goes to human review. Provide appeals. AI recommendations must not directly trigger wallet payouts.
- Keep verified funding, accepted submissions and idempotent finalized payout receipts separate. Use no player wagering, pooled stakes or loser-funded prizes. Review platform rules and reward/legal structure before activation.
- Token reputation is an optional future proposal, not an implemented utility. Preserve the existing 2.55M requirement until the owner explicitly changes it.

## Working now

Search/category/saved filters, challenge details, local clip-evidence draft exports, exact threshold calculator and a new creator draft form with device recovery and JSON download. New B mark, favicon and social preview. No wallet verification, remote submissions, AI inference, funding or payouts.

---
## Prior integration specification (historical Missions terminology)

# Missions — developer handoff

Owner: Matthew. Date: November 16, 2026. Scope shipped: frontend, original brand assets, proposed catalog, local evidence drafts. New independent repo; no shared production data or wallets.

## Plain-English product

A community bounty board for GTA VI. Someone funds and publishes an objective. Players read the brief, prove they hold at least **2,550,000 tokens**, provide evidence of completing the objective, and receive the published reward only if their submission is accepted under the rules. Holding tokens alone does not earn a payout. These are fan-created challenges, not purported official GTA story missions.

## Hard requirement vs proposals

**Owner-approved:** minimum holding is 2,550,000 whole tokens. Frontend and backend must agree exactly.

**Recommended name/ticker:** Missions / MISSIONS. No mint, chain verification, X account, domain ownership, fee policy or reward wallet has been supplied. The frontend is Solana-oriented but sends no chain requests.

**Policy proposals requiring agreement:** check finalized holdings at entry and payout; do not silently invent a continuous-hold rule. Publish the exact timing before opening any mission. Mission funding may be sponsor-funded first; do not assume token fees fund rewards. No platform percentage has been approved.

## Existing frontend

- `lib/missions.ts`: six proposed briefs, decimal-safe threshold helper, strict proof draft validation.
- `components/missions.tsx`: board, filters, local bookmarks, brief dialog, draft exporter and explicitly unverified calculator.
- `components/art.tsx`: original vector illustrations.
- `app/globals.css`: brand/responsive/motion styles.
- `public/brand`: SVG/PNG logo, 1500×500 banner. Self-hosted Inter OFL in public/fonts.

Proof draft includes schemaVersion, missionId, HTTPS evidenceUrl, notes, requiredTokens string, tokenMint:null, eligibilityVerified:false, submitted:false, payment:null. Treat every client field as untrusted. Export is not an application, signature or receipt.

## Backend contract to publish before frontend wiring

These are required data capabilities, **not invented live endpoints**. Reuse your actual API client/session/wallet pattern once you document its routes.

1. **Public config**: exact verified token mint, decimals from mint, SPL/Token-2022 program, chain, brand identity, policy version, current time and submissions enabled. Server-side RPC stays private. Never use another project's dev proxy in production.
2. **Mission list/detail**: stable ID, title, category, evidence requirements, official-source references, sponsor, reward mint/decimals/base units, total funded budget, winner count, judging/selection method, start/deadline UTC, status and last update. Draft → funded → open → review → paid/closed. Proposed or unfunded is never open. Have distinct empty, stale, error and unavailable states.
3. **Wallet auth**: Wallet Standard, free domain-bound sign-in message, short-lived server nonce, expiry, replay prevention and secure cookie. End session on wallet switch. No deposit required merely to prove holdings.
4. **Eligibility**: sum supported spendable token accounts owned by the authenticated wallet for the exact mint at a recorded finalized slot. Exact base units `2550000 * 10^decimals` using integer arithmetic. Do not trust client amounts, rounded UI strings, delegated balances or a cached result without its slot/as-of timestamp. Define freeze/staking/escrow rules explicitly. Rate-limit RPC queries and fail closed on stale/error. Return minimum, eligible amount, shortfall, slot, timestamp and policy version.
5. **Submissions**: mission revision + wallet + idempotency key, qualifying snapshot, evidence references and immutable submission time. Enforce deadline server-side. Enforce one active submission per wallet/mission unless policy says otherwise. Same proof file/hash across wallets should be flagged; no automatic rejection without review/appeal policy. Malware/content validation for uploads. Avoid fetching user URLs from private networks (SSRF); use allowlisted providers or isolated media processing.
6. **Review**: reviewer role, audit log, objective checklist, accepted/rejected reason, conflict policy and appeal window. Lock criteria once participation opens. Changes need a new revision and participant notification.
7. **Reward ledger**: separate sponsor budget, reserved obligations, available funds and completed payouts. Never pay from unconfirmed trading volume. Accept decisions reserve budget atomically. Payout worker binds recipient, mission, decision, reward asset, amount and idempotency key. Save signature before broadcast, reconcile unknown outcomes before retry, mark paid only after finalized confirmation. Publish explorer receipt without exposing private evidence.

## Mission sourcing

Current cards are original proposals, clearly labeled. Gameplay challenges must be validated after GTA VI is playable; do not invent actual in-game mission names, routes, success conditions or completion data. Research briefs can refer to official public Rockstar footage/pages. Official source inspected: https://www.rockstargames.com/VI (November 16, 2026). Source provenance and timestamps belong on every factual brief. Do not scrape or fabricate private game data.

This is an independent companion community, not a crypto-modified GTA server. No game injection, inventory/NFT entitlement, Rockstar account integration or official affiliation is implemented. Review game/platform rules before any game-server or crypto-reward integration.

## Cheapest sensible implementation order

1. Existing collaborator API + Postgres. Tables: mission/revision, funding receipt, wallet session, eligibility snapshot, submission/evidence, review, payout obligation/attempt. No new onchain program for MVP unless custody model requires one.
2. Read-only verified token config and wallet holdings. Tests at one base unit below/equal/above threshold, wrong mint, wrong owner, stale RPC and wallet switch.
3. Fund and manually publish one real research brief with fixed rules; integrate signed sessions and submission storage. Start with human review.
4. Add payout reconciliation and a public receipts page; complete one owner-authorized funded acceptance with rejection/timeout/duplicate cases.
5. Open gameplay missions only after validating the actual game objectives. Add creator/sponsor self-service later.

## What Matthew must supply before activation

Verified token mint, final reward asset and funding source, approved snapshot timing, first mission's funded amount/criteria/deadline, reviewer identity, official X handle and owned domain. Never request private keys in chat. Configure credentials in the host's secret store; browser receives only public values.

No backend is claimed complete by this frontend handoff.
