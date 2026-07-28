'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import ActorIcon from './ActorIcon';
import CodeBlock from './CodeBlock';
import { actorsFromSteps } from '../lib/actors';
import { generateFlowGif, slugifyForFilename } from '../lib/flowGif';
import { GLOSSARY } from '../lib/glossary';
import type { TechRefStep } from '../types';

interface ProcessFlowProps {
  steps: TechRefStep[];
  title?: string;
}

const STEP_MS = 2200;
const CIRCLE_RADIUS = 36;
const SPEEDS = [0.5, 1, 2];

function circularPosition(i: number, n: number) {
  const angle = -Math.PI / 2 + (i / Math.max(n, 1)) * 2 * Math.PI;
  return { x: 50 + CIRCLE_RADIUS * Math.cos(angle), y: 50 + CIRCLE_RADIUS * Math.sin(angle) };
}

const GLOSSARY_KEYS = Object.keys(GLOSSARY).sort((a, b) => b.length - a.length);
const GLOSSARY_REGEX = new RegExp(
  `\\b(${GLOSSARY_KEYS.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`,
  'gi'
);

// Wraps the first occurrence of each known glossary term in a hoverable/focusable
// tooltip span — subsequent occurrences of the same term in the same string render as
// plain text so the paragraph doesn't get cluttered with repeats.
function renderGlossaryText(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const seen = new Set<string>();
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  GLOSSARY_REGEX.lastIndex = 0;
  while ((match = GLOSSARY_REGEX.exec(text))) {
    const term = match[0];
    const key = term.toLowerCase();
    parts.push(text.slice(lastIndex, match.index));
    if (!seen.has(key)) {
      seen.add(key);
      const canonicalKey = GLOSSARY_KEYS.find((k) => k.toLowerCase() === key) || term;
      parts.push(
        <span key={match.index} className="pf-glossary-term" tabIndex={0} data-tooltip={GLOSSARY[canonicalKey]}>
          {term}
        </span>
      );
    } else {
      parts.push(term);
    }
    lastIndex = match.index + term.length;
  }
  parts.push(text.slice(lastIndex));
  return parts;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// An animated flow visualization for "what happens when..." topics. When steps carry
// from/to actors, this renders actors as a connected system arranged around a ring,
// with a code panel beside it showing the implementation behind whichever step is
// playing — "the whole system," diagram and code together. Without actor data at all,
// it falls back to a simple numbered step chain so older/simpler flows still render.
export default function ProcessFlow({ steps, title }: ProcessFlowProps) {
  const [step, setStep] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [circlePos, setCirclePos] = useState({ x: 50, y: 50 });
  const [circleAnimating, setCircleAnimating] = useState(false);
  const [generatingGif, setGeneratingGif] = useState(false);

  const [quizMode, setQuizMode] = useState(false);
  const [quizOrder, setQuizOrder] = useState<TechRefStep[]>([]);
  const [quizPicked, setQuizPicked] = useState<TechRefStep[]>([]);
  const [quizResult, setQuizResult] = useState<'correct' | 'incorrect' | null>(null);

  const actors = actorsFromSteps(steps);
  const hasDiagram = actors.length > 0;
  const n = actors.length;
  const hasAnyCode = steps.some((s) => s.code);

  useEffect(() => {
    if (!autoplay || steps.length <= 1) return;
    const t = setTimeout(() => setStep((s) => (s + 1) % steps.length), STEP_MS / speed);
    return () => clearTimeout(t);
  }, [autoplay, step, steps.length, speed]);

  const current = steps[Math.min(step, steps.length - 1)];
  const fromIdx = current?.from ? actors.indexOf(current.from) : -1;
  const toIdx = current?.to ? actors.indexOf(current.to) : -1;
  const isSelfLoop = !!current?.from && !!current?.to && current.from === current.to;
  const isError = current?.status === 'error';

  const fromCircle = fromIdx >= 0 ? circularPosition(fromIdx, n) : { x: 50, y: 50 };
  const toCircle = toIdx >= 0 ? circularPosition(toIdx, n) : { x: 50, y: 50 };

  // Snap the packet to the sender's position instantly, then transition it to the
  // receiver's position on the next frame — the classic "reset, then animate" trick,
  // so every step's travel restarts cleanly instead of drifting from the last step.
  useEffect(() => {
    if (!hasDiagram) return;
    setCircleAnimating(false);
    setCirclePos(fromCircle);
    const raf = requestAnimationFrame(() => {
      setCircleAnimating(true);
      setCirclePos(toCircle);
    });
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, hasDiagram, fromCircle.x, fromCircle.y, toCircle.x, toCircle.y]);

  function stepPrev() {
    setAutoplay(false);
    setStep((s) => Math.max(0, s - 1));
  }

  function stepNext() {
    setAutoplay(false);
    setStep((s) => Math.min(steps.length - 1, s + 1));
  }

  function jumpTo(i: number) {
    setAutoplay(false);
    setStep(i);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (quizMode) return;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      stepPrev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      stepNext();
    } else if (e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      setAutoplay((a) => !a);
    }
  }

  async function downloadGif() {
    setGeneratingGif(true);
    try {
      const blob = await generateFlowGif(steps);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${slugifyForFilename(title || steps[0]?.title || 'flow')}.gif`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setGeneratingGif(false);
    }
  }

  function startQuiz() {
    setAutoplay(false);
    setQuizOrder(shuffle(steps));
    setQuizPicked([]);
    setQuizResult(null);
    setQuizMode(true);
  }

  function pickQuizStep(s: TechRefStep) {
    if (quizPicked.includes(s)) return;
    const nextPicked = [...quizPicked, s];
    setQuizPicked(nextPicked);
    if (nextPicked.length === steps.length) {
      const isCorrect = nextPicked.every((picked, i) => picked === steps[i]);
      setQuizResult(isCorrect ? 'correct' : 'incorrect');
    }
  }

  if (steps.length === 0) return null;

  return (
    <div className="process-flow" tabIndex={0} onKeyDown={handleKeyDown}>
      {quizMode ? (
        <div className="pf-quiz">
          <div className="cat-title">Put these steps back in the right order</div>
          <div className="pf-quiz-picked">
            {quizPicked.length === 0 && (
              <span className="pf-quiz-hint">Click the steps below, in order, starting from step 1.</span>
            )}
            {quizPicked.map((s, i) => (
              <span key={i} className="pf-quiz-picked-item">
                {i + 1}. {s.title}
              </span>
            ))}
          </div>
          <div className="pf-quiz-options">
            {quizOrder.map((s, i) => (
              <button
                key={i}
                className={`pf-quiz-option${quizPicked.includes(s) ? ' picked' : ''}`}
                onClick={() => pickQuizStep(s)}
                disabled={quizPicked.includes(s)}
              >
                {s.title}
              </button>
            ))}
          </div>
          {quizResult === 'correct' && <div className="pf-quiz-result correct">✓ Correct order — nice work!</div>}
          {quizResult === 'incorrect' && (
            <div className="pf-quiz-result incorrect">
              ✕ Not quite. Here&rsquo;s the actual order:
              <ol className="pf-quiz-answer">
                {steps.map((s, i) => (
                  <li key={i}>{s.title}</li>
                ))}
              </ol>
            </div>
          )}
          <div className="edit-actions">
            <button onClick={startQuiz}>↻ Shuffle again</button>
            <button className="ghost-btn" onClick={() => setQuizMode(false)}>
              ← Back to diagram
            </button>
          </div>
        </div>
      ) : (
        <>
          {hasDiagram && (
            <div className="pf-system-layout">
              <div className="pf-outline">
                {steps.map((s, i) => (
                  <button
                    key={i}
                    className={`pf-outline-item${i === step ? ' active' : ''}${
                      i === step && s.status === 'error' ? ' error' : ''
                    }`}
                    onClick={() => jumpTo(i)}
                  >
                    <span className="pf-outline-index">{i + 1}</span>
                    <span className="pf-outline-title">{s.title}</span>
                  </button>
                ))}
              </div>

              <div className="pf-circle-wrap">
                <svg className="pf-circle-svg" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r={CIRCLE_RADIUS} className="pf-circle-ring" />
                  {!isSelfLoop && fromIdx >= 0 && toIdx >= 0 && (
                    <line
                      x1={fromCircle.x}
                      y1={fromCircle.y}
                      x2={toCircle.x}
                      y2={toCircle.y}
                      className={`pf-circle-chord${isError ? ' error' : ''}`}
                    />
                  )}
                  {!isSelfLoop && fromIdx >= 0 && toIdx >= 0 && (
                    <circle
                      cx={circlePos.x}
                      cy={circlePos.y}
                      r="2.4"
                      className={`pf-circle-packet${circleAnimating ? ' animating' : ''}${isError ? ' error' : ''}`}
                    />
                  )}
                </svg>
                {actors.map((a, i) => {
                  const pos = circularPosition(i, n);
                  const active = i === fromIdx || i === toIdx;
                  return (
                    <div
                      key={a}
                      className={`pf-actor pf-circle-node${active ? ' active' : ''}${
                        isSelfLoop && i === fromIdx ? ' pulsing' : ''
                      }${active && isError ? ' error' : ''}`}
                      style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                    >
                      <ActorIcon name={a} />
                      <span className="pf-actor-label">{a}</span>
                    </div>
                  );
                })}
                <div className="pf-circle-caption">
                  {current.title}
                  {current.latency && <span className="pf-latency"> · {current.latency}</span>}
                  {current.payload && <div className="pf-circle-payload">{current.payload}</div>}
                </div>
              </div>

              <div className="pf-code-panel">
                <div className="cat-title">Code for this step</div>
                {current.code ? (
                  <CodeBlock code={current.code} />
                ) : (
                  <div className="empty-state">
                    {hasAnyCode ? 'No code for this step — try another one.' : 'No code attached to this flow yet.'}
                  </div>
                )}
              </div>
            </div>
          )}

          {!hasDiagram && (
            <div className="process-flow-track">
              {steps.map((s, i) => (
                <div className="process-flow-node-wrap" key={s.title}>
                  <div
                    className={`process-flow-node${i === step ? ' active' : ''}${i < step ? ' done' : ''}`}
                    onClick={() => jumpTo(i)}
                  >
                    <span className="process-flow-node-index">{i + 1}</span>
                    <span className="process-flow-node-title">{s.title}</span>
                  </div>
                  {i < steps.length - 1 && <span className="process-flow-arrow">→</span>}
                </div>
              ))}
            </div>
          )}

          <div className={`process-flow-detail${isError ? ' error' : ''}`}>
            <span className="code-flow-step-count">
              Step {step + 1} / {steps.length} — {current.title}
              {current.latency && ` · ${current.latency}`}
              {isError && ' · ERROR'}
            </span>
            <p>{renderGlossaryText(current.detail)}</p>
          </div>

          <div className="code-flow-controls">
            <button onClick={stepPrev} disabled={step === 0}>
              ‹ Prev
            </button>
            <button className={autoplay ? 'primary' : ''} onClick={() => setAutoplay((a) => !a)}>
              {autoplay ? '❚❚ Pause' : '▶ Play'}
            </button>
            <button onClick={stepNext} disabled={step === steps.length - 1}>
              Next ›
            </button>
            {SPEEDS.map((sp) => (
              <button key={sp} className={speed === sp ? 'primary' : ''} onClick={() => setSpeed(sp)}>
                {sp}x
              </button>
            ))}
            {steps.length > 2 && <button onClick={startQuiz}>🎯 Test yourself</button>}
            {hasDiagram && (
              <button onClick={downloadGif} disabled={generatingGif}>
                {generatingGif ? 'Generating…' : '⬇ Download as GIF'}
              </button>
            )}
          </div>
          <div className="pf-kbd-hint">← → to step · Space to play/pause</div>
        </>
      )}
    </div>
  );
}
