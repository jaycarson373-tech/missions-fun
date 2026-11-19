import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateEligibility, parseTokenAmount, briefChecks, briefIdFromHash, briefLink, xIntent,
  missions, liveBounties, queuedBounties, isWalletAddress,
} from '../lib/missions.ts';
import {parseTweetUrl, shortWallet, validateReview, validateSubmission} from '../lib/submissions.ts';

const WALLET = 'So11111111111111111111111111111111111111112';
const NOTES = 'An original clip with the wanted level and timer visible start to finish.';

test('2.5M boundary is exact; estimate never claims verification', () => {
  assert.equal(calculateEligibility('2499999.999999').meetsThreshold, false);
  assert.equal(calculateEligibility('2500000').meetsThreshold, true);
  assert.equal(calculateEligibility('2500000.000001').meetsThreshold, true);
  assert.equal(calculateEligibility('2500000').verified, false);
  assert.equal(calculateEligibility('2499999.999999').shortfall, 1n);
});

test('unsafe/ambiguous amounts rejected', () => {
  for (const v of ['-1', '2.5e6', 'NaN', 'Infinity', '2,500,000', '0.0000001', '']) assert.throws(() => parseTokenAmount(v));
});

test('submissions need a live bounty, a real wallet and a tweet link', () => {
  const v = validateSubmission({bountyId: '001', wallet: ` ${WALLET} `, tweetUrl: 'https://twitter.com/Player_1/status/1234567890?s=20', note: ' first try '});
  assert.deepEqual(v, {bountyId: '001', wallet: WALLET, tweetUrl: 'https://x.com/Player_1/status/1234567890', handle: 'Player_1', note: 'first try'});
  assert.ok(validateSubmission({bountyId: '002', wallet: WALLET, tweetUrl: 'https://x.com/a/status/99999'}));
  assert.throws(() => validateSubmission({bountyId: '003', wallet: WALLET, tweetUrl: 'https://x.com/a/status/99999'}), /not live/);
  for (const w of ['', '0xabc', 'not a wallet', 'O0Il'.repeat(10)]) assert.throws(() => validateSubmission({bountyId: '001', wallet: w, tweetUrl: 'https://x.com/a/status/99999'}));
  for (const u of ['http://x.com/a/status/99999', 'https://youtube.com/watch?v=1', 'https://x.com/a', 'https://x.com.evil.io/a/status/99999', 'javascript:alert(1)'])
    assert.throws(() => validateSubmission({bountyId: '001', wallet: WALLET, tweetUrl: u}), /tweet/);
  assert.throws(() => validateSubmission({bountyId: '001', wallet: WALLET, tweetUrl: 'https://x.com/a/status/99999', note: 'x'.repeat(281)}));
  assert.equal(parseTweetUrl('https://mobile.twitter.com/b/status/123456')?.url, 'https://x.com/b/status/123456');
});

test('reviews: paid needs a payout tx, statuses are fixed', () => {
  const tx = '5'.repeat(88);
  assert.deepEqual(validateReview({status: 'paid', payoutTx: tx, reviewNote: 'clean run'}), {status: 'paid', reviewNote: 'clean run', payoutTx: tx});
  assert.throws(() => validateReview({status: 'paid'}), /payout/);
  assert.throws(() => validateReview({status: 'winner'}));
  assert.throws(() => validateReview({status: 'paid', payoutTx: 'not-a-tx'}));
  assert.equal(validateReview({status: 'rejected', payoutTx: tx}).payoutTx, null);
  assert.equal(shortWallet(WALLET), 'So11…1112');
});

test('two bounties are live with their rewards', () => {
  assert.deepEqual(liveBounties.map(m => [m.id, m.reward]), [['001', '1 SOL'], ['002', '0.5 SOL']]);
  assert.equal(queuedBounties.length, 0);
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
  assert.equal(briefIdFromHash('#brief-002'), '002');
  assert.equal(briefIdFromHash('#brief-003'), null);
  assert.equal(briefIdFromHash('#brief-999'), null);
  assert.equal(briefIdFromHash('#how'), null);
  assert.equal(briefLink('https://a.b/', '001'), 'https://a.b/#brief-001');
  assert.ok(xIntent('hi & bye', 'https://a.b/#brief-001').startsWith('https://x.com/intent/post?text=hi%20%26%20bye&url='));
});
