export const REQUIRED_TOKENS = 2_500_000n;
export const MAX_STARS = 5;
export const difficultyLabel = {1: 'Warm-up', 2: 'Easy', 3: 'Skilled', 4: 'Hard', 5: 'Elite'} as const;

export type Rules = {vehicle: string; limit: string; fail: string};
export type BountyStatus = 'live' | 'queued';
export type Mission = {
  id: string; title: string; status: BountyStatus; reward: string; wanted: number;
  description: string; proof: string[]; difficulty: 1 | 2 | 3 | 4 | 5; rules: Rules;
};

// Live bounties are posted one at a time as the pool fills. Rewards are set per bounty.
export const missions: Mission[] = [
  {id: '001', title: 'Six stars. Five minutes.', status: 'live', reward: '1 SOL', wanted: 6, difficulty: 5,
    description: 'Hit six stars, the highest wanted level in GTA VI, and stay alive for five straight minutes. No dying, no getting busted.',
    proof: ['One continuous clip, no cuts or pauses', 'Before the sixth star appears', 'Five minutes after it, still alive at six stars'],
    rules: {vehicle: 'Anything', limit: '5:00 at six stars', fail: 'You die, get busted, or the clip cuts'}},
  {id: '002', title: 'Lose the heat.', status: 'live', reward: '0.5 SOL', wanted: 3, difficulty: 3,
    description: 'Steal a police car and lose the cops without ever getting out. Get to at least three stars first.',
    proof: ['One continuous clip, no cuts or pauses', 'When you take the police car', 'When the wanted level fully clears'],
    rules: {vehicle: 'The police car you steal', limit: 'Until the wanted level clears', fail: 'You leave the car, it’s destroyed, or the clip cuts'}},
];

// Display-only previews. These do not enable submissions or allocate rewards.
export const upcomingBounties = [
  {id: '003', title: 'Stick the landing.', description: 'Land a selected stunt jump and keep the vehicle intact.'},
  {id: '004', title: 'Not a scratch.', description: 'Finish a city route without a single collision.'},
  {id: '005', title: 'One way out.', description: 'Lose a pursuit while staying inside a marked district.'},
  {id: '006', title: 'Beat the run.', description: 'Beat the target time on a fixed route with the same vehicle.'},
];

export const liveBounties = missions.filter(m => m.status === 'live');
export const queuedBounties = missions.filter(m => m.status === 'queued');

// UI estimator only. Live authorization must come from a signed wallet session + finalized onchain holdings.
export function parseTokenAmount(value: string, decimals = 6): bigint {
  if (!Number.isInteger(decimals) || decimals < 0 || decimals > 18) throw new Error('Invalid decimals');
  const v = value.trim();
  if (!/^\d+(\.\d+)?$/.test(v)) throw new Error('Enter a positive token amount without commas.');
  const [whole, fraction = ''] = v.split('.');
  if (fraction.length > decimals) throw new Error(`Use at most ${decimals} decimal places.`);
  if (whole.length > 30) throw new Error('Amount is too large.');
  return BigInt(whole) * 10n ** BigInt(decimals) + BigInt(fraction.padEnd(decimals, '0') || '0');
}

export function calculateEligibility(amount: string) {
  const balance = parseTokenAmount(amount);
  const threshold = REQUIRED_TOKENS * 1_000_000n;
  return {meetsThreshold: balance >= threshold, shortfall: balance >= threshold ? 0n : threshold - balance, verified: false as const};
}

const BASE58_WALLET = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
export function isWalletAddress(v: string) { return BASE58_WALLET.test(v.trim()); }

export type BriefDraft = {title: string; objective: string; evidence: string; rewardNotes: string};
// Local writing aid only: it scores how measurable a pitch reads, never approves, publishes or funds it.
export function briefChecks(d: BriefDraft) {
  const o = d.objective, e = d.evidence;
  return [
    {id: 'title', label: 'Short, specific title', ok: d.title.trim().length >= 4 && d.title.length <= 100},
    {id: 'limit', label: 'A measurable limit (time, laps, checkpoints or stars)', ok: /\d+\s*(:\d\d|s\b|sec|second|min|minute|lap|checkpoint|star|km|mile|meter|metre)/i.test(o)},
    {id: 'vehicle', label: 'Vehicle or loadout named', ok: /\b(car|vehicle|bike|motorcycle|boat|truck|van|heli|helicopter|plane|on foot|class|any vehicle)\b/i.test(o)},
    {id: 'fail', label: 'A clear fail condition', ok: /\b(fail|fails|disqualif\w*|without|must not|no (collision|crash|cuts?|respawn|death)|if you|crash|collision|respawn)\b/i.test(o)},
    {id: 'continuous', label: 'Continuous footage required', ok: /\b(continuous|uncut|unedited|one clip|single clip|no cuts?|one take)\b/i.test(e)},
    {id: 'hud', label: 'HUD, timer or map visible', ok: /\b(hud|timer|wanted|minimap|map|speedometer)\b/i.test(e)},
    {id: 'nowager', label: 'No entry fees or player wagers', ok: !/\b(entry fee|buy-?in|winner takes all|pay to (enter|play)|stake to enter)\b/i.test(d.rewardNotes)},
  ];
}

export function briefLink(origin: string, id: string) { return `${origin.replace(/\/$/, '')}/#brief-${id}`; }
export function shareText(title: string) { return `"${title.trim().replace(/\.$/, '')}." The live GTA VI bounty on BOUNTY. Think you can clip it?`; }
export function xIntent(text: string, url: string) { return `https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`; }
export function briefIdFromHash(hash: string) {
  const m = /^#brief-(\d{3})$/.exec(hash);
  return m && liveBounties.some(x => x.id === m[1]) ? m[1] : null;
}
