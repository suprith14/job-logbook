'use client';

import { Dispatch, SetStateAction, useState } from 'react';
import type { ResumeData } from '../types';

export const DEFAULT_RESUME: ResumeData = {
  name: 'Your Name',
  title: 'Senior Frontend Developer',
  email: 'your.email@example.com',
  phone: '+91 90000 00000',
  location: 'Bengaluru, India',
  linkedin: 'linkedin.com/in/yourprofile',
  website: 'github.com/yourusername',
  summary:
    'Frontend developer with 4 years of experience building performant, accessible web applications using React and TypeScript. Experienced leading feature delivery end-to-end, from component architecture to production deployment, in fast-moving product teams.',
  skills: 'JavaScript, TypeScript, React, Next.js, Redux, HTML5, CSS3, REST APIs, GraphQL, Git, Jest, Webpack, Node.js, Agile/Scrum',
  experience: [
    {
      id: 'e1',
      company: 'Company Name',
      role: 'Senior Frontend Developer',
      location: 'Bengaluru, India',
      start: 'Jan 2024',
      end: 'Present',
      bullets:
        'Led migration of a legacy jQuery codebase to React, reducing page load time by 40%\nBuilt a reusable component library adopted across 6 product teams\nMentored 3 junior engineers through code review and pairing',
    },
    {
      id: 'e2',
      company: 'Previous Company',
      role: 'Frontend Developer',
      location: 'Bengaluru, India',
      start: 'Jun 2022',
      end: 'Dec 2023',
      bullets:
        'Implemented responsive UI features for a consumer-facing web app used by 2M+ monthly users\nImproved test coverage from 45% to 85% by introducing Jest and React Testing Library\nCollaborated with design and backend teams to ship features on a two-week sprint cycle',
    },
  ],
  education: [
    {
      id: 'd1',
      school: 'Your University',
      degree: 'B.Tech in Computer Science',
      start: '2014',
      end: '2018',
      details: '',
    },
  ],
  certifications: 'AWS Certified Cloud Practitioner\nMeta Front-End Developer Professional Certificate',
  projects: [],
};

function splitLines(text: string): string[] {
  return (text || '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
}

function reorder<T extends { id: string }>(list: T[], id: string, dir: -1 | 1): T[] {
  const idx = list.findIndex((item) => item.id === id);
  const swapWith = idx + dir;
  if (idx === -1 || swapWith < 0 || swapWith >= list.length) return list;
  const next = [...list];
  [next[idx], next[swapWith]] = [next[swapWith], next[idx]];
  return next;
}

const ACTION_VERBS = [
  'led', 'built', 'developed', 'implemented', 'designed', 'improved', 'reduced', 'increased', 'created',
  'managed', 'launched', 'optimized', 'migrated', 'automated', 'mentored', 'collaborated', 'delivered',
  'architected', 'owned', 'drove', 'spearheaded', 'established', 'streamlined', 'engineered', 'refactored',
  'shipped', 'scaled', 'authored', 'introduced', 'resolved', 'accelerated', 'coordinated', 'executed',
  'directed', 'initiated', 'transformed', 'enhanced', 'decreased', 'achieved', 'partnered', 'wrote', 'redesigned',
];

const UNSAFE_CHAR_RE = /[^\x00-\x7F–—‘’“”]/;

interface ATSCheck {
  label: string;
  passed: boolean;
  hint: string;
}

interface ATSResult {
  score: number;
  rating: string;
  checks: ATSCheck[];
}

function scoreResume(resume: ResumeData): ATSResult {
  const checks: ATSCheck[] = [];
  const allBullets = (resume.experience || []).flatMap((e) => splitLines(e.bullets));

  const contactFilled =
    !!resume.email && resume.email !== DEFAULT_RESUME.email && !!resume.phone && resume.phone !== DEFAULT_RESUME.phone;
  checks.push({
    label: 'Contact details filled in',
    passed: contactFilled,
    hint: 'Replace the placeholder email and phone with your real ones — ATS systems parse these as structured fields.',
  });

  const summaryWords = (resume.summary || '').trim().split(/\s+/).filter(Boolean).length;
  checks.push({
    label: 'Summary is a focused 15–60 words',
    passed: summaryWords >= 15 && summaryWords <= 60,
    hint: 'Aim for 2–3 sentences — long enough to include keywords, short enough that it gets read.',
  });

  const skillCount = (resume.skills || '').split(',').map((s) => s.trim()).filter(Boolean).length;
  checks.push({
    label: 'At least 6 skills listed',
    passed: skillCount >= 6,
    hint: 'List the specific tools and technologies from the job description — ATS keyword matching runs on this section most heavily.',
  });

  checks.push({
    label: 'At least one work experience entry',
    passed: (resume.experience || []).length > 0,
    hint: 'Add at least one role — an empty experience section is an automatic reject in most ATS screens.',
  });

  const datesComplete = (resume.experience || []).every((e) => e.start.trim() && e.end.trim());
  checks.push({
    label: 'Every role has a start and end date',
    passed: (resume.experience || []).length === 0 ? false : datesComplete,
    hint: 'Missing dates are one of the most common reasons ATS parsers misfile work history into the wrong order.',
  });

  const verbCount = allBullets.filter((b) => {
    const first = (b.split(/\s+/)[0] || '').toLowerCase().replace(/[^a-z]/g, '');
    return ACTION_VERBS.includes(first);
  }).length;
  const verbRatio = allBullets.length ? verbCount / allBullets.length : 0;
  checks.push({
    label: 'Bullets start with an action verb',
    passed: allBullets.length > 0 && verbRatio >= 0.7,
    hint: 'Start each bullet with "Led", "Built", "Reduced", "Improved" etc. instead of "Responsible for" or "Worked on".',
  });

  const numberCount = allBullets.filter((b) => /\d/.test(b)).length;
  const numberRatio = allBullets.length ? numberCount / allBullets.length : 0;
  checks.push({
    label: 'Bullets include a measurable number',
    passed: allBullets.length > 0 && numberRatio >= 0.5,
    hint: 'Add a %, a count, or a time saved wherever you can — "reduced load time by 40%" beats "improved performance".',
  });

  checks.push({
    label: 'Bullet count is in a healthy range (4–15)',
    passed: allBullets.length >= 4 && allBullets.length <= 15,
    hint: allBullets.length < 4 ? 'Add more detail to your experience bullets.' : 'Trim to your strongest bullets — too many buries the important ones.',
  });

  const allText = [
    resume.name, resume.title, resume.summary, resume.skills, resume.certifications,
    ...(resume.experience || []).flatMap((e) => [e.company, e.role, e.location, e.bullets]),
    ...(resume.education || []).flatMap((e) => [e.school, e.degree, e.details]),
    ...(resume.projects || []).flatMap((p) => [p.name, p.description]),
  ].join(' ');
  checks.push({
    label: 'No special characters or symbols that can break parsing',
    passed: !UNSAFE_CHAR_RE.test(allText),
    hint: 'Avoid emoji, bullet glyphs, or decorative symbols typed into the text fields — stick to plain characters and standard punctuation.',
  });

  const passedCount = checks.filter((c) => c.passed).length;
  const score = Math.round((passedCount / checks.length) * 100);
  let rating = 'Needs work';
  if (score >= 90) rating = 'Excellent';
  else if (score >= 75) rating = 'Good';
  else if (score >= 55) rating = 'Fair';

  return { score, rating, checks };
}

function buildResumeText(resume: ResumeData): string {
  const lines: string[] = [];
  lines.push(resume.name);
  lines.push(resume.title);
  const contact = [resume.location, resume.phone, resume.email, resume.linkedin, resume.website].filter(Boolean);
  lines.push(contact.join(' | '));
  lines.push('');

  if (resume.summary) {
    lines.push('PROFESSIONAL SUMMARY');
    lines.push(resume.summary);
    lines.push('');
  }

  if (resume.skills) {
    lines.push('SKILLS');
    lines.push(
      resume.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .join(', ')
    );
    lines.push('');
  }

  if (resume.experience && resume.experience.length > 0) {
    lines.push('EXPERIENCE');
    resume.experience.forEach((exp) => {
      lines.push(`${exp.role} — ${exp.company}${exp.location ? ' | ' + exp.location : ''}`);
      lines.push(`${exp.start} – ${exp.end}`);
      splitLines(exp.bullets).forEach((b) => lines.push(`- ${b}`));
      lines.push('');
    });
  }

  if (resume.education && resume.education.length > 0) {
    lines.push('EDUCATION');
    resume.education.forEach((ed) => {
      lines.push(`${ed.degree} — ${ed.school}`);
      lines.push(`${ed.start} – ${ed.end}`);
      if (ed.details) lines.push(ed.details);
      lines.push('');
    });
  }

  if (resume.certifications) {
    lines.push('CERTIFICATIONS');
    splitLines(resume.certifications).forEach((c) => lines.push(`- ${c}`));
    lines.push('');
  }

  if (resume.projects && resume.projects.length > 0) {
    lines.push('PROJECTS');
    resume.projects.forEach((p) => {
      lines.push(`${p.name}${p.link ? ' | ' + p.link : ''}`);
      if (p.description) lines.push(p.description);
      lines.push('');
    });
  }

  return lines.join('\n').trim() + '\n';
}

interface TailorResult {
  missingKeywords: string[];
  matchingStrengths: string[];
  suggestions: string;
}

interface ResumeBuilderProps {
  resume: ResumeData;
  setResume: Dispatch<SetStateAction<ResumeData>>;
  isAdmin: boolean;
}

export default function ResumeBuilder({ resume, setResume, isAdmin }: ResumeBuilderProps) {
  const ats = scoreResume(resume);
  const [copyStatus, setCopyStatus] = useState('idle');

  const [showExportImport, setShowExportImport] = useState(false);
  const [resumeJsonText, setResumeJsonText] = useState('');
  const [importError, setImportError] = useState('');
  const [copiedResumeJson, setCopiedResumeJson] = useState(false);

  const [jobDescription, setJobDescription] = useState('');
  const [tailoring, setTailoring] = useState(false);
  const [tailorError, setTailorError] = useState('');
  const [tailorResult, setTailorResult] = useState<TailorResult | null>(null);

  const [improvingId, setImprovingId] = useState<string | null>(null);
  const [improveErrorId, setImproveErrorId] = useState<string | null>(null);
  const [improveError, setImproveError] = useState('');
  const [improvedBullets, setImprovedBullets] = useState<Record<string, string[]>>({});

  async function onCopy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      return;
    }
    setCopyStatus('copied');
    setTimeout(() => setCopyStatus('idle'), 1500);
  }

  function exportResumeJson() {
    if (!isAdmin) return;
    setResumeJsonText(JSON.stringify(resume, null, 2));
    setImportError('');
    setShowExportImport(true);
  }

  async function copyResumeJson() {
    try {
      await navigator.clipboard.writeText(resumeJsonText);
    } catch (err) {
      return;
    }
    setCopiedResumeJson(true);
    setTimeout(() => setCopiedResumeJson(false), 1500);
  }

  function importResumeJson() {
    if (!isAdmin) return;
    let parsed: unknown;
    try {
      parsed = JSON.parse(resumeJsonText);
    } catch (err) {
      setImportError('Invalid JSON — check for a missing comma or bracket.');
      return;
    }
    const p = parsed as Partial<ResumeData>;
    if (!p || typeof p !== 'object' || typeof p.name !== 'string' || !Array.isArray(p.experience)) {
      setImportError("That doesn't look like valid resume JSON — check the shape and try again.");
      return;
    }
    setResume({ ...DEFAULT_RESUME, ...p });
    setImportError('');
  }

  async function tailorToJob() {
    if (!isAdmin || !jobDescription.trim()) return;
    setTailoring(true);
    setTailorError('');
    setTailorResult(null);
    try {
      const allBullets = resume.experience.flatMap((e) => splitLines(e.bullets)).join('\n');
      const res = await fetch('/api/resume-tailor-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription, skills: resume.skills, bullets: allBullets, summary: resume.summary }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setTailorError(data.error || 'Something went wrong. Try again.');
        return;
      }
      setTailorResult(data);
    } catch (err) {
      setTailorError('Network error — try again.');
    } finally {
      setTailoring(false);
    }
  }

  async function improveBullets(exp: ResumeData['experience'][number]) {
    if (!isAdmin) return;
    const bulletLines = splitLines(exp.bullets);
    if (bulletLines.length === 0) return;
    setImprovingId(exp.id);
    setImproveErrorId(null);
    setImproveError('');
    try {
      const res = await fetch('/api/resume-bullet-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bullets: bulletLines.join('\n'), role: exp.role, company: exp.company }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setImproveErrorId(exp.id);
        setImproveError(data.error || 'Something went wrong. Try again.');
        return;
      }
      setImprovedBullets((prev) => ({ ...prev, [exp.id]: data.bullets || [] }));
    } catch (err) {
      setImproveErrorId(exp.id);
      setImproveError('Network error — try again.');
    } finally {
      setImprovingId(null);
    }
  }

  function applyImprovedBullets(id: string) {
    const improved = improvedBullets[id];
    if (!improved) return;
    updateExperience(id, 'bullets', improved.join('\n'));
    setImprovedBullets((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  function discardImprovedBullets(id: string) {
    setImprovedBullets((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  function update<K extends keyof ResumeData>(field: K, value: ResumeData[K]) {
    setResume((prev) => ({ ...prev, [field]: value }));
  }

  function updateExperience(id: string, field: string, value: string) {
    setResume((prev) => ({
      ...prev,
      experience: prev.experience.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    }));
  }

  function addExperience() {
    setResume((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        { id: `e${Date.now()}${Math.random()}`, company: '', role: '', location: '', start: '', end: '', bullets: '' },
      ],
    }));
  }

  function removeExperience(id: string) {
    setResume((prev) => ({ ...prev, experience: prev.experience.filter((e) => e.id !== id) }));
  }

  function moveExperience(id: string, dir: -1 | 1) {
    setResume((prev) => ({ ...prev, experience: reorder(prev.experience, id, dir) }));
  }

  function updateEducation(id: string, field: string, value: string) {
    setResume((prev) => ({
      ...prev,
      education: prev.education.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    }));
  }

  function addEducation() {
    setResume((prev) => ({
      ...prev,
      education: [...prev.education, { id: `d${Date.now()}${Math.random()}`, school: '', degree: '', start: '', end: '', details: '' }],
    }));
  }

  function removeEducation(id: string) {
    setResume((prev) => ({ ...prev, education: prev.education.filter((e) => e.id !== id) }));
  }

  function moveEducation(id: string, dir: -1 | 1) {
    setResume((prev) => ({ ...prev, education: reorder(prev.education, id, dir) }));
  }

  function updateProject(id: string, field: string, value: string) {
    setResume((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    }));
  }

  function addProject() {
    setResume((prev) => ({
      ...prev,
      projects: [...prev.projects, { id: `p${Date.now()}${Math.random()}`, name: '', description: '', link: '' }],
    }));
  }

  function removeProject(id: string) {
    setResume((prev) => ({ ...prev, projects: prev.projects.filter((p) => p.id !== id) }));
  }

  function moveProject(id: string, dir: -1 | 1) {
    setResume((prev) => ({ ...prev, projects: reorder(prev.projects, id, dir) }));
  }

  function handlePrint() {
    window.print();
  }

  const contactLine = [resume.location, resume.phone, resume.email, resume.linkedin, resume.website]
    .filter(Boolean)
    .join('  |  ');

  return (
    <div className="panel active">
      <p className="guide-intro">
        Kept to a single column, standard headings and plain bullets on purpose — the layout most ATS parsers read
        correctly. Fill in the fields, then copy the text or print straight to PDF below.
      </p>

      {isAdmin && (
        <div className="bulk-section">
          <div className="bulk-section-toggles">
            <button className="bulk-toggle" onClick={() => setShowExportImport((v) => !v)}>
              {showExportImport ? '▾' : '▸'} Export / import resume (JSON)
            </button>
            <button className="ghost-btn" onClick={exportResumeJson}>
              ⬇ Export resume
            </button>
          </div>
          {showExportImport && (
            <div className="bulk-panel">
              <div className="bulk-hint">
                Export fills this box with the whole resume as JSON — copy it out to review or polish with an AI
                assistant, then paste the edited JSON back here and import to apply the changes.
              </div>
              <textarea
                className="bulk-textarea mono-textarea"
                rows={10}
                placeholder="Click Export above, or paste resume JSON here to import"
                value={resumeJsonText}
                onChange={(e) => setResumeJsonText(e.target.value)}
                spellCheck={false}
              />
              <div className="bulk-actions">
                <button onClick={importResumeJson} disabled={!resumeJsonText.trim()}>
                  Import
                </button>
                <button className="ghost-btn" onClick={copyResumeJson} disabled={!resumeJsonText.trim()}>
                  {copiedResumeJson ? '✓ Copied' : '📋 Copy'}
                </button>
                {importError && <span className="bulk-result" style={{ color: 'var(--rose)' }}>{importError}</span>}
              </div>
            </div>
          )}
        </div>
      )}

      <div className={`ats-score-card ats-${ats.rating.toLowerCase().replace(/\s+/g, '-')}`}>
        <div className="ats-score-top">
          <div className="ats-score-number">{ats.score}<span>/100</span></div>
          <div>
            <div className="ats-score-rating">{ats.rating} ATS compatibility</div>
            <div className="ats-score-sub">Based on {ats.checks.length} structural and content checks below.</div>
          </div>
        </div>
        <ul className="ats-checklist">
          {ats.checks.map((c) => (
            <li key={c.label} className={c.passed ? 'pass' : 'fail'}>
              <span className="ats-check-mark">{c.passed ? '✓' : '✗'}</span>
              <div>
                <div className="ats-check-label">{c.label}</div>
                {!c.passed && <div className="ats-check-hint">{c.hint}</div>}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {isAdmin && (
        <div className="add-form qa-form" style={{ marginBottom: 24 }}>
          <div className="cat-title">✦ Tailor to a job description</div>
          <textarea
            className="qa-textarea"
            rows={4}
            placeholder="Paste the target job description here"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
          <button className="add-concept-btn" onClick={tailorToJob} disabled={tailoring || !jobDescription.trim()}>
            {tailoring ? 'Analyzing…' : '✦ Analyze against my resume'}
          </button>

          {tailorError && <div className="discover-error">{tailorError}</div>}

          {tailorResult && (
            <div className="suggestions-panel">
              <div className="cat-title">Gap analysis — advisory only, nothing changes automatically</div>
              {tailorResult.missingKeywords.length > 0 && (
                <>
                  <div className="qa-tag" style={{ marginBottom: 6 }}>Missing keywords from the JD</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                    {tailorResult.missingKeywords.map((k) => (
                      <span key={k} className="qa-category-tag">
                        {k}
                      </span>
                    ))}
                  </div>
                </>
              )}
              {tailorResult.matchingStrengths.length > 0 && (
                <div className="qa-answer qa-right" style={{ marginBottom: 10 }}>
                  <span className="qa-tag">Already aligns well</span>
                  <ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>
                    {tailorResult.matchingStrengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
              {tailorResult.suggestions && (
                <div className="qa-answer qa-wrong">
                  <span className="qa-tag">Suggestions</span>
                  <span>{tailorResult.suggestions}</span>
                </div>
              )}
              <div className="edit-actions">
                <button className="ghost-btn" onClick={() => setTailorResult(null)}>
                  Dismiss
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {isAdmin && (
        <div className="resume-editor">
          <div className="cat-group">
            <div className="cat-title">Header</div>
            <div className="resume-field-grid">
              <input type="text" placeholder="Full name" value={resume.name} onChange={(e) => update('name', e.target.value)} />
              <input type="text" placeholder="Title / headline" value={resume.title} onChange={(e) => update('title', e.target.value)} />
              <input type="text" placeholder="Location" value={resume.location} onChange={(e) => update('location', e.target.value)} />
              <input type="text" placeholder="Phone" value={resume.phone} onChange={(e) => update('phone', e.target.value)} />
              <input type="text" placeholder="Email" value={resume.email} onChange={(e) => update('email', e.target.value)} />
              <input type="text" placeholder="LinkedIn URL" value={resume.linkedin} onChange={(e) => update('linkedin', e.target.value)} />
              <input type="text" placeholder="Website / GitHub" value={resume.website} onChange={(e) => update('website', e.target.value)} />
            </div>
          </div>

          <div className="cat-group">
            <div className="cat-title">Professional summary</div>
            <textarea
              className="qa-textarea"
              rows={3}
              value={resume.summary}
              onChange={(e) => update('summary', e.target.value)}
              placeholder="2-3 sentence summary of your experience and strengths"
            />
          </div>

          <div className="cat-group">
            <div className="cat-title">Skills (comma-separated)</div>
            <textarea
              className="qa-textarea"
              rows={2}
              value={resume.skills}
              onChange={(e) => update('skills', e.target.value)}
              placeholder="React, TypeScript, Node.js, …"
            />
          </div>

          <div className="cat-group">
            <div className="cat-title">Experience</div>
            <div className="resume-entries">
              {resume.experience.map((exp, i) => (
                <div className="resume-entry" key={exp.id}>
                  <div className="resume-field-grid">
                    <input type="text" placeholder="Company" value={exp.company} onChange={(e) => updateExperience(exp.id, 'company', e.target.value)} />
                    <input type="text" placeholder="Role / title" value={exp.role} onChange={(e) => updateExperience(exp.id, 'role', e.target.value)} />
                    <input type="text" placeholder="Location" value={exp.location} onChange={(e) => updateExperience(exp.id, 'location', e.target.value)} />
                    <input type="text" placeholder="Start (e.g. Jan 2022)" value={exp.start} onChange={(e) => updateExperience(exp.id, 'start', e.target.value)} />
                    <input type="text" placeholder="End (e.g. Present)" value={exp.end} onChange={(e) => updateExperience(exp.id, 'end', e.target.value)} />
                  </div>
                  <textarea
                    className="qa-textarea"
                    rows={3}
                    placeholder="One achievement per line — start with an action verb, include a number where you can"
                    value={exp.bullets}
                    onChange={(e) => updateExperience(exp.id, 'bullets', e.target.value)}
                  />

                  {improveErrorId === exp.id && improveError && (
                    <div className="discover-error">{improveError}</div>
                  )}

                  {improvedBullets[exp.id] ? (
                    <div className="suggestions-panel">
                      <div className="cat-title">Suggested rewrite — review before applying</div>
                      <ul style={{ margin: '4px 0 10px', paddingLeft: 18 }}>
                        {improvedBullets[exp.id].map((b, bi) => (
                          <li key={bi} style={{ marginBottom: 4 }}>{b}</li>
                        ))}
                      </ul>
                      <div className="edit-actions">
                        <button onClick={() => applyImprovedBullets(exp.id)}>Apply</button>
                        <button className="ghost-btn" onClick={() => discardImprovedBullets(exp.id)}>
                          Discard
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      className="ghost-btn resume-add-btn"
                      onClick={() => improveBullets(exp)}
                      disabled={improvingId === exp.id || splitLines(exp.bullets).length === 0}
                    >
                      {improvingId === exp.id ? 'Improving…' : '✦ Improve these bullets'}
                    </button>
                  )}

                  <div className="flow-step-actions">
                    <button className="ghost-btn" onClick={() => moveExperience(exp.id, -1)} disabled={i === 0}>
                      ↑ Move up
                    </button>
                    <button
                      className="ghost-btn"
                      onClick={() => moveExperience(exp.id, 1)}
                      disabled={i === resume.experience.length - 1}
                    >
                      ↓ Move down
                    </button>
                    <button className="del-btn resume-remove" onClick={() => removeExperience(exp.id)}>
                      ✕ Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button className="ghost-btn resume-add-btn" onClick={addExperience}>+ Add experience</button>
          </div>

          <div className="cat-group">
            <div className="cat-title">Education</div>
            <div className="resume-entries">
              {resume.education.map((ed, i) => (
                <div className="resume-entry" key={ed.id}>
                  <div className="resume-field-grid">
                    <input type="text" placeholder="School" value={ed.school} onChange={(e) => updateEducation(ed.id, 'school', e.target.value)} />
                    <input type="text" placeholder="Degree" value={ed.degree} onChange={(e) => updateEducation(ed.id, 'degree', e.target.value)} />
                    <input type="text" placeholder="Start year" value={ed.start} onChange={(e) => updateEducation(ed.id, 'start', e.target.value)} />
                    <input type="text" placeholder="End year" value={ed.end} onChange={(e) => updateEducation(ed.id, 'end', e.target.value)} />
                  </div>
                  <input
                    type="text"
                    placeholder="Details (optional — honors, GPA, coursework)"
                    value={ed.details}
                    onChange={(e) => updateEducation(ed.id, 'details', e.target.value)}
                  />
                  <div className="flow-step-actions">
                    <button className="ghost-btn" onClick={() => moveEducation(ed.id, -1)} disabled={i === 0}>
                      ↑ Move up
                    </button>
                    <button
                      className="ghost-btn"
                      onClick={() => moveEducation(ed.id, 1)}
                      disabled={i === resume.education.length - 1}
                    >
                      ↓ Move down
                    </button>
                    <button className="del-btn resume-remove" onClick={() => removeEducation(ed.id)}>
                      ✕ Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button className="ghost-btn resume-add-btn" onClick={addEducation}>+ Add education</button>
          </div>

          <div className="cat-group">
            <div className="cat-title">Certifications (one per line, optional)</div>
            <textarea
              className="qa-textarea"
              rows={2}
              value={resume.certifications}
              onChange={(e) => update('certifications', e.target.value)}
              placeholder="AWS Certified Cloud Practitioner"
            />
          </div>

          <div className="cat-group">
            <div className="cat-title">Projects (optional)</div>
            <div className="resume-entries">
              {resume.projects.map((p, i) => (
                <div className="resume-entry" key={p.id}>
                  <div className="resume-field-grid">
                    <input type="text" placeholder="Project name" value={p.name} onChange={(e) => updateProject(p.id, 'name', e.target.value)} />
                    <input type="text" placeholder="Link (optional)" value={p.link} onChange={(e) => updateProject(p.id, 'link', e.target.value)} />
                  </div>
                  <textarea
                    className="qa-textarea"
                    rows={2}
                    placeholder="One or two lines on what it does and your role"
                    value={p.description}
                    onChange={(e) => updateProject(p.id, 'description', e.target.value)}
                  />
                  <div className="flow-step-actions">
                    <button className="ghost-btn" onClick={() => moveProject(p.id, -1)} disabled={i === 0}>
                      ↑ Move up
                    </button>
                    <button
                      className="ghost-btn"
                      onClick={() => moveProject(p.id, 1)}
                      disabled={i === resume.projects.length - 1}
                    >
                      ↓ Move down
                    </button>
                    <button className="del-btn resume-remove" onClick={() => removeProject(p.id)}>
                      ✕ Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button className="ghost-btn resume-add-btn" onClick={addProject}>+ Add project</button>
          </div>
        </div>
      )}

      <div className="resume-actions no-print">
        <button className="copy-btn" onClick={() => onCopy(buildResumeText(resume))}>
          {copyStatus === 'copied' ? '✓ Copied' : 'Copy resume text'}
        </button>
        <button className="copy-btn" onClick={handlePrint}>Print / Save as PDF</button>
      </div>

      <div className="cat-title">Preview — this is what prints</div>
      <div className="resume-preview" id="resume-print-area">
        <div className="r-name">{resume.name}</div>
        <div className="r-title">{resume.title}</div>
        <div className="r-contact">{contactLine}</div>

        {resume.summary && (
          <div className="r-section">
            <div className="r-heading">Professional Summary</div>
            <p className="r-summary">{resume.summary}</p>
          </div>
        )}

        {resume.skills && (
          <div className="r-section">
            <div className="r-heading">Skills</div>
            <p className="r-skills">
              {resume.skills
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean)
                .join(', ')}
            </p>
          </div>
        )}

        {resume.experience.length > 0 && (
          <div className="r-section">
            <div className="r-heading">Experience</div>
            {resume.experience.map((exp) => (
              <div className="r-entry" key={exp.id}>
                <div className="r-entry-top">
                  <span className="r-entry-title">{exp.role}{exp.company ? ` — ${exp.company}` : ''}</span>
                  <span className="r-entry-dates">{exp.start} – {exp.end}</span>
                </div>
                {exp.location && <div className="r-entry-sub">{exp.location}</div>}
                <ul className="r-bullets">
                  {splitLines(exp.bullets).map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {resume.education.length > 0 && (
          <div className="r-section">
            <div className="r-heading">Education</div>
            {resume.education.map((ed) => (
              <div className="r-entry" key={ed.id}>
                <div className="r-entry-top">
                  <span className="r-entry-title">{ed.degree}{ed.school ? ` — ${ed.school}` : ''}</span>
                  <span className="r-entry-dates">{ed.start} – {ed.end}</span>
                </div>
                {ed.details && <div className="r-entry-sub">{ed.details}</div>}
              </div>
            ))}
          </div>
        )}

        {resume.certifications && (
          <div className="r-section">
            <div className="r-heading">Certifications</div>
            <ul className="r-bullets">
              {splitLines(resume.certifications).map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        )}

        {resume.projects.length > 0 && (
          <div className="r-section">
            <div className="r-heading">Projects</div>
            {resume.projects.map((p) => (
              <div className="r-entry" key={p.id}>
                <div className="r-entry-top">
                  <span className="r-entry-title">{p.name}</span>
                </div>
                {p.link && <div className="r-entry-sub">{p.link}</div>}
                {p.description && <p className="r-summary">{p.description}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
