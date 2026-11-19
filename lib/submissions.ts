import {isWalletAddress, liveBounties} from './missions.ts';

export const STATUSES = ['pending', 'approved', 'rejected', 'paid'] as const;
export type Status = typeof STATUSES[number];
export const statusLabel: Record<Status, string> = {pending: 'Pending review', approved: 'Approved', rejected: 'Rejected', paid: 'Paid'};

export type Submission = {
  id: string; bountyId: string; wallet: string; tweetUrl: string; handle: string; note: string;
  status: Status; createdAt: string; reviewedAt: string | null; reviewNote: string; payoutTx: string | null;
};

const TWEET = /^https:\/\/(?:www\.|mobile\.)?(?:x|twitter)\.com\/([A-Za-z0-9_]{1,15})\/status\/(\d{5,25})\/?(?:[?#].*)?$/;
const TX = /^[1-9A-HJ-NP-Za-km-z]{64,90}$/;

export function parseTweetUrl(url: string) {
  const m = TWEET.exec(url.trim());
  if (!m) return null;
  return {handle: m[1], url: `https://x.com/${m[1]}/status/${m[2]}`};
}

// Shared by the form and the API. Throws a readable message on bad input.
export function validateSubmission(input: {bountyId?: unknown; wallet?: unknown; tweetUrl?: unknown; note?: unknown}) {
  const bountyId = typeof input.bountyId === 'string' ? input.bountyId : '';
  const wallet = typeof input.wallet === 'string' ? input.wallet.trim() : '';
  const tweetUrl = typeof input.tweetUrl === 'string' ? input.tweetUrl : '';
  const note = typeof input.note === 'string' ? input.note.trim() : '';
  if (!liveBounties.some(m => m.id === bountyId)) throw new Error('That bounty is not live.');
  if (!isWalletAddress(wallet)) throw new Error('Add the Solana wallet that holds your $BOUNTY.');
  const tweet = parseTweetUrl(tweetUrl);
  if (!tweet) throw new Error('Paste the link to your tweet, like https://x.com/you/status/123…');
  if (note.length > 280) throw new Error('Keep the note under 280 characters.');
  return {bountyId, wallet, tweetUrl: tweet.url, handle: tweet.handle, note};
}

export function validateReview(input: {status?: unknown; reviewNote?: unknown; payoutTx?: unknown}) {
  const status = input.status as Status;
  if (!STATUSES.includes(status)) throw new Error('Unknown status.');
  const reviewNote = typeof input.reviewNote === 'string' ? input.reviewNote.trim().slice(0, 280) : '';
  const payoutTx = typeof input.payoutTx === 'string' && input.payoutTx.trim() ? input.payoutTx.trim() : null;
  if (payoutTx && !TX.test(payoutTx)) throw new Error('That does not look like a Solana transaction signature.');
  if (status === 'paid' && !payoutTx) throw new Error('Add the payout transaction to mark it paid.');
  return {status, reviewNote, payoutTx: status === 'paid' ? payoutTx : null};
}

export function shortWallet(w: string) { return w.length > 10 ? `${w.slice(0, 4)}…${w.slice(-4)}` : w; }

export function tweetTemplate(title: string, id: string, origin: string) {
  return `Just pulled off Bounty #${id}: "${title.replace(/\.$/, '')}" on $BOUNTY. Clip below. ${origin.replace(/\/$/, '')}/#bounty-${id}`;
}
