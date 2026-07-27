'use client';

export const DEFAULT_COVER_LETTER = {
  yourName: 'Your Name',
  yourEmail: 'your.email@example.com',
  yourPhone: '+91 90000 00000',
  company: 'Company Name',
  role: 'Senior Frontend Developer',
  hiringManager: 'Hiring Manager',
  opening:
    "I'm writing to apply for the Senior Frontend Developer role at Company Name. Having followed the company's product for a while, I'm particularly drawn to the challenge of building fast, accessible interfaces at your scale, and I believe my four years of frontend experience are a strong match for what this role needs.",
  achievements: [
    {
      id: 'a1',
      company: 'Company Name',
      detail: 'Led the migration of a legacy jQuery codebase to React, cutting page load time by 40% and building a component library now used across six product teams.',
    },
    {
      id: 'a2',
      company: 'Previous Company',
      detail: 'Shipped responsive UI features for a product used by over two million monthly users, while raising test coverage from 45% to 85%.',
    },
  ],
  closing:
    "I'd welcome the opportunity to discuss how I can contribute to your team. Thank you for your time and consideration — I look forward to hearing from you.",
};

const STRUCTURE_TIPS = [
  {
    title: '1. Opening hook',
    detail:
      'Name the exact role and one specific, non-generic reason you want this company — not "I am excited to apply." Mention a referral or a product of theirs you actually use, if true.',
  },
  {
    title: '2. Value proof',
    detail:
      'List one or two concrete achievements per company you\'ve worked at that map directly to what the job asks for. Use numbers. Do not just repeat your resume word for word.',
  },
  {
    title: '3. Company fit',
    detail:
      'One line connecting your interest to something specific about the company — their product, engineering culture, or mission. This is what proves you did not mass-send this letter.',
  },
  {
    title: '4. Call to action',
    detail:
      'Thank them, restate interest briefly, invite next steps. Keep it to a sentence or two — do not re-summarize the whole letter.',
  },
];

function buildCoverLetterText(cl) {
  const lines = [];
  lines.push(cl.yourName);
  lines.push([cl.yourEmail, cl.yourPhone].filter(Boolean).join(' | '));
  lines.push('');
  lines.push(`Dear ${cl.hiringManager || 'Hiring Manager'},`);
  lines.push('');
  if (cl.opening) lines.push(cl.opening);
  lines.push('');
  const achievements = (cl.achievements || []).filter((a) => a.detail && a.detail.trim());
  achievements.forEach((a) => {
    lines.push(`- At ${a.company || 'this role'}: ${a.detail}`);
  });
  if (achievements.length > 0) lines.push('');
  if (cl.closing) lines.push(cl.closing);
  lines.push('');
  lines.push('Sincerely,');
  lines.push(cl.yourName);
  return lines.join('\n').trim() + '\n';
}

export default function CoverLetterBuilder({ coverLetter, setCoverLetter, isAdmin, copyStatus, onCopy }) {
  function update(field, value) {
    setCoverLetter((prev) => ({ ...prev, [field]: value }));
  }

  function updateAchievement(id, field, value) {
    setCoverLetter((prev) => ({
      ...prev,
      achievements: prev.achievements.map((a) => (a.id === id ? { ...a, [field]: value } : a)),
    }));
  }

  function addAchievement() {
    setCoverLetter((prev) => ({
      ...prev,
      achievements: [...prev.achievements, { id: `a${Date.now()}${Math.random()}`, company: '', detail: '' }],
    }));
  }

  function removeAchievement(id) {
    setCoverLetter((prev) => ({ ...prev, achievements: prev.achievements.filter((a) => a.id !== id) }));
  }

  function handlePrint() {
    window.print();
  }

  const achievements = (coverLetter.achievements || []).filter((a) => a.detail && a.detail.trim());

  return (
    <div className="panel active">
      <p className="guide-intro">
        A short, tailored cover letter never hurts and occasionally matters — mainly for smaller companies, referrals,
        or when you want to explain something the resume can't. The four-part structure below is the reusable part;
        the example text is there so you can see it filled in before you write your own.
      </p>

      <div className="cat-group">
        <div className="cat-title">How this is structured</div>
        <div className="guide-list">
          {STRUCTURE_TIPS.map((t) => (
            <div className="guide-item" key={t.title}>
              <div className="guide-item-title">{t.title}</div>
              <div className="guide-item-detail">{t.detail}</div>
            </div>
          ))}
        </div>
      </div>

      {isAdmin && (
        <div className="resume-editor">
          <div className="cat-group">
            <div className="cat-title">Your details</div>
            <div className="resume-field-grid">
              <input type="text" placeholder="Your name" value={coverLetter.yourName} onChange={(e) => update('yourName', e.target.value)} />
              <input type="text" placeholder="Your email" value={coverLetter.yourEmail} onChange={(e) => update('yourEmail', e.target.value)} />
              <input type="text" placeholder="Your phone" value={coverLetter.yourPhone} onChange={(e) => update('yourPhone', e.target.value)} />
            </div>
          </div>

          <div className="cat-group">
            <div className="cat-title">This application</div>
            <div className="resume-field-grid">
              <input type="text" placeholder="Company name" value={coverLetter.company} onChange={(e) => update('company', e.target.value)} />
              <input type="text" placeholder="Role title" value={coverLetter.role} onChange={(e) => update('role', e.target.value)} />
              <input
                type="text"
                placeholder="Hiring manager (or “Hiring Manager”)"
                value={coverLetter.hiringManager}
                onChange={(e) => update('hiringManager', e.target.value)}
              />
            </div>
          </div>

          <div className="cat-group">
            <div className="cat-title">Opening hook</div>
            <textarea
              className="qa-textarea"
              rows={3}
              value={coverLetter.opening}
              onChange={(e) => update('opening', e.target.value)}
              placeholder="Name the role and one specific, real reason you want this company"
            />
          </div>

          <div className="cat-group">
            <div className="cat-title">Value proof — projects/achievements, one per company</div>
            <div className="resume-entries">
              {coverLetter.achievements.map((a) => (
                <div className="resume-entry" key={a.id}>
                  <input
                    type="text"
                    placeholder="Company (e.g. Company Name)"
                    value={a.company}
                    onChange={(e) => updateAchievement(a.id, 'company', e.target.value)}
                  />
                  <textarea
                    className="qa-textarea"
                    rows={2}
                    placeholder="One concrete, numbered achievement or project from this company"
                    value={a.detail}
                    onChange={(e) => updateAchievement(a.id, 'detail', e.target.value)}
                  />
                  <button className="del-btn resume-remove" onClick={() => removeAchievement(a.id)}>✕ Remove</button>
                </div>
              ))}
            </div>
            <button className="ghost-btn resume-add-btn" onClick={addAchievement}>+ Add achievement</button>
          </div>

          <div className="cat-group">
            <div className="cat-title">Call to action</div>
            <textarea
              className="qa-textarea"
              rows={2}
              value={coverLetter.closing}
              onChange={(e) => update('closing', e.target.value)}
              placeholder="Thank them, restate interest, invite next steps"
            />
          </div>
        </div>
      )}

      <div className="resume-actions no-print">
        <button className="copy-btn" onClick={() => onCopy(buildCoverLetterText(coverLetter))}>
          {copyStatus === 'copied' ? '✓ Copied' : 'Copy letter text'}
        </button>
        <button className="copy-btn" onClick={handlePrint}>Print / Save as PDF</button>
      </div>

      <div className="cat-title">Preview — this is what prints</div>
      <div className="resume-preview" id="cover-letter-print-area">
        <p className="cl-sender">{coverLetter.yourName}</p>
        <p className="cl-sender-sub">{[coverLetter.yourEmail, coverLetter.yourPhone].filter(Boolean).join('  |  ')}</p>
        <p className="cl-greeting">Dear {coverLetter.hiringManager || 'Hiring Manager'},</p>
        {coverLetter.opening && <p className="cl-para">{coverLetter.opening}</p>}
        {achievements.length > 0 && (
          <ul className="cl-achievements">
            {achievements.map((a) => (
              <li key={a.id}>
                <b>{a.company ? `At ${a.company}: ` : ''}</b>
                {a.detail}
              </li>
            ))}
          </ul>
        )}
        {coverLetter.closing && <p className="cl-para">{coverLetter.closing}</p>}
        <p className="cl-para">Sincerely,<br />{coverLetter.yourName}</p>
      </div>
    </div>
  );
}
