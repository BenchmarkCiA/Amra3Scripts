import { useEffect, useRef, useState } from 'react';
import type { Challenge, QuizQuestion } from '../types';
import { useStore } from '../state/store';
import { CATEGORY_COLOR, computeReward, isHelpingOthers } from '../lib/scoring';
import { categoryLabel, t } from '../lib/i18n';
import { factSubjects, randomFact } from '../data/facts';

interface Props {
  childId: string;
  challenge: Challenge;
  onClose: () => void;
}

export function TaskDetailModal({ childId, challenge, onClose }: Props) {
  const { state, dispatch } = useStore();
  const lang = state.language;
  const reward = computeReward(state.scoringConfig, challenge.difficulty, challenge.category);
  const [submitted, setSubmitted] = useState(false);
  const [note, setNote] = useState('');
  const helpingOthers = isHelpingOthers(challenge.category);

  function handleMarkComplete(noteText?: string) {
    dispatch({ type: 'COMPLETE_TASK', childId, challengeId: challenge.id, note: noteText });
    if (challenge.requiresApproval) {
      setSubmitted(true);
      setTimeout(onClose, 1300);
    } else {
      onClose();
    }
  }

  function handleQuizFinish(correctCount: number, totalQuestions: number) {
    dispatch({ type: 'COMPLETE_QUIZ', childId, challengeId: challenge.id, correctCount, totalQuestions });
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <span className="quest-tag" style={{ background: CATEGORY_COLOR[challenge.category] }}>
          {categoryLabel(lang, challenge.category).toUpperCase()}
        </span>
        <div className="modal-title">{challenge.title}</div>
        <div className="modal-desc">{challenge.description}</div>

        {reward.bonusApplied && (
          <div className="reward-preview">⭐ +{reward.stars} · ⚡ +{reward.xp} XP — {reward.bonusPct}% helping-others bonus!</div>
        )}

        {challenge.kind === 'quiz' && challenge.quiz && challenge.quiz.length > 0 && (
          <QuizBody questions={challenge.quiz} reward={reward} lang={lang} onFinish={handleQuizFinish} onAllDone={onClose} />
        )}

        {challenge.kind === 'draw' && <DrawBody onDone={() => handleMarkComplete()} lang={lang} />}

        {challenge.kind === 'discovery' && <DiscoveryBody onDone={(noteText) => handleMarkComplete(noteText)} lang={lang} />}

        {challenge.kind === 'selfreport' &&
          (submitted ? (
            <div className="feedback-msg right">{t(lang, 'submitWaitingApproval')}</div>
          ) : (
            <div>
              {helpingOthers && (
                <textarea
                  className="form-textarea"
                  style={{ marginBottom: 10 }}
                  placeholder={t(lang, 'whatDidYouDo')}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              )}
              <button
                className="btn btn-primary"
                disabled={helpingOthers && !note.trim()}
                onClick={() => handleMarkComplete(helpingOthers ? note.trim() : undefined)}
              >
                {t(lang, 'markComplete')} · +{reward.stars} ⭐
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}

function QuizBody({
  questions,
  reward,
  lang,
  onFinish,
  onAllDone,
}: {
  questions: QuizQuestion[];
  reward: { stars: number; xp: number };
  lang: Parameters<typeof t>[0];
  onFinish: (correctCount: number, totalQuestions: number) => void;
  onAllDone: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState<'right' | 'wrong' | null>(null);
  const [attemptedWrong, setAttemptedWrong] = useState<boolean[]>(() => Array(questions.length).fill(false));
  const [correctFlags, setCorrectFlags] = useState<boolean[]>(() => Array(questions.length).fill(false));
  const [finished, setFinished] = useState(false);
  const question = questions[index];

  useEffect(() => {
    if (feedback !== 'right') return;
    const delay = question.exampleSentence ? 2200 : 900;
    const timer = setTimeout(() => {
      if (index + 1 < questions.length) {
        setIndex((i) => i + 1);
        setFeedback(null);
      } else {
        setFinished(true);
      }
    }, delay);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedback]);

  useEffect(() => {
    if (!finished) return;
    const correctCount = correctFlags.filter(Boolean).length;
    onFinish(correctCount, questions.length);
    const timer = setTimeout(onAllDone, 1600);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  function handleChoice(choiceIndex: number) {
    if (feedback === 'right') return;
    const isCorrect = choiceIndex === question.correctIndex;
    if (isCorrect) {
      const firstTry = !attemptedWrong[index];
      setCorrectFlags((prev) => {
        const next = [...prev];
        next[index] = firstTry;
        return next;
      });
      setFeedback('right');
    } else {
      setAttemptedWrong((prev) => {
        const next = [...prev];
        next[index] = true;
        return next;
      });
      setFeedback('wrong');
    }
  }

  if (finished) {
    const correctCount = correctFlags.filter(Boolean).length;
    return (
      <div>
        <div className="modal-desc" style={{ fontWeight: 800, color: 'var(--text-heading)' }}>
          🎉 {correctCount} / {questions.length} correct
        </div>
        <div className="feedback-msg right">
          +{reward.stars} ⭐ · +{reward.xp} XP
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="quest-reward" style={{ marginBottom: 6 }}>
        {t(lang, 'questionOf')} {index + 1} {t(lang, 'of')} {questions.length}
      </div>
      <div className="modal-desc" style={{ fontWeight: 800, color: 'var(--text-heading)' }}>
        {question.question}
      </div>
      {question.choices.map((choice, i) => (
        <button key={i} className="choice-btn" onClick={() => handleChoice(i)} disabled={feedback === 'right'}>
          {choice}
        </button>
      ))}
      {feedback === 'right' && (
        <>
          <div className="feedback-msg right">{t(lang, 'correct')}</div>
          {question.exampleSentence && (
            <div className="reward-preview" style={{ marginTop: 8 }}>
              {t(lang, 'example')}: {question.exampleSentence}
            </div>
          )}
        </>
      )}
      {feedback === 'wrong' && <div className="feedback-msg wrong">{t(lang, 'notQuite')}</div>}
    </div>
  );
}

function DiscoveryBody({ onDone, lang }: { onDone: (note: string) => void; lang: Parameters<typeof t>[0] }) {
  const [picked, setPicked] = useState<{ subjectLabel: string; fact: string } | null>(null);

  if (picked) {
    return (
      <div>
        <div className="modal-desc" style={{ fontWeight: 700, color: 'var(--text-heading)', lineHeight: 1.6 }}>
          {picked.fact}
        </div>
        <button className="btn btn-primary" onClick={() => onDone(`${picked.subjectLabel}: ${picked.fact}`)}>
          {t(lang, 'gotIt')}
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="quest-reward" style={{ marginBottom: 8 }}>
        {t(lang, 'chooseSubject')}
      </div>
      <div className="chip-row">
        {factSubjects.map((s) => (
          <button key={s.id} type="button" className="chip" onClick={() => setPicked(randomFact(s.id))}>
            {s.emoji} {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function DrawBody({ onDone, lang }: { onDone: () => void; lang: Parameters<typeof t>[0] }) {
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
          {t(lang, 'clear')}
        </button>
        <button className="btn btn-primary" onClick={onDone}>
          {t(lang, 'imDone')}
        </button>
      </div>
    </div>
  );
}
