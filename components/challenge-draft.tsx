'use client';
import {useEffect, useState} from 'react';
import {Icon} from './art';
import {Ticket} from './poster';
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
    setStatus('Pitch downloaded. It has not been sent or posted.');
  }

  return (
    <section className="editor" id="create">
      <div className="head reveal">
        <p className="kicker">Got an idea?</p>
        <h2 className="h-big">Pitch the<br/><span className="vice-text">next bounty.</span></h2>
        <p className="sub">We post bounties one at a time. Write up a fun one with rules anyone can judge from a clip. Your pitch stays on your device until pitching opens.</p>
      </div>

      <div className="editor-grid">
        <form className="panel beam reveal" onSubmit={save}>
          <label>Challenge title<input value={draft.title} onChange={set('title')} required maxLength={100} placeholder="Jet ski off the tallest pier"/></label>
          <label>What must the player do?<textarea value={draft.objective} onChange={set('objective')} required minLength={20} maxLength={2000} rows={3} placeholder="Objective, time limit, vehicle and what counts as a fail."/></label>
          <label>What must the clip show?<textarea value={draft.evidence} onChange={set('evidence')} required minLength={20} maxLength={2000} rows={3} placeholder="One continuous clip, HUD and timer visible, start to finish."/></label>
          <label>Anything else? <small>(optional)</small><input value={draft.rewardNotes} onChange={set('rewardNotes')} maxLength={300} placeholder="Why it would be fun to watch"/></label>
          <div className="draft-actions">
            <button className="btn btn-pink shimmer" type="submit">Save pitch <Icon type="download" size={18}/></button>
            {touched && <button type="button" className="link-btn" onClick={() => { setDraft(empty); setStatus('Pitch cleared from this device.'); }}>Clear</button>}
          </div>
          {status && <p role="status" className="note">{status}</p>}
          <p className="note">Saved on this device only. Nothing is sent anywhere yet.</p>
        </form>

        <div className="editor-side reveal">
          <div className="preview" aria-live="polite">
            <span className="preview-tag">Live preview</span>
            <Ticket
              no="Bounty #???"
              status={<span className="chip-status draft">Pitch</span>}
              stars={Math.max(1, Math.round(score / checks.length * 5))}
              kind="file" color="#ff2e88"
              title={draft.title.trim() || 'Name your bounty'}
              body={draft.objective.trim() || 'Say exactly what the player must do, with what, and how fast.'}/>
          </div>
          <div className="strength">
            <div className="row"><h3>Brief strength</h3><span className="score">{score}/{checks.length}</span></div>
            <div className="meter" role="meter" aria-label="Brief strength" aria-valuemin={0} aria-valuemax={checks.length} aria-valuenow={score}>
              {checks.map((c, i) => <i key={c.id} className={i < score ? 'on' : ''}/>)}
            </div>
            <ul>
              {checks.map(c => (
                <li key={c.id} className={c.ok ? 'ok' : touched ? 'miss' : ''}><Icon type={c.ok ? 'check' : 'plus'} size={14}/>{c.label}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
