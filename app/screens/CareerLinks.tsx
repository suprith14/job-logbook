'use client';

import { Dispatch, SetStateAction, useMemo, useState } from 'react';
import { mergeCompanies } from '../data/companies';
import { slugStatus, statusOptions, todayStr } from '../lib/status';
import type { Application, Company, CompanyOverrides } from '../types';

interface CareerLinksProps {
  applications: Application[];
  setApplications: Dispatch<SetStateAction<Application[]>>;
  customCompanies: Company[];
  setCustomCompanies: Dispatch<SetStateAction<Company[]>>;
  companyOverrides: CompanyOverrides;
  setCompanyOverrides: Dispatch<SetStateAction<CompanyOverrides>>;
  defaultRole: string;
  setDefaultRole: Dispatch<SetStateAction<string>>;
  isAdmin: boolean;
}

interface CompanyForm {
  name: string;
  link: string;
  category: string;
}

interface Suggestion {
  name: string;
  link: string;
  category: string;
}

export default function CareerLinks({
  applications,
  setApplications,
  customCompanies,
  setCustomCompanies,
  companyOverrides,
  setCompanyOverrides,
  defaultRole,
  setDefaultRole,
  isAdmin,
}: CareerLinksProps) {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [hideAppliedToday, setHideAppliedToday] = useState(false);
  const [newCompany, setNewCompany] = useState<CompanyForm>({ name: '', link: '', category: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBuffer, setEditBuffer] = useState<CompanyForm>({ name: '', link: '', category: '' });
  const [bulkText, setBulkText] = useState('');
  const [bulkResult, setBulkResult] = useState('');
  const [showBulk, setShowBulk] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[] | null>(null);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(new Set());
  const [discovering, setDiscovering] = useState(false);
  const [discoverError, setDiscoverError] = useState('');

  const allCompanies = useMemo(
    () => mergeCompanies(customCompanies, companyOverrides),
    [customCompanies, companyOverrides]
  );

  const categories = useMemo(() => [...new Set(allCompanies.map((c) => c.category))], [allCompanies]);

  const filteredCompanies = useMemo(() => {
    const s = search.toLowerCase();
    return allCompanies.filter(
      (c) =>
        c.name.toLowerCase().includes(s) &&
        (catFilter === '' || c.category === catFilter) &&
        (!hideAppliedToday || !applications.some((a) => a.company === c.name && a.appliedDate === todayStr()))
    );
  }, [allCompanies, search, catFilter, hideAppliedToday, applications]);

  const groupedCompanies = useMemo(() => {
    const groups: Record<string, Company[]> = {};
    filteredCompanies.forEach((c) => {
      if (!groups[c.category]) groups[c.category] = [];
      groups[c.category].push(c);
    });
    return groups;
  }, [filteredCompanies]);

  function isAppliedToday(companyName: string) {
    const t = todayStr();
    return applications.some((a) => a.company === companyName && a.appliedDate === t);
  }

  function quickApply(company: Company) {
    if (!isAdmin) return;
    if (isAppliedToday(company.name)) {
      const t = todayStr();
      setApplications((prev) => {
        const idx = prev.findIndex((a) => a.company === company.name && a.appliedDate === t);
        if (idx === -1) return prev;
        return prev.filter((_, i) => i !== idx);
      });
      return;
    }
    window.open(company.link, '_blank', 'noopener');
    setApplications((prev) => [
      {
        id: Date.now() + Math.random(),
        company: company.name,
        role: defaultRole || 'Senior Frontend Developer',
        postedDate: '',
        appliedDate: todayStr(),
        status: 'Applied',
      },
      ...prev,
    ]);
  }

  function addCompany() {
    if (!isAdmin) return;
    const name = newCompany.name.trim();
    let link = newCompany.link.trim();
    const category = newCompany.category.trim() || 'Added by you';
    if (!name || !link) return;
    if (!/^https?:\/\//i.test(link)) link = 'https://' + link;
    setCustomCompanies((prev) => [...prev, { id: `c${Date.now()}${Math.random()}`, name, link, category }]);
    setNewCompany({ name: '', link: '', category: '' });
  }

  function bulkImportCompanies() {
    if (!isAdmin) return;
    const existingNames = new Set(allCompanies.map((c) => c.name.toLowerCase()));
    const lines = bulkText.split('\n').map((l) => l.trim()).filter(Boolean);
    const toAdd: Company[] = [];
    let skipped = 0;
    lines.forEach((line, idx) => {
      const parts = line.split(',').map((p) => p.trim());
      const name = parts[0];
      let link = parts[1];
      const category = parts[2] || 'Added by you';
      if (!name || !link) {
        skipped++;
        return;
      }
      if (existingNames.has(name.toLowerCase())) {
        skipped++;
        return;
      }
      if (!/^https?:\/\//i.test(link)) link = 'https://' + link;
      toAdd.push({ id: `c${Date.now()}${Math.random()}${idx}`, name, link, category });
      existingNames.add(name.toLowerCase());
    });
    if (toAdd.length > 0) {
      setCustomCompanies((prev) => [...prev, ...toAdd]);
    }
    setBulkResult(`Added ${toAdd.length} compan${toAdd.length === 1 ? 'y' : 'ies'}.${skipped ? ` Skipped ${skipped} (duplicate or missing link).` : ''}`);
    setBulkText('');
  }

  function updateCompany(company: Company, edits: Partial<Company>) {
    if (!isAdmin) return;
    if (company.id.startsWith('d')) {
      setCompanyOverrides((prev) => ({
        ...prev,
        [company.id]: { ...prev[company.id], ...edits },
      }));
    } else {
      setCustomCompanies((prev) => prev.map((c) => (c.id === company.id ? { ...c, ...edits } : c)));
    }
  }

  function startEdit(company: Company) {
    if (!isAdmin) return;
    setEditingId(company.id);
    setEditBuffer({ name: company.name, link: company.link, category: company.category });
  }

  function saveEdit(company: Company) {
    let link = editBuffer.link.trim();
    if (!link) return;
    if (!/^https?:\/\//i.test(link)) link = 'https://' + link;
    updateCompany(company, { name: editBuffer.name.trim() || company.name, link, category: editBuffer.category.trim() || company.category });
    setEditingId(null);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function findNewCompanies() {
    if (!isAdmin) return;
    setDiscovering(true);
    setDiscoverError('');
    setSuggestions(null);
    try {
      const res = await fetch('/api/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ existingNames: allCompanies.map((c) => c.name) }),
      });
      const data = await res.json();
      if (data.error) {
        setDiscoverError(data.error);
      } else {
        setSuggestions(data.companies || []);
        setSelectedSuggestions(new Set((data.companies || []).map((c: Suggestion) => c.name)));
      }
    } catch (err) {
      setDiscoverError(String(err));
    } finally {
      setDiscovering(false);
    }
  }

  function toggleSuggestion(name: string) {
    setSelectedSuggestions((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  function addSelectedSuggestions() {
    if (!isAdmin) return;
    const toAdd = (suggestions || [])
      .filter((c) => selectedSuggestions.has(c.name))
      .map((c) => ({ ...c, id: `c${Date.now()}${Math.random()}` }));
    setCustomCompanies((prev) => [...prev, ...toAdd]);
    setSuggestions(null);
    setSelectedSuggestions(new Set());
  }

  return (
    <div className="panel active">
      <div className="dir-controls">
        <input
          id="search"
          type="text"
          placeholder="Search companies…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {isAdmin && (
        <div className="quick-settings">
          <div className="quick-role">
            <label>Quick-apply role</label>
            <input
              type="text"
              value={defaultRole}
              onChange={(e) => setDefaultRole(e.target.value)}
              placeholder="Senior Frontend Developer"
            />
          </div>
          <label className="hide-toggle">
            <input type="checkbox" checked={hideAppliedToday} onChange={(e) => setHideAppliedToday(e.target.checked)} />
            Hide applied today
          </label>
        </div>
      )}

      {isAdmin && (
        <div className="add-form">
          <input
            type="text"
            placeholder="Company name"
            value={newCompany.name}
            onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Career page URL (https://…)"
            value={newCompany.link}
            onChange={(e) => setNewCompany({ ...newCompany, link: e.target.value })}
          />
          <input
            type="text"
            placeholder="Category (optional)"
            value={newCompany.category}
            onChange={(e) => setNewCompany({ ...newCompany, category: e.target.value })}
          />
          <button onClick={addCompany}>Add company</button>
        </div>
      )}

      {isAdmin && (
        <div className="bulk-section">
          <button className="bulk-toggle" onClick={() => setShowBulk((v) => !v)}>
            {showBulk ? '▾' : '▸'} Bulk import (paste from a spreadsheet)
          </button>
          {showBulk && (
            <div className="bulk-panel">
              <div className="bulk-hint">
                One company per line: <code>Name, https://link, Category</code> — category is optional.
              </div>
              <textarea
                className="bulk-textarea"
                rows={6}
                placeholder={'Acme Inc, https://acme.com/careers, Bangalore product\nExample Co, https://example.com/jobs'}
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
              />
              <div className="bulk-actions">
                <button onClick={bulkImportCompanies} disabled={!bulkText.trim()}>
                  Import all
                </button>
                {bulkResult && <span className="bulk-result">{bulkResult}</span>}
              </div>
            </div>
          )}
        </div>
      )}

      {isAdmin && (
        <div className="discover-row">
          <button className="discover-btn" onClick={findNewCompanies} disabled={discovering}>
            {discovering ? 'Searching…' : '✦ Find new companies'}
          </button>
          <span className="discover-hint">Free — suggested from Gemini's knowledge, not a live search. Verify each link before adding.</span>
        </div>
      )}

      {discoverError && <div className="discover-error">{discoverError}</div>}

      {suggestions && suggestions.length > 0 && (
        <div className="suggestions-panel">
          <div className="cat-title">Suggested companies — review before adding</div>
          <div className="company-grid">
            {suggestions.map((c) => (
              <label className="suggestion-card" key={c.name}>
                <input
                  type="checkbox"
                  checked={selectedSuggestions.has(c.name)}
                  onChange={() => toggleSuggestion(c.name)}
                />
                <div>
                  <div className="company-name">{c.name}</div>
                  <a className="link-btn" href={c.link} target="_blank" rel="noopener noreferrer">
                    {c.link}
                  </a>
                  <div className="suggestion-cat">{c.category}</div>
                </div>
              </label>
            ))}
          </div>
          <div className="suggestions-actions">
            <button onClick={addSelectedSuggestions}>Add selected ({selectedSuggestions.size})</button>
            <button className="ghost-btn" onClick={() => setSuggestions(null)}>
              Dismiss
            </button>
          </div>
        </div>
      )}

      {suggestions && suggestions.length === 0 && (
        <div className="empty-state">No new companies found this time — try again in a bit.</div>
      )}

      {Object.keys(groupedCompanies).length === 0 && (
        <div className="empty-state">No companies match that search.</div>
      )}

      {Object.keys(groupedCompanies).map((cat) => (
        <div className="cat-group" key={cat}>
          <div className="cat-title">{cat}</div>
          <div className="company-grid">
            {groupedCompanies[cat].map((c) => {
              const done = isAppliedToday(c.name);
              const app = applications.find((a) => a.company === c.name);
              const isEditing = editingId === c.id;
              if (isEditing) {
                return (
                  <div className="company-card editing" key={c.id}>
                    <input
                      className="edit-input"
                      type="text"
                      value={editBuffer.name}
                      onChange={(e) => setEditBuffer({ ...editBuffer, name: e.target.value })}
                      placeholder="Company name"
                    />
                    <input
                      className="edit-input"
                      type="text"
                      value={editBuffer.link}
                      onChange={(e) => setEditBuffer({ ...editBuffer, link: e.target.value })}
                      placeholder="Career page URL"
                    />
                    <input
                      className="edit-input"
                      type="text"
                      value={editBuffer.category}
                      onChange={(e) => setEditBuffer({ ...editBuffer, category: e.target.value })}
                      placeholder="Category"
                    />
                    <div className="edit-actions">
                      <button onClick={() => saveEdit(c)}>Save</button>
                      <button className="ghost-btn" onClick={cancelEdit}>Cancel</button>
                    </div>
                  </div>
                );
              }
              return (
                <div className="company-card" key={c.id}>
                  <div className="company-name-row">
                    <div className="company-name">{c.name}</div>
                    {isAdmin && (
                      <button className="edit-icon" onClick={() => startEdit(c)} title="Edit company">
                        ✎
                      </button>
                    )}
                  </div>
                  {app && (
                    <div className="stage-row">
                      {isAdmin ? (
                        <select
                          className={`stage-select stage-${slugStatus(app.status)}`}
                          value={app.status}
                          onChange={(e) =>
                            setApplications((prev) =>
                              prev.map((a) => (a.id === app.id ? { ...a, status: e.target.value } : a))
                            )
                          }
                        >
                          {statusOptions(app.status).map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className={`stage-badge stage-${slugStatus(app.status)}`}>{app.status}</span>
                      )}
                    </div>
                  )}
                  <div className="company-row">
                    <a className="link-btn" href={c.link} target="_blank" rel="noopener noreferrer">
                      Open career page ↗
                    </a>
                    {isAdmin && (
                      <button
                        className={`apply-btn${done ? ' done' : ''}`}
                        onClick={() => quickApply(c)}
                        title={done ? 'Click to undo — not fully applied' : 'Opens the career page and logs it as applied'}
                      >
                        {done ? '✓ Applied today' : 'Apply →'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
