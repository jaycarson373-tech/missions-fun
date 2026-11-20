import {NextResponse} from 'next/server';
import {authorizeAdmin} from '@/lib/admin';
import {validateReview} from '@/lib/submissions';
import {getSubmission, saveSubmission, storeReady} from '@/lib/store';

export const dynamic = 'force-dynamic';
const json = (body: unknown, status = 200) => NextResponse.json(body, {status, headers: {'Cache-Control': 'no-store'}});
// Manual review: only the review password can change a submission's status.
export async function PATCH(req: Request, {params}: {params: Promise<{id: string}>}) {
  const auth = await authorizeAdmin(req);
  if (auth !== 200) return json({error: auth === 429 ? 'Too many attempts. Try again later.' : 'Not allowed.'}, auth);
  if (!storeReady()) return json({error: 'Storage is not connected.'}, 503);
  const {id} = await params;
  if (!/^[a-z0-9-]{6,40}$/i.test(id)) return json({error: 'Bad id.'}, 400);
  let review: ReturnType<typeof validateReview>;
  try { const raw = await req.text(); if(raw.length > 4000) return json({error:'Request too large.'},413); review = validateReview(JSON.parse(raw)); } catch (e) { return json({error: (e as Error).message}, 400); }
  try {
  const s = await getSubmission(id);
  if (!s) return json({error: 'Not found.'}, 404);
  const next = {...s, ...review, reviewedAt: new Date().toISOString()};
  await saveSubmission(next, false);
  return json({submission: next});
  } catch { return json({error: "Could not save the review. Try again."}, 503); }
}
