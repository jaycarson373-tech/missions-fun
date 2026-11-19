'use client';
import {useEffect, useRef, useState} from 'react';
import {
  missions, categories, calculateEligibility, makeProofDraft, briefLink, briefIdFromHash,
  shareText, xIntent, difficultyLabel, type Category, type Mission,
} from '@/lib/missions';
import {Icon, MissionArt} from './art';
import ChallengeDraft from './challenge-draft';

type Modal = {type: 'mission'; mission: Mission} | {type: 'eligibility'} | null;

export function Stars({n, label = true}: {n: 1 | 2 | 3; label?: boolean}) {
  return (
    <span className="stars" title={`${difficultyLabel[n]} difficulty`} aria-label={`Difficulty: ${difficultyLabel[n]}`}>
      {[1, 2, 3].map(i => <i key={i} className={i <= n ? 'on' : ''} aria-hidden="true">★</i>)}
      {label && <em>{difficultyLabel[n]}</em>}
    </span>
  );
}

const ticker = [
  `${missions.length} briefs on the board`,
  '2,550,000 $BOUNTY to qualify',
  'No entry fees. No wagers.',
  'One clip. No cuts.',
  'Creators set the rules',
  'Players bring the proof',
];

export default function Missions() {
  const [category, setCategory] = useState<Category>('All');
  const [query, setQuery] = useState('');
  const [saved, setSaved] = useState<string[]>([]);
  const [savedOnly, setSavedOnly] = useState(false);
  const [openOnly, setOpenOnly] = useState(false);
  const [modal, setModal] = useState<Modal>(null);
  const [notice, setNotice] = useState('');
  const [amount, setAmount] = useState('');
  const [estimate, setEstimate] = useState('');
  const [evidence, setEvidence] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [paused, setPaused] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);

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
    !openOnly &&
    (category === 'All' || m.category === category) &&
    (!savedOnly || saved.includes(m.id)) &&
    `${m.title} ${m.description} ${m.area} ${m.rules.vehicle}`.toLowerCase().includes(query.toLowerCase()));
  const count = (c: Category) => c === 'All' ? missions.length : missions.filter(m => m.category === c).length;
  const openMission = (m: Mission) => setModal({type: 'mission', mission: m});
  const lead = missions[0];

  return (
    <div className={paused ? 'site paused' : 'site'}>
      <a className="skip" href="#main">Skip to the board</a>

      <div className="ticker" aria-hidden="true">
        <div className="ticker-track">
          {[0, 1].map(k => <span key={k}>{ticker.map(t => <b key={t}>{t}<i>●</i></b>)}</span>)}
        </div>
      </div>

      <header className="top">
        <a href="#" className="brand" aria-label="Bounty home">
          <img src="/mark.svg" width="36" height="36" alt=""/>
          <span>BOUNTY</span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#board">The board</a>
          <a href="#create">Post a challenge</a>
          <a href="#how">How it works</a>
          <a href="#rules">Rules</a>
        </nav>
        <button className="btn btn-hot btn-sm" onClick={() => setModal({type: 'eligibility'})}>
          2.55M access <Icon type="arrow" size={16}/>
        </button>
      </header>

      <main id="main">
        <section className="hero">
          <div className="hero-copy">
            <p className="kicker"><span className="dot"/> GTA VI player-made challenges · board preview</p>
            <h1>Set the bounty.<br/><span>Beat the run.</span></h1>
            <p className="lede">
              Post a challenge with rules anyone can check. Record your attempt in one uncut clip.
              Community-funded rewards with <strong>no entry fees and no wagers</strong>.
            </p>
            <div className="hero-actions">
              <a href="#board" className="btn btn-hot">See the board <Icon/></a>
              <a href="#create" className="btn btn-ghost">Post a challenge <Icon type="plus" size={17}/></a>
            </div>
            <p className="fine">Preview: briefs are proposals until GTA VI gameplay and reward funding are confirmed. Not affiliated with Rockstar Games.</p>
          </div>

          <div className="poster-wrap">
            <article className="poster">
              <div className="poster-head">
                <span className="wanted">Wanted</span>
                <span className="poster-sub">A clean escape · File {lead.id}</span>
                <button className="poster-pause" aria-label={paused ? 'Resume route animation' : 'Pause route animation'} onClick={() => setPaused(!paused)}>
                  {paused ? 'Play' : 'Pause'}
                </button>
              </div>
              <MissionArt large/>
              <div className="poster-foot">
                <div>
                  <Stars n={lead.difficulty}/>
                  <h2>{lead.title}</h2>
                  <p>Stolen police car. Wanted level gone. One uncut clip.</p>
                </div>
                <button className="round" aria-label={`Read ${lead.title}`} onClick={() => openMission(lead)}><Icon/></button>
              </div>
              <span className="stamp">Proposed</span>
            </article>
          </div>
        </section>

        <section className="stats" aria-label="Board at a glance">
          <div><b>{missions.length}</b><span>briefs on the board</span></div>
          <div><b>2.55M</b><span>$BOUNTY held to qualify</span></div>
          <div><b>0</b><span>entry fees, ever</span></div>
          <div><b>1</b><span>continuous clip is the proof</span></div>
        </section>

        <section className="board" id="board">
          <div className="section-head">
            <div>
              <p className="kicker">The board</p>
              <h2>Pick a brief.<br/>Make it look easy.</h2>
            </div>
            <p className="section-note">Every brief is a proposal. A bounty opens only once its rules are confirmed in playable GTA VI and its reward is funded.</p>
          </div>

          <div className="tools">
            <div className="tabs" role="group" aria-label="Challenge category">
              {categories.map(c => (
                <button key={c} aria-pressed={category === c} className={category === c ? 'on' : ''} onClick={() => setCategory(c)}>
                  {c}<small>{count(c)}</small>
                </button>
              ))}
            </div>
            <div className="tools-right">
              <button aria-pressed={savedOnly} onClick={() => setSavedOnly(!savedOnly)} className={savedOnly ? 'toggle on' : 'toggle'}>
                <Icon type="bookmark" size={14}/>Saved ({saved.length})
              </button>
              <button aria-pressed={openOnly} onClick={() => setOpenOnly(!openOnly)} className={openOnly ? 'toggle on' : 'toggle'}>
                Funded only
              </button>
              <label className="search">
                <Icon type="search" size={17}/>
                <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search briefs" aria-label="Search challenges"/>
              </label>
            </div>
          </div>
          <p className="result-count" aria-live="polite">{visible.length} {visible.length === 1 ? 'brief' : 'briefs'} in view</p>

          <div className="grid">
            {visible.map(m => (
              <article className="card" key={m.id}>
                <button className="card-art" onClick={() => openMission(m)} aria-label={`Read ${m.title}`} tabIndex={-1}>
                  <MissionArt kind={m.kind} color={m.color}/>
                  <span className="card-no">#{m.id}</span>
                </button>
                <div className="card-body">
                  <div className="card-top">
                    <span className="tag">{m.category}</span>
                    <Stars n={m.difficulty} label={false}/>
                    <button
                      className={saved.includes(m.id) ? 'save on' : 'save'}
                      aria-pressed={saved.includes(m.id)}
                      aria-label={`${saved.includes(m.id) ? 'Unsave' : 'Save'} ${m.title}`}
                      onClick={() => bookmark(m.id)}>
                      <Icon type="bookmark" size={18}/>
                    </button>
                  </div>
                  <h3><button className="card-title" onClick={() => openMission(m)}>{m.title}</button></h3>
                  <p>{m.description}</p>
                  <dl className="card-rules">
                    <div><dt>Vehicle</dt><dd>{m.rules.vehicle}</dd></div>
                    <div><dt>Fail if</dt><dd>{m.rules.fail}</dd></div>
                  </dl>
                  <div className="card-foot">
                    <span className="status">Proposed · unfunded</span>
                    <button className="card-link" aria-label={`Read brief: ${m.title}`} onClick={() => openMission(m)}>Read brief <Icon size={16}/></button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {!visible.length && (
            <div className="empty">
              <Icon type="search" size={30}/>
              <h3>{openOnly ? 'No funded bounties are open yet.' : 'No briefs match those filters.'}</h3>
              <p>{openOnly
                ? 'Everything on the board is a proposal. A bounty opens only after its gameplay rules and reward funding are confirmed.'
                : 'Try another category or search, or clear the saved-only filter.'}</p>
              <button className="btn btn-hot" onClick={() => { setOpenOnly(false); setSavedOnly(false); setQuery(''); setCategory('All'); }}>Show every brief</button>
            </div>
          )}
        </section>

        <section className="qualify" aria-label="Participation requirement">
          <img src="/mark.svg" width="54" height="54" alt=""/>
          <div>
            <p className="kicker">To submit a run</p>
            <h2>Hold 2,550,000 $BOUNTY.</h2>
            <p>Browse and draft freely. Holding qualifies you to submit. It never wins a bounty on its own.</p>
          </div>
          <button className="btn btn-dark" onClick={() => setModal({type: 'eligibility'})}>Check the threshold <Icon/></button>
        </section>

        <ChallengeDraft/>

        <section className="how" id="how">
          <div className="section-head">
            <div>
              <p className="kicker">How it works</p>
              <h2>The clip is<br/><span>the evidence.</span></h2>
            </div>
            <p className="section-note">AI checks each clip against the written rules. Anything uncertain goes to a human reviewer. Review is a backend integration and is not active in this preview.</p>
          </div>
          <ol className="steps">
            {[
              ['Post the challenge.', 'Set the objective, the vehicle, the time limit and what the clip must show. Sponsors or the community fund the reward. Players never bet against each other.'],
              ['Qualify.', 'Hold at least 2,550,000 tokens in the wallet you submit with. The verified mint is published before submissions open.'],
              ['Send the full run.', 'One continuous clip. AI-assisted review checks it against every rule, and a human settles anything uncertain before a reward is approved.'],
            ].map(([t, b], i) => (
              <li key={t}><span className="step-no">0{i + 1}</span><h3>{t}</h3><p>{b}</p></li>
            ))}
          </ol>
        </section>

        <section className="rules" id="rules">
          <div>
            <p className="kicker">Rules</p>
            <h2>Know what counts.</h2>
          </div>
          <div className="faq">
            {[
              ['What does holding 2.55M unlock?', 'It is the minimum holding to submit for a bounty. Holding alone never wins one: a funded brief, a qualifying wallet and accepted evidence are all required. The token mint and the balance-check timing will be published before real submissions open.'],
              ['Can I complete these challenges yet?', 'These are player-made challenge concepts. Vehicles, routes and wanted levels must be confirmed in playable GTA VI before a bounty opens. The six-star idea is an example, not a claim about the game.'],
              ['Where do rewards come from?', 'Non-wagered community or sponsor reward pools. Each bounty must publish its funded amount, reward asset and acceptance rules. Players never stake a bet. Funding and payouts are not active in this preview.'],
              ['How do I submit proof?', 'Open a brief to see its evidence checklist and export a proof draft. Wallet checks, clip uploads, AI-assisted review and payouts arrive with the backend.'],
              ['Is this an official Rockstar project?', 'No. BOUNTY is an independent community project with original artwork. It is not affiliated with Rockstar Games or Take-Two, and tokens give no access to GTA VI, game items or official rewards.'],
            ].map(([q, a]) => (
              <details key={q}><summary>{q}<Icon type="plus" size={18}/></summary><p>{a}</p></details>
            ))}
          </div>
        </section>

        <section className="last-call">
          <h2>Got a run worth<br/>challenging?</h2>
          <div>
            <a href="#create" className="btn btn-dark">Post it on the board <Icon/></a>
            <a href="#board" className="btn btn-line">Browse briefs</a>
          </div>
        </section>
      </main>

      <footer>
        <a href="#" className="brand"><img src="/mark.svg" alt="" width="26" height="26"/><span>BOUNTY</span></a>
        <span>Independent GTA VI community project. Not affiliated with Rockstar Games or Take-Two.</span>
        <div>
          <a href="#rules">Rules</a>
          <a href="/brand/logo.svg" download>Brand mark <Icon type="download" size={14}/></a>
        </div>
      </footer>

      {notice && (
        <div className="toast" role="status">
          <span>{notice}</span>
          <button onClick={() => setNotice('')} aria-label="Dismiss notification"><Icon type="close" size={18}/></button>
        </div>
      )}

      <dialog
        ref={dialog}
        onCancel={() => setModal(null)}
        onClose={() => { if (modal) setModal(null); }}
        onClick={e => { if (e.target === e.currentTarget) setModal(null); }}
        aria-labelledby="modal-title">
        <button className="modal-close" aria-label="Close dialog" onClick={() => setModal(null)}><Icon type="close"/></button>
        {modal?.type === 'mission' ? (
          <>
            <div className="modal-art">
              <MissionArt kind={modal.mission.kind} color={modal.mission.color}/>
              <span className="stamp">Proposed</span>
            </div>
            <div className="modal-body">
              <p className="kicker">Brief #{modal.mission.id} · {modal.mission.category}</p>
              <h2 id="modal-title">{modal.mission.title}</h2>
              <p className="modal-lede">{modal.mission.description}</p>
              <div className="facts">
                <div><span>Reward</span><b>Not funded</b></div>
                <div><span>Access</span><b>2.55M tokens</b></div>
                <div><span>Difficulty</span><b><Stars n={modal.mission.difficulty}/></b></div>
              </div>
              <div className="rule-sheet">
                <div className="sub-head"><h3>Rule sheet</h3><span>Proposed · confirm in game</span></div>
                <dl>
                  <div><dt>Vehicle</dt><dd>{modal.mission.rules.vehicle}</dd></div>
                  <div><dt>Limit</dt><dd>{modal.mission.rules.limit}</dd></div>
                  <div><dt>Fail if</dt><dd>{modal.mission.rules.fail}</dd></div>
                  <div><dt>Deadline</dt><dd>Not scheduled</dd></div>
                </dl>
              </div>
              <div className="share-row">
                <span>Call someone out</span>
                <div>
                  <button type="button" className="chip" onClick={() => copyLink(modal.mission)}>Copy link</button>
                  <a className="chip chip-hot" target="_blank" rel="noopener noreferrer"
                    href={xIntent(shareText(modal.mission.title), briefLink(typeof location === 'undefined' ? '' : location.origin, modal.mission.id))}>
                    Post on X <Icon size={14}/>
                  </a>
                </div>
              </div>
              <h3>Bring this evidence</h3>
              <ul className="proof-list">
                {modal.mission.proof.map(p => <li key={p}><Icon type="check" size={17}/>{p}</li>)}
              </ul>
              <form onSubmit={e => { e.preventDefault(); exportProof(modal.mission); }}>
                <div className="sub-head"><h3>Prepare your proof</h3><span>Local draft</span></div>
                <p className="muted">Save an evidence package for later. This preview does not submit it or verify eligibility.</p>
                <label>Evidence link<input type="url" placeholder="https://…" required value={evidence} onChange={e => setEvidence(e.target.value)} maxLength={2000}/></label>
                <label>What does it show?<textarea rows={3} required minLength={20} maxLength={2000} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Timestamps, the objective and how the clip proves it…"/></label>
                {formError && <p className="error" role="alert">{formError}</p>}
                <button type="submit" className="btn btn-hot">Export proof draft <Icon type="download" size={18}/></button>
              </form>
            </div>
          </>
        ) : modal?.type === 'eligibility' ? (
          <div className="modal-body access">
            <img src="/mark.svg" width="56" height="56" alt=""/>
            <p className="kicker">The participation requirement</p>
            <h2 id="modal-title">2,550,000 <span>$BOUNTY</span></h2>
            <p className="modal-lede">Hold at least 2.55 million tokens to submit a run. Winning still means meeting the brief and passing evidence review.</p>
            <div className="facts one"><div><span>Token mint</span><b>Awaiting launch configuration</b></div></div>
            <h3>Check the threshold</h3>
            <p className="muted">Balance calculator only. No wallet is connected or verified.</p>
            <form className="calc" onSubmit={e => { e.preventDefault(); checkAmount(); }}>
              <label>Example token balance<input inputMode="decimal" value={amount} onChange={e => { setAmount(e.target.value); setEstimate(''); }} placeholder="2550000" required maxLength={40}/></label>
              <button className="btn btn-hot" type="submit">Calculate <Icon/></button>
            </form>
            {estimate && <p className="estimate" role="status">{estimate}</p>}
          </div>
        ) : null}
      </dialog>
    </div>
  );
}
