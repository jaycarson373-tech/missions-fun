import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateEligibility, makeProofDraft, parseTokenAmount, briefChecks, briefIdFromHash, briefLink, xIntent,
  missions, liveBounties, queuedBounties, isWalletAddress,
} from '../lib/missions.ts';

const WALLET = 'So11111111111111111111111111111111111111112';
const NOTES = 'An original clip with the wanted level and timer visible start to finish.';

test('2.55M boundary is exact; estimate never claims verification', () => {
  assert.equal(calculateEligibility('2549999.999999').meetsThreshold, false);
  assert.equal(calculateEligibility('2550000').meetsThreshold, true);
  assert.equal(calculateEligibility('2550000.000001').meetsThreshold, true);
  assert.equal(calculateEligibility('2550000').verified, false);
  assert.equal(calculateEligibility('2549999.999999').shortfall, 1n);
});

test('unsafe/ambiguous amounts rejected', () => {
  for (const v of ['-1', '2.55e6', 'NaN', 'Infinity', '2,550,000', '0.0000001', '']) assert.throws(() => parseTokenAmount(v));
});

test('proof export cannot become a payout or submission', () => {
  const d = makeProofDraft('001', 'https://example.com/evidence', NOTES, WALLET);
  assert.equal(d.submitted, false);
  assert.equal(d.eligibilityVerified, false);
  assert.equal(d.tokenMint, null);
  assert.equal(d.payment, null);
  assert.equal(d.wallet, WALLET);
  assert.equal(d.requiredTokens, '2550000');
});

test('proof validation rejects queued bounties, bad wallets, credentials and executable links', () => {
  for (const link of ['javascript:alert(1)', 'http://example.com', 'https://user:pass@example.com'])
    assert.throws(() => makeProofDraft('001', link, NOTES, WALLET));
  assert.throws(() => makeProofDraft('999', 'https://example.com', NOTES, WALLET));
  assert.throws(() => makeProofDraft('002', 'https://example.com', NOTES, WALLET), /not live/);
  assert.throws(() => makeProofDraft('001', 'https://example.com', 'short', WALLET));
  for (const w of ['', '0xabc', 'not a wallet', 'O0Il'.repeat(10)]) assert.throws(() => makeProofDraft('001', 'https://example.com', NOTES, w));
  assert.ok(isWalletAddress(` ${WALLET} `));
});

test('exactly one bounty is live; the rest wait in the queue', () => {
  assert.equal(liveBounties.length, 1);
  assert.equal(liveBounties[0].id, '001');
  assert.equal(queuedBounties.length, missions.length - 1);
  for (const m of missions) {
    assert.ok([1, 2, 3, 4, 5].includes(m.difficulty));
    for (const k of ['vehicle', 'limit', 'fail'] as const) assert.ok(m.rules[k].length > 2);
  }
});

test('brief checks reward measurable rules and flag entry fees', () => {
  const weak = briefChecks({title: '', objective: 'go fast', evidence: 'a video', rewardNotes: ''});
  assert.equal(weak.filter(c => c.ok).length, 1);
  const strong = briefChecks({title: 'Not a scratch', objective: 'Drive the harbor loop in any vehicle under 3 minutes. Fail on any collision.', evidence: 'One continuous uncut clip with the HUD and timer visible.', rewardNotes: 'Paid from the pool, no player wagers'});
  assert.ok(strong.every(c => c.ok));
  assert.equal(briefChecks({title: 'x', objective: '', evidence: '', rewardNotes: '5 SOL entry fee'}).find(c => c.id === 'nowager')!.ok, false);
});

test('deep links only resolve the live bounty', () => {
  assert.equal(briefIdFromHash('#brief-001'), '001');
  assert.equal(briefIdFromHash('#brief-002'), null);
  assert.equal(briefIdFromHash('#brief-999'), null);
  assert.equal(briefIdFromHash('#how'), null);
  assert.equal(briefLink('https://a.b/', '001'), 'https://a.b/#brief-001');
  assert.ok(xIntent('hi & bye', 'https://a.b/#brief-001').startsWith('https://x.com/intent/post?text=hi%20%26%20bye&url='));
});
