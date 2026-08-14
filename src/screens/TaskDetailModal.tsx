import { useEffect, useMemo, useRef, useState } from 'react';
import type { Challenge, QuizAnswerDetail, QuizQuestion } from '../types';
import { useStore } from '../state/store';
import { CATEGORY_COLOR, computeReward, isHelpingOthers } from '../lib/scoring';
import { categoryLabel, localizeChallengeText, t } from '../lib/i18n';
import { factSubjects, randomFact } from '../data/facts';
import { getDailyQuestions } from '../lib/dailyQuiz';
import { seededShuffle } from '../lib/seededRandom';
import { todayISO } from '../lib/id';

interface Props {
  childId: string;
  challenge: Challenge;
  onClose: () => void;
}

export function TaskDetailModal({ childId, challenge, onClose }: Props) {
  const { state, dispatch } = useStore();
  const lang = state.language;
  const reward = computeReward(state.scoringConfig, challenge.difficulty, challenge.category);
  const localized = localizeChallengeText(lang, challenge);
  const [submitted, setSubmitted] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);
  const [note, setNote] = useState('');
  const helpingOthers = isHelpingOthers(challenge.category);
  // A different 10-question subset of the challenge's full pool each day,
  // stable for the whole day — see lib/dailyQuiz.ts.
  const dailyQuestions = useMemo(
    () => (challenge.quiz ? getDailyQuestions(challenge.quiz, `${challenge.id}-${todayISO()}`) : []),
    [challenge.quiz, challenge.id],
  );

  function handleMarkComplete(noteText?: string) {
    dispatch({ type: 'COMPLETE_TASK', childId, challengeId: challenge.id, note: noteText });
    if (challenge.requiresApproval) {
      setSubmitted(true);
      setTimeout(onClose, 1300);
    } else {
      // A brief, visible "done!" moment — closing instantly with zero
      // feedback reads as broken ("nothing happened") even though the
      // completion went through.
      setJustCompleted(true);
      setTimeout(onClose, 1300);
    }
  }

  function handleQuizFinish(correctCount: number, totalQuestions: number, details: QuizAnswerDetail[]) {
    dispatch({ type: 'COMPLETE_QUIZ', childId, challengeId: challenge.id, correctCount, totalQuestions, details });
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
        <div className="modal-title">{localized.title}</div>
        <div className="modal-desc">{localized.description}</div>

        {reward.bonusApplied && (
          <div className="reward-preview">⭐ +{reward.stars} · ⚡ +{reward.xp} XP — {reward.bonusPct}% helping-others bonus!</div>
        )}

        {justCompleted && (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{ fontSize: 40 }}>🎉</div>
            <div className="feedback-msg right">{t(lang, 'niceWork')}</div>
            <div className="reward-preview">
              +{reward.stars} ⭐ · +{reward.xp} XP
            </div>
          </div>
        )}

        {!justCompleted && challenge.kind === 'quiz' && dailyQuestions.length > 0 && (
          <QuizBody questions={dailyQuestions} reward={reward} lang={lang} onFinish={handleQuizFinish} onAllDone={onClose} />
        )}

        {!justCompleted && challenge.kind === 'draw' && <DrawBody onDone={() => handleMarkComplete()} lang={lang} />}

        {!justCompleted && challenge.kind === 'memory' && (
          <MemoryBody
            symbols={challenge.memorySymbols && challenge.memorySymbols.length > 0 ? challenge.memorySymbols : DEFAULT_MEMORY_SYMBOLS}
            difficulty={challenge.difficulty}
            seedKey={`${challenge.id}-${childId}-${todayISO()}`}
            lang={lang}
            onDone={(note) => handleMarkComplete(note)}
          />
        )}

        {!justCompleted && challenge.kind === 'discovery' && <DiscoveryBody onDone={(noteText) => handleMarkComplete(noteText)} lang={lang} />}

        {!justCompleted && challenge.kind === 'selfreport' &&
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
  onFinish: (correctCount: number, totalQuestions: number, details: QuizAnswerDetail[]) => void;
  onAllDone: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState<'right' | 'wrong' | null>(null);
  const [attemptedWrong, setAttemptedWrong] = useState<boolean[]>(() => Array(questions.length).fill(false));
  const [correctFlags, setCorrectFlags] = useState<boolean[]>(() => Array(questions.length).fill(false));
  const [finished, setFinished] = useState(false);
  const question = questions[index];
  // A "Next" button appears instead of auto-advancing whenever there's extra
  // reading material (the example sentence) — kids need time to actually read it.
  const waitsForNext = Boolean(question.exampleSentence);

  function advance() {
    if (index + 1 < questions.length) {
      setIndex((i) => i + 1);
      setFeedback(null);
    } else {
      setFinished(true);
    }
  }

  useEffect(() => {
    if (feedback !== 'right' || waitsForNext) return;
    const timer = setTimeout(advance, 900);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedback]);

  useEffect(() => {
    if (!finished) return;
    const correctCount = correctFlags.filter(Boolean).length;
    const details: QuizAnswerDetail[] = questions.map((q, i) => ({
      question: q.question,
      correctAnswer: q.choices[q.correctIndex],
      correct: correctFlags[i],
    }));
    onFinish(correctCount, questions.length, details);
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
          {waitsForNext && (
            <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={advance}>
              {t(lang, 'next')}
            </button>
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
          <button key={s.id} type="button" className="chip" onClick={() => setPicked(randomFact(s.id, lang))}>
            {s.emoji} {lang === 'he' ? s.labelHe : s.label}
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

// Card count per difficulty follows the PRD's 6/10/14/16/20-card progression
// (expressed here as pairs, since a "card" is one face of a pair).
const MEMORY_PAIRS_BY_DIFFICULTY: Record<number, number> = { 1: 3, 2: 5, 3: 7, 4: 8, 5: 10 };

// Fallback so a memory challenge can never render as an empty modal — used
// whenever a challenge is missing its own symbol pool (e.g. one created by
// hand without setting it).
const DEFAULT_MEMORY_SYMBOLS = ['🍎', '🐶', '⭐', '🚗', '🎈', '🌈', '🐱', '🎁', '🍭', '⚽'];

interface MemoryCard {
  key: string;
  symbol: string;
  pairId: number;
}

function MemoryBody({
  symbols,
  difficulty,
  seedKey,
  lang,
  onDone,
}: {
  symbols: string[];
  difficulty: number;
  seedKey: string;
  lang: Parameters<typeof t>[0];
  onDone: (note: string) => void;
}) {
  const pairCount = Math.min(MEMORY_PAIRS_BY_DIFFICULTY[difficulty] ?? 3, symbols.length);
  const cards = useMemo<MemoryCard[]>(() => {
    const chosen = seededShuffle(symbols, seedKey).slice(0, pairCount);
    const pairs = chosen.flatMap((symbol, pairId) => [
      { key: `${pairId}-a`, symbol, pairId },
      { key: `${pairId}-b`, symbol, pairId },
    ]);
    return seededShuffle(pairs, `${seedKey}-board`);
  }, [symbols, pairCount, seedKey]);

  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [flipped, setFlipped] = useState<number[]>([]); // indices into `cards`
  const [attempts, setAttempts] = useState(0);
  const doneRef = useRef(false);

  useEffect(() => {
    if (flipped.length !== 2) return;
    const [a, b] = flipped;
    const isMatch = cards[a].pairId === cards[b].pairId;
    const timer = setTimeout(
      () => {
        if (isMatch) setMatched((prev) => new Set(prev).add(cards[a].pairId));
        setFlipped([]);
      },
      isMatch ? 500 : 900,
    );
    setAttempts((n) => n + 1);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flipped]);

  const allMatched = matched.size === pairCount;

  useEffect(() => {
    if (!allMatched || doneRef.current) return;
    doneRef.current = true;
    const timer = setTimeout(() => onDone(`Matched all ${pairCount} pairs in ${attempts} tries.`), 900);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allMatched]);

  function handleFlip(index: number) {
    if (flipped.length === 2 || flipped.includes(index) || matched.has(cards[index].pairId)) return;
    setFlipped((prev) => [...prev, index]);
  }

  const columns = pairCount <= 5 ? 3 : 4;

  return (
    <div>
      <div className="quest-reward" style={{ marginBottom: 8 }}>
        {t(lang, 'memoryAttempts')}: {attempts}
      </div>
      <div className="memory-grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {cards.map((card, i) => {
          const isFlipped = flipped.includes(i) || matched.has(card.pairId);
          return (
            <button
              key={card.key}
              type="button"
              className={`memory-card${isFlipped ? ' flipped' : ''}${matched.has(card.pairId) ? ' matched' : ''}`}
              onClick={() => handleFlip(i)}
              disabled={isFlipped}
            >
              {isFlipped ? card.symbol : '❓'}
            </button>
          );
        })}
      </div>
      {allMatched && <div className="feedback-msg right" style={{ marginTop: 10 }}>🎉 {t(lang, 'memoryDone')}</div>}
    </div>
  );
}
