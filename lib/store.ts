import type {Submission} from './submissions.ts';

// Upstash Redis over REST (Vercel Marketplace sets KV_REST_API_URL / KV_REST_API_TOKEN).
// Without it, development uses an in-memory store and production reports submissions closed.
const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '';
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '';
const memory = (globalThis as unknown as {__bountyMem?: Map<string, unknown>}).__bountyMem ??= new Map();

export function storeReady() { return Boolean(URL_ && TOKEN) || process.env.NODE_ENV !== 'production'; }

async function redis(cmd: (string | number)[]): Promise<unknown> {
  const r = await fetch(URL_, {method: 'POST', headers: {Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json'}, body: JSON.stringify(cmd), cache: 'no-store',signal:AbortSignal.timeout(8000)});
  const j = await r.json() as {result?: unknown; error?: string};
  if (!r.ok || j.error) throw new Error('store_error');
  return j.result;
}
const useRedis = () => Boolean(URL_ && TOKEN);

export async function rateLimit(key: string, max: number, windowSec: number) {
  if (!useRedis()) {
    const k = `rl:${key}`, now = Date.now(), e = memory.get(k) as {n: number; t: number} | undefined;
    const cur = e && now - e.t < windowSec * 1000 ? {n: e.n + 1, t: e.t} : {n: 1, t: now};
    memory.set(k, cur);
    return cur.n <= max;
  }
  const k = `rl:${key}`;
  const n = Number(await redis(['EVAL',"local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],ARGV[1]) end return n",1,k,windowSec]));
  return n <= max;
}

export async function claimTweet(url: string) {
  if (!useRedis()) {
    const set = (memory.get('tweets') as Set<string>) ?? new Set<string>();
    memory.set('tweets', set);
    if (set.has(url)) return false;
    set.add(url);
    return true;
  }
  return Number(await redis(['SADD', 'bounty:tweets', url])) === 1;
}

export async function saveSubmission(s: Submission, isNew: boolean) {
  if (!useRedis()) {
    memory.set(`sub:${s.id}`, s);
    if (isNew) memory.set('subs', [s.id, ...((memory.get('subs') as string[]) ?? [])]);
    return;
  }
  await redis(['SET', `bounty:sub:${s.id}`, JSON.stringify(s)]);
  if (isNew) await redis(['LPUSH', 'bounty:subs', s.id]);
}

export async function getSubmission(id: string): Promise<Submission | null> {
  if (!useRedis()) return (memory.get(`sub:${id}`) as Submission) ?? null;
  const v = await redis(['GET', `bounty:sub:${id}`]);
  return typeof v === 'string' ? JSON.parse(v) as Submission : null;
}

export async function listSubmissions(limit = 200): Promise<Submission[]> {
  if (!useRedis()) return ((memory.get('subs') as string[]) ?? []).slice(0, limit).map(id => memory.get(`sub:${id}`) as Submission).filter(Boolean);
  const ids = await redis(['LRANGE', 'bounty:subs', 0, limit - 1]) as string[];
  if (!ids?.length) return [];
  const vals = await redis(['MGET', ...ids.map(id => `bounty:sub:${id}`)]) as (string | null)[];
  return vals.filter((v): v is string => typeof v === 'string').map(v => JSON.parse(v) as Submission);
}

// Claim proof and save its row/index in one operation; a failed write cannot strand a tweet.
export async function createSubmission(s:Submission){
 if(!useRedis()){if(!await claimTweet(s.tweetUrl))return false;await saveSubmission(s,true);return true;}
 const script="if redis.call('SISMEMBER',KEYS[1],ARGV[1]) == 1 then return 0 end redis.call('SET',KEYS[2],ARGV[2]); redis.call('LPUSH',KEYS[3],ARGV[3]); redis.call('SADD',KEYS[1],ARGV[1]); return 1";
 return Number(await redis(['EVAL',script,3,'bounty:tweets',`bounty:sub:${s.id}`,'bounty:subs',s.tweetUrl,JSON.stringify(s),s.id]))===1;
}
