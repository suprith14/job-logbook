'use client';

import { Dispatch, SetStateAction, useState } from 'react';
import type { CompanyTier, PrepQuestion, PrepQuestionCategory, PrepSet } from '../types';

export const COMPANY_TIERS: CompanyTier[] = [
  'FAANG / Tier-1',
  'Product-based Tier-2',
  'Service-based / IT-services',
  'Startup',
];

const TIER_HINT: Record<CompanyTier, string> = {
  'FAANG / Tier-1': 'Deep JS/React internals, performance, and system design rounds — high bar, multiple rounds.',
  'Product-based Tier-2': 'Solid practical depth plus one architecture/system-design round — mid-to-high bar.',
  'Service-based / IT-services': 'Broader but shallower coverage, more process/communication weight, less system design depth.',
  'Startup': 'Hands-on, ownership-focused, fewer formal rounds, heavier weight on what you\'ve actually shipped.',
};

const CATEGORIES: PrepQuestionCategory[] = ['Technical', 'System Design', 'Behavioral', 'Coding/DSA'];

// A cross-section of well-known real companies per tier, for "🎲 Surprise me" — picks one
// at random so you don't have to think of a company name (or a tier) yourself.
const RANDOM_COMPANIES: { name: string; tier: CompanyTier }[] = [
  { name: 'Google', tier: 'FAANG / Tier-1' },
  { name: 'Amazon', tier: 'FAANG / Tier-1' },
  { name: 'Meta', tier: 'FAANG / Tier-1' },
  { name: 'Microsoft', tier: 'FAANG / Tier-1' },
  { name: 'Netflix', tier: 'FAANG / Tier-1' },
  { name: 'Apple', tier: 'FAANG / Tier-1' },
  { name: 'Atlassian', tier: 'Product-based Tier-2' },
  { name: 'Adobe', tier: 'Product-based Tier-2' },
  { name: 'Razorpay', tier: 'Product-based Tier-2' },
  { name: 'Flipkart', tier: 'Product-based Tier-2' },
  { name: 'Swiggy', tier: 'Product-based Tier-2' },
  { name: 'Zoho', tier: 'Product-based Tier-2' },
  { name: 'Salesforce', tier: 'Product-based Tier-2' },
  { name: 'TCS', tier: 'Service-based / IT-services' },
  { name: 'Infosys', tier: 'Service-based / IT-services' },
  { name: 'Wipro', tier: 'Service-based / IT-services' },
  { name: 'Accenture', tier: 'Service-based / IT-services' },
  { name: 'Cognizant', tier: 'Service-based / IT-services' },
  { name: 'a seed-stage startup', tier: 'Startup' },
  { name: 'a Series B funded startup', tier: 'Startup' },
  { name: 'a fast-growing YC-backed startup', tier: 'Startup' },
];

interface CompanyPrepProps {
  prepSets: PrepSet[];
  setPrepSets: Dispatch<SetStateAction<PrepSet[]>>;
  isAdmin: boolean;
}

export default function CompanyPrep({ prepSets, setPrepSets, isAdmin }: CompanyPrepProps) {
  const [company, setCompany] = useState('');
  const [tier, setTier] = useState<CompanyTier>(COMPANY_TIERS[0]);
  const [years, setYears] = useState(6);
  const [categories, setCategories] = useState<Set<PrepQuestionCategory>>(new Set(CATEGORIES));
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState('');
  const [generatedQuestions, setGeneratedQuestions] = useState<PrepQuestion[] | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  function toggleCategory(c: PrepQuestionCategory) {
    setCategories((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });
  }

  function toggleExpanded(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function runGenerate(companyValue: string, tierValue: CompanyTier, categoriesValue: PrepQuestionCategory[]) {
    if (!isAdmin || categoriesValue.length === 0) return;
    setGenerating(true);
    setGenerateError('');
    setGeneratedQuestions(null);
    try {
      const res = await fetch('/api/prep-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company: companyValue, tier: tierValue, years, categories: categoriesValue }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setGenerateError(data.error || 'Something went wrong. Try again.');
        return;
      }
      const questions: PrepQuestion[] = (data.questions || []).map((q: PrepQuestion) => ({
        id: `pq${Date.now()}${Math.random()}`,
        category: q.category,
        question: q.question,
        guidance: q.guidance,
      }));
      setGeneratedQuestions(questions);
    } catch (err) {
      setGenerateError('Network error — try again.');
    } finally {
      setGenerating(false);
    }
  }

  function generate() {
    runGenerate(company.trim(), tier, Array.from(categories));
  }

  function surpriseMe() {
    if (!isAdmin) return;
    const pick = RANDOM_COMPANIES[Math.floor(Math.random() * RANDOM_COMPANIES.length)];
    setCompany(pick.name);
    setTier(pick.tier);
    const activeCategories = categories.size > 0 ? Array.from(categories) : CATEGORIES;
    if (categories.size === 0) setCategories(new Set(CATEGORIES));
    runGenerate(pick.name, pick.tier, activeCategories);
  }

  function saveGenerated() {
    if (!generatedQuestions || !isAdmin) return;
    setPrepSets((prev) => [
      {
        id: `set${Date.now()}${Math.random()}`,
        company: company.trim() || tier,
        tier,
        years,
        questions: generatedQuestions,
      },
      ...prev,
    ]);
    setGeneratedQuestions(null);
    setCompany('');
  }

  function discardGenerated() {
    setGeneratedQuestions(null);
    setGenerateError('');
  }

  function deleteSet(id: string) {
    if (!isAdmin) return;
    setPrepSets((prev) => prev.filter((s) => s.id !== id));
  }

  function deleteQuestion(setId: string, qId: string) {
    if (!isAdmin) return;
    setPrepSets((prev) =>
      prev.map((s) => (s.id === setId ? { ...s, questions: s.questions.filter((q) => q.id !== qId) } : s))
    );
  }

  return (
    <div className="panel active">
      <p className="guide-intro">
        Generate a company-flavored interview question set for your experience level — pick a tier (or name an
        actual company), choose which rounds to prep, and review before saving. Build up a bank of prep sets across
        different company tiers so you&rsquo;re ready no matter which one calls back.
      </p>

      {isAdmin && (
        <div className="add-form qa-form" style={{ marginBottom: 24 }}>
          <div className="cat-title">✦ Generate a prep set</div>
          <div className="resume-field-grid">
            <input
              type="text"
              placeholder='Company name (optional) — e.g. "Google", "Razorpay"'
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
            <select value={tier} onChange={(e) => setTier(e.target.value as CompanyTier)}>
              {COMPANY_TIERS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={0}
              max={40}
              value={years}
              onChange={(e) => setYears(Math.max(0, Number(e.target.value) || 0))}
              placeholder="Years of experience"
            />
          </div>
          <p className="tech-explanation">{TIER_HINT[tier]}</p>

          <div className="resume-field-grid">
            {CATEGORIES.map((c) => (
              <label key={c} className="hide-toggle">
                <input type="checkbox" checked={categories.has(c)} onChange={() => toggleCategory(c)} />
                {c}
              </label>
            ))}
          </div>

          <div className="resume-actions no-print" style={{ marginTop: 0 }}>
            <button className="add-concept-btn" onClick={generate} disabled={generating || categories.size === 0}>
              {generating ? 'Generating…' : '✦ Generate questions'}
            </button>
            <button className="ghost-btn resume-add-btn" onClick={surpriseMe} disabled={generating}>
              {generating ? 'Generating…' : '🎲 Surprise me (random company)'}
            </button>
          </div>

          {generateError && <div className="discover-error">{generateError}</div>}

          {generatedQuestions && (
            <div className="suggestions-panel">
              <div className="cat-title">
                {company.trim() || tier} · {years} yrs · {generatedQuestions.length} questions — review before saving
              </div>
              <div className="qa-list">
                {generatedQuestions.map((q) => (
                  <div className="qa-card" key={q.id}>
                    <span className="qa-category-tag">{q.category}</span>
                    <div className="qa-question">{q.question}</div>
                    <div className="qa-answer qa-right">
                      <span className="qa-tag">What a strong answer covers</span>
                      <span>{q.guidance}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="edit-actions">
                <button onClick={saveGenerated}>+ Save this set</button>
                <button className="ghost-btn" onClick={discardGenerated}>
                  Discard
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {prepSets.length === 0 && (
        <div className="empty-state">
          No prep sets yet — {isAdmin ? 'generate one above to get started.' : 'nothing has been added yet.'}
        </div>
      )}

      <div className="qa-list">
        {prepSets.map((set) => {
          const isExpanded = expandedIds.has(set.id);
          return (
            <div className={`qa-card tech-card${isExpanded ? ' expanded' : ''}`} key={set.id}>
              <div className="qa-question-row tech-card-header" onClick={() => toggleExpanded(set.id)}>
                <div>
                  <span className="qa-category-tag">{set.tier}</span>
                  <span className="qa-category-tag">{set.years} yrs</span>
                  <span className="qa-category-tag">{set.questions.length} questions</span>
                  <div className="qa-question">{set.company}</div>
                </div>
                <div className="tech-card-header-right">
                  {isAdmin && (
                    <div className="qa-actions" onClick={(e) => e.stopPropagation()}>
                      <button className="del-btn" onClick={() => deleteSet(set.id)} title="Delete set">
                        ✕
                      </button>
                    </div>
                  )}
                  <span className="tech-chevron">{isExpanded ? '▾' : '▸'}</span>
                </div>
              </div>
              {isExpanded && (
                <div className="qa-list" style={{ marginTop: 8 }}>
                  {set.questions.map((q) => (
                    <div className="qa-card" key={q.id}>
                      <div className="qa-question-row">
                        <div>
                          <span className="qa-category-tag">{q.category}</span>
                          <div className="qa-question">{q.question}</div>
                        </div>
                        {isAdmin && (
                          <div className="qa-actions">
                            <button className="del-btn" onClick={() => deleteQuestion(set.id, q.id)} title="Delete question">
                              ✕
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="qa-answer qa-right">
                        <span className="qa-tag">What a strong answer covers</span>
                        <span>{q.guidance}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
