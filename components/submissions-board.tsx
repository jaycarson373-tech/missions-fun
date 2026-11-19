'use client';
import {useCallback, useEffect, useState} from 'react';
import {liveBounties} from '@/lib/missions';
import {shortWallet, statusLabel, type Submission} from '@/lib/submissions';
import {Icon} from './art';

function ago(iso: string) {
  const s = Math.max(1, Math.round((Date.now() - Date.parse(iso)) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  return `${Math.round(s / 86400)}d ago`;
}

export default function SubmissionsBoard() {
  const [subs, setSubs] = useState<Submission[] | null>(null);
  const [open, setOpen] = useState(true);
  const [filter, setFilter] = useState('all');

  const load = useCallback(async () => {
    try {
      const r = await fetch('/api/submissions', {cache: 'no-store'});
      const j = await r.json() as {open?: boolean; submissions?: Submission[]};
      setOpen(j.open !== false);
      setSubs(Array.isArray(j.submissions) ? j.submissions : []);
    } catch { setSubs([]); }
  }, []);

  useEffect(() => {
    load();
    const on = () => load();
    addEventListener('bounty:submitted', on);
    const t = setInterval(load, 60000);
    return () => { removeEventListener('bounty:submitted', on); clearInterval(t); };
  }, [load]);

  const list = (subs ?? []).filter(s => filter === 'all' || s.bountyId === filter);
  const count = (st: string) => (subs ?? []).filter(s => s.status === st).length;

  return (
    <section className="board" id="submissions">
      <div className="board-head">
        <div>
          <h2 className="h2">Submissions</h2>
          <p className="board-sub">Every entry is public. Each one is reviewed by hand, and payouts are linked on-chain.</p>
        </div>
        {subs && subs.length > 0 && (
          <div className="board-stats">
            <span><b>{subs.length}</b>submitted</span>
            <span><b>{count('approved') + count('paid')}</b>passed</span>
            <span><b>{count('paid')}</b>paid</span>
          </div>
        )}
      </div>

      <div className="board-tabs" role="group" aria-label="Filter by bounty">
        {[['all', 'All'], ...liveBounties.map(m => [m.id, `#${m.id}`])].map(([k, l]) => (
          <button key={k} className={filter === k ? 'on' : ''} aria-pressed={filter === k} onClick={() => setFilter(k)}>{l}</button>
        ))}
      </div>

      {subs === null ? <p className="board-empty">Loading submissions…</p>
        : !open ? <p className="board-empty">Submissions open at launch. Entries will show up here.</p>
        : list.length === 0 ? <p className="board-empty">No submissions yet. Be the first.</p>
        : (
          <ul className="sub-list">
            {list.map(s => (
              <li key={s.id} className={`sub sub-${s.status}`}>
                <span className="sub-bounty">#{s.bountyId}</span>
                <div className="sub-who">
                  <a href={s.tweetUrl} target="_blank" rel="noopener noreferrer nofollow">@{s.handle} <Icon type="xlogo" size={12}/></a>
                  <a className="sub-wallet" href={`https://solscan.io/account/${s.wallet}`} target="_blank" rel="noopener noreferrer nofollow">{shortWallet(s.wallet)}</a>
                </div>
                <span className="sub-time">{ago(s.createdAt)}</span>
                <span className={`sub-status st-${s.status}`}>{statusLabel[s.status]}</span>
                {s.status === 'paid' && s.payoutTx && (
                  <a className="sub-tx" href={`https://solscan.io/tx/${s.payoutTx}`} target="_blank" rel="noopener noreferrer">Payout tx <Icon size={12}/></a>
                )}
                {s.reviewNote && <p className="sub-note">{s.reviewNote}</p>}
              </li>
            ))}
          </ul>
        )}
    </section>
  );
}
