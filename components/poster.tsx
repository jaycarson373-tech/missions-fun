import {Star} from './art';
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
