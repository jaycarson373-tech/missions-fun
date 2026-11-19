// Original illustrations. Nothing here is taken from Rockstar Games artwork.
const NIGHT = '#130a22', GRID = '#2a1942', ROAD = '#08040f', BLOCK = '#2b1b45', BLOCK_EDGE = '#45306a';

export function Icon({type = 'arrow', size = 20}: {type?: string; size?: number}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {type === 'search' ? <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></>
        : type === 'close' ? <path d="m6 6 12 12M6 18 18 6"/>
        : type === 'bookmark' ? <path d="M6 4h12v17l-6-4-6 4z"/>
        : type === 'check' ? <path d="m5 12 4 4L19 6"/>
        : type === 'plus' ? <path d="M12 4v16M4 12h16"/>
        : type === 'download' ? <path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"/>
        : type === 'x' ? <path d="M4 4l16 16M20 4 4 20" strokeWidth="2.4"/>
        : type === 'play' ? <path d="M7 4v16l13-8z" fill="currentColor"/>
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

export function MissionArt({kind = 'map', color = '#ff2e88', large = false}: {kind?: string; color?: string; large?: boolean}) {
  const label = kind === 'map' ? 'Illustrated escape route through a fictional city'
    : kind === 'road' ? 'Illustrated driving checkpoint'
    : kind === 'camera' ? 'Illustrated viewfinder over a sunset skyline'
    : 'Illustrated evidence dossier';
  return (
    <svg className={`mission-art ${large ? 'large' : ''}`} viewBox="0 0 640 380" preserveAspectRatio="xMidYMid slice" role="img" aria-label={label}>
      <rect width="640" height="380" fill={NIGHT}/>
      {Array.from({length: 14}, (_, i) => <path key={i} d={`M${i * 48} 0v380M0 ${i * 32}h640`} stroke={GRID} strokeWidth=".8"/>)}
      {kind === 'map' ? <>
        <path d="M-40 360 90 220 65 90 220-30M235 420 284 255 423 171 490-20M400 420 500 290 700 275" stroke={ROAD} strokeWidth="45" fill="none"/>
        <path d="M-40 360 90 220 65 90 220-30M235 420 284 255 423 171 490-20M400 420 500 290 700 275" stroke="#5a3f86" strokeWidth="2" fill="none"/>
        {[[160, 140], [365, 290], [445, 90], [550, 180], [200, 320], [300, 80]].map(([x, y], i) =>
          <g key={i} transform={`translate(${x} ${y}) rotate(-28)`}><rect x="-28" y="-22" width="56" height="44" rx="2" fill={BLOCK}/><path d="M-24-18h44v32" fill="none" stroke={BLOCK_EDGE}/></g>)}
        <path className="route" d="m95 315 93-103 123 28 55-91 104-46" stroke={color} strokeWidth="5" fill="none" strokeLinejoin="round"/>
        <circle cx="95" cy="315" r="8" fill={color}/>
        <circle cx="470" cy="103" r="22" fill={NIGHT} stroke={color} strokeWidth="2"/>
        <circle cx="470" cy="103" r="7" fill={color}/>
        <path d="M470 69v13m0 43v13m-34-35h13m43 0h13" stroke={color} strokeWidth="2"/>
        <rect x="365" y="185" width="164" height="43" rx="3" fill="#fff6ee"/>
        <text x="380" y="211" fill={NIGHT} fontFamily="monospace" fontSize="13" fontWeight="700">ESCAPE / ROUTE 01</text>
      </> : kind === 'road' ? <>
        <defs><linearGradient id={`sky-${color.slice(1)}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2a0f45"/><stop offset="1" stopColor="#b52872"/></linearGradient></defs>
        <rect width="640" height="185" fill={`url(#sky-${color.slice(1)})`} opacity=".55"/>
        <path d="M75 400 285 175h70L565 400" fill={ROAD} stroke={color} strokeWidth="3"/>
        <path d="m319 185 2 20m-1 23 3 39m-2 32 3 70" stroke={color} strokeWidth="4"/>
        <path d="M160 270V95h320v175M160 95l35 24h250l35-24" fill="none" stroke={color} strokeWidth="9"/>
        <text x="224" y="157" fill={color} fontSize="22" fontFamily="monospace" fontWeight="700">CHECKPOINT</text>
        <path d="M0 185h140M500 185h140" stroke="#5a3f86"/>
      </> : kind === 'camera' ? <>
        <defs><linearGradient id="sunset-cam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffd23f"/><stop offset=".6" stopColor="#ff8a2a"/><stop offset="1" stopColor="#ff2e88"/></linearGradient></defs>
        <circle cx="417" cy="150" r="72" fill="url(#sunset-cam)"/>
        {[150, 168, 184, 198].map(y => <rect key={y} x="340" y={y} width="160" height={4 + (y - 150) / 12} fill={NIGHT}/>)}
        {[100, 150, 204, 260, 310, 380, 440, 495].map((x, i) =>
          <rect key={x} x={x} y={230 - (i % 3) * 40} width="45" height={130 + (i % 3) * 40} fill="#0c0616" stroke={BLOCK_EDGE}/>)}
        <path d="M90 125V75h55M495 75h55v50M90 255v50h55M495 305h55v-50M300 190h40m-20-20v40" stroke={color} strokeWidth="4" fill="none"/>
      </> : <>
        <g transform="rotate(-7 320 190)">
          <rect x="189" y="51" width="225" height="288" rx="4" fill="#f1e4cc"/>
          <rect x="211" y="79" width="80" height="12" fill="#1c140e"/>
          <path d="M213 122h173M213 147h145M213 172h165M213 229h105M213 253h105M213 277h82" stroke="#a89474" strokeWidth="8"/>
          <rect x="298" y="188" width="143" height="95" fill={color}/>
          <text x="316" y="230" fontFamily="monospace" fill="#1c140e" fontSize="17" fontWeight="700">CLIP</text>
          <text x="316" y="255" fontFamily="monospace" fill="#1c140e" fontSize="17" fontWeight="700">REQUIRED</text>
        </g>
      </>}
      <path d="M22 346h22m-11-11v22M596 346h22m-11-11v22" stroke={color}/>
    </svg>
  );
}

/* Deterministic pseudo-random so server and client render the same skyline. */
const rnd = (i: number) => { const x = Math.sin(i * 9301 + 49297) * 233280; return x - Math.floor(x); };

function Palm({x, h, flip = false}: {x: number; h: number; flip?: boolean}) {
  const s = flip ? -1 : 1, top = 420 - h;
  const tx = x + s * h * 0.18;
  return (
    <g fill="#07030d">
      <path d={`M${x - 5} 420 Q${x + s * h * 0.05} ${420 - h * 0.5} ${tx} ${top} L${tx + 6} ${top + 4} Q${x + s * h * 0.08 + 6} ${420 - h * 0.5} ${x + 6} 420Z`}/>
      {[-150, -110, -70, -30, 10, 45].map((a, i) => {
        const r = (a * Math.PI) / 180, len = 70 + (i % 2) * 18;
        const ex = tx + Math.cos(r) * len, ey = top + Math.sin(r) * len * 0.6 + 34;
        const cx = tx + Math.cos(r) * len * 0.5, cy = top + Math.sin(r) * len * 0.5 - 16;
        return <path key={a} d={`M${tx} ${top} Q${cx} ${cy} ${ex} ${ey} Q${cx} ${cy + 12} ${tx} ${top + 6}Z`}/>;
      })}
    </g>
  );
}

export function Skyline({className = ''}: {className?: string}) {
  const buildings = Array.from({length: 46}, (_, i) => {
    const w = 26 + Math.floor(rnd(i) * 40);
    const h = 70 + Math.floor(rnd(i + 99) * (i % 7 === 3 ? 250 : 160));
    return {x: i * 32 - 10, w, h};
  });
  return (
    <svg className={`skyline ${className}`} viewBox="0 0 1440 420" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id="sun" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffd23f"/><stop offset=".55" stopColor="#ff8a2a"/><stop offset="1" stopColor="#ff2e88"/>
        </linearGradient>
        <mask id="sun-cut">
          <rect width="1440" height="420" fill="#fff"/>
          {[0, 1, 2, 3, 4, 5].map(i => <rect key={i} x="0" y={190 + i * 24} width="1440" height={4 + i * 2.4} fill="#000"/>)}
        </mask>
      </defs>
      <circle cx="980" cy="250" r="170" fill="url(#sun)" mask="url(#sun-cut)" className="sun"/>
      {buildings.map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={420 - b.h} width={b.w} height={b.h} fill={i % 3 ? '#12081f' : '#1a0d2c'}/>
          {Array.from({length: Math.floor(b.h / 22)}, (_, r) => rnd(i * 31 + r) > 0.62 &&
            <rect key={r} x={b.x + 6 + (r % 2) * (b.w / 2 - 4)} y={420 - b.h + 10 + r * 20} width="5" height="7"
              fill={rnd(i + r) > 0.5 ? '#ffd23f' : '#ff2e88'} opacity={0.55 + rnd(r + i * 7) * 0.4}/>)}
        </g>
      ))}
      <Palm x={110} h={300}/><Palm x={190} h={240} flip/><Palm x={1260} h={320} flip/><Palm x={1350} h={250}/>
    </svg>
  );
}
