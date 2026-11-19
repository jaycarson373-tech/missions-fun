'use client';
import {useEffect, useRef, useState} from 'react';
import {
  missions, categories, calculateEligibility, makeProofDraft, briefLink, briefIdFromHash,
  shareText, xIntent, type Category, type Mission,
} from '@/lib/missions';
import {Icon, MissionArt, Minimap, Skyline, Star} from './art';
import {Poster, Stars} from './poster';
import ChallengeDraft from './challenge-draft';

type Modal = {type: 'mission'; mission: Mission} | {type: 'eligibility'} | null;

const ticker = [
  'Six stars. Five minutes.', 'Steal a cop car. Lose the cops.', 'Stick the landing.',
  'One clip. No cuts.', 'No entry fees. No wagers.', 'Clip or it didn’t happen.',
];

const objectives = [
  ['Create the challenge', 'Write a brief anyone can judge from a clip: the objective, the vehicle, the time limit and what counts as a fail.'],
  ['Record the run', 'Play it in GTA VI and capture one continuous clip, start to finish, HUD on.'],
  ['The clip gets checked', 'AI compares the footage to every written rule. Anything uncertain goes to a human reviewer. In build, not live yet.'],
  ['Mission passed', 'Accepted runs are paid from a non-wagered community or sponsor pool, or earn on-chain reputation. Subject to platform rules and legal review.'],
];

const sides = [
  {key: 'creator', name: 'Creator', color: 'pink', icon: 'plus', blurb: 'You know the run nobody can pull off. Put it on the board with rules tight enough to judge from one clip.',
    stats: [['Skill', 2], ['Creativity', 5], ['Effort', 2]], steps: ['Write the brief in the mission editor.', 'Set the vehicle, limit and fail conditions.', 'A pool gets funded, entries open.'], cta: 'Post a challenge', href: '#create'},
  {key: 'hunter', name: 'Hunter', color: 'teal', icon: 'play', blurb: 'You already play the game. The board puts a target on your best run and a reason to hit record.',
    stats: [['Skill', 5], ['Creativity', 2], ['Effort', 4]], steps: ['Pick a bounty from the board.', 'Record the run in one uncut clip.', 'Submit it for AI and human review.'], cta: 'Browse bounties', href: '#board'},
  {key: 'holder', name: 'Holder', color: 'sun', icon: 'check', blurb: 'Hold 2,550,000 $BOUNTY to submit runs. Planned: wallet reputation from verified runs and a say in what goes on the board.',
    stats: [['Skill', 1], ['Creativity', 3], ['Effort', 1]], steps: ['Hold the threshold in the wallet you submit with.', 'Verified runs build your reputation (planned).', 'Vote on new bounties (planned).'], cta: 'Check the threshold', href: ''},
] as const;

const faq = [
  ['What is BOUNTY?', 'A board of player-made GTA VI challenges. Survive six stars for five minutes, escape in a stolen police car, land a brutal stunt. You record the run, submit the clip, and it gets checked against the rules.'],
  ['How does verification work?', 'Every brief has written rules that can be judged from footage. AI-assisted review checks the clip against each rule, and a human settles anything uncertain or disputed. This is in build and not active in the preview.'],
  ['Where do rewards come from?', 'Non-wagered community or sponsor reward pools, or token-based reputation. Players never bet against each other and there are no entry fees. All of it is subject to platform rules and legal review, and none of it is live yet.'],
  ['Why 2,550,000 $BOUNTY?', 'It is the minimum holding to submit a run. Holding never wins a bounty on its own: you still need a funded brief and a clip that passes review. The mint and the balance-check timing are published before submissions open.'],
  ['Can I do these challenges yet?', 'Briefs are proposals until vehicles, routes and wanted levels are confirmed in playable GTA VI. The six-star brief falls back to the highest wanted level the game really has.'],
  ['Is this made by Rockstar?', 'No. BOUNTY is an independent community project with original artwork. It is not affiliated with Rockstar Games or Take-Two, and tokens give no access to GTA VI, game items or official rewards.'],
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

function CountUp({to, suffix = ''}: {to: number; suffix?: string}) {
  const [v, setV] = useState(to);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
    setV(0);
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const step = (t: number) => { const k = Math.min(1, (t - t0) / 900); setV(Math.round(to * (1 - Math.pow(1 - k, 3)))); if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    });
    io.observe(el);
    return () => io.disconnect();
  }, [to]);
  return <span ref={ref}>{v}{suffix}</span>;
}

export default function Missions() {
  const [category, setCategory] = useState<Category>('All');
  const [query, setQuery] = useState('');
  const [saved, setSaved] = useState<string[]>([]);
  const [savedOnly, setSavedOnly] = useState(false);
  const [modal, setModal] = useState<Modal>(null);
  const [notice, setNotice] = useState('');
  const [amount, setAmount] = useState('');
  const [estimate, setEstimate] = useState('');
  const [evidence, setEvidence] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [faqOpen, setFaqOpen] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  useReveal();

  useEffect(() => {
    try {
      const x = JSON.parse(localStorage.getItem('missions:saved') || '[]');
      if (Array.isArray(x)) setSaved(x.filter(id => typeof id === 'string' && missions.some(m => m.id === id)));
    } catch {}
  }, []);

  useEffect(() => {
    if (modal) {
      opener.current = document.activeElement as HTMLElement;
      if (!dialog.current?.open) dialog.current?.showModal();
      setFormError(''); setEvidence(''); setNotes(''); setEstimate(''); setAmount('');
    } else if (dialog.current?.open) {
      dialog.current.close();
      opener.current?.focus();
    }
  }, [modal]);

  // Deep links: #brief-001 opens that brief.
  useEffect(() => {
    const open = () => {
      const id = briefIdFromHash(location.hash);
      const m = id && missions.find(x => x.id === id);
      if (m) setModal({type: 'mission', mission: m});
    };
    open();
    addEventListener('hashchange', open);
    return () => removeEventListener('hashchange', open);
  }, []);

  useEffect(() => {
    try {
      if (modal?.type === 'mission') {
        if (location.hash !== `#brief-${modal.mission.id}`) history.replaceState(null, '', `#brief-${modal.mission.id}`);
      } else if (briefIdFromHash(location.hash)) {
        history.replaceState(null, '', location.pathname + location.search);
      }
    } catch {}
  }, [modal]);

  // Press B to open the board, like a game menu.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key.toLowerCase() !== 'b' || e.metaKey || e.ctrlKey || e.altKey || dialog.current?.open) return;
      if (t.closest('input,textarea,select,[contenteditable="true"]')) return;
      document.getElementById('board')?.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(''), 4500);
    return () => clearTimeout(t);
  }, [notice]);

  async function copyLink(m: Mission) {
    const url = briefLink(location.origin, m.id);
    try { await navigator.clipboard.writeText(url); setNotice('Brief link copied. Send it to someone who thinks they can do it.'); }
    catch { setNotice(url); }
  }

  function bookmark(id: string) {
    const next = saved.includes(id) ? saved.filter(x => x !== id) : [...saved, id];
    setSaved(next);
    try { localStorage.setItem('missions:saved', JSON.stringify(next)); }
    catch { setNotice('Saved for this visit. Device storage is unavailable.'); }
  }

  function exportProof(m: Mission) {
    try {
      const draft = makeProofDraft(m.id, evidence, notes);
      const link = URL.createObjectURL(new Blob([JSON.stringify(draft, null, 2)], {type: 'application/json'}));
      const a = document.createElement('a');
      a.href = link; a.download = `bounty-${m.id}-proof-draft.json`; a.click();
      setTimeout(() => URL.revokeObjectURL(link), 1000);
      setFormError(''); setNotice('Proof draft downloaded. It has not been submitted.'); setModal(null);
    } catch (e) { setFormError(e instanceof Error ? e.message : 'Please check your evidence.'); }
  }

  function checkAmount() {
    try {
      const r = calculateEligibility(amount);
      setEstimate(r.meetsThreshold
        ? 'That amount meets the 2.55M threshold. This is an estimate, not a wallet check.'
        : `${(Number(r.shortfall) / 1e6).toLocaleString('en-US')} more tokens needed. This calculator does not verify your wallet.`);
    } catch (e) { setEstimate(e instanceof Error ? e.message : 'Check the amount.'); }
  }

  const visible = missions.filter(m =>
    (category === 'All' || m.category === category) &&
    (!savedOnly || saved.includes(m.id)) &&
    `${m.title} ${m.description} ${m.rules.vehicle}`.toLowerCase().includes(query.toLowerCase()));
  const count = (c: Category) => c === 'All' ? missions.length : missions.filter(m => m.category === c).length;
  const openMission = (m: Mission) => setModal({type: 'mission', mission: m});

  return (
    <div className="site">
      <a className="skip" href="#main">Skip to content</a>

      <header className={menuOpen ? 'top open' : 'top'}>
        <a href="#" className="brand" aria-label="Bounty home"><img src="/mark.svg" width="34" height="34" alt=""/><span>Bounty</span></a>
        <nav id="nav" aria-label="Main navigation" onClick={() => setMenuOpen(false)}>
          <a href="#objectives">Objectives</a>
          <a href="#board">Wanted</a>
          <a href="#sides">Pick a side</a>
          <a href="#create">Mission editor</a>
          <a href="#faq">FAQ</a>
        </nav>
        <div className="top-right">
          <a href="#create" className="btn btn-pink btn-sm">Post a challenge</a>
          <button className="menu-btn" aria-expanded={menuOpen} aria-controls="nav" aria-label="Menu" onClick={() => setMenuOpen(!menuOpen)}><i/><i/></button>
        </div>
      </header>

      <main id="main">
        {/* HERO */}
        <section className="hero">
          <div className="sky" aria-hidden="true"/>
          <Skyline className="hero-city"/>
          <div className="retro-grid" aria-hidden="true"><i/></div>

          <div className="hud hud-tl">
            <p>Players set the challenge. <span className="c-sun">You</span> record the run. <span className="c-cash">The clip</span> is the proof. Press <kbd>B</kbd> to open the board.</p>
          </div>
          <div className="hud hud-tr" aria-label="Wanted level: six stars">
            <span className="hud-label">Wanted level</span>
            <span className="wanted-stars">{Array.from({length: 6}, (_, i) => <Star key={i} size={26}/>)}</span>
            <span className="hud-label dim">Reward pools · not funded</span>
          </div>
          <div className="hud hud-bl"><Minimap/><span className="hud-bar"><i/><i/></span></div>
          <div className="hud hud-br"><span>GTA VI · player-made challenges</span><span className="dim">Preview · sample briefs</span></div>

          <div className="hero-center">
            <h1 className="wordmark" aria-label="Bounty"><span aria-hidden="true">Bounty</span></h1>
            <p className="tagline">Set the challenge. Record the run. <b>Prove it.</b></p>
            <div className="hero-actions">
              <a href="#board" className="btn btn-pink shimmer">Browse bounties <Icon size={18}/></a>
              <a href="#create" className="btn btn-outline">Post a challenge</a>
            </div>
          </div>
        </section>

        <div className="ticker" aria-hidden="true">
          <div className="ticker-track">
            {[0, 1].map(k => <span key={k}>{ticker.map(t => <b key={t}>{t}<Star size={14}/></b>)}</span>)}
          </div>
        </div>

        {/* OBJECTIVES */}
        <section className="objectives" id="objectives">
          <div className="head reveal">
            <p className="kicker">How it works</p>
            <h2 className="h-big">Objectives</h2>
          </div>
          <ol className="obj-list">
            {objectives.map(([t, b], i) => (
              <li key={t} className="reveal" style={{transitionDelay: `${i * 80}ms`}}>
                <span className="obj-no">0{i + 1}</span>
                <div><h3>{t}</h3><p>{b}</p></div>
              </li>
            ))}
          </ol>
          <div className="stats reveal">
            <div><b><CountUp to={missions.length}/></b><span>briefs on the board</span></div>
            <div><b className="c-pink"><CountUp to={0}/></b><span>entry fees. Ever.</span></div>
            <div><b className="c-sun"><CountUp to={1}/></b><span>uncut clip is the proof</span></div>
            <div><b className="c-teal"><CountUp to={2}/></b><span>checks: AI, then a human</span></div>
          </div>
        </section>

        {/* WANTED BOARD */}
        <section className="board" id="board">
          <div className="board-sky" aria-hidden="true"><Skyline/></div>
          <div className="head reveal">
            <p className="kicker">On the board</p>
            <h2 className="h-big h-shadow">Wanted</h2>
            <p className="sub">Difficulty in stars. Every brief is a proposal until its rules are confirmed in GTA VI and a reward pool is funded.</p>
          </div>

          <div className="tools reveal">
            <div className="tabs" role="group" aria-label="Challenge category">
              {categories.map(c => (
                <button key={c} aria-pressed={category === c} className={category === c ? 'on' : ''} onClick={() => setCategory(c)}>{c}<small>{count(c)}</small></button>
              ))}
              <button aria-pressed={savedOnly} className={savedOnly ? 'on' : ''} onClick={() => setSavedOnly(!savedOnly)}><Icon type="bookmark" size={14}/>Saved<small>{saved.length}</small></button>
            </div>
            <label className="search"><Icon type="search" size={17}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search bounties" aria-label="Search challenges"/></label>
          </div>

          <div className="posters">
            {visible.map((m, i) => (
              <article key={m.id} className="poster-item reveal" style={{transitionDelay: `${(i % 3) * 70}ms`}}>
                <Poster no={`B-${m.id}`} stars={m.difficulty} kind={m.kind} color={m.color}
                  title={<button className="poster-open" onClick={() => openMission(m)}>{m.title}</button>}
                  body={m.description}
                  top={<button className={saved.includes(m.id) ? 'save on' : 'save'} aria-pressed={saved.includes(m.id)}
                    aria-label={`${saved.includes(m.id) ? 'Unsave' : 'Save'} ${m.title}`} onClick={() => bookmark(m.id)}><Icon type="bookmark" size={16}/></button>}>
                  <div className="poster-reward"><b>$???</b><span>Reward · pool not funded</span></div>
                  <div className="poster-foot">
                    <span>{m.rules.limit}</span>
                    <button className="poster-link" onClick={() => openMission(m)} aria-label={`Read brief: ${m.title}`}>Read brief <Icon size={14}/></button>
                  </div>
                </Poster>
              </article>
            ))}
          </div>
          {!visible.length && (
            <div className="empty">
              <h3>No bounties match.</h3>
              <p>Try another category or search, or turn off saved-only.</p>
              <button className="btn btn-pink" onClick={() => { setSavedOnly(false); setQuery(''); setCategory('All'); }}>Show every bounty</button>
            </div>
          )}
        </section>

        {/* PICK A SIDE */}
        <section className="sides" id="sides">
          <div className="head reveal">
            <p className="kicker">Character select</p>
            <h2 className="h-big">Pick a side</h2>
          </div>
          <div className="side-grid">
            {sides.map((s, i) => (
              <article key={s.key} className={`side side-${s.color} reveal`} style={{transitionDelay: `${i * 90}ms`}}>
                <div className="side-banner"><h3>{s.name}</h3><span className="side-icon"><Icon type={s.icon} size={40}/></span></div>
                <div className="side-body">
                  <p>{s.blurb}</p>
                  <dl className="side-stats">
                    {s.stats.map(([k, v]) => (
                      <div key={k}><dt>{k}</dt><dd aria-label={`${v} of 5`}>{Array.from({length: 5}, (_, j) => <i key={j} className={j < v ? 'on' : ''}/>)}</dd></div>
                    ))}
                  </dl>
                  <ol className="side-steps">{s.steps.map(t => <li key={t}>{t}</li>)}</ol>
                  {s.href
                    ? <a href={s.href} className="btn btn-side">{s.cta}</a>
                    : <button className="btn btn-side" onClick={() => setModal({type: 'eligibility'})}>{s.cta}</button>}
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* CLAIMS + MONEY */}
        <section className="claims" id="claims">
          <div className="head reveal">
            <p className="kicker">Claims</p>
            <h2 className="h-big">Clip or it<br/><span className="vice-text">didn’t happen.</span></h2>
          </div>
          <div className="claims-grid">
            <ol className="claim-steps reveal">
              {[['Record', 'One continuous clip of the full run, HUD on.'], ['Submit', 'Bounty ID, the clip link and the wallet to credit.'], ['AI check', 'Footage checked against every written rule.'], ['Human review', 'A person settles anything uncertain or disputed.']].map(([t, b], i) => (
                <li key={t}><span>{i + 1}</span><div><h3>{t}</h3><p>{b}</p></div></li>
              ))}
            </ol>
            <div className="verdicts reveal">
              <div className="verdict pass"><p>Mission passed</p><span>Rules met. Reward or reputation credited.</span></div>
              <div className="verdict fail"><p>Wasted</p><span>Rule missed or the clip was cut. Try again.</span></div>
              <p className="note">Review and payouts are in build. Nothing is submitted or paid in this preview.</p>
            </div>
          </div>
          <div className="money reveal">
            <h3>No bets. Just bounties.</h3>
            <div className="money-grid">
              <div><b className="c-cash">Reward pools</b><p>Sponsors and communities fund each bounty. Players never wager against each other and there are no entry fees.</p></div>
              <div><b className="c-sun">Reputation</b><p>Verified runs could build a public, token-based reputation tied to your wallet.</p></div>
              <div><b className="c-teal">Rules first</b><p>Every crypto feature is subject to platform rules and legal review before it goes live.</p></div>
            </div>
          </div>
        </section>

        <ChallengeDraft/>

        {/* PAUSE MENU FAQ */}
        <section className="pause" id="faq">
          <div className="head reveal"><p className="kicker">Pause menu</p><h2 className="h-big">FAQ</h2></div>
          <div className="pause-menu reveal">
            <div className="pause-list" role="tablist" aria-label="Questions">
              {faq.map(([q], i) => (
                <button key={q} role="tab" id={`faq-tab-${i}`} aria-selected={faqOpen === i} aria-controls="faq-panel" className={faqOpen === i ? 'on' : ''} onClick={() => setFaqOpen(i)}>{q}</button>
              ))}
            </div>
            <div className="pause-panel" role="tabpanel" id="faq-panel" aria-labelledby={`faq-tab-${faqOpen}`}>
              <h3>{faq[faqOpen][0]}</h3>
              <p>{faq[faqOpen][1]}</p>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="final">
          <div className="sky" aria-hidden="true"/>
          <Skyline/>
          <div className="final-inner reveal">
            <h2 className="h-big h-shadow">Got a run worth<br/>challenging?</h2>
            <div className="hero-actions">
              <a href="#create" className="btn btn-pink shimmer">Post a challenge <Icon size={18}/></a>
              <a href="#board" className="btn btn-outline">Browse bounties</a>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <a href="#" className="brand"><img src="/mark.svg" alt="" width="26" height="26"/><span>Bounty</span></a>
        <p>Independent GTA VI community project. Not affiliated with Rockstar Games or Take-Two. Rewards and reputation are subject to platform rules and legal review.</p>
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
        {modal?.type === 'mission' ? (
          <>
            <div className="modal-art"><MissionArt kind={modal.mission.kind} color={modal.mission.color}/></div>
            <div className="modal-body">
              <p className="kicker">Bounty B-{modal.mission.id} · {modal.mission.category} · proposed</p>
              <h2 id="modal-title">{modal.mission.title}</h2>
              <Stars n={modal.mission.difficulty} label size={20}/>
              <p className="modal-lede">{modal.mission.description}</p>
              <dl className="rule-sheet">
                <div><dt>Vehicle</dt><dd>{modal.mission.rules.vehicle}</dd></div>
                <div><dt>Limit</dt><dd>{modal.mission.rules.limit}</dd></div>
                <div><dt>Fail if</dt><dd>{modal.mission.rules.fail}</dd></div>
                <div><dt>Reward</dt><dd>Pool not funded</dd></div>
              </dl>
              <p className="note">Rules are proposed and get confirmed in playable GTA VI before the bounty opens.</p>
              <div className="share-row">
                <span>Call someone out</span>
                <div>
                  <button type="button" className="chip" onClick={() => copyLink(modal.mission)}>Copy link</button>
                  <a className="chip chip-pink" target="_blank" rel="noopener noreferrer"
                    href={xIntent(shareText(modal.mission.title), briefLink(typeof location === 'undefined' ? '' : location.origin, modal.mission.id))}>
                    Post on <Icon type="x" size={13}/>
                  </a>
                </div>
              </div>
              <h3>Bring this evidence</h3>
              <ul className="proof-list">{modal.mission.proof.map(p => <li key={p}><Icon type="check" size={17}/>{p}</li>)}</ul>
              <form onSubmit={e => { e.preventDefault(); exportProof(modal.mission); }}>
                <h3>Prepare your proof <small>Local draft</small></h3>
                <p className="note">Save an evidence package for later. This preview does not submit it or verify eligibility.</p>
                <label>Evidence link<input type="url" placeholder="https://…" required value={evidence} onChange={e => setEvidence(e.target.value)} maxLength={2000}/></label>
                <label>What does it show?<textarea rows={3} required minLength={20} maxLength={2000} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Timestamps, the objective and how the clip proves it…"/></label>
                {formError && <p className="error" role="alert">{formError}</p>}
                <button type="submit" className="btn btn-pink">Export proof draft <Icon type="download" size={18}/></button>
              </form>
            </div>
          </>
        ) : modal?.type === 'eligibility' ? (
          <div className="modal-body access">
            <p className="kicker">Holder requirement</p>
            <h2 id="modal-title">2,550,000 <span className="vice-text">$BOUNTY</span></h2>
            <p className="modal-lede">Hold at least 2.55 million tokens to submit a run. Winning still means a funded brief and a clip that passes review.</p>
            <dl className="rule-sheet one"><div><dt>Token mint</dt><dd>Awaiting launch configuration</dd></div></dl>
            <h3>Check the threshold</h3>
            <p className="note">Balance calculator only. No wallet is connected or verified.</p>
            <form className="calc" onSubmit={e => { e.preventDefault(); checkAmount(); }}>
              <label>Example token balance<input inputMode="decimal" value={amount} onChange={e => { setAmount(e.target.value); setEstimate(''); }} placeholder="2550000" required maxLength={40}/></label>
              <button className="btn btn-pink" type="submit">Calculate <Icon size={18}/></button>
            </form>
            {estimate && <p className="estimate" role="status">{estimate}</p>}
          </div>
        ) : null}
      </dialog>
    </div>
  );
}
