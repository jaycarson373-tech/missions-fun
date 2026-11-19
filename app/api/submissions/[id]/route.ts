import {NextResponse} from 'next/server';
import {timingSafeEqual, createHash} from 'node:crypto';
import {validateReview} from '@/lib/submissions';
import {getSubmission, saveSubmission, storeReady} from '@/lib/store';

export const dynamic = 'force-dynamic';
const json = (body: unknown, status = 200) => NextResponse.json(body, {status, headers: {'Cache-Control': 'no-store'}});
const digest = (s: string) => createHash('sha256').update(s).digest();

// The review password is ADMIN_TOKEN if set, otherwise the storage token Vercel creates
// when Upstash is connected (Vercel → Storage → the database → .env.local tab → KV_REST_API_TOKEN).
const reviewPassword = () => process.env.ADMIN_TOKEN || process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '';
// SHA-256 of the owner's admin password (the password itself is never stored in the repo).
const ADMIN_PASSWORD_SHA256 = 'a016c3135b9bb10b4309ea3e76de641c4d98886c5515ea483af67e876d82dd62';

function isAdmin(req: Request) {
  const got = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!got || got.length > 200) return false;
  if (timingSafeEqual(digest(got), Buffer.from(ADMIN_PASSWORD_SHA256, 'hex'))) return true;
  const want = reviewPassword();
  return want.length >= 16 && timingSafeEqual(digest(want), digest(got));
}

// Manual review: only the review password can change a submission's status.
export async function PATCH(req: Request, {params}: {params: Promise<{id: string}>}) {
  if (!isAdmin(req)) return json({error: 'Not allowed.'}, 401);
  if (!storeReady()) return json({error: 'Storage is not connected.'}, 503);
  const {id} = await params;
  if (!/^[a-z0-9-]{6,40}$/i.test(id)) return json({error: 'Bad id.'}, 400);
  let review: ReturnType<typeof validateReview>;
  try { review = validateReview(await req.json()); } catch (e) { return json({error: (e as Error).message}, 400); }
  const s = await getSubmission(id);
  if (!s) return json({error: 'Not found.'}, 404);
  const next = {...s, ...review, reviewedAt: new Date().toISOString()};
  await saveSubmission(next, false);
  return json({submission: next});
}
