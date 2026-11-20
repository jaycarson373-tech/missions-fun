import {NextResponse} from 'next/server';
import {validateSubmission, type Submission} from '@/lib/submissions';
import {createSubmission, listSubmissions, rateLimit, storeReady} from '@/lib/store';

export const dynamic = 'force-dynamic';
const json = (body: unknown, status = 200) => NextResponse.json(body, {status, headers: {'Cache-Control': 'no-store'}});

export async function GET() {
  if (!storeReady()) return json({open: false, submissions: []});
  try { return json({open: true, submissions: await listSubmissions()}); }
  catch { return json({open: false, submissions: [], error: 'Could not load submissions right now.'}, 503); }
}

export async function POST(req: Request) {
  if (!storeReady()) return json({error: 'Submissions open at launch.'}, 503);
  const origin=req.headers.get('origin');
  if(origin&&origin!==new URL(req.url).origin)return json({error:'Invalid request origin.'},403);
  const raw = await req.text();
  if (raw.length > 4000) return json({error: 'Submission is too large.'}, 413);
  let body: Record<string, unknown>;
  try { body = JSON.parse(raw); } catch { return json({error: 'Bad request.'}, 400); }

  let v: ReturnType<typeof validateSubmission>;
  try { v = validateSubmission(body); } catch (e) { return json({error: (e as Error).message}, 400); }

  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
  try {
    if (!await rateLimit(`ip:${ip}`, 6, 3600)) return json({error: 'Too many submissions. Try again in an hour.'}, 429);
    if (!await rateLimit(`w:${v.wallet}:${v.bountyId}`, 3, 86400)) return json({error: 'This wallet already submitted to this bounty today.'}, 429);
    const s: Submission = {
      id: `${Date.now().toString(36)}${crypto.randomUUID().slice(0, 6)}`, ...v,
      status: 'pending', createdAt: new Date().toISOString(), reviewedAt: null, reviewNote: '', payoutTx: null,
    };
    if (!await createSubmission(s)) return json({error:'That tweet was already submitted.'},409);
    return json({submission: s}, 201);
  } catch {
    return json({error: 'Could not save right now. Try again in a minute.'}, 503);
  }
}
