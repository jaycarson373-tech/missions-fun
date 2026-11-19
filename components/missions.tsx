'use client';
import {useEffect, useRef, useState} from 'react';
import {
  liveBounties, calculateEligibility, briefLink, briefIdFromHash,
  shareText, xIntent, type Mission,
} from '@/lib/missions';
import {Icon, Scene, Star} from './art';
import {Stars} from './poster';
import SubmissionsBoard from './submissions-board';
import {tweetTemplate, validateSubmission, type Submission} from '@/lib/submissions';

type Modal = {type: 'submit'; mission: Mission} | {type: 'eligibility'} | null;
const live = liveBounties[0];

const steps = [
  {icon: 'wallet', t: 'Hold 2.5M+', b: 'Keep at least 2,500,000 $BOUNTY in your Solana wallet.'},
  {icon: 'clip', t: 'Clip it', b: 'Do the bounty in GTA VI. One continuous clip, no cuts.'},
  {icon: 'coin', t: 'Tweet it & submit', b: 'Tweet the clip, then submit the tweet link with your wallet. Every entry is reviewed by hand, and the first one that passes gets paid.'},
];

const faq = [
  ['Where does the reward come from?', 'Trading fees fill the bounty pool, and rewards are paid from it. The amount is shown in SOL and paid out in TTWO, since $BOUNTY is paired with it. No team supply. Subject to platform rules and legal review; payouts are not live yet.'],
  ['When is the next bounty?', 'When the pool fills. Next bounties stay secret until they drop, so nobody gets a head start.'],
  ['Can more than one person win?', 'No. Each bounty pays the first clip that passes review. After that it closes.'],
  ['How are clips checked?', 'By hand. We watch every clip against the bounty’s rules and check that the wallet holds 2,500,000+ $BOUNTY. Every status and payout shows on the public submissions board.'],
  ['Is this made by Rockstar?', 'No. BOUNTY is an independent community project with original artwork, not affiliated with Rockstar Games or Take-Two.'],
];

type Slide = {kind: 'live'; m: Mission} | {kind: 'locked'; n: number};
const slides: Slide[] = [...liveBounties.map(m => ({kind: 'live' as const, m})), {kind: 'locked', n: liveBounties.length + 1}, {kind: 'locked', n: liveBounties.length + 2}];

function HeroDeck({onSubmit}: {onSubmit: (m: Mission) => void}) {
  const rail = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(0);
  const [hold, setHold] = useState(false);
  const go = (k: number) => {
    const el = rail.current;
    if (!el) return;
    const n = (k + slides.length) % slides.length;
    el.scrollTo({left: n * el.clientWidth, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
  };
  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    const on = () => setI(Math.round(el.scrollLeft / Math.max(1, el.clientWidth)));
    el.addEventListener('scroll', on, {passive: true});
    return () => el.removeEventListener('scroll', on);
  }, []);
  useEffect(() => {
    if (hold || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setTimeout(() => go(i + 1), 5000);
    return () => clearTimeout(t);
  }, [i, hold]);
  return (
    <div className="deck" onMouseEnter={() => setHold(true)} onMouseLeave={() => setHold(false)} onTouchStart={() => setHold(true)} onFocusCapture={() => setHold(true)}>
      <div className="rail" ref={rail} role="region" aria-roledescription="carousel" aria-label="Bounties">
        {slides.map((s, k) => (
          <div className="slide" key={k} role="group" aria-roledescription="slide" aria-label={`${k + 1} of ${slides.length}`}>
            {s.kind === 'live' ? (
              <article className="deck-card">
                <div className="deck-top"><span className="badge-live"><span className="live-dot"/>Live · #{s.m.id}</span><Stars n={s.m.difficulty} size={14}/></div>
                <span className="wanted-row" aria-label={`${s.m.wanted}-star wanted level`}>{Array.from({length: s.m.wanted}, (_, j) => <Star key={j} size={30}/>)}</span>
                <h3>{s.m.title}</h3>
                <p>{s.m.description}</p>
                <div className="deck-reward"><span>Reward</span><b>{s.m.reward}</b></div>
                <div className="deck-actions">
                  <button className="btn btn-pink" onClick={() => onSubmit(s.m)}>Submit clip</button>
                  <a className="chip" href={`#bounty-${s.m.id}`}>Rules</a>
                </div>
              </article>
            ) : (
              <article className="deck-card locked">
                <div className="deck-top"><span className="badge-lock"><Icon type="lock" size={13}/>Bounty #00{s.n}</span></div>
                <b className="q">???</b>
                <p className="redact" aria-hidden="true"><i/><i/><i/></p>
                <div className="deck-reward"><span>Reward</span><b>??? SOL</b></div>
                <p className="deck-note">Classified. Drops when the pool fills.</p>
              </article>
            )}
          </div>
        ))}
      </div>
      <div className="deck-nav">
        <button aria-label="Previous bounty" onClick={() => go(i - 1)}><Icon type="left" size={18}/></button>
        <div className="dots">{slides.map((_, k) => <button key={k} className={k === i ? 'on' : ''} aria-label={`Go to slide ${k + 1}`} aria-current={k === i} onClick={() => go(k)}/>)}</div>
        <button aria-label="Next bounty" onClick={() => go(i + 1)}><Icon size={18}/></button>
      </div>
      <p className="swipe-hint">Swipe for more bounties</p>
    </div>
  );
}

export default function Missions() {
  const [modal, setModal] = useState<Modal>(null);
  const [notice, setNotice] = useState('');
  const [amount, setAmount] = useState('');
  const [estimate, setEstimate] = useState('');
  const [tweet, setTweet] = useState('');
  const [wallet, setWallet] = useState('');
  const [note, setNote] = useState('');
  const [formError, setFormError] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<Submission | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (modal) {
      opener.current = document.activeElement as HTMLElement;
      if (!dialog.current?.open) dialog.current?.showModal();
      setFormError(''); setEstimate(''); setAmount(''); setDone(null);
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

  async function submitEntry(m: Mission) {
    setFormError('');
    try { validateSubmission({bountyId: m.id, wallet, tweetUrl: tweet, note}); }
    catch (e) { setFormError((e as Error).message); return; }
    setSending(true);
    try {
      const r = await fetch('/api/submissions', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({bountyId: m.id, wallet, tweetUrl: tweet, note})});
      const j = await r.json() as {submission?: Submission; error?: string};
      if (!r.ok || !j.submission) { setFormError(j.error || 'Could not submit right now.'); return; }
      setDone(j.submission); setTweet(''); setNote('');
      dispatchEvent(new Event('bounty:submitted'));
    } catch { setFormError('Could not reach the server. Try again.'); }
    finally { setSending(false); }
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
        <a href="#" className="brand" aria-label="Bounty home"><img src="/logo.jpg" width="40" height="40" alt=""/><span>Bounty</span></a>
        <nav aria-label="Main navigation"><a href="#bounty">Bounties</a><a href="#submissions">Submissions</a><a href="#how">How it works</a><a href="#faq">FAQ</a></nav>
        <button className="btn btn-pink btn-sm" onClick={() => openSubmit()}>Submit a clip</button>
      </header>

      <main id="main">
        <section className="hero">
          <Scene className="hero-scene"/>
          <div className="hero-copy">
            <p className="pill"><span className="live-dot"/>{liveBounties.length} bounties live · {liveBounties.reduce((t, m) => t + parseFloat(m.reward), 0)} SOL up for grabs</p>
            <h1>Pull it off.<br/>Clip it.<br/><span className="vice-text">Get paid.</span></h1>
            <p className="lede">Each bounty is a challenge with real SOL on it. Pull it off in GTA VI, record it in one uncut clip, and submit it with your wallet. The first clip that passes gets paid.</p>
            <div className="hero-actions">
              <a href="#bounty" className="btn btn-pink">See the bounties <Icon size={18}/></a>
              <a href="#how" className="btn btn-ghost">How it works</a>
            </div>
            <ol className="mini-steps" aria-label="How a bounty works">
              <li><span className="mini-ico"><Icon type="target" size={20}/></span>Complete a bounty</li>
              <li aria-hidden="true" className="mini-arrow"><Icon size={16}/></li>
              <li><span className="mini-ico"><Icon type="cam" size={20}/></span>Clip and post proof</li>
              <li aria-hidden="true" className="mini-arrow"><Icon size={16}/></li>
              <li><span className="mini-ico"><Icon type="cash" size={20}/></span>Get paid</li>
            </ol>
          </div>
          <HeroDeck onSubmit={openSubmit}/>
        </section>

        <section className="bounty" id="bounty">
          {liveBounties.map(m => (
            <article className="card" key={m.id} id={`bounty-${m.id}`}>
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
                  <li><b>Starts</b>{m.proof[1]}</li>
                  <li><b>Ends</b>{m.proof[2]}</li>
                </ul>
                <div className="card-actions">
                  <button className="btn btn-pink" onClick={() => openSubmit(m)}>Submit your clip <Icon type="clip" size={18}/></button>
                  <button className="chip" onClick={() => copyLink(m)}>Copy link</button>
                  <a className="chip" href={shareHref(m)} target="_blank" rel="noopener noreferrer">Share on <Icon type="xlogo" size={13}/></a>
                </div>
              </div>
            </article>
          ))}
        </section>

        <SubmissionsBoard/>

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
          <button className="link-btn" onClick={() => setModal({type: 'eligibility'})}>Not sure you hold enough? Check an amount</button>
        </section>

        <section className="faq" id="faq">
          <h2 className="h2">FAQ</h2>
          <div className="faq-list">
            {faq.map(([q, a]) => <details key={q}><summary>{q}<Icon type="plus" size={18}/></summary><p>{a}</p></details>)}
          </div>
        </section>
      </main>

      <footer>
        <span className="brand"><img src="/logo.jpg" alt="" width="28" height="28"/><span>Bounty</span></span>
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
            <p className="label">Bounty #{modal.mission.id} · {modal.mission.reward}</p>
            <h2 id="modal-title">{modal.mission.title}</h2>
            {done ? (
              <div className="sent">
                <span className="sent-ico"><Icon type="check" size={26}/></span>
                <h3>Submitted</h3>
                <p>Your entry is on the public board as <b>Pending review</b>. We check every clip by hand, plus your wallet’s 2.5M+ balance.</p>
                <a className="btn btn-pink" href="#submissions" onClick={() => setModal(null)}>See it on the board</a>
              </div>
            ) : (
              <form onSubmit={e => { e.preventDefault(); submitEntry(modal.mission); }}>
                <ol className="submit-steps">
                  <li>
                    <b>1. Tweet your clip</b>
                    <span>Post the full uncut clip on X and tag $BOUNTY.</span>
                    <a className="chip" target="_blank" rel="noopener noreferrer"
                      href={`https://x.com/intent/post?text=${encodeURIComponent(tweetTemplate(modal.mission.title, modal.mission.id, typeof location === 'undefined' ? '' : location.origin))}`}>
                      Open a tweet <Icon type="xlogo" size={13}/>
                    </a>
                  </li>
                  <li><b>2. Paste the tweet and your wallet</b></li>
                </ol>
                <label>Tweet link<input type="url" inputMode="url" placeholder="https://x.com/you/status/…" required value={tweet} onChange={e => setTweet(e.target.value)} maxLength={300}/></label>
                <label>Your Solana wallet<input value={wallet} onChange={e => setWallet(e.target.value)} required maxLength={60} placeholder="Wallet holding 2,500,000+ $BOUNTY" autoComplete="off" spellCheck={false}/></label>
                <label>Note for the reviewer <small>(optional)</small><textarea rows={2} maxLength={280} value={note} onChange={e => setNote(e.target.value)} placeholder="Timestamp where the sixth star appears, anything to look for…"/></label>
                {formError && <p className="error" role="alert">{formError}</p>}
                <button type="submit" className="btn btn-pink" disabled={sending}>{sending ? 'Submitting…' : 'Submit for review'}</button>
                <p className="note">Your tweet link, wallet and status are shown publicly on the submissions board.</p>
              </form>
            )}
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
