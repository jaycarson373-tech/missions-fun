'use client';
import {useEffect, useRef, useState} from 'react';
import {
  liveBounties, calculateEligibility, makeProofDraft, briefLink, briefIdFromHash,
  shareText, xIntent, type Mission,
} from '@/lib/missions';
import {Icon, Scene, Star} from './art';
import {Stars} from './poster';

type Modal = {type: 'submit'; mission: Mission} | {type: 'eligibility'} | null;
const live = liveBounties[0];

const steps = [
  {icon: 'wallet', t: 'Hold 2.5M+', b: 'Keep at least 2,500,000 $BOUNTY in your Solana wallet.'},
  {icon: 'clip', t: 'Clip it', b: 'Do the bounty in GTA VI. One continuous clip, no cuts.'},
  {icon: 'coin', t: 'Get paid', b: 'Submit the clip with your wallet. Pass and the reward is paid from the bounty pool.'},
];

const faq = [
  ['Where does the reward come from?', 'Trading fees fill the bounty pool, and rewards are paid from it. The amount is shown in SOL and paid out in TTWO, since $BOUNTY is paired with it. No team supply. Subject to platform rules and legal review; payouts are not live yet.'],
  ['When is the next bounty?', 'When the pool fills. Next bounties stay secret until they drop, so nobody gets a head start.'],
  ['Can more than one person win?', 'No. Each bounty pays the first clip that passes review. After that it closes.'],
  ['How are clips checked?', 'Against the bounty’s written rules, with AI helping and a person making the call. Your wallet must hold 2,500,000+ $BOUNTY.'],
  ['Is this made by Rockstar?', 'No. BOUNTY is an independent community project with original artwork, not affiliated with Rockstar Games or Take-Two.'],
];

export default function Missions() {
  const [modal, setModal] = useState<Modal>(null);
  const [notice, setNotice] = useState('');
  const [amount, setAmount] = useState('');
  const [estimate, setEstimate] = useState('');
  const [evidence, setEvidence] = useState('');
  const [wallet, setWallet] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (modal) {
      opener.current = document.activeElement as HTMLElement;
      if (!dialog.current?.open) dialog.current?.showModal();
      setFormError(''); setEstimate(''); setAmount('');
    } else if (dialog.current?.open) {
      dialog.current.close();
      opener.current?.focus();
    }
  }, [modal]);

  // Deep link: #brief-001 opens the submit sheet for the live bounty.
  useEffect(() => {
    const open = () => {
      const id = briefIdFromHash(location.hash);
      const m = id && liveBounties.find(x => x.id === id);
      if (m) setModal({type: 'submit', mission: m});
    };
    open();
    addEventListener('hashchange', open);
    return () => removeEventListener('hashchange', open);
  }, []);

  useEffect(() => {
    try {
      if (modal?.type === 'submit') {
        if (location.hash !== `#brief-${modal.mission.id}`) history.replaceState(null, '', `#brief-${modal.mission.id}`);
      } else if (briefIdFromHash(location.hash)) {
        history.replaceState(null, '', location.pathname + location.search);
      }
    } catch {}
  }, [modal]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(''), 4500);
    return () => clearTimeout(t);
  }, [notice]);

  async function copyLink(m: Mission) {
    const url = briefLink(location.origin, m.id);
    try { await navigator.clipboard.writeText(url); setNotice('Bounty link copied.'); }
    catch { setNotice(url); }
  }

  function exportProof(m: Mission) {
    try {
      const draft = makeProofDraft(m.id, evidence, notes, wallet);
      const link = URL.createObjectURL(new Blob([JSON.stringify(draft, null, 2)], {type: 'application/json'}));
      const a = document.createElement('a');
      a.href = link; a.download = `bounty-${m.id}-submission-draft.json`; a.click();
      setTimeout(() => URL.revokeObjectURL(link), 1000);
      setFormError(''); setNotice('Submission draft saved. It has not been sent.'); setModal(null);
    } catch (e) { setFormError(e instanceof Error ? e.message : 'Please check your submission.'); }
  }

  function checkAmount() {
    try {
      const r = calculateEligibility(amount);
      setEstimate(r.meetsThreshold
        ? 'That meets the 2,500,000 minimum. This is an estimate, not a wallet check.'
        : `${(Number(r.shortfall) / 1e6).toLocaleString('en-US')} more tokens needed. This calculator does not check your wallet.`);
    } catch (e) { setEstimate(e instanceof Error ? e.message : 'Check the amount.'); }
  }

  const openSubmit = (m: Mission = live) => setModal({type: 'submit', mission: m});
  const shareHref = (m: Mission) => xIntent(shareText(m.title), briefLink(typeof location === 'undefined' ? '' : location.origin, m.id));

  return (
    <div className="site">
      <a className="skip" href="#main">Skip to content</a>

      <header className="top">
        <a href="#" className="brand" aria-label="Bounty home"><img src="/mark.svg" width="34" height="34" alt=""/><span>Bounty</span></a>
        <nav aria-label="Main navigation"><a href="#bounty">Bounties</a><a href="#next">Next</a><a href="#how">How it works</a><a href="#faq">FAQ</a></nav>
        <button className="btn btn-pink btn-sm" onClick={() => openSubmit()}>Submit a clip</button>
      </header>

      <main id="main">
        <section className="hero">
          <Scene className="hero-scene"/>
          <div className="hero-copy">
            <p className="pill"><span className="live-dot"/>{liveBounties.length} bounties live · {liveBounties.reduce((t, m) => t + parseFloat(m.reward), 0)} SOL up for grabs</p>
            <h1>Pull it off.<br/>Clip it.<br/><span className="vice-text">Get paid.</span></h1>
            <p className="lede">Wild things to pull off in GTA VI. Clip it, submit it with your wallet, and the first clip that passes takes the bounty.</p>
            <div className="hero-actions">
              <a href="#bounty" className="btn btn-pink">See the bounties <Icon size={18}/></a>
              <a href="#how" className="btn btn-ghost">How it works</a>
            </div>
          </div>
        </section>

        <section className="bounty" id="bounty">
          {liveBounties.map(m => (
            <article className="card" key={m.id}>
              <div className="card-reward">
                <span className="label"><span className="live-dot"/>Live · Bounty #{m.id}</span>
                <span className="wanted-row" aria-label={`${m.wanted}-star wanted level`}>{Array.from({length: m.wanted}, (_, i) => <Star key={i} size={26}/>)}</span>
                <b className="amount">{m.reward}</b>
                <span className="label">Reward</span>
                <small className="paid-in">paid in TTWO</small>
              </div>
              <div className="card-body">
                <Stars n={m.difficulty} label size={18}/>
                <h2>{m.title}</h2>
                <p>{m.description}</p>
                <ul className="rules">
                  <li><b>Fail if</b>{m.rules.fail}</li>
                  {m.proof.slice(1).map(p => <li key={p}><b>Clip</b>{p}</li>)}
                </ul>
                <div className="card-actions">
                  <button className="btn btn-pink" onClick={() => openSubmit(m)}>Submit your clip <Icon type="clip" size={18}/></button>
                  <button className="chip" onClick={() => copyLink(m)}>Copy link</button>
                  <a className="chip" href={shareHref(m)} target="_blank" rel="noopener noreferrer">Share on <Icon type="x" size={13}/></a>
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="ideas" id="next">
          <h2 className="h2">Next bounties</h2>
          <p className="ideas-sub">Classified until they drop. New bounties go live when the pool fills.</p>
          <div className="mystery-grid">
            {[3, 4].map(n => (
              <div className="mystery" key={n}>
                <span className="label"><Icon type="lock" size={14}/>Bounty #00{n}</span>
                <b className="q">???</b>
                <span className="redact" aria-hidden="true"><i/><i/></span>
                <span className="label">Reward ??? · drops when the pool fills</span>
              </div>
            ))}
          </div>
        </section>

        <section className="how" id="how">
          <h2 className="h2">How it works</h2>
          <ol className="steps">
            {steps.map((s, i) => (
              <li key={s.t}>
                <span className="step-ico"><Icon type={s.icon} size={24}/></span>
                <div><h3><em>{i + 1}</em>{s.t}</h3><p>{s.b}</p></div>
              </li>
            ))}
          </ol>
          <p className="fees">Fees fill the pool <Icon size={14}/> a new bounty posts when it’s full. <b>No team supply.</b></p>
          <button className="link-btn" onClick={() => setModal({type: 'eligibility'})}>Check if an amount is 2.5M+</button>
        </section>

        <section className="faq" id="faq">
          <h2 className="h2">FAQ</h2>
          <div className="faq-list">
            {faq.map(([q, a]) => <details key={q}><summary>{q}<Icon type="plus" size={18}/></summary><p>{a}</p></details>)}
          </div>
        </section>
      </main>

      <footer>
        <span className="brand"><img src="/mark.svg" alt="" width="24" height="24"/><span>Bounty</span></span>
        <p>Independent GTA VI community project. Not affiliated with Rockstar Games or Take-Two.</p>
      </footer>

      {notice && (
        <div className="toast" role="status">
          <span>{notice}</span>
          <button onClick={() => setNotice('')} aria-label="Dismiss notification"><Icon type="close" size={18}/></button>
        </div>
      )}

      <dialog ref={dialog} onCancel={() => setModal(null)} onClose={() => { if (modal) setModal(null); }}
        onClick={e => { if (e.target === e.currentTarget) setModal(null); }} aria-labelledby="modal-title">
        <button className="modal-close" aria-label="Close dialog" onClick={() => setModal(null)}><Icon type="close"/></button>
        {modal?.type === 'submit' ? (
          <div className="modal-body">
            <p className="label">Bounty #{modal.mission.id} · submit a clip</p>
            <h2 id="modal-title">{modal.mission.title}</h2>
            <p className="note">Reward: {modal.mission.reward}. First clip that passes review wins.</p>
            <form onSubmit={e => { e.preventDefault(); exportProof(modal.mission); }}>
              <label>Your Solana wallet<input value={wallet} onChange={e => setWallet(e.target.value)} required maxLength={60} placeholder="Wallet holding 2,500,000+ $BOUNTY" autoComplete="off" spellCheck={false}/></label>
              <label>Clip link<input type="url" placeholder="https://…" required value={evidence} onChange={e => setEvidence(e.target.value)} maxLength={2000}/></label>
              <label>What does it show?<textarea rows={3} required minLength={20} maxLength={2000} value={notes} onChange={e => setNotes(e.target.value)} placeholder="When the timer starts and ends, anything a reviewer should look for…"/></label>
              {formError && <p className="error" role="alert">{formError}</p>}
              <button type="submit" className="btn btn-pink">Save submission <Icon type="download" size={18}/></button>
              <p className="note">Submissions open at launch. For now this saves a draft on your device. Nothing is sent or checked.</p>
            </form>
          </div>
        ) : modal?.type === 'eligibility' ? (
          <div className="modal-body">
            <p className="label">Eligibility</p>
            <h2 id="modal-title">2,500,000+ <span className="vice-text">$BOUNTY</span></h2>
            <p className="note">Calculator only. No wallet is connected or checked.</p>
            <form className="calc" onSubmit={e => { e.preventDefault(); checkAmount(); }}>
              <label>Token amount<input inputMode="decimal" value={amount} onChange={e => { setAmount(e.target.value); setEstimate(''); }} placeholder="2500000" required maxLength={40}/></label>
              <button className="btn btn-pink" type="submit">Check</button>
            </form>
            {estimate && <p className="estimate" role="status">{estimate}</p>}
          </div>
        ) : null}
      </dialog>
    </div>
  );
}
