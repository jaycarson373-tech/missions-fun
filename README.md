# BOUNTY

Player-created GTA VI challenges with gameplay-clip evidence and planned AI-assisted review. Rebranded from Missions; repository and preview address retained.

Model: one bounty is live at a time. Trading creator fees fill a bounty pool held in Take-Two; when the pool can fund another bounty, the next one is posted. Players submit one uncut clip with their Solana wallet, which must hold at least 2,500,000 $BOUNTY to be eligible. No team supply.

Working frontend: the live bounty with its rule sheet, a six-star countdown banner, a shareable link (`#brief-001`) with copy and post-to-X, locked "up next" bounties, How it works and pool sections, a local clip + wallet submission draft (unsigned, unsent), a local "pitch the next bounty" draft with a brief-strength aid, and the 2.5M-token calculator.

No remote publishing, wallet verification, AI review or payouts are active. All gameplay examples need validation in the actual game before opening. See docs/BACKEND-HANDOFF.md.

Run: `npm ci`, `npm run dev`. Check: `npm test`, `npm run build`.
