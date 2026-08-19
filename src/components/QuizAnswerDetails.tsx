import { useState } from 'react';
import type { ChallengeCompletion } from '../types';

interface Props {
  completion: ChallengeCompletion;
  defaultOpen?: boolean;
}

export function QuizAnswerDetails({ completion, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const details = completion.score?.details;
  if (!details || details.length === 0) return null;

  return (
    <div style={{ marginTop: 6 }}>
      <button type="button" className="link" onClick={() => setOpen((o) => !o)}>
        {open ? 'Hide answers' : 'See answers'}
      </button>
      {open && (
        <div className="card" style={{ marginTop: 8, padding: 12 }}>
          {details.map((d, i) => (
            <div key={i} className="approval-row" style={{ padding: '6px 0' }}>
              <div style={{ flex: 1 }}>
                <div className="quest-title" style={{ fontSize: 12.5 }}>
                  {d.correct ? '✅' : '❌'} {d.question}
                </div>
                {!d.correct && (
                  <div className="quest-reward" style={{ color: 'var(--error)' }}>
                    Correct answer: {d.correctAnswer}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
