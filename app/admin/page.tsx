'use client';
import {useCallback, useEffect, useState} from 'react';
import {STATUSES, statusLabel, shortWallet, type Status, type Submission} from '@/lib/submissions';

// Private review page. The password is the storage token from Vercel; it stays in this browser tab.
export default function Admin() {
  const [token, setToken] = useState('');
  const [subs, setSubs] = useState<Submission[]>([]);
  const [msg, setMsg] = useState('');
  const [edit, setEdit] = useState<Record<string, {status: Status; reviewNote: string; payoutTx: string}>>({});

  useEffect(() => { try { setToken(sessionStorage.getItem('bounty:admin') || ''); } catch {} }, []);
  const load = useCallback(async () => {
    const r = await fetch('/api/submissions', {cache: 'no-store'});
    const j = await r.json() as {submissions?: Submission[]};
    const list = j.submissions ?? [];
    setSubs(list);
    setEdit(Object.fromEntries(list.map(s => [s.id, {status: s.status, reviewNote: s.reviewNote, payoutTx: s.payoutTx ?? ''}])));
  }, []);
  useEffect(() => { load(); }, [load]);

  async function save(id: string) {
    setMsg('');
    const e = edit[id];
    const r = await fetch(`/api/submissions/${id}`, {method: 'PATCH', headers: {'Content-Type': 'application/json', Authorization: `Bearer ${token}`}, body: JSON.stringify(e)});
    const j = await r.json() as {error?: string};
    if (!r.ok) { setMsg(j.error || 'Save failed.'); return; }
    try { sessionStorage.setItem('bounty:admin', token); } catch {}
    setMsg('Saved.');
    load();
  }

  return (
    <main className="admin">
      <h1>Review submissions</h1>
      <label>Review password<input type="password" value={token} onChange={e => setToken(e.target.value)} autoComplete="off" placeholder="KV_REST_API_TOKEN from Vercel → Storage"/></label>
      {msg && <p className="admin-msg" role="status">{msg}</p>}
      <p className="admin-count">{subs.length} submissions · {subs.filter(s => s.status === 'pending').length} pending</p>
      <ul>
        {subs.map(s => (
          <li key={s.id}>
            <div className="admin-row">
              <b>#{s.bountyId}</b>
              <a href={s.tweetUrl} target="_blank" rel="noopener noreferrer">@{s.handle}</a>
              <a href={`https://solscan.io/account/${s.wallet}`} target="_blank" rel="noopener noreferrer" title={s.wallet}>{shortWallet(s.wallet)}</a>
              <span>{new Date(s.createdAt).toLocaleString()}</span>
              <span className={`sub-status st-${s.status}`}>{statusLabel[s.status]}</span>
            </div>
            {s.note && <p className="admin-note">Note: {s.note}</p>}
            <div className="admin-edit">
              <select value={edit[s.id]?.status} onChange={e => setEdit({...edit, [s.id]: {...edit[s.id], status: e.target.value as Status}})}>
                {STATUSES.map(st => <option key={st} value={st}>{statusLabel[st]}</option>)}
              </select>
              <input placeholder="Public note (why it passed or failed)" value={edit[s.id]?.reviewNote ?? ''} onChange={e => setEdit({...edit, [s.id]: {...edit[s.id], reviewNote: e.target.value}})} maxLength={280}/>
              <input placeholder="Payout tx signature (for Paid)" value={edit[s.id]?.payoutTx ?? ''} onChange={e => setEdit({...edit, [s.id]: {...edit[s.id], payoutTx: e.target.value}})} spellCheck={false}/>
              <button onClick={() => save(s.id)}>Save</button>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
