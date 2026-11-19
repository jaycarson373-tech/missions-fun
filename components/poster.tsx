import type {ReactNode} from 'react';
import {Icon, MissionArt, Star} from './art';
import {difficultyLabel, MAX_STARS} from '@/lib/missions';

export function Stars({n, label = false, size = 16}: {n: number; label?: boolean; size?: number}) {
  const name = difficultyLabel[n as keyof typeof difficultyLabel] ?? '';
  return (
    <span className="stars" title={`${name} difficulty`} aria-label={`Difficulty ${n} of ${MAX_STARS}: ${name}`} role="img">
      {Array.from({length: MAX_STARS}, (_, i) => <Star key={i} on={i < n} size={size}/>)}
      {label && <em>{name}</em>}
    </span>
  );
}

/* A bounty "ticket": dark card with a sunset border. Used for the live bounty preview and drafts. */
export function Ticket({no, status, title, body, stars, kind, color, children}: {
  no: string; status: ReactNode; title: ReactNode; body: ReactNode; stars?: number; kind?: string; color?: string; children?: ReactNode;
}) {
  return (
    <div className="ticket">
      <div className="ticket-top"><span className="ticket-no">{no}</span>{status}</div>
      <div className="ticket-art"><MissionArt kind={kind} color={color}/></div>
      <div className="ticket-body">
        {stars ? <Stars n={stars}/> : null}
        <h3 className="ticket-title">{title}</h3>
        <p>{body}</p>
        {children}
      </div>
    </div>
  );
}

export function LockedTicket({no, category, stars}: {no: string; category: string; stars: number}) {
  return (
    <div className="ticket locked" aria-label={`Bounty ${no}, locked until the pool fills`}>
      <div className="ticket-top"><span className="ticket-no">{no}</span><span className="chip-status queued"><Icon type="lock" size={13}/>Locked</span></div>
      <div className="ticket-art classified"><Icon type="lock" size={38}/><span>Classified</span></div>
      <div className="ticket-body">
        <Stars n={stars}/>
        <p className="redact" aria-hidden="true"><i style={{width: '78%'}}/><i style={{width: '52%'}}/></p>
        <p className="locked-note">{category} · posts when the pool fills</p>
      </div>
    </div>
  );
}
