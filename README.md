# BOUNTY

Player-created GTA VI challenges with gameplay-clip evidence and planned AI-assisted review. Rebranded from Missions; repository and preview address retained.

Model: bounties are posted a few at a time as the pool fills, each with its own reward: an amount in SOL, paid in TTWO (Take-Two) from the pool. Trading creator fees fill a bounty pool held in Take-Two; when the pool can fund another bounty, the next one is posted. Players submit one uncut clip with their Solana wallet, which must hold at least 2,500,000 $BOUNTY to be eligible. No team supply.

Working frontend: a single short page with an original Vice-style hero illustration (causeway chase at sunset), two live bounties (Six stars. Five minutes. for 1 SOL and Lose the heat. for 0.5 SOL) with share links (`#brief-001`, `#brief-002`), a swipeable hero deck with the live bounties plus two named locked previews plus four greyed-out upcoming challenge cards, a three-step How it works, a short FAQ, a local clip + wallet submission draft (unsigned, unsent) and the 2.5M-token calculator.

No remote publishing, wallet verification, AI review or payouts are active. All gameplay examples need validation in the actual game before opening. See docs/BACKEND-HANDOFF.md.

Run: `npm ci`, `npm run dev`. Check: `npm test`, `npm run build`.

## Admin and storage (Vercel)

Review submissions at `/admin`. Sign in with the existing owner password. Its hash is configured in server-only `ADMIN_PASSWORD_SHA256`; the password is no longer embedded in source or saved in browser storage. A dedicated `ADMIN_TOKEN` can be configured instead. Database credentials are never accepted as admin passwords.

Connect a dedicated Upstash Redis database to this Vercel project’s production environment. Supported variables: `KV_REST_API_URL` / `KV_REST_API_TOKEN` or `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`. Do not make these NEXT_PUBLIC variables. Use the free tier, eviction off and automatic paid upgrades off. Redeploy after connecting.

`GET /api/submissions` reports whether storage is configured and loads the public board. `GET /api/admin` checks the password and database; `PATCH /api/submissions/:id` saves manual decisions. New submissions atomically claim their tweet and persist the row/index. Sign-out clears the in-memory admin credential.

Review is manual. Setting a payout transaction link records an operator-reported payment; this app does not send funds or verify token holdings, clip content or payment receipts automatically. No token mint has been supplied to this repository.
