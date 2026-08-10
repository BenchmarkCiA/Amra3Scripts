import { useEffect, useRef, useState } from 'react';
import type { Challenge } from '../types';
import { useStore } from '../state/store';
import { CATEGORY_COLOR, CATEGORY_LABEL, computeReward } from '../lib/scoring';

interface Props {
  childId: string;
  challenge: Challenge;
  onClose: () => void;
}

export function TaskDetailModal({ childId, challenge, onClose }: Props) {
  const { state, dispatch } = useStore();
  const reward = computeReward(state.scoringConfig, challenge.difficulty, challenge.category);
  const [feedback, setFeedback] = useState<'right' | 'wrong' | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (feedback === 'right') {
      const t = setTimeout(onClose, 900);
      return () => clearTimeout(t);
    }
  }, [feedback, onClose]);

  function handleChoice(index: number) {
    if (feedback === 'right') return;
    const correct = index === challenge.quiz?.correctIndex;
    dispatch({ type: 'COMPLETE_QUIZ', childId, challengeId: challenge.id, correct });
    setFeedback(correct ? 'right' : 'wrong');
  }

  function handleMarkComplete() {
    dispatch({ type: 'COMPLETE_TASK', childId, challengeId: challenge.id });
    if (challenge.requiresApproval) {
      setSubmitted(true);
      setTimeout(onClose, 1300);
    } else {
      onClose();
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <span className="quest-tag" style={{ background: CATEGORY_COLOR[challenge.category] }}>
          {CATEGORY_LABEL[challenge.category].toUpperCase()}
        </span>
        <div className="modal-title">{challenge.title}</div>
        <div className="modal-desc">{challenge.description}</div>

        {reward.bonusApplied && (
          <div className="reward-preview">⭐ +{reward.stars} · ⚡ +{reward.xp} XP — {reward.bonusPct}% helping-others bonus!</div>
        )}

        {challenge.kind === 'quiz' && challenge.quiz && (
          <QuizBody quiz={challenge.quiz} onChoice={handleChoice} feedback={feedback} reward={reward} />
        )}

        {challenge.kind === 'draw' && <DrawBody onDone={handleMarkComplete} />}

        {challenge.kind === 'selfreport' &&
          (submitted ? (
            <div className="feedback-msg right">Submitted — waiting for approval!</div>
          ) : (
            <button className="btn btn-primary" onClick={handleMarkComplete}>
              Mark Complete · +{reward.stars} ⭐
            </button>
          ))}
      </div>
    </div>
  );
}

function QuizBody({
  quiz,
  onChoice,
  feedback,
  reward,
}: {
  quiz: NonNullable<Challenge['quiz']>;
  onChoice: (index: number) => void;
  feedback: 'right' | 'wrong' | null;
  reward: { stars: number };
}) {
  return (
    <div>
      <div className="modal-desc" style={{ fontWeight: 800, color: 'var(--text-heading)' }}>
        {quiz.question}
      </div>
      {quiz.choices.map((choice, i) => (
        <button key={i} className="choice-btn" onClick={() => onChoice(i)}>
          {choice}
        </button>
      ))}
      {feedback === 'right' && <div className="feedback-msg right">Correct! +{reward.stars} ⭐</div>}
      {feedback === 'wrong' && <div className="feedback-msg wrong">Not quite — try again!</div>}
    </div>
  );
}

function DrawBody({ onDone }: { onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  function getPos(canvas: HTMLCanvasElement, e: React.PointerEvent) {
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawing.current = true;
    const ctx = canvas.getContext('2d');
    const { x, y } = getPos(canvas, e);
    ctx?.beginPath();
    ctx?.moveTo(x, y);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas || !drawing.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getPos(canvas, e);
    ctx.strokeStyle = '#f4c14f';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function handlePointerUp() {
    drawing.current = false;
  }

  function handleClear() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={256}
        height={180}
        className="draw-canvas"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
      <div className="btn-row">
        <button className="btn btn-secondary" onClick={handleClear}>
          Clear
        </button>
        <button className="btn btn-primary" onClick={onDone}>
          I'm done!
        </button>
      </div>
    </div>
  );
}
