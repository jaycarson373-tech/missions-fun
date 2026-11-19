import type {ReactNode} from 'react';
import {MissionArt, Star} from './art';
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

export function Poster({no, title, body, stars, kind, color, top, children}: {
  no: string; title: ReactNode; body: ReactNode; stars?: number; kind?: string; color?: string;
  top?: ReactNode; children?: ReactNode;
}) {
  return (
    <div className="poster">
      <span className="tape" aria-hidden="true"/>
      <div className="poster-top">
        <span className="poster-no">{no}</span>
        {stars ? <Stars n={stars}/> : null}
        {top}
      </div>
      <p className="poster-wanted" aria-hidden="true">Wanted</p>
      <div className="poster-photo"><MissionArt kind={kind} color={color}/></div>
      <h3 className="poster-title">{title}</h3>
      <p className="poster-body">{body}</p>
      {children}
    </div>
  );
}
