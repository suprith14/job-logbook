'use client';

import { useState, useMemo } from 'react';

export const HR_CATEGORIES = ['HR Screening', 'Behavioral', 'Salary & Compensation', 'Situational Judgment'];

export const DEFAULT_HR_QUESTIONS = [
  // --- HR Screening ---
  {
    id: 'seed-hs1',
    category: 'HR Screening',
    question: 'Tell me about yourself.',
    wrongAnswer: 'A full chronological life story starting from school, unrelated to the role you\'re interviewing for.',
    rightAnswer:
      'A 60–90 second pitch: what you do now, one relevant win, and why this role is the logical next step. Keep it tied to the job, not a biography.',
  },
  {
    id: 'seed-hs2',
    category: 'HR Screening',
    question: 'Why are you leaving your current job?',
    wrongAnswer: '"My manager is terrible and the company is a mess" — badmouthing a current or past employer.',
    rightAnswer:
      'Frame it around growth: "I\'ve learned a lot there, but I\'m looking for [specific thing this role offers] that my current role has plateaued on."',
  },
  {
    id: 'seed-hs3',
    category: 'HR Screening',
    question: 'Why do you want to work here?',
    wrongAnswer: '"You\'re a great company with good culture and growth opportunities" — generic, could apply to any employer.',
    rightAnswer:
      'Reference something specific you actually researched — a product, an engineering practice, a team — and connect it to your own goals.',
  },
  {
    id: 'seed-hs4',
    category: 'HR Screening',
    question: 'What is your notice period, and can you join sooner?',
    wrongAnswer: '"Sure, I can try to leave in 2 weeks instead of 60 days" — committing before checking your actual contract terms.',
    rightAnswer:
      '"My contractual notice is 60 days. I can discuss buyout options with my current employer, but I can\'t commit to a shorter date without confirming first."',
  },
  {
    id: 'seed-hs5',
    category: 'HR Screening',
    question: 'Do you have any gaps in your resume you\'d like to explain?',
    wrongAnswer: 'Over-apologizing, or being vague ("just personal stuff") in a way that invites more digging.',
    rightAnswer:
      'Brief, factual, forward-looking: "I took four months for [reason] and used the time to [upskill / certification / freelance] — I\'m ready to fully commit now."',
  },

  // --- Behavioral ---
  {
    id: 'seed-bh1',
    category: 'Behavioral',
    question: 'Tell me about a time you disagreed with a teammate or manager.',
    wrongAnswer: '"I don\'t really disagree with people, I just go along with the team" — reads as no independent judgment.',
    rightAnswer:
      'Describe a specific technical disagreement, how you presented your reasoning or data, and the resolution — even if you didn\'t "win."',
  },
  {
    id: 'seed-bh2',
    category: 'Behavioral',
    question: 'Tell me about a time you failed.',
    wrongAnswer: 'A humble-brag fake failure: "I just work too hard" or "I care too much about quality."',
    rightAnswer: 'A real, specific failure, what caused it, and a concrete change you made afterward to prevent it recurring.',
  },
  {
    id: 'seed-bh3',
    category: 'Behavioral',
    question: 'Tell me about a time you had to learn something new quickly.',
    wrongAnswer: '"I\'m a fast learner, I pick things up quickly" — a claim with no evidence behind it.',
    rightAnswer: 'A specific example with a timeline, the resource or approach you used, and the concrete outcome.',
  },
  {
    id: 'seed-bh4',
    category: 'Behavioral',
    question: 'Describe a time you missed a deadline.',
    wrongAnswer: '"The backend team was late, so it wasn\'t my fault" — deflecting all responsibility.',
    rightAnswer: 'Own your part of it first, then explain what you changed in your process afterward to prevent a repeat.',
  },
  {
    id: 'seed-bh5',
    category: 'Behavioral',
    question: 'How do you handle negative feedback?',
    wrongAnswer: '"I don\'t really get much negative feedback, I don\'t make many mistakes."',
    rightAnswer: 'A specific instance, how you responded in the moment, and how you applied the feedback afterward.',
  },

  // --- Salary & Compensation ---
  {
    id: 'seed-sc1',
    category: 'Salary & Compensation',
    question: 'Before we go further — what\'s your current CTC, including bonus and any stock?',
    wrongAnswer: 'Stating the exact current package immediately — this anchors any offer to your past pay, not the role\'s worth.',
    rightAnswer:
      '"I\'d rather focus on the value of this role — based on market research, this position typically pays ₹X–Y LPA. Does that align with your budget?"',
  },
  {
    id: 'seed-sc2',
    category: 'Salary & Compensation',
    question: 'What are your salary expectations for this role?',
    wrongAnswer: '"Whatever you think is fair, I\'m flexible" — removes your anchor and reads as low-confidence.',
    rightAnswer:
      '"Based on the scope discussed and market rates, I\'m looking at ₹X–Y LPA." A researched range, not a single number.',
  },
  {
    id: 'seed-sc3',
    category: 'Salary & Compensation',
    question: 'Our budget for this role is capped — there\'s no room to move.',
    wrongAnswer: 'Accepting instantly with no pause, which signals you never had a number of your own.',
    rightAnswer:
      '"If the fixed component can\'t move, is there flexibility in a joining bonus, ESOPs, or an earlier review at six months?"',
  },
  {
    id: 'seed-sc4',
    category: 'Salary & Compensation',
    question: 'Other candidates for this role are okay with a lower number.',
    wrongAnswer: '"Oh, in that case I can come down too" — lowering your ask based on an unverifiable claim.',
    rightAnswer:
      '"Good to know, but I can only speak to the value I\'d bring to this role — my number reflects that, not what anyone else is asking."',
  },
  {
    id: 'seed-sc5',
    category: 'Salary & Compensation',
    question: 'If we can match your expectation, can you confirm you\'ll join right now?',
    wrongAnswer: '"Yes, absolutely, 100%!" — committing before you\'ve seen the actual offer letter or terms.',
    rightAnswer:
      '"I\'m very interested, and if the offer matches, I\'d move quickly — I\'d like to see it in writing before confirming."',
  },
  {
    id: 'seed-sc6',
    category: 'Salary & Compensation',
    question: '(Silence, after you state your number)',
    wrongAnswer: 'Filling the silence yourself: "...or, I could also do a bit less if that\'s an issue."',
    rightAnswer: 'Stay quiet. If it goes on too long: "Take your time — happy to walk through how I arrived at that number."',
  },
  {
    id: 'seed-sc7',
    category: 'Salary & Compensation',
    question: 'Honestly, that number seems high for someone at your experience level.',
    wrongAnswer: '"I understand, sorry — I can definitely adjust it down" — apologizing for a researched number.',
    rightAnswer: '"That\'s based on market data for this scope of role, not just years of experience — happy to walk through it."',
  },
  {
    id: 'seed-sc8',
    category: 'Salary & Compensation',
    question: 'We can\'t match that on salary, but we can offer you a senior title and faster growth.',
    wrongAnswer: '"Oh, a senior title — sure, that works instead!" — trading a real number for a feeling.',
    rightAnswer:
      '"I appreciate that, and the title matters too — but I\'d want to close the compensation gap separately as well."',
  },
  {
    id: 'seed-sc9',
    category: 'Salary & Compensation',
    question: 'This is our best and final offer.',
    wrongAnswer: '"Okay, I\'ll take it" on the same call, with no time taken to review.',
    rightAnswer: '"Thank you for sharing that — I\'d like a day to review the complete offer in writing before I confirm."',
  },
  {
    id: 'seed-sc10',
    category: 'Salary & Compensation',
    question: 'Why should we pay you this much when other candidates are asking for less?',
    wrongAnswer: '"Because I\'m better than them" — an unprovable, adversarial comparison to people you\'ve never met.',
    rightAnswer:
      '"I can\'t speak to other candidates, but I can tell you exactly what I\'d bring in the first six months — that\'s what my number reflects."',
  },

  // --- Situational Judgment ---
  {
    id: 'seed-sj1',
    category: 'Situational Judgment',
    question: 'A designer\'s spec isn\'t technically feasible on the given timeline. What do you do?',
    wrongAnswer: 'Build it exactly as specced regardless, and miss the deadline without flagging it in advance.',
    rightAnswer: 'Flag the constraint early with concrete options (cut scope or extend timeline) so the team decides, not you alone.',
  },
  {
    id: 'seed-sj2',
    category: 'Situational Judgment',
    question: 'A senior engineer asks you to skip writing tests to hit a deadline. What do you do?',
    wrongAnswer: 'Silently comply, or flatly refuse and escalate immediately with no discussion.',
    rightAnswer:
      'Push back with the specific risk, propose a minimal test for the riskiest path, and document the decision if overruled.',
  },
  {
    id: 'seed-sj3',
    category: 'Situational Judgment',
    question: 'How do you decide between shipping fast and writing clean code?',
    wrongAnswer: '"Clean code always" or "ship fast always" — a fixed rule with no situational judgment.',
    rightAnswer: 'Frame it as a deliberate tradeoff: a throwaway prototype and a core payment flow warrant very different bars.',
  },
  {
    id: 'seed-sj4',
    category: 'Situational Judgment',
    question: 'You inherit a codebase with no documentation, and the original engineer has left. What\'s your approach?',
    wrongAnswer: '"I\'d just start rewriting it from scratch."',
    rightAnswer: 'Read tests and commit history first, map the critical paths, document as you go — avoid a full rewrite unless justified.',
  },
  {
    id: 'seed-sj5',
    category: 'Situational Judgment',
    question: 'QA finds a critical bug the night before a release. How do you respond?',
    wrongAnswer: 'Panic-fix without understanding the root cause, then push straight to production.',
    rightAnswer: 'Assess the blast radius first, decide fix-vs-delay with the team, and add a regression test before shipping the fix.',
  },
];

export default function HRPrep({ hrQuestions, setHrQuestions, isAdmin }) {
  const [newQA, setNewQA] = useState({ question: '', wrongAnswer: '', rightAnswer: '', category: HR_CATEGORIES[0] });
  const [hrSearch, setHrSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [editingQAId, setEditingQAId] = useState(null);
  const [editQABuffer, setEditQABuffer] = useState({ question: '', wrongAnswer: '', rightAnswer: '', category: HR_CATEGORIES[0] });

  function addQA() {
    if (!isAdmin) return;
    const question = newQA.question.trim();
    const wrongAnswer = newQA.wrongAnswer.trim();
    const rightAnswer = newQA.rightAnswer.trim();
    if (!question || !rightAnswer) return;
    setHrQuestions((prev) => [
      { id: `q${Date.now()}${Math.random()}`, question, wrongAnswer, rightAnswer, category: newQA.category },
      ...prev,
    ]);
    setNewQA({ question: '', wrongAnswer: '', rightAnswer: '', category: newQA.category });
  }

  function deleteQA(id) {
    if (!isAdmin) return;
    setHrQuestions((prev) => prev.filter((q) => q.id !== id));
  }

  function startEditQA(qa) {
    if (!isAdmin) return;
    setEditingQAId(qa.id);
    setEditQABuffer({
      question: qa.question,
      wrongAnswer: qa.wrongAnswer,
      rightAnswer: qa.rightAnswer,
      category: qa.category || HR_CATEGORIES[0],
    });
  }

  function saveEditQA(id) {
    const question = editQABuffer.question.trim();
    const rightAnswer = editQABuffer.rightAnswer.trim();
    if (!question || !rightAnswer) return;
    setHrQuestions((prev) =>
      prev.map((q) =>
        q.id === id
          ? { ...q, question, wrongAnswer: editQABuffer.wrongAnswer.trim(), rightAnswer, category: editQABuffer.category }
          : q
      )
    );
    setEditingQAId(null);
  }

  function cancelEditQA() {
    setEditingQAId(null);
  }

  function loadStarterQuestions() {
    if (!isAdmin) return;
    const existing = new Set(hrQuestions.map((q) => q.question.trim().toLowerCase()));
    const toAdd = DEFAULT_HR_QUESTIONS.filter((q) => !existing.has(q.question.trim().toLowerCase()));
    if (toAdd.length === 0) return;
    setHrQuestions((prev) => [...toAdd, ...prev]);
  }

  const filteredQA = useMemo(() => {
    const s = hrSearch.trim().toLowerCase();
    return hrQuestions.filter((q) => {
      const matchesSearch = !s || q.question.toLowerCase().includes(s);
      const matchesCategory = !categoryFilter || q.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [hrQuestions, hrSearch, categoryFilter]);

  return (
    <div className="panel active">
      <div className="dir-controls">
        <input
          type="text"
          placeholder="Search your questions…"
          value={hrSearch}
          onChange={(e) => setHrSearch(e.target.value)}
        />
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="">All categories</option>
          {HR_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {isAdmin && hrQuestions.length === 0 && (
        <button className="ghost-btn resume-add-btn" onClick={loadStarterQuestions} style={{ marginBottom: 16 }}>
          + Load 25 starter questions (HR screening, behavioral, salary, situational)
        </button>
      )}

      {isAdmin && (
        <div className="add-form qa-form">
          <select value={newQA.category} onChange={(e) => setNewQA({ ...newQA, category: e.target.value })}>
            {HR_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <textarea
            className="qa-textarea"
            rows={2}
            placeholder="Question HR might ask…"
            value={newQA.question}
            onChange={(e) => setNewQA({ ...newQA, question: e.target.value })}
          />
          <textarea
            className="qa-textarea"
            rows={2}
            placeholder="Wrong answer (what to avoid saying)…"
            value={newQA.wrongAnswer}
            onChange={(e) => setNewQA({ ...newQA, wrongAnswer: e.target.value })}
          />
          <textarea
            className="qa-textarea"
            rows={2}
            placeholder="Right answer (what to actually say)…"
            value={newQA.rightAnswer}
            onChange={(e) => setNewQA({ ...newQA, rightAnswer: e.target.value })}
          />
          <button onClick={addQA}>Add question</button>
        </div>
      )}

      {isAdmin && hrQuestions.length > 0 && (
        <button className="ghost-btn resume-add-btn" onClick={loadStarterQuestions} style={{ marginBottom: 16 }}>
          + Add any missing starter questions
        </button>
      )}

      {filteredQA.length === 0 && (
        <div className="empty-state">
          {hrQuestions.length === 0
            ? 'No questions yet — load the starter pack above or add your own.'
            : 'No questions match that search/filter.'}
        </div>
      )}

      <div className="qa-list">
        {filteredQA.map((qa) => {
          const isEditing = editingQAId === qa.id;
          if (isEditing) {
            return (
              <div className="qa-card editing" key={qa.id}>
                <select value={editQABuffer.category} onChange={(e) => setEditQABuffer({ ...editQABuffer, category: e.target.value })}>
                  {HR_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <textarea
                  className="qa-textarea"
                  rows={2}
                  value={editQABuffer.question}
                  onChange={(e) => setEditQABuffer({ ...editQABuffer, question: e.target.value })}
                  placeholder="Question"
                />
                <textarea
                  className="qa-textarea"
                  rows={2}
                  value={editQABuffer.wrongAnswer}
                  onChange={(e) => setEditQABuffer({ ...editQABuffer, wrongAnswer: e.target.value })}
                  placeholder="Wrong answer"
                />
                <textarea
                  className="qa-textarea"
                  rows={2}
                  value={editQABuffer.rightAnswer}
                  onChange={(e) => setEditQABuffer({ ...editQABuffer, rightAnswer: e.target.value })}
                  placeholder="Right answer"
                />
                <div className="edit-actions">
                  <button onClick={() => saveEditQA(qa.id)}>Save</button>
                  <button className="ghost-btn" onClick={cancelEditQA}>Cancel</button>
                </div>
              </div>
            );
          }
          return (
            <div className="qa-card" key={qa.id}>
              <div className="qa-question-row">
                <div>
                  {qa.category && <span className="qa-category-tag">{qa.category}</span>}
                  <div className="qa-question">{qa.question}</div>
                </div>
                {isAdmin && (
                  <div className="qa-actions">
                    <button className="edit-icon" onClick={() => startEditQA(qa)} title="Edit">
                      ✎
                    </button>
                    <button className="del-btn" onClick={() => deleteQA(qa.id)} title="Delete">
                      ✕
                    </button>
                  </div>
                )}
              </div>
              {qa.wrongAnswer && (
                <div className="qa-answer qa-wrong">
                  <span className="qa-tag">✗ Avoid</span>
                  <span>{qa.wrongAnswer}</span>
                </div>
              )}
              <div className="qa-answer qa-right">
                <span className="qa-tag">✓ Say this</span>
                <span>{qa.rightAnswer}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
