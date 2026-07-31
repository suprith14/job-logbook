'use client';

import { Dispatch, SetStateAction, useMemo, useState } from 'react';
import type { CorporateScenario, DialogueLine } from '../types';

export const CORPORATE_CATEGORIES = [
  'Office Politics & Influence',
  'Negotiation',
  'How Business Actually Runs',
  'Stakeholder Communication',
];

export const DEFAULT_SCENARIOS: CorporateScenario[] = [
  // --- Office Politics & Influence ---
  {
    id: 'seed-op1',
    category: 'Office Politics & Influence',
    situation: 'A peer takes credit for your work in a meeting with your skip-level present.',
    dialogue: [
      { speaker: 'Peer', line: 'Yeah, I pushed hard to get the caching layer redesigned last sprint — it fixed the timeout issue.' },
      { speaker: 'You', line: 'Adding on to that — I built the caching layer itself; [Peer] helped scope the rollout plan with me.' },
      { speaker: 'Skip-level', line: 'Good, glad it\'s stable now. Nice work, both of you.' },
    ],
    takeaway: 'Correct the record factually and immediately, in the same room, without accusing anyone — silence reads as agreement, but a calm factual add-on doesn\'t create a confrontation.',
  },
  {
    id: 'seed-op2',
    category: 'Office Politics & Influence',
    situation: 'Your manager consistently cuts you off mid-explanation in team meetings.',
    dialogue: [
      { speaker: 'Manager', line: 'Let\'s move on, I think we get the idea.' },
      { speaker: 'You', line: '(later, in your 1:1) I noticed in yesterday\'s meeting I didn\'t get to finish the tradeoff on the caching approach — can I get two minutes to walk it through in the next one?' },
      { speaker: 'Manager', line: 'Sure, go ahead next time, my bad.' },
    ],
    takeaway: 'Address a pattern privately and specifically, framed as a small forward-looking request rather than a complaint about what already happened — it\'s far easier for someone to say yes to.',
  },
  {
    id: 'seed-op3',
    category: 'Office Politics & Influence',
    situation: 'A colleague publicly flags your PR in a way that reads more critical than warranted.',
    dialogue: [
      { speaker: 'Colleague', line: '(in the team channel) This PR has some concerning patterns, might want to rethink the approach.' },
      { speaker: 'You', line: '(DM) Saw your comment on the PR — happy to discuss directly, could you share specifics so I can address them?' },
      { speaker: 'Colleague', line: 'Oh, it was just a general note, nothing too serious.' },
      { speaker: 'You', line: 'Got it — next time, mind sending specifics in a thread or DM first? Easier for me to act on quickly.' },
    ],
    takeaway: 'Move a vague public criticism into a direct, private channel and ask for specifics — most vague callouts either sharpen into something actionable or quietly evaporate.',
  },
  {
    id: 'seed-op4',
    category: 'Office Politics & Influence',
    situation: 'You\'re excluded from a cross-team decision that directly affects your work.',
    dialogue: [
      { speaker: 'You', line: 'I noticed the API contract for checkout was finalized without frontend input — can we make sure frontend is looped in before these get locked, since we\'re the main consumer?' },
      { speaker: 'Manager', line: 'Good point, I\'ll make sure you\'re included going forward.' },
    ],
    takeaway: 'Frame the ask around a concrete cost or risk to the work — "this affects a decision I have to build against" — rather than "I feel left out," which is harder to act on.',
  },
  {
    id: 'seed-op5',
    category: 'Office Politics & Influence',
    situation: 'You quietly fixed a production incident, but nobody outside your team knows it happened.',
    dialogue: [
      { speaker: 'You', line: '(weekly update to manager) Quick note — the checkout timeout issue from Tuesday was root-caused and fixed by EOD; added a regression test and a dashboard alert so it surfaces faster next time.' },
      { speaker: 'Manager', line: 'Great, thanks for the heads up — I\'ll mention it in the leadership sync.' },
    ],
    takeaway: 'Reporting real wins concisely as they happen isn\'t self-promotion, it\'s making sure the people who decide your growth actually have the information to decide it.',
  },

  // --- Negotiation ---
  {
    id: 'seed-neg1',
    category: 'Negotiation',
    situation: 'A PM asks for an entire redesign to ship by an unrealistic Friday deadline.',
    dialogue: [
      { speaker: 'PM', line: 'We need the whole redesign live by Friday.' },
      { speaker: 'You', line: 'I can ship checkout and cart by Friday. The account-settings redesign needs another week if we want it properly tested — want checkout/cart first, or should we split resources?' },
      { speaker: 'PM', line: 'Let\'s do checkout and cart first, account-settings can wait.' },
    ],
    takeaway: 'Never answer an unrealistic deadline with a flat "no" — offer a scoped alternative with a real tradeoff, which forces the requester to make an informed choice instead of just pushing harder.',
  },
  {
    id: 'seed-neg2',
    category: 'Negotiation',
    situation: 'Your manager says "not yet" to a promotion, with no specifics.',
    dialogue: [
      { speaker: 'Manager', line: 'You\'re doing well, but it\'s not quite the right time for promo this cycle.' },
      { speaker: 'You', line: 'Understood — can we define specifically what\'s needed to be ready next cycle, and check in on it at the mid-year review?' },
      { speaker: 'Manager', line: 'Sure, let\'s write that down so we\'re both clear.' },
    ],
    takeaway: 'Turn a vague rejection into a concrete, written, checkable plan — a vague "not yet" stays vague forever unless someone forces it to become specific.',
  },
  {
    id: 'seed-neg3',
    category: 'Negotiation',
    situation: 'You need another engineer on your team before technical debt becomes unmanageable.',
    dialogue: [
      { speaker: 'You', line: 'I can keep shipping at this pace for another month, but without a second engineer on this, tech debt on the payments module will start slowing everything down.' },
      { speaker: 'Manager', line: 'Let me see what I can do on headcount.' },
      { speaker: 'You', line: '(2 weeks later) Just flagging, we\'re still solo on payments — any movement on that headcount ask?' },
    ],
    takeaway: 'Name the concrete downstream cost of inaction, then follow up — most reasonable asks die not from rejection, but from being asked once and never mentioned again.',
  },
  {
    id: 'seed-neg4',
    category: 'Negotiation',
    situation: 'A stakeholder tacks a "small" extra ask onto an already-scoped ticket.',
    dialogue: [
      { speaker: 'Stakeholder', line: 'Can you also add analytics tracking to this ticket? It\'s small.' },
      { speaker: 'You', line: 'Happy to — that\'s about half a day extra with QA. Should I add it to this sprint (pushing something else out) or the next one?' },
      { speaker: 'Stakeholder', line: 'Next sprint works fine.' },
    ],
    takeaway: '"Small" asks often aren\'t — quantify the actual cost and make the tradeoff explicit instead of silently absorbing scope creep into an already-committed estimate.',
  },
  {
    id: 'seed-neg5',
    category: 'Negotiation',
    situation: 'You want to raise your comp outside the normal review cycle.',
    dialogue: [
      { speaker: 'You', line: 'I\'ve taken on the payments module lead role since March, which wasn\'t part of my original scope — I\'d like to discuss adjusting comp to reflect that ahead of the next cycle.' },
      { speaker: 'Manager', line: 'Let me check what\'s possible outside the normal cycle.' },
    ],
    takeaway: 'An off-cycle ask needs a concrete trigger — expanded scope, market data, a competing offer. "I\'ve been here a while" on its own rarely moves anything outside the standard cycle.',
  },

  // --- How Business Actually Runs ---
  {
    id: 'seed-biz1',
    category: 'How Business Actually Runs',
    situation: 'Your team\'s roadmap suddenly shifts with no warning at the start of a quarter.',
    dialogue: [
      { speaker: 'Manager', line: 'We\'re deprioritizing the redesign — use-it-or-lose-it budget needs to go to the mobile initiative this quarter.' },
      { speaker: 'You', line: 'Got it — is this a one-quarter shift, or is redesign off the roadmap entirely?' },
      { speaker: 'Manager', line: 'One quarter, it\'s back on in Q1.' },
    ],
    takeaway: 'Many "sudden priority changes" are budget or fiscal-calendar driven, not a verdict on your project\'s value — ask whether it\'s temporary before reading too much into it.',
  },
  {
    id: 'seed-biz2',
    category: 'How Business Actually Runs',
    situation: 'You\'re up for promotion and don\'t understand why the decision isn\'t just your manager\'s call.',
    dialogue: [
      { speaker: 'Manager', line: 'I\'m putting you forward for promo, but the final call happens in calibration with other managers — I\'ll advocate for you, but I can\'t guarantee it.' },
      { speaker: 'You', line: 'What would help you make the case in that room?' },
      { speaker: 'Manager', line: 'Specific examples with measurable impact — send me a few before the meeting.' },
    ],
    takeaway: 'Your manager is your advocate in a room you\'re not in — feed them concrete, specific evidence beforehand instead of assuming they already remember everything you did.',
  },
  {
    id: 'seed-biz3',
    category: 'How Business Actually Runs',
    situation: 'Leadership asks for a "quick" feature by next week for a board meeting.',
    dialogue: [
      { speaker: 'VP', line: '(in Slack, to your manager) Can we get this live by next week for the board meeting?' },
      { speaker: 'Manager', line: '(to team) I know this is a fire drill — what can we realistically ship by Thursday, and what would slip if we do this?' },
      { speaker: 'You', line: 'We can ship a working version by Thursday if we cut the edge-case handling — I\'ll list what that means in practice.' },
    ],
    takeaway: 'Good managers translate top-down urgency into an explicit tradeoff instead of silently absorbing it — you can ask the same question when a similar ask lands on you directly.',
  },
  {
    id: 'seed-biz4',
    category: 'How Business Actually Runs',
    situation: 'A reorg changes your reporting line with no input from you.',
    dialogue: [
      { speaker: 'Manager', line: 'Heads up — starting next month you\'ll report to a new manager as part of a reorg. Nothing about your role or level is changing.' },
      { speaker: 'You', line: 'Thanks for the heads up — can we set up time with them this week so I\'m not starting cold?' },
      { speaker: 'Manager', line: 'Good idea, I\'ll set that up.' },
    ],
    takeaway: 'Reorgs are usually about org-chart efficiency, not a signal about you specifically — the only lever you actually control is how quickly you build context with whoever you now report to.',
  },
  {
    id: 'seed-biz5',
    category: 'How Business Actually Runs',
    situation: 'A tech-debt fix you believe in keeps getting deprioritized against feature work.',
    dialogue: [
      { speaker: 'You', line: 'This refactor would cut our incident rate, but it\'s hard to tie directly to this quarter\'s goals.' },
      { speaker: 'Manager', line: 'Frame it as reliability — that maps to the "platform stability" goal leadership already committed to.' },
    ],
    takeaway: 'Good ideas get funded when they\'re framed against an existing stated priority — learn what your org\'s top-level goals actually are before pitching work that competes for the same time.',
  },

  // --- Stakeholder Communication ---
  {
    id: 'seed-stk1',
    category: 'Stakeholder Communication',
    situation: 'Your manager gives vague direction and expects you to figure out the rest.',
    dialogue: [
      { speaker: 'Manager', line: 'Just build whatever makes sense for now, we\'ll figure out details later.' },
      { speaker: 'You', line: 'To make sure I build the right thing — can I send you a one-paragraph plan by EOD, and you flag anything off before I start?' },
      { speaker: 'Manager', line: 'Yeah, that works, send it over.' },
    ],
    takeaway: 'When direction is vague, don\'t guess silently — propose your own interpretation and ask for a quick confirm/correct. Correcting is cheap; guessing wrong for a week is expensive.',
  },
  {
    id: 'seed-stk2',
    category: 'Stakeholder Communication',
    situation: 'A non-technical VP pushes back on your timeline without understanding the tradeoff.',
    dialogue: [
      { speaker: 'VP', line: 'Why can\'t we just ship this faster?' },
      { speaker: 'You', line: 'We can ship in 2 weeks if we accept some manual QA risk on payments, or 4 weeks fully automated and tested. Since this touches money, I\'d lean toward 4 weeks — want both options in writing?' },
      { speaker: 'VP', line: 'Yes, send me both, I\'ll make the call.' },
    ],
    takeaway: 'Translate technical tradeoffs into risk-and-time terms leadership can actually decide on — never just say "it\'s complicated" and leave it there.',
  },
  {
    id: 'seed-stk3',
    category: 'Stakeholder Communication',
    situation: 'You need to tell a stakeholder a deliverable is going to slip.',
    dialogue: [
      { speaker: 'You', line: 'Want to flag early — the API integration will slip about 3 days due to an undocumented rate limit on the partner\'s side. Here\'s the revised plan and what I\'m doing to protect the rest of the timeline.' },
      { speaker: 'Stakeholder', line: 'Thanks for the heads-up, let\'s adjust the launch comms accordingly.' },
    ],
    takeaway: 'Lead with the problem, the cause, and your mitigation plan in the same message — never send a slip notice without a plan already attached to it.',
  },
  {
    id: 'seed-stk4',
    category: 'Stakeholder Communication',
    situation: 'You get rare 1:1 time with your skip-level manager.',
    dialogue: [
      { speaker: 'Skip-level', line: 'How\'s it going? Anything I should know?' },
      { speaker: 'You', line: 'Good overall — one thing worth flagging: our release process has a manual step that\'s caused two near-misses this quarter. I\'ve proposed automating it, wanted you aware in case it needs prioritization support.' },
      { speaker: 'Skip-level', line: 'Appreciate you raising that, let\'s follow up.' },
    ],
    takeaway: 'A skip-level is a rare, high-leverage audience — come with one specific, well-framed point, not a vague "everything\'s fine" or a laundry list of complaints.',
  },
  {
    id: 'seed-stk5',
    category: 'Stakeholder Communication',
    situation: 'Another team\'s lead deflects a bug onto your service before the root cause is even known.',
    dialogue: [
      { speaker: 'Other lead', line: 'This bug is actually in your service, not ours.' },
      { speaker: 'You', line: 'Let\'s not debate ownership before we understand the actual root cause — want to pair for 20 minutes to trace it, then figure out who owns the fix?' },
      { speaker: 'Other lead', line: 'Fair, let\'s do that.' },
    ],
    takeaway: 'Separate "whose fault" from "what\'s broken" — chasing blame before root cause wastes time and creates friction that outlasts the actual bug.',
  },
];

interface DialogueDraft extends DialogueLine {
  key: string;
}

interface ScenarioDraft {
  category: string;
  situation: string;
  dialogue: DialogueDraft[];
  takeaway: string;
}

function emptyDraft(category: string): ScenarioDraft {
  return {
    category,
    situation: '',
    dialogue: [{ key: `d${Date.now()}${Math.random()}`, speaker: '', line: '' }],
    takeaway: '',
  };
}

function toDraft(s: CorporateScenario): ScenarioDraft {
  return {
    category: s.category,
    situation: s.situation,
    dialogue: s.dialogue.map((d) => ({ ...d, key: `d${Date.now()}${Math.random()}` })),
    takeaway: s.takeaway,
  };
}

interface SuggestedScenario {
  situation: string;
  dialogue: DialogueLine[];
  takeaway: string;
}

interface CorporatePlaybookProps {
  scenarios: CorporateScenario[];
  setScenarios: Dispatch<SetStateAction<CorporateScenario[]>>;
  isAdmin: boolean;
}

export default function CorporatePlaybook({ scenarios, setScenarios, isAdmin }: CorporatePlaybookProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [addingCategory, setAddingCategory] = useState<string | null>(null);
  const [draft, setDraft] = useState<ScenarioDraft>(emptyDraft(CORPORATE_CATEGORIES[0]));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const [suggestingCategory, setSuggestingCategory] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<SuggestedScenario[] | null>(null);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<number>>(new Set());
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [suggestError, setSuggestError] = useState('');

  function toggleExpanded(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function openAddForm(category: string) {
    if (!isAdmin) return;
    setEditingId(null);
    setDraft(emptyDraft(category));
    setAddingCategory(category);
  }

  function cancelDraft() {
    setAddingCategory(null);
    setEditingId(null);
  }

  function addDialogueLine() {
    setDraft((prev) => ({
      ...prev,
      dialogue: [...prev.dialogue, { key: `d${Date.now()}${Math.random()}`, speaker: '', line: '' }],
    }));
  }

  function removeDialogueLine(key: string) {
    setDraft((prev) => ({ ...prev, dialogue: prev.dialogue.filter((d) => d.key !== key) }));
  }

  function updateDialogueLine(key: string, field: 'speaker' | 'line', value: string) {
    setDraft((prev) => ({
      ...prev,
      dialogue: prev.dialogue.map((d) => (d.key === key ? { ...d, [field]: value } : d)),
    }));
  }

  function moveDialogueLine(key: string, dir: -1 | 1) {
    setDraft((prev) => {
      const idx = prev.dialogue.findIndex((d) => d.key === key);
      const swapWith = idx + dir;
      if (idx === -1 || swapWith < 0 || swapWith >= prev.dialogue.length) return prev;
      const dialogue = [...prev.dialogue];
      [dialogue[idx], dialogue[swapWith]] = [dialogue[swapWith], dialogue[idx]];
      return { ...prev, dialogue };
    });
  }

  function saveDraft() {
    if (!isAdmin) return;
    const situation = draft.situation.trim();
    const takeaway = draft.takeaway.trim();
    const dialogue = draft.dialogue
      .map((d) => ({ speaker: d.speaker.trim(), line: d.line.trim() }))
      .filter((d) => d.speaker && d.line);
    if (!situation || !takeaway || dialogue.length === 0) return;

    if (editingId) {
      setScenarios((prev) =>
        prev.map((s) => (s.id === editingId ? { ...s, category: draft.category, situation, dialogue, takeaway } : s))
      );
    } else {
      setScenarios((prev) => [
        { id: `cs${Date.now()}${Math.random()}`, category: draft.category, situation, dialogue, takeaway },
        ...prev,
      ]);
    }
    setAddingCategory(null);
    setEditingId(null);
  }

  function startEdit(s: CorporateScenario) {
    if (!isAdmin) return;
    setEditingId(s.id);
    setDraft(toDraft(s));
    setAddingCategory(s.category);
  }

  function deleteScenario(id: string) {
    if (!isAdmin) return;
    setScenarios((prev) => prev.filter((s) => s.id !== id));
  }

  function loadStarterPack() {
    if (!isAdmin) return;
    const existing = new Set(scenarios.map((s) => s.situation.trim().toLowerCase()));
    const toAdd = DEFAULT_SCENARIOS.filter((s) => !existing.has(s.situation.trim().toLowerCase()));
    if (toAdd.length === 0) return;
    setScenarios((prev) => [...toAdd, ...prev]);
  }

  async function findScenarios(category: string) {
    if (!isAdmin) return;
    setSuggestingCategory(category);
    setSuggestLoading(true);
    setSuggestError('');
    setSuggestions(null);
    try {
      const existingSituations = scenarios.filter((s) => s.category === category).map((s) => s.situation);
      const res = await fetch('/api/corporate-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, existingSituations }),
      });
      const data = await res.json();
      if (data.error) {
        setSuggestError(data.error);
      } else {
        const items: SuggestedScenario[] = data.scenarios || [];
        setSuggestions(items);
        setSelectedSuggestions(new Set(items.map((_, i) => i)));
      }
    } catch (err) {
      setSuggestError(String(err));
    } finally {
      setSuggestLoading(false);
    }
  }

  function toggleSuggestion(i: number) {
    setSelectedSuggestions((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  function dismissSuggestions() {
    setSuggestingCategory(null);
    setSuggestions(null);
    setSuggestError('');
  }

  function addSelectedSuggestions(category: string) {
    if (!isAdmin || !suggestions) return;
    const toAdd = suggestions
      .filter((_, i) => selectedSuggestions.has(i))
      .map((s) => ({
        id: `cs${Date.now()}${Math.random()}`,
        category,
        situation: s.situation,
        dialogue: s.dialogue,
        takeaway: s.takeaway,
      }));
    setScenarios((prev) => [...toAdd, ...prev]);
    dismissSuggestions();
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return scenarios.filter(
      (s) => !q || s.situation.toLowerCase().includes(q) || s.takeaway.toLowerCase().includes(q)
    );
  }, [scenarios, search]);

  const categoriesToShow = categoryFilter ? [categoryFilter] : CORPORATE_CATEGORIES;

  return (
    <div className="panel active">
      <p className="guide-intro">
        Realistic scripts for the stuff no job description covers — office politics, negotiating scope and
        promotions, how decisions actually get made above your team, and talking to people above your manager. Each
        entry is a real situation with an actual back-and-forth, not just advice.
      </p>

      <div className="dir-controls">
        <input
          type="text"
          placeholder="Search scenarios…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="">All categories</option>
          {CORPORATE_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {isAdmin && scenarios.length === 0 && (
        <button className="ghost-btn resume-add-btn" onClick={loadStarterPack} style={{ marginBottom: 16 }}>
          + Load starter pack ({DEFAULT_SCENARIOS.length} scenarios across {CORPORATE_CATEGORIES.length} topics)
        </button>
      )}
      {isAdmin && scenarios.length > 0 && (
        <button className="ghost-btn resume-add-btn" onClick={loadStarterPack} style={{ marginBottom: 16 }}>
          + Add any missing starter scenarios
        </button>
      )}

      {categoriesToShow.map((category) => {
        const items = filtered.filter((s) => s.category === category);
        return (
          <div className="cat-group" key={category}>
            <div className="cat-title-row">
              <div className="cat-title">{category}</div>
              {isAdmin && (
                <div className="cat-title-actions">
                  <button
                    className="add-concept-btn"
                    onClick={() => findScenarios(category)}
                    disabled={suggestLoading && suggestingCategory === category}
                  >
                    {suggestLoading && suggestingCategory === category ? 'Searching…' : '✦ Find scenarios'}
                  </button>
                  <button className="add-concept-btn" onClick={() => openAddForm(category)}>
                    + Add scenario
                  </button>
                </div>
              )}
            </div>

            {suggestingCategory === category && suggestError && <div className="discover-error">{suggestError}</div>}

            {suggestingCategory === category && suggestions && suggestions.length > 0 && (
              <div className="suggestions-panel">
                <div className="cat-title">Suggested scenarios — review before adding</div>
                <div className="qa-list">
                  {suggestions.map((s, i) => (
                    <label className="suggestion-card tech-suggestion-card" key={i}>
                      <input type="checkbox" checked={selectedSuggestions.has(i)} onChange={() => toggleSuggestion(i)} />
                      <div>
                        <div className="qa-question">{s.situation}</div>
                        <div className="dialogue-script">
                          {s.dialogue.map((d, j) => (
                            <div className="dialogue-line" key={j}>
                              <span className="dialogue-speaker">{d.speaker}:</span> {d.line}
                            </div>
                          ))}
                        </div>
                        <p className="tech-explanation">{s.takeaway}</p>
                      </div>
                    </label>
                  ))}
                </div>
                <div className="edit-actions">
                  <button onClick={() => addSelectedSuggestions(category)}>Add selected</button>
                  <button className="ghost-btn" onClick={dismissSuggestions}>
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {isAdmin && addingCategory === category && (
              <div className="add-form qa-form">
                <textarea
                  className="qa-textarea"
                  rows={2}
                  placeholder='The situation (e.g. "A peer takes credit for your work in a meeting")'
                  value={draft.situation}
                  onChange={(e) => setDraft({ ...draft, situation: e.target.value })}
                />
                <div className="resume-entries">
                  {draft.dialogue.map((d, i) => (
                    <div className="resume-entry" key={d.key}>
                      <div className="resume-field-grid">
                        <input
                          type="text"
                          placeholder="Speaker (e.g. Manager, You)"
                          value={d.speaker}
                          onChange={(e) => updateDialogueLine(d.key, 'speaker', e.target.value)}
                        />
                        <input
                          type="text"
                          placeholder="What they say"
                          value={d.line}
                          onChange={(e) => updateDialogueLine(d.key, 'line', e.target.value)}
                        />
                      </div>
                      <div className="flow-step-actions">
                        <button className="ghost-btn" onClick={() => moveDialogueLine(d.key, -1)} disabled={i === 0}>
                          ↑ Move up
                        </button>
                        <button
                          className="ghost-btn"
                          onClick={() => moveDialogueLine(d.key, 1)}
                          disabled={i === draft.dialogue.length - 1}
                        >
                          ↓ Move down
                        </button>
                        <button className="del-btn resume-remove" onClick={() => removeDialogueLine(d.key)}>
                          ✕ Remove line
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="ghost-btn resume-add-btn" onClick={addDialogueLine}>
                  + Add line
                </button>
                <textarea
                  className="qa-textarea"
                  rows={2}
                  placeholder="Takeaway — why this works"
                  value={draft.takeaway}
                  onChange={(e) => setDraft({ ...draft, takeaway: e.target.value })}
                />
                <div className="edit-actions">
                  <button onClick={saveDraft}>{editingId ? 'Save changes' : 'Add scenario'}</button>
                  <button className="ghost-btn" onClick={cancelDraft}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {items.length === 0 && <div className="empty-state">No scenarios in this category yet.</div>}

            <div className="qa-list">
              {items.map((s) => {
                const isExpanded = expandedIds.has(s.id);
                return (
                  <div className={`qa-card tech-card${isExpanded ? ' expanded' : ''}`} key={s.id}>
                    <div className="qa-question-row tech-card-header" onClick={() => toggleExpanded(s.id)}>
                      <div>
                        <div className="qa-question">{s.situation}</div>
                      </div>
                      <div className="tech-card-header-right">
                        {isAdmin && (
                          <div className="qa-actions" onClick={(e) => e.stopPropagation()}>
                            <button className="edit-icon" onClick={() => startEdit(s)} title="Edit">
                              ✎
                            </button>
                            <button className="del-btn" onClick={() => deleteScenario(s.id)} title="Delete">
                              ✕
                            </button>
                          </div>
                        )}
                        <span className="tech-chevron">{isExpanded ? '▾' : '▸'}</span>
                      </div>
                    </div>
                    {isExpanded && (
                      <>
                        <div className="dialogue-script">
                          {s.dialogue.map((d, i) => (
                            <div className="dialogue-line" key={i}>
                              <span className="dialogue-speaker">{d.speaker}:</span> {d.line}
                            </div>
                          ))}
                        </div>
                        <div className="qa-answer qa-right">
                          <span className="qa-tag">Why this works</span>
                          <span>{s.takeaway}</span>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
