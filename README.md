# BOUNTY

Player-created GTA VI challenges with gameplay-clip evidence and planned AI-assisted review. Rebranded from Missions; repository and preview address retained.

Model: bounties are posted a few at a time as the pool fills, each with its own reward: an amount in SOL, paid in TTWO (Take-Two) from the pool. Trading creator fees fill a bounty pool held in Take-Two; when the pool can fund another bounty, the next one is posted. Players submit one uncut clip with their Solana wallet, which must hold at least 2,500,000 $BOUNTY to be eligible. No team supply.

Working frontend: a single short page with an original Vice-style hero illustration (causeway chase at sunset), two live bounties (Six stars. Five minutes. for 1 SOL and Lose the heat. for 0.5 SOL) with share links (`#brief-001`, `#brief-002`), a swipeable hero deck with the live bounties plus two locked "???" cards (future bounties are kept out of the code so nobody can front-run them), a three-step How it works, a short FAQ, a local clip + wallet submission draft (unsigned, unsent) and the 2.5M-token calculator.

No remote publishing, wallet verification, AI review or payouts are active. All gameplay examples need validation in the actual game before opening. See docs/BACKEND-HANDOFF.md.

Run: `npm ci`, `npm run dev`. Check: `npm test`, `npm run build`.

## Submissions setup (Vercel)

Submissions are public and reviewed by hand. They need two things in Vercel:

1. **Storage:** Vercel → Storage (or Marketplace) → **Upstash for Redis** → create a free database and connect it to this project. That sets `KV_REST_API_URL` and `KV_REST_API_TOKEN` automatically.
2. **Admin token:** Vercel → Settings → Environment Variables → add `ADMIN_TOKEN` with a long random value (16+ characters). Keep it private.

Redeploy after adding them. Until storage is connected, the site shows "Submissions open at launch" and the form does not accept entries.

Review at `/admin`: paste the admin token, set each entry to Pending review / Approved / Rejected / Paid, add a public note, and paste the payout transaction signature when marking Paid. The public board on the home page updates automatically.
