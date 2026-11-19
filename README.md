# BOUNTY

Player-created GTA VI challenges with gameplay-clip evidence and planned AI-assisted review. Rebranded from Missions; repository and preview address retained.

Model: bounties are posted a few at a time as the pool fills, each with its own reward: an amount in SOL, paid in TTWO (Take-Two) from the pool. Trading creator fees fill a bounty pool held in Take-Two; when the pool can fund another bounty, the next one is posted. Players submit one uncut clip with their Solana wallet, which must hold at least 2,500,000 $BOUNTY to be eligible. No team supply.

Working frontend: a single short page with an original Vice-style hero illustration (causeway chase at sunset), two live bounties (Six stars. Five minutes. for 1 SOL and Lose the heat. for 0.5 SOL) with share links (`#brief-001`, `#brief-002`), two hidden "next bounty" cards (kept out of the code so nobody can front-run them), a three-step How it works, a short FAQ, a local clip + wallet submission draft (unsigned, unsent) and the 2.5M-token calculator.

No remote publishing, wallet verification, AI review or payouts are active. All gameplay examples need validation in the actual game before opening. See docs/BACKEND-HANDOFF.md.

Run: `npm ci`, `npm run dev`. Check: `npm test`, `npm run build`.
