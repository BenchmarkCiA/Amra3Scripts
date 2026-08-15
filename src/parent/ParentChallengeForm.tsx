import { useMemo, useState } from 'react';
import type { Category, Challenge, ChallengeKind, Difficulty, Recurrence } from '../types';
import { useStore } from '../state/store';
import { CATEGORY_LABEL, computeReward, isHelpingOthers } from '../lib/scoring';
import { makeId } from '../lib/id';

const CATEGORIES: Category[] = [
  'math',
  'english',
  'knowledge',
  'discovery',
  'reading',
  'physical',
  'home',
  'creative',
  'kindness',
  'sibling',
  'family',
  'memory',
  'logic',
  'explorer',
  'lifeskills',
  'adventure',
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function ParentChallengeForm({ onCreated }: { onCreated?: () => void }) {
  const { state, dispatch } = useStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('kindness');
  const [kind, setKind] = useState<ChallengeKind>('selfreport');
  const [difficulty, setDifficulty] = useState<Difficulty>(2);
  const [requiresApproval, setRequiresApproval] = useState(true);
  const [recurrence, setRecurrence] = useState<Recurrence>('daily');
  const [dueDate, setDueDate] = useState('');
  const [weekday, setWeekday] = useState(1);
  const [assignedTo, setAssignedTo] = useState<string[]>([]);
  const [question, setQuestion] = useState('');
  const [choices, setChoices] = useState(['', '', '']);
  const [correctIndex, setCorrectIndex] = useState(0);

  const reward = useMemo(() => computeReward(state.scoringConfig, difficulty, category), [state.scoringConfig, difficulty, category]);

  function toggleChild(id: string) {
    setAssignedTo((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function handleAllChildren() {
    setAssignedTo(state.children.map((c) => c.id));
  }

  function resetForm() {
    setTitle('');
    setDescription('');
    setQuestion('');
    setChoices(['', '', '']);
    setCorrectIndex(0);
    setDueDate('');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || assignedTo.length === 0) return;
    if (recurrence === 'once' && !dueDate) return;

    const challenge: Challenge = {
      id: makeId(),
      title: title.trim(),
      description: description.trim(),
      category,
      kind,
      difficulty,
      requiresApproval,
      recurrence,
      assignedTo,
      createdBy: 'parent',
      active: true,
      createdAt: new Date().toISOString(),
      ...(recurrence === 'once' ? { dueDate } : {}),
      ...(recurrence === 'weekly' ? { weekday } : {}),
      ...(kind === 'quiz'
        ? { quiz: [{ question: question.trim(), choices: choices.map((c) => c.trim()), correctIndex }] }
        : {}),
    };

    dispatch({ type: 'ADD_CHALLENGE', challenge });
    resetForm();
    onCreated?.();
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label">Title</label>
        <input className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Clean your wardrobe" required />
      </div>

      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea className="form-textarea" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What should they do?" />
      </div>

      <div className="form-group">
        <label className="form-label">Category</label>
        <div className="chip-row">
          {CATEGORIES.map((cat) => {
            const helping = isHelpingOthers(cat);
            return (
              <button
                type="button"
                key={cat}
                className={`chip${helping ? ' kindness-chip' : ''}${category === cat ? ' selected' : ''}`}
                onClick={() => setCategory(cat)}
              >
                {CATEGORY_LABEL[cat]}
                {helping ? ' ❤️' : ''}
              </button>
            );
          })}
        </div>
        {isHelpingOthers(category) && (
          <div className="reward-preview">
            Helping-others categories always earn a +{state.scoringConfig.helpingOthersBonusPct}% Stars & XP bonus over a
            same-difficulty challenge — Family Quest's way of making kindness pay off the most.
          </div>
        )}
      </div>

      <div className="form-group">
        <label className="form-label">Challenge type</label>
        <select className="form-select" value={kind} onChange={(e) => setKind(e.target.value as ChallengeKind)}>
          <option value="selfreport">Self-report (child marks it done)</option>
          <option value="quiz">Quiz (auto-graded, 1 question)</option>
          <option value="draw">Drawing</option>
          <option value="discovery">Discovery (pick-a-subject fun fact)</option>
        </select>
      </div>

      {kind === 'quiz' && (
        <div className="form-group">
          <label className="form-label">Question</label>
          <input className="form-input" value={question} onChange={(e) => setQuestion(e.target.value)} required style={{ marginBottom: 8 }} />
          {choices.map((choice, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
              <input
                type="radio"
                name="correct"
                checked={correctIndex === i}
                onChange={() => setCorrectIndex(i)}
              />
              <input
                className="form-input"
                placeholder={`Choice ${i + 1}`}
                value={choice}
                onChange={(e) => setChoices((prev) => prev.map((c, idx) => (idx === i ? e.target.value : c)))}
                required
              />
            </div>
          ))}
          <div className="empty-state" style={{ padding: 0, textAlign: 'start' }}>Select the radio next to the correct answer.</div>
        </div>
      )}

      <div className="form-group">
        <label className="form-label">Difficulty ({difficulty}/5)</label>
        <input
          type="range"
          min={1}
          max={5}
          value={difficulty}
          onChange={(e) => setDifficulty(Number(e.target.value) as Difficulty)}
          style={{ width: '100%' }}
        />
        <div className="reward-preview">
          ⭐ +{reward.stars} · ⚡ +{reward.xp} XP{reward.bonusApplied ? ` (includes +${reward.bonusPct}% helping-others bonus)` : ''}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Assign to</label>
        <div className="chip-row">
          {state.children.map((child) => (
            <button
              type="button"
              key={child.id}
              className={`chip${assignedTo.includes(child.id) ? ' selected' : ''}`}
              onClick={() => toggleChild(child.id)}
            >
              {child.name}
            </button>
          ))}
          <button type="button" className="chip" onClick={handleAllChildren}>
            All
          </button>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Recurrence</label>
        <select className="form-select" value={recurrence} onChange={(e) => setRecurrence(e.target.value as Recurrence)}>
          <option value="once">One-time</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
        </select>
      </div>

      {recurrence === 'once' && (
        <div className="form-group">
          <label className="form-label">Due date</label>
          <input className="form-input" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
        </div>
      )}

      {recurrence === 'weekly' && (
        <div className="form-group">
          <label className="form-label">Day of week</label>
          <select className="form-select" value={weekday} onChange={(e) => setWeekday(Number(e.target.value))}>
            {WEEKDAYS.map((d, i) => (
              <option key={d} value={i}>
                {d}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="form-group">
        <label className="checkbox-row">
          <input type="checkbox" checked={requiresApproval} onChange={(e) => setRequiresApproval(e.target.checked)} />
          Requires parent approval to award Stars/XP
        </label>
      </div>

      <button className="btn btn-primary" type="submit">
        Create Challenge
      </button>
    </form>
  );
}
