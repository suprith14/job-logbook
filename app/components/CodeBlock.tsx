'use client';

import { useEffect, useRef, useState } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';

interface CodeBlockProps {
  code: string;
  language?: string;
}

// Our authored snippets use a trailing "// comment" on almost every line — this pulls
// that comment out so the step-through view can narrate each line instead of just
// re-showing the code the user is already looking at.
function splitLineComment(line: string): string {
  const idx = line.indexOf('//');
  if (idx === -1) return '';
  return line.slice(idx + 2).trim();
}

export default function CodeBlock({ code, language = 'javascript' }: CodeBlockProps) {
  const staticRef = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<'static' | 'flow'>('static');
  const [step, setStep] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  const lines = code.split('\n');
  const grammar = Prism.languages[language] || Prism.languages.javascript;

  useEffect(() => {
    if (mode === 'static' && staticRef.current) {
      Prism.highlightElement(staticRef.current);
    }
  }, [code, language, mode]);

  // Auto-advance through lines while playing, pausing longer on lines that have a
  // comment to actually read, then looping back to the start like a GIF would.
  useEffect(() => {
    if (mode !== 'flow' || !autoplay || lines.length <= 1) return;
    const hasNote = !!splitLineComment(lines[step] || '');
    const delay = hasNote ? 1700 : 500;
    const t = setTimeout(() => setStep((s) => (s + 1) % lines.length), delay);
    return () => clearTimeout(t);
  }, [mode, autoplay, step, lines.length, code]);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
    } catch (err) {
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function enterFlow() {
    setMode('flow');
    setStep(0);
    setAutoplay(true);
  }

  function exitFlow() {
    setMode('static');
    setAutoplay(false);
  }

  function stepPrev() {
    setAutoplay(false);
    setStep((s) => Math.max(0, s - 1));
  }

  function stepNext() {
    setAutoplay(false);
    setStep((s) => Math.min(lines.length - 1, s + 1));
  }

  // Keep showing the last line that actually had a note while scanning past
  // structural lines (closing braces, blank lines) that don't have their own.
  let currentNote = '';
  for (let i = Math.min(step, lines.length - 1); i >= 0; i--) {
    const n = splitLineComment(lines[i]);
    if (n) {
      currentNote = n;
      break;
    }
  }

  if (mode === 'static') {
    return (
      <div className="code-block">
        <div className="code-block-actions">
          <button className="code-copy-btn" onClick={copyCode} title="Copy code">
            {copied ? '✓ Copied' : 'Copy'}
          </button>
          {lines.length > 1 && (
            <button className="code-copy-btn" onClick={enterFlow} title="Step through this code line by line">
              ▶ Step through
            </button>
          )}
        </div>
        <pre className={`language-${language}`}>
          <code ref={staticRef} className={`language-${language}`}>
            {code}
          </code>
        </pre>
      </div>
    );
  }

  return (
    <div className="code-block">
      <div className="code-flow">
        <pre className={`language-${language} code-flow-pre`}>
          {lines.map((line, i) => (
            <div
              key={i}
              className={`code-flow-line${i === step ? ' active' : ''}`}
              dangerouslySetInnerHTML={{ __html: Prism.highlight(line, grammar, language) || '&nbsp;' }}
            />
          ))}
        </pre>
        <div className="code-flow-note">
          <span className="code-flow-step-count">
            Line {step + 1} / {lines.length}
          </span>
          <p>{currentNote || 'Running…'}</p>
        </div>
        <div className="code-flow-controls">
          <button onClick={stepPrev} disabled={step === 0}>
            ‹ Prev
          </button>
          <button className={autoplay ? 'primary' : ''} onClick={() => setAutoplay((a) => !a)}>
            {autoplay ? '❚❚ Pause' : '▶ Play'}
          </button>
          <button onClick={stepNext} disabled={step === lines.length - 1}>
            Next ›
          </button>
          <button onClick={exitFlow}>✕ Exit</button>
        </div>
      </div>
    </div>
  );
}
