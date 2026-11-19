// Original illustrations. Nothing here is taken from Rockstar Games artwork.

export function Icon({type = 'arrow', size = 20}: {type?: string; size?: number}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {type === 'close' ? <path d="m6 6 12 12M6 18 18 6"/>
        : type === 'check' ? <path d="m5 12 4 4L19 6"/>
        : type === 'plus' ? <path d="M12 4v16M4 12h16"/>
        : type === 'download' ? <path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"/>
        : type === 'x' ? <path d="M4 4l16 16M20 4 4 20" strokeWidth="2.4"/>
        : type === 'xlogo' ? <path d="M17.8 3h3.1l-6.8 7.8L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.3-8.3L2 3h6.4l4.4 5.8zm-1.1 16.2h1.7L7.4 4.7H5.6z" fill="currentColor" stroke="none"/>
        : type === 'target' ? <><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.5"/><path d="M12 1.5v4M12 18.5v4M1.5 12h4M18.5 12h4"/><circle cx="12" cy="12" r="1" fill="currentColor"/></>
        : type === 'cam' ? <><rect x="2.5" y="6.5" width="13" height="11" rx="2.5"/><path d="m15.5 10.5 6-3.5v10l-6-3.5z"/><circle cx="6.5" cy="10" r="1.4" fill="currentColor" stroke="none"/></>
        : type === 'cash' ? <><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.8"/><path d="M5.5 9.5v5M18.5 9.5v5"/></>
        : type === 'left' ? <path d="M20 12H5m6-6-6 6 6 6"/>
        : type === 'lock' ? <><rect x="5" y="11" width="14" height="9" rx="1.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></>
        : type === 'wallet' ? <><path d="M4 7h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4z"/><path d="M4 7V6a2 2 0 0 1 2-2h10v3M16 13.5h.01"/></>
        : type === 'clip' ? <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m10 9 5 3-5 3z" fill="currentColor"/></>
        : type === 'coin' ? <><circle cx="12" cy="12" r="8"/><path d="M12 7v10M9.5 9.5h3.75a1.75 1.75 0 0 1 0 3.5h-2.5a1.75 1.75 0 0 0 0 3.5H14.5"/></>
        : <path d="M4 12h15m-6-6 6 6-6 6"/>}
    </svg>
  );
}

export function Star({on = true, size = 18}: {on?: boolean; size?: number}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className={on ? 'star on' : 'star'}>
      <path d="m12 2.5 2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z" stroke="#000" strokeWidth="1.6" strokeLinejoin="round"/>
    </svg>
  );
}

/* Deterministic pseudo-random so server and client render the same picture. */
const rnd = (i: number) => { const x = Math.sin(i * 9301 + 49297) * 233280; return x - Math.floor(x); };
const INK = '#0a0612';

function Palm({x, base, h, flip = false}: {x: number; base: number; h: number; flip?: boolean}) {
  const s = flip ? -1 : 1, top = base - h, tx = x + s * h * 0.16;
  return (
    <g fill={INK}>
      <path d={`M${x - 9} ${base} Q${x + s * h * 0.05} ${base - h * 0.5} ${tx} ${top} L${tx + 9} ${top + 5} Q${x + s * h * 0.08 + 10} ${base - h * 0.5} ${x + 10} ${base}Z`}/>
      {[-160, -125, -90, -55, -20, 15, 40].map((a, i) => {
        const r = (a * Math.PI) / 180, len = h * (0.34 + (i % 2) * 0.07);
        const ex = tx + Math.cos(r) * len, ey = top + Math.sin(r) * len * 0.55 + h * 0.13;
        const cx = tx + Math.cos(r) * len * 0.5, cy = top + Math.sin(r) * len * 0.5 - h * 0.06;
        return <path key={a} d={`M${tx} ${top} Q${cx} ${cy} ${ex} ${ey} Q${cx} ${cy + h * 0.05} ${tx} ${top + 9}Z`}/>;
      })}
    </g>
  );
}

function SportsCar() {
  return (
    <g>
      <ellipse cx="121" cy="2" rx="150" ry="10" fill="#ff2e88" opacity=".55" filter="url(#blur8)"/>
      <path d="M242-31 L520-18 L520-6 L242-20Z" fill="url(#beam)" opacity=".5"/>
      <path d="M0-14 L6-30 Q30-36 64-40 L96-58 Q130-66 168-60 L198-44 Q232-40 240-30 L242-14Z" fill={INK} stroke="#ff2e88" strokeWidth="1.6" strokeOpacity=".75"/>
      <path d="M102-54 L128-60 L160-56 L182-45 L106-45Z" fill="#3b1a55"/>
      <rect x="0" y="-30" width="9" height="6" rx="1" fill="#ff2e88"/>
      <rect x="236" y="-32" width="7" height="5" rx="1" fill="#fff4cf"/>
      {[50, 192].map(cx => <g key={cx}><circle cx={cx} cy="-12" r="15" fill="#000"/><circle cx={cx} cy="-12" r="6" fill="#3a2a55"/></g>)}
    </g>
  );
}

function PoliceCar() {
  return (
    <g>
      <circle cx="108" cy="-66" r="70" fill="#ff2a3d" className="glow-red" filter="url(#blur18)"/>
      <circle cx="132" cy="-66" r="70" fill="#3d7bff" className="glow-blue" filter="url(#blur18)"/>
      <path d="M232-30 L470-18 L470-6 L232-20Z" fill="url(#beam)" opacity=".35"/>
      <path d="M0-14 L4-32 Q20-38 52-40 L78-62 L160-62 L186-40 Q220-38 230-30 L232-14Z" fill={INK} stroke="#9fb4ff" strokeWidth="1.4" strokeOpacity=".5"/>
      <path d="M86-58 L118-58 L118-43 L76-43Z M124-58 L156-58 L175-43 L124-43Z" fill="#26203f"/>
      <rect x="98" y="-70" width="21" height="7" rx="2" fill="#ff2a3d" className="flash-red"/>
      <rect x="121" y="-70" width="21" height="7" rx="2" fill="#3d7bff" className="flash-blue"/>
      <rect x="226" y="-31" width="7" height="5" rx="1" fill="#fff4cf"/>
      {[46, 186].map(cx => <g key={cx}><circle cx={cx} cy="-12" r="15" fill="#000"/><circle cx={cx} cy="-12" r="6" fill="#33304a"/></g>)}
    </g>
  );
}

function Helicopter() {
  return (
    <g>
      <path d="M0 0 Q-10-26 30-30 L70-30 Q96-26 96-6 Q90 10 50 12 L20 12 Q4 10 0 0Z" fill={INK}/>
      <path d="M90-14 L190-22 L192-12 L94-2Z" fill={INK}/>
      <path d="M186-34 L196-34 L196-2 L186-2Z" fill={INK}/>
      <path d="M14-6 Q16-22 34-24 L48-24 L48-4 Z" fill="#3b2a5c"/>
      <path d="M10 22 H86 M24 12 L20 22 M66 12 L70 22" stroke={INK} strokeWidth="4"/>
      <rect x="44" y="-36" width="8" height="6" fill={INK}/>
      <ellipse cx="48" cy="-38" rx="110" ry="3" fill={INK} className="rotor"/>
      <circle cx="28" cy="10" r="5" fill="#fff4cf"/>
    </g>
  );
}

export function Scene({className = ''}: {className?: string}) {
  const skyline = Array.from({length: 26}, (_, i) => ({x: 20 + i * 26, w: 16 + Math.floor(rnd(i) * 18), h: 20 + Math.floor(rnd(i + 40) * (i % 5 === 2 ? 130 : 70))}));
  return (
    <svg className={`scene ${className}`} viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" role="img"
      aria-label="Illustration: a sports car chased by a police cruiser across a beach causeway at sunset, a helicopter searchlight overhead">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#170834"/><stop offset=".32" stopColor="#4f1470"/><stop offset=".52" stopColor="#c42d72"/>
          <stop offset=".6" stopColor="#ff6e3f"/><stop offset=".63" stopColor="#ffb04a"/>
        </linearGradient>
        <radialGradient id="sunG" cx=".5" cy=".35" r=".6"><stop offset="0" stopColor="#fff1b0"/><stop offset=".45" stopColor="#ffc24a"/><stop offset="1" stopColor="#ff5a6e"/></radialGradient>
        <radialGradient id="halo"><stop offset="0" stopColor="#ff8a4a" stopOpacity=".7"/><stop offset="1" stopColor="#ff2e88" stopOpacity="0"/></radialGradient>
        <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8a2a78"/><stop offset=".25" stopColor="#2a2a6e"/><stop offset="1" stopColor="#06101f"/></linearGradient>
        <linearGradient id="beam" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#fff4cf"/><stop offset="1" stopColor="#fff4cf" stopOpacity="0"/></linearGradient>
        <linearGradient id="spot" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fffbe6" stopOpacity=".55"/><stop offset="1" stopColor="#fffbe6" stopOpacity=".04"/></linearGradient>
        <filter id="blur8" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8"/></filter>
        <filter id="blur18" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="18"/></filter>
      </defs>

      <rect width="1600" height="900" fill="url(#sky)"/>
      {Array.from({length: 40}, (_, i) => <circle key={i} cx={rnd(i + 3) * 1600} cy={rnd(i + 77) * 300} r={rnd(i + 9) * 1.4 + .3} fill="#fff" opacity={.25 + rnd(i + 5) * .5}/>)}

      <circle cx="1080" cy="560" r="330" fill="url(#halo)"/>
      <circle cx="1080" cy="560" r="160" fill="url(#sunG)" className="sun"/>

      <g fill="#3a1350" opacity=".95">
        {skyline.map((b, i) => <rect key={i} x={b.x} y={560 - b.h} width={b.w} height={b.h}/>)}
        <rect x="236" y="380" width="22" height="180"/><path d="M247 380v-40" stroke="#3a1350" strokeWidth="3"/>
        <rect x="410" y="410" width="26" height="150"/>
      </g>
      {skyline.flatMap((b, i) => Array.from({length: Math.floor(b.h / 18)}, (_, r) => rnd(i * 13 + r) > 0.6 &&
        <rect key={`${i}-${r}`} x={b.x + 4 + (r % 2) * (b.w / 2 - 2)} y={560 - b.h + 6 + r * 16} width="3" height="4" fill={rnd(r + i) > .5 ? '#ffd23f' : '#ff7ab8'} opacity=".7"/>))}

      <rect y="560" width="1600" height="340" fill="url(#sea)"/>
      <g className="shimmer-sea">
        {Array.from({length: 16}, (_, i) => {
          const y = 568 + i * i * 0.9 + i * 6, w = 300 - i * 15 + rnd(i) * 40;
          return <rect key={i} x={1080 - w / 2 + (rnd(i + 20) - .5) * 30} y={y} width={w} height={3 + i * .25} rx="2" fill="#ffc96a" opacity={.55 - i * .03}/>;
        })}
      </g>

      <path className="searchlight" d="M788 166 L640 694 L900 694 Z" fill="url(#spot)"/>
      <g transform="translate(740 150)" className="heli"><Helicopter/></g>

      {/* causeway */}
      <g fill={INK}>
        <rect x="-20" y="690" width="1640" height="20"/>
        <rect x="-20" y="678" width="1640" height="3" opacity=".9"/>
        {Array.from({length: 15}, (_, i) => <rect key={i} x={i * 120 + 10} y="708" width="16" height="70"/>)}
        {Array.from({length: 8}, (_, i) => <g key={i}><rect x={i * 230 + 60} y="600" width="4" height="90"/><path d={`M${i * 230 + 62} 602 q14 -8 28 0`} stroke={INK} strokeWidth="4" fill="none"/></g>)}
      </g>
      {Array.from({length: 8}, (_, i) => <circle key={i} cx={i * 230 + 90} cy="606" r="14" fill="#ffd6a0" opacity=".55" filter="url(#blur8)"/>)}
      <g className="reflect" opacity=".35">
        {Array.from({length: 8}, (_, i) => <rect key={i} x={i * 230 + 84} y="790" width="12" height="60" rx="6" fill="#ffd6a0" filter="url(#blur8)"/>)}
      </g>

      <g transform="translate(575 690)"><PoliceCar/></g>
      <g transform="translate(830 690)"><SportsCar/></g>

      {/* foreground shore */}
      <path d="M0 900 V840 Q200 812 420 836 T860 846 Q1180 820 1600 842 V900Z" fill="#07040d"/>
      <Palm x={120} base={900} h={640}/>
      <Palm x={250} base={900} h={470} flip/>
      <Palm x={1490} base={900} h={600} flip/>
    </svg>
  );
}
