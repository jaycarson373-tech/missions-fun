'use client';
import {useEffect, useState} from 'react';
import {Icon, MissionArt} from './art';
import {briefChecks, REQUIRED_TOKENS} from '@/lib/missions';

const empty = {title: '', objective: '', evidence: '', rewardNotes: ''};
type Draft = typeof empty;

export default function ChallengeDraft() {
  const [draft, setDraft] = useState<Draft>(empty);
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('bounty:creator-draft') || 'null');
      if (saved) setDraft(Object.fromEntries(Object.keys(empty).map(k => [k, typeof saved[k] === 'string' ? saved[k].slice(0, 2000) : ''])) as Draft);
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem('bounty:creator-draft', JSON.stringify(draft)); }
    catch { setStatus('Device storage unavailable. Download your draft to keep it.'); }
  }, [draft, ready]);

  const set = (k: keyof Draft) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setDraft({...draft, [k]: e.target.value});
  const checks = briefChecks(draft);
  const score = checks.filter(c => c.ok).length;
  const touched = Object.values(draft).some(v => v.trim());

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.title.trim() || draft.objective.trim().length < 20 || draft.evidence.trim().length < 20) {
      setStatus('Add a title and at least 20 characters for the objective and the evidence rules.');
      return;
    }
    const blob = new Blob([JSON.stringify({
      schemaVersion: 1, project: 'BOUNTY', ...draft, status: 'local-draft', published: false, funded: false,
      aiVerified: false, requiredTokens: REQUIRED_TOKENS.toString(), wagered: false,
    }, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'bounty-challenge-draft.json'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus('Challenge draft downloaded. It has not been published or funded.');
  }

  return (
    <section className="creator" id="create">
      <div className="creator-intro">
        <p className="kicker">For challenge creators</p>
        <h2>Think someone<br/>can pull it off?</h2>
        <p className="lede">Write the challenge. Define what counts. Plan a community-funded reward with no entry bets.</p>
        <div className="draft-preview" aria-live="polite">
          <span className="preview-label">Live preview</span>
          <article className="card">
            <div className="card-art"><MissionArt kind="file" color="#ff5a1f"/><span className="card-no">Draft</span></div>
            <div className="card-body">
              <div className="card-top"><span className="tag">Your challenge</span></div>
              <h3>{draft.title.trim() || 'Name your challenge.'}</h3>
              <p>{draft.objective.trim() || 'Say exactly what the player must do, with what, and how fast.'}</p>
              <div className="card-foot"><span className="status">Local draft · not published</span></div>
            </div>
          </article>
        </div>
      </div>

      <div className="creator-work">
        <form onSubmit={save}>
          <label>Challenge title<input value={draft.title} onChange={set('title')} required maxLength={100} placeholder="Escape in a stolen police car"/></label>
          <label>What must the player do?<textarea value={draft.objective} onChange={set('objective')} required minLength={20} maxLength={2000} rows={3} placeholder="Objective, time limit, permitted vehicles and what counts as a fail."/></label>
          <label>What must the clip show?<textarea value={draft.evidence} onChange={set('evidence')} required minLength={20} maxLength={2000} rows={3} placeholder="Continuous footage, visible HUD, start and finish."/></label>
          <label>Reward plan <small>(optional)</small><input value={draft.rewardNotes} onChange={set('rewardNotes')} maxLength={300} placeholder="Sponsor or community pool; no player wagers"/></label>
          <div className="draft-actions">
            <button className="btn btn-hot" type="submit">Save challenge draft <Icon type="download"/></button>
            {touched && <button type="button" className="link-btn" onClick={() => { setDraft(empty); setStatus('Draft cleared from this device.'); }}>Clear draft</button>}
          </div>
          {status && <p role="status" className="muted">{status}</p>}
          <p className="muted">Saved on this device only. Publishing, funding and AI clip review are not active yet.</p>
        </form>

        <div className="strength">
          <div className="sub-head"><h3>Brief strength</h3><span className="score">{score}/{checks.length}</span></div>
          <div className="meter" role="meter" aria-label="Brief strength" aria-valuemin={0} aria-valuemax={checks.length} aria-valuenow={score}>
            <i style={{width: `${score / checks.length * 100}%`}}/>
          </div>
          <ul>
            {checks.map(c => (
              <li key={c.id} className={c.ok ? 'ok' : touched ? 'miss' : ''}>
                <Icon type={c.ok ? 'check' : 'plus'} size={14}/>{c.label}
              </li>
            ))}
          </ul>
          <p className="muted">A writing aid. A strong brief can be judged from a single clip.</p>
        </div>
      </div>
    </section>
  );
}
