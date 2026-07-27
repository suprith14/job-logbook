'use client';

export const DEFAULT_RESUME = {
  name: 'Your Name',
  title: 'Senior Frontend Developer',
  email: 'your.email@example.com',
  phone: '+91 90000 00000',
  location: 'Bengaluru, India',
  linkedin: 'linkedin.com/in/yourprofile',
  website: 'github.com/yourusername',
  summary:
    'Frontend developer with 5+ years building performant, accessible web applications using React and TypeScript. Experienced leading feature delivery end-to-end, from component architecture to production deployment, in fast-moving product teams.',
  skills: 'JavaScript, TypeScript, React, Next.js, Redux, HTML5, CSS3, REST APIs, GraphQL, Git, Jest, Webpack, Node.js, Agile/Scrum',
  experience: [
    {
      id: 'e1',
      company: 'Company Name',
      role: 'Senior Frontend Developer',
      location: 'Bengaluru, India',
      start: 'Jan 2022',
      end: 'Present',
      bullets:
        'Led migration of a legacy jQuery codebase to React, reducing page load time by 40%\nBuilt a reusable component library adopted across 6 product teams\nMentored 3 junior engineers through code review and pairing',
    },
    {
      id: 'e2',
      company: 'Previous Company',
      role: 'Frontend Developer',
      location: 'Bengaluru, India',
      start: 'Jun 2019',
      end: 'Dec 2021',
      bullets:
        'Implemented responsive UI features for a consumer-facing web app used by 2M+ monthly users\nImproved test coverage from 45% to 85% by introducing Jest and React Testing Library\nCollaborated with design and backend teams to ship features on a two-week sprint cycle',
    },
  ],
  education: [
    {
      id: 'd1',
      school: 'Your University',
      degree: 'B.Tech in Computer Science',
      start: '2015',
      end: '2019',
      details: '',
    },
  ],
  certifications: 'AWS Certified Cloud Practitioner\nMeta Front-End Developer Professional Certificate',
  projects: [],
};

function splitLines(text) {
  return (text || '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
}

function buildResumeText(resume) {
  const lines = [];
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

export default function ResumeBuilder({ resume, setResume, isAdmin, copyStatus, onCopy }) {
  function update(field, value) {
    setResume((prev) => ({ ...prev, [field]: value }));
  }

  function updateExperience(id, field, value) {
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

  function removeExperience(id) {
    setResume((prev) => ({ ...prev, experience: prev.experience.filter((e) => e.id !== id) }));
  }

  function updateEducation(id, field, value) {
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

  function removeEducation(id) {
    setResume((prev) => ({ ...prev, education: prev.education.filter((e) => e.id !== id) }));
  }

  function updateProject(id, field, value) {
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

  function removeProject(id) {
    setResume((prev) => ({ ...prev, projects: prev.projects.filter((p) => p.id !== id) }));
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
              {resume.experience.map((exp) => (
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
                  <button className="del-btn resume-remove" onClick={() => removeExperience(exp.id)}>✕ Remove</button>
                </div>
              ))}
            </div>
            <button className="ghost-btn resume-add-btn" onClick={addExperience}>+ Add experience</button>
          </div>

          <div className="cat-group">
            <div className="cat-title">Education</div>
            <div className="resume-entries">
              {resume.education.map((ed) => (
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
                  <button className="del-btn resume-remove" onClick={() => removeEducation(ed.id)}>✕ Remove</button>
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
              {resume.projects.map((p) => (
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
                  <button className="del-btn resume-remove" onClick={() => removeProject(p.id)}>✕ Remove</button>
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
