import { useMemo } from 'react';

interface Props {
  count?: number;
}

export function StarField({ count = 24 }: Props) {
  const stars = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 4}s`,
        duration: `${3.5 + Math.random()}s`,
      })),
    [count],
  );

  return (
    <div className="starfield" aria-hidden="true">
      {stars.map((s, i) => (
        <div
          key={i}
          className="star"
          style={{ top: s.top, left: s.left, animationDelay: s.delay, animationDuration: s.duration }}
        />
      ))}
    </div>
  );
}
