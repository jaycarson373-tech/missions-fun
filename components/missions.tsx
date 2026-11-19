'use client';
import {useEffect, useRef, useState} from 'react';
import {
  liveBounties, queuedBounties, calculateEligibility, makeProofDraft, briefLink, briefIdFromHash,
  shareText, xIntent, type Mission,
} from '@/lib/missions';
import {Icon, Skyline, Star} from './art';
import {LockedTicket, Stars} from './poster';
import ChallengeDraft from './challenge-draft';

type Modal = {type: 'submit'; mission: Mission} | {type: 'eligibility'} | null;
const live = liveBounties[0];

const ticker = [
  `Bounty #${live.id} is live`, live.title, 'Fees fill the pool', 'The pool holds Take-Two', 'One clip. No cuts.', 'No team supply',
];

const steps = [
  {icon: 'wallet', t: 'Hold 2.55M+', b: 'Keep at least 2,550,000 $BOUNTY in your Solana wallet. That is what makes you eligible.'},
  {icon: 'clip', t: 'Pull it off', b: 'Do the live bounty in GTA VI and record it in one continuous clip, HUD on, no cuts.'},
  {icon: 'check', t: 'Submit with your wallet', b: 'Send the clip link with your wallet address. The clip is checked against the rules and your wallet against the 2.55M minimum.'},
  {icon: 'coin', t: 'Get the bounty', b: 'Pass and the reward is paid in Take-Two from the bounty pool. Then the next bounty goes up.'},
];

const loop = [
  ['Trades', 'Every $BOUNTY trade pays a creator fee'],
  ['Pool', 'Fees fill the bounty pool, held in Take-Two'],
  ['Bounty', 'A new bounty goes up when the pool can fund it'],
  ['Payout', 'The first clip that passes gets paid from the pool'],
];

const faq = [
  ['How do I win a bounty?', 'Do the live bounty in GTA VI, record one uncut clip and submit it with your wallet. If the clip meets every rule and your wallet holds 2,550,000 $BOUNTY or more, you get the reward.'],
  ['Why do I need 2.55M tokens?', 'Only wallets holding at least 2,550,000 $BOUNTY can submit. The calculator on this page is an estimate only. The real check happens against your wallet when submissions open.'],
  ['Where does the reward come from?', 'Creator fees from $BOUNTY trading fill the bounty pool, and the pool holds Take-Two. Rewards are paid from it. Everything is subject to platform rules and legal review, and payouts are not live in this preview.'],
  ['When does the next bounty drop?', 'Bounties go up one at a time. Once the pool has enough in it to fund the next one, it is posted here.'],
  ['Is there a team supply?', 'No. There is no team token allocation.'],
  ['How are clips checked?', 'Each bounty has written rules you can judge from footage. Clips are checked against every rule, with AI assisting and a person making the call. Review is in build and not active yet.'],
  ['Is this made by Rockstar?', 'No. BOUNTY is an independent community project with original artwork. It is not affiliated with Rockstar Games or Take-Two, and tokens give no access to GTA VI or official rewards.'],
];

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('.reveal');
    if (!('IntersectionObserver' in window)) return;
    document.documentElement.classList.add('js');
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), {rootMargin: '0px 0px -8% 0px'});
    els.forEach(e => io.observe(e));
    return () => io.disconnect();
  }, []);
}

function Countdown() {
  const [t, setT] = useState(300);
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => setT(v => (v <= 0 ? 300 : v - 1)), 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="timer">{String(Math.floor(t / 60)).padStart(2, '0')}:{String(t % 60).padStart(2, '0')}</span>;
}

function Phone() {
  return (
    <div className="phone" aria-hidden="true">
      <div className="phone-screen">
        <div className="phone-wall"><Skyline/></div>
        <div className="phone-bar"><span>11:19</span><span className="phone-dots"><i/><i/><i/></span></div>
        <p className="phone-clock">11:19</p>
        <div className="notifs">
          <div className="notif n1"><img src="/mark.svg" width="34" height="34" alt=""/><div><b>BOUNTY · now</b><p>New bounty posted: <strong>{live.title}</strong></p></div></div>
          <div className="notif n2"><span className="notif-ico c-teal"><Icon type="coin" size={20}/></span><div><b>Pool · 2m</b><p>Fees are filling the pool. Next bounty posts when it can fund one.</p></div></div>
          <div className="notif n3"><span className="notif-ico c-sun"><Icon type="clip" size={20}/></span><div><b>Reminder</b><p>One clip. No cuts. Wallet needs 2.55M+.</p></div></div>
        </div>
      </div>
    </div>
  );
}

export default function Missions() {
  const [modal, setModal] = useState<Modal>(null);
  const [notice, setNotice] = useState('');
  const [amount, setAmount] = useState('');
  const [estimate, setEstimate] = useState('');
  const [evidence, setEvidence] = useState('');
  const [wallet, setWallet] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  useReveal();

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
        ? 'That meets the 2,550,000 minimum. This is an estimate, not a wallet check.'
        : `${(Number(r.shortfall) / 1e6).toLocaleString('en-US')} more tokens needed. This calculator does not check your wallet.`);
    } catch (e) { setEstimate(e instanceof Error ? e.message : 'Check the amount.'); }
  }

  const openSubmit = () => setModal({type: 'submit', mission: live});
  const shareHref = xIntent(shareText(live.title), briefLink(typeof location === 'undefined' ? '' : location.origin, live.id));

  return (
    <div className="site">
      <a className="skip" href="#main">Skip to content</a>

      <header className={menuOpen ? 'top open' : 'top'}>
        <a href="#" className="brand" aria-label="Bounty home"><img src="/mark.svg" width="34" height="34" alt=""/><span>Bounty</span></a>
        <nav id="nav" aria-label="Main navigation" onClick={() => setMenuOpen(false)}>
          <a href="#bounty">Live bounty</a>
          <a href="#how">How it works</a>
          <a href="#pool">The pool</a>
          <a href="#faq">FAQ</a>
        </nav>
        <div className="top-right">
          <button className="btn btn-pink btn-sm" onClick={openSubmit}>Submit a clip</button>
          <button className="menu-btn" aria-expanded={menuOpen} aria-controls="nav" aria-label="Menu" onClick={() => setMenuOpen(!menuOpen)}><i/><i/></button>
        </div>
      </header>

      <main id="main">
        {/* HERO */}
        <section className="hero">
          <div className="sky" aria-hidden="true"/>
          <Skyline className="hero-city"/>
          <div className="retro-grid" aria-hidden="true"><i/></div>

          <div className="hero-copy">
            <p className="kicker"><span className="live-dot"/>GTA VI clip bounties · Bounty #{live.id} live</p>
            <h1>Pull it off.<br/><span className="vice-text">Clip it.</span><br/>Get the bounty.</h1>
            <p className="lede">Fun, ridiculous, hard things to do in GTA VI, posted one at a time. Nail it in one uncut clip, submit it with your wallet, and get paid in Take-Two from the bounty pool.</p>
            <div className="hero-actions">
              <a href="#bounty" className="btn btn-pink shimmer">See the live bounty <Icon size={18}/></a>
              <a href="#how" className="btn btn-outline">How it works</a>
            </div>
            <p className="fine">Preview. Submissions and payouts open at launch. Not affiliated with Rockstar Games.</p>
          </div>
          <div className="hero-phone"><Phone/></div>
        </section>

        <div className="ticker" aria-hidden="true">
          <div className="ticker-track">
            {[0, 1].map(k => <span key={k}>{ticker.map(t => <b key={t}>{t}<Star size={14}/></b>)}</span>)}
          </div>
        </div>

        {/* LIVE BOUNTY */}
        <section className="live-sec" id="bounty">
          <div className="head reveal">
            <p className="kicker">Live now</p>
            <h2 className="h-big">Bounty <span className="vice-text">#{live.id}</span></h2>
          </div>

          <article className="feature reveal">
            <div className="feature-art banner">
              <div className="sky" aria-hidden="true"/>
              <Skyline/>
              <div className="banner-hud" aria-hidden="true">
                <span className="wanted-row">{Array.from({length: 6}, (_, i) => <Star key={i} size={46}/>)}</span>
                <Countdown/>
              </div>
              <span className="chip-status live"><span className="live-dot"/>Live</span>
            </div>
            <div className="feature-body">
              <div className="fb-main">
              <div className="feature-meta"><span className="tag">{live.category}</span><Stars n={live.difficulty} label size={20}/></div>
              <h3>{live.title}</h3>
              <p className="feature-lede">{live.description}</p>
              <div className="feature-actions">
                <button className="btn btn-pink shimmer" onClick={openSubmit}>Submit your clip <Icon type="clip" size={18}/></button>
                <button className="chip" onClick={() => copyLink(live)}>Copy link</button>
                <a className="chip" href={shareHref} target="_blank" rel="noopener noreferrer">Post on <Icon type="x" size={13}/></a>
              </div>
              <p className="eligible"><Icon type="wallet" size={16}/>Eligible wallets hold 2,550,000+ $BOUNTY. <button className="link-btn" onClick={() => setModal({type: 'eligibility'})}>Check an amount</button></p>
              </div>
              <div className="fb-side">
              <dl className="rule-sheet">
                <div><dt>Vehicle</dt><dd>{live.rules.vehicle}</dd></div>
                <div><dt>Limit</dt><dd>{live.rules.limit}</dd></div>
                <div><dt>Fail if</dt><dd>{live.rules.fail}</dd></div>
                <div><dt>Reward</dt><dd>Take-Two, paid from the pool</dd></div>
              </dl>
              <p className="proof-head">The clip must show</p>
              <ul className="proof-list">{live.proof.map(p => <li key={p}><Icon type="check" size={17}/>{p}</li>)}</ul>
              </div>
            </div>
          </article>

          <div className="queue reveal">
            <div className="queue-head">
              <div>
                <h3>Up next</h3>
                <p>The next bounty drops when the pool can fund it.</p>
              </div>
              <div className="pool-meter" aria-label="Pool size goes live with the token">
                <span>Bounty pool</span>
                <div className="bar"><i/></div>
                <small>Live pool size shows here at launch</small>
              </div>
            </div>
            <div className="queue-grid">
              {queuedBounties.slice(0, 3).map((m, i) => <LockedTicket key={m.id} no={`Bounty #00${i + 2}`} category={m.category} stars={m.difficulty}/>)}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="how" id="how">
          <div className="head reveal">
            <p className="kicker">How it works</p>
            <h2 className="h-big">Four steps.<br/><span className="vice-text">That’s it.</span></h2>
          </div>
          <ol className="how-steps">
            {steps.map((s, i) => (
              <li key={s.t} className="reveal" style={{transitionDelay: `${i * 80}ms`}}>
                <div className="how-top"><span className="how-no">0{i + 1}</span><span className="how-ico"><Icon type={s.icon} size={26}/></span></div>
                <h3>{s.t}</h3>
                <p>{s.b}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* THE POOL */}
        <section className="pool" id="pool">
          <div className="pool-grid">
            <div className="head reveal">
              <p className="kicker">The pool</p>
              <h2 className="h-big">Fees in.<br/><span className="vice-text">Bounties out.</span></h2>
              <p className="sub">Trading fees fill the bounty pool, and the pool holds Take-Two. Rewards come out of it, and every time it can fund another one, a new bounty goes up. No team supply.</p>
            </div>
            <ol className="loop reveal" aria-label="How the pool works">
              {loop.map(([t, b], i) => (
                <li key={t} style={{['--i' as string]: i}}><b>{t}</b><span>{b}</span></li>
              ))}
            </ol>
          </div>
          <div className="pool-stats reveal">
            <div><b>0</b><span>team supply</span></div>
            <div><b className="c-pink">1</b><span>bounty live at a time</span></div>
            <div><b className="c-sun">2.55M+</b><span>to be eligible</span></div>
            <div><b className="c-teal">TTWO</b><span>what the pool holds</span></div>
          </div>
        </section>

        <ChallengeDraft/>

        {/* FAQ */}
        <section className="faq" id="faq">
          <div className="head reveal"><p className="kicker">Questions</p><h2 className="h-big">FAQ</h2></div>
          <div className="faq-list reveal">
            {faq.map(([q, a], i) => (
              <details key={q} open={i === 0}><summary>{q}<Icon type="plus" size={20}/></summary><p>{a}</p></details>
            ))}
          </div>
        </section>

        {/* FINAL */}
        <section className="final">
          <div className="sky" aria-hidden="true"/>
          <Skyline/>
          <div className="final-inner reveal">
            <p className="kicker"><span className="live-dot"/>Live now</p>
            <h2 className="h-big h-shadow">{live.title}</h2>
            <div className="hero-actions">
              <button className="btn btn-pink shimmer" onClick={openSubmit}>Submit your clip <Icon size={18}/></button>
              <a href="#create" className="btn btn-outline">Pitch a bounty</a>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <a href="#" className="brand"><img src="/mark.svg" alt="" width="26" height="26"/><span>Bounty</span></a>
        <p>Independent GTA VI community project. Not affiliated with Rockstar Games or Take-Two. Rewards are subject to platform rules and legal review.</p>
        <div><a href="#faq">FAQ</a><a href="/brand/logo.svg" download>Brand mark <Icon type="download" size={14}/></a></div>
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
            <p className="kicker">Bounty #{modal.mission.id} · submit a clip</p>
            <h2 id="modal-title">{modal.mission.title}</h2>
            <ul className="proof-list">{modal.mission.proof.map(p => <li key={p}><Icon type="check" size={17}/>{p}</li>)}</ul>
            <form onSubmit={e => { e.preventDefault(); exportProof(modal.mission); }}>
              <label>Your Solana wallet<input value={wallet} onChange={e => setWallet(e.target.value)} required maxLength={60} placeholder="The wallet holding 2,550,000+ $BOUNTY" autoComplete="off" spellCheck={false}/></label>
              <label>Clip link<input type="url" placeholder="https://…" required value={evidence} onChange={e => setEvidence(e.target.value)} maxLength={2000}/></label>
              <label>What does the clip show?<textarea rows={3} required minLength={20} maxLength={2000} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Timestamps, when the timer starts and ends, anything a reviewer should look for…"/></label>
              {formError && <p className="error" role="alert">{formError}</p>}
              <button type="submit" className="btn btn-pink">Save submission <Icon type="download" size={18}/></button>
              <p className="note">Submissions open at launch. For now this saves a draft with your wallet and clip link on your device. Nothing is sent, signed or checked.</p>
            </form>
          </div>
        ) : modal?.type === 'eligibility' ? (
          <div className="modal-body access">
            <p className="kicker">Eligibility</p>
            <h2 id="modal-title">2,550,000+ <span className="vice-text">$BOUNTY</span></h2>
            <p className="modal-lede">Your wallet needs at least 2.55 million tokens to submit a clip.</p>
            <dl className="rule-sheet one"><div><dt>Token mint</dt><dd>Published at launch</dd></div></dl>
            <p className="note">Calculator only. No wallet is connected or checked.</p>
            <form className="calc" onSubmit={e => { e.preventDefault(); checkAmount(); }}>
              <label>Token amount<input inputMode="decimal" value={amount} onChange={e => { setAmount(e.target.value); setEstimate(''); }} placeholder="2550000" required maxLength={40}/></label>
              <button className="btn btn-pink" type="submit">Check <Icon size={18}/></button>
            </form>
            {estimate && <p className="estimate" role="status">{estimate}</p>}
          </div>
        ) : null}
      </dialog>
    </div>
  );
}
