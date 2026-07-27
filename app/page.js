'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

const DAILY_GOAL = 15;

const STATUSES = [
  'Applied',
  'Online Assessment',
  'Phone/Recruiter Screen',
  'Technical Interview',
  'Final/HR Round',
  'Offer',
  'Rejected',
  'Ghosted (no response)',
];

function slugStatus(status) {
  return status.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function statusOptions(current) {
  return STATUSES.includes(current) ? STATUSES : [current, ...STATUSES];
}

const DEFAULT_COMPANIES = [
  ["Flipkart","https://www.flipkartcareers.com/#!/joblist","Bangalore product"],
  ["Swiggy","https://careers.swiggy.com/","Bangalore product"],
  ["Zomato","https://www.zomato.com/careers","Bangalore product"],
  ["Myntra","https://careers.myntra.com/","Bangalore product"],
  ["Razorpay","https://razorpay.com/jobs/","Bangalore product"],
  ["PhonePe","https://www.phonepe.com/careers/","Bangalore product"],
  ["CRED","https://careers.cred.club/","Bangalore product"],
  ["Groww","https://groww.in/careers","Bangalore product"],
  ["Meesho","https://careers.meesho.com/","Bangalore product"],
  ["Zerodha","https://zerodha.com/careers/","Bangalore product"],
  ["InMobi","https://careers.inmobi.com/","Bangalore product"],
  ["Postman","https://www.postman.com/company/careers/","Bangalore product"],
  ["Chargebee","https://www.chargebee.com/careers/","Bangalore product"],
  ["BrowserStack","https://www.browserstack.com/careers","Bangalore product"],
  ["Freshworks","https://www.freshworks.com/company/careers/","Bangalore product"],
  ["Zoho","https://www.zoho.com/careers/","Bangalore product"],
  ["Practo","https://www.practo.com/careers","Bangalore product"],
  ["Urban Company","https://www.urbancompany.com/careers","Bangalore product"],
  ["Cure.fit","https://careers.cure.fit/","Bangalore product"],
  ["Ola","https://www.olacabs.com/careers","Bangalore product"],
  ["Slice","https://sliceit.com/careers","Bangalore product"],
  ["Juspay","https://juspay.io/careers","Bangalore product"],
  ["Whatfix","https://whatfix.com/careers/","Bangalore product"],
  ["MoEngage","https://www.moengage.com/careers/","Bangalore product"],
  ["Clevertap","https://clevertap.com/careers/","Bangalore product"],
  ["Darwinbox","https://darwinbox.com/careers","Bangalore product"],
  ["Uniphore","https://www.uniphore.com/careers/","Bangalore product"],
  ["Yellow.ai","https://yellow.ai/careers/","Bangalore product"],
  ["Licious","https://www.licious.in/careers","Bangalore product"],
  ["Rapido","https://rapido.bike/careers","Bangalore product"],
  ["Hasura","https://hasura.io/careers","Bangalore product"],
  ["Springworks","https://www.springworks.in/careers/","Bangalore product"],
  ["Zeta","https://www.zeta.tech/in/careers","Bangalore product"],
  ["Khatabook","https://khatabook.com/careers","Bangalore product"],
  ["Amagi","https://amagi.com/careers/","Bangalore product"],
  ["Observe.AI","https://www.observe.ai/careers","Bangalore product"],
  ["LeadSquared","https://www.leadsquared.com/careers/","Bangalore product"],

  ["Google","https://www.google.com/about/careers/applications/jobs/results?location=Bengaluru","Global tech"],
  ["Microsoft","https://careers.microsoft.com/v2/global/en/locations/bangalore-india","Global tech"],
  ["Amazon","https://www.amazon.jobs/en/locations/bengaluru-india","Global tech"],
  ["Adobe","https://careers.adobe.com/us/en/search-results?keywords=frontend&location=Bengaluru","Global tech"],
  ["Salesforce","https://careers.salesforce.com/en/jobs/?search=frontend&location=Bengaluru","Global tech"],
  ["Walmart Global Tech","https://tech.walmart.com/careers/","Global tech"],
  ["Atlassian","https://www.atlassian.com/company/careers/all-jobs","Global tech"],
  ["ServiceNow","https://careers.servicenow.com/jobs/?search=frontend","Global tech"],
  ["SAP Labs","https://jobs.sap.com/search/?q=frontend&locationsearch=Bangalore","Global tech"],
  ["Cisco","https://jobs.cisco.com/jobs/SearchJobs/frontend","Global tech"],
  ["Target India","https://tech.target.com/careers","Global tech"],
  ["Intuit","https://www.intuit.com/careers/","Global tech"],
  ["Oracle","https://www.oracle.com/in/careers/","Global tech"],
  ["Dell","https://jobs.dell.com/","Global tech"],
  ["IBM","https://www.ibm.com/in-en/employment","Global tech"],
  ["Visa","https://corporate.visa.com/en/jobs.html","Global tech"],
  ["Mastercard","https://careers.mastercard.com/","Global tech"],
  ["Uber","https://www.uber.com/us/en/careers/","Global tech"],
  ["LinkedIn","https://careers.linkedin.com/","Global tech"],
  ["Netskope","https://www.netskope.com/company/careers","Global tech"],
  ["Highspot","https://www.highspot.com/careers/","Global tech"],
  ["Innovaccer","https://innovaccer.com/careers","Global tech"],

  ["JPMorgan Chase","https://careers.jpmorgan.com/in/en/students/programs","Banking / fintech"],
  ["Goldman Sachs","https://www.goldmansachs.com/careers/students/programs/india/index.html","Banking / fintech"],
  ["Morgan Stanley","https://www.morganstanley.com/careers/technology-jobs","Banking / fintech"],
  ["Standard Chartered","https://www.sc.com/en/careers/","Banking / fintech"],
  ["Deutsche Bank","https://careers.db.com/","Banking / fintech"],
  ["Barclays","https://search.jobs.barclays/","Banking / fintech"],
  ["HSBC","https://www.hsbc.com/careers","Banking / fintech"],
  ["American Express","https://aexp.eightfold.ai/careers","Banking / fintech"],

  ["Accenture","https://www.accenture.com/in-en/careers/jobsearch?jk=frontend","IT services"],
  ["Capgemini","https://www.capgemini.com/in-en/careers/join-capgemini/","IT services"],
  ["Wipro","https://careers.wipro.com/","IT services"],
  ["Infosys","https://www.infosys.com/careers/","IT services"],
  ["TCS","https://www.tcs.com/careers","IT services"],
  ["Cognizant","https://careers.cognizant.com/global/en","IT services"],
  ["Persistent Systems","https://www.persistent.com/careers/","IT services"],
  ["CGI","https://www.cgi.com/en/careers","IT services"],
  ["LTIMindtree","https://careers.ltimindtree.com/","IT services"],
  ["Publicis Sapient","https://www.publicissapient.com/careers","IT services"],
  ["ThoughtWorks","https://www.thoughtworks.com/careers","IT services"],

  ["GitLab","https://about.gitlab.com/jobs/all-jobs/","Remote-first"],
  ["Automattic","https://automattic.com/work-with-us/","Remote-first"],
  ["Zapier","https://zapier.com/jobs","Remote-first"],
  ["Doist","https://doist.com/careers","Remote-first"],
  ["Buffer","https://buffer.com/journey","Remote-first"]
].map(([name, link, category], i) => ({ id: `d${i}`, name, link, category }));

function todayStr() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

export default function Home() {
  const router = useRouter();
  const [role, setRole] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [applications, setApplications] = useState([]);
  const [customCompanies, setCustomCompanies] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState('idle'); // idle | saving | saved | error
  const [syncError, setSyncError] = useState('');
  const [activeTab, setActiveTab] = useState('directory');
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [newCompany, setNewCompany] = useState({ name: '', link: '', category: '' });
  const [suggestions, setSuggestions] = useState(null);
  const [selectedSuggestions, setSelectedSuggestions] = useState(new Set());
  const [discovering, setDiscovering] = useState(false);
  const [discoverError, setDiscoverError] = useState('');
  const [defaultRole, setDefaultRole] = useState('Senior Frontend Developer');
  const [hideAppliedToday, setHideAppliedToday] = useState(false);
  const [companyOverrides, setCompanyOverrides] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [editBuffer, setEditBuffer] = useState({ name: '', link: '', category: '' });
  const [bulkText, setBulkText] = useState('');
  const [bulkResult, setBulkResult] = useState('');
  const [showBulk, setShowBulk] = useState(false);
  const [hrQuestions, setHrQuestions] = useState([]);
  const [newQA, setNewQA] = useState({ question: '', wrongAnswer: '', rightAnswer: '' });
  const [hrSearch, setHrSearch] = useState('');
  const [editingQAId, setEditingQAId] = useState(null);
  const [editQABuffer, setEditQABuffer] = useState({ question: '', wrongAnswer: '', rightAnswer: '' });

  const isAdmin = role === 'admin';

  // Check session on mount
  useEffect(() => {
    fetch('/api/session')
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated) {
          router.push('/login');
        } else {
          setRole(data.role);
          setAuthChecked(true);
        }
      })
      .catch(() => router.push('/login'));
  }, [router]);

  function handleLogout() {
    fetch('/api/logout', { method: 'POST' }).then(() => router.push('/login'));
  }

  // Load state on mount
  useEffect(() => {
    if (!authChecked) return;
    fetch('/api/state')
      .then((res) => res.json())
      .then((data) => {
        setApplications(data.applications || []);
        setCustomCompanies(data.customCompanies || []);
        setCompanyOverrides(data.companyOverrides || {});
        setHrQuestions(data.hrQuestions || []);
        if (data.settings && data.settings.defaultRole) setDefaultRole(data.settings.defaultRole);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [authChecked]);

  // Save state whenever it changes (after initial load) — admin only
  useEffect(() => {
    if (!loaded || !isAdmin) return;
    setSyncStatus('saving');
    const t = setTimeout(() => {
      fetch('/api/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applications, customCompanies, companyOverrides, hrQuestions, settings: { defaultRole } }),
      })
        .then((res) => res.json())
        .then((res) => {
          setSyncStatus(res.ok ? 'saved' : 'error');
          setSyncError(res.ok ? '' : res.error || 'Unknown error');
        })
        .catch((err) => {
          setSyncStatus('error');
          setSyncError(String(err));
        });
    }, 400);
    return () => clearTimeout(t);
  }, [applications, customCompanies, companyOverrides, hrQuestions, defaultRole, loaded, isAdmin]);

  const allCompanies = useMemo(() => {
    const defaults = DEFAULT_COMPANIES.map((c) =>
      companyOverrides[c.id] ? { ...c, ...companyOverrides[c.id] } : c
    );
    return [...defaults, ...customCompanies];
  }, [customCompanies, companyOverrides]);

  const todayCount = useMemo(
    () => applications.filter((a) => a.appliedDate === todayStr()).length,
    [applications]
  );

  const totalCount = applications.length;

  const stageCounts = useMemo(() => {
    const counts = {};
    applications.forEach((a) => {
      counts[a.status] = (counts[a.status] || 0) + 1;
    });
    return STATUSES.filter((s) => counts[s]).map((s) => ({ status: s, count: counts[s] }));
  }, [applications]);

  const categories = useMemo(
    () => [...new Set(allCompanies.map((c) => c.category))],
    [allCompanies]
  );

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
    const groups = {};
    filteredCompanies.forEach((c) => {
      if (!groups[c.category]) groups[c.category] = [];
      groups[c.category].push(c);
    });
    return groups;
  }, [filteredCompanies]);

  function isAppliedToday(companyName) {
    const t = todayStr();
    return applications.some((a) => a.company === companyName && a.appliedDate === t);
  }

  function quickApply(company) {
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

  function undoLast() {
    if (!isAdmin) return;
    const t = todayStr();
    const idx = applications.findIndex((a) => a.appliedDate === t);
    if (idx === -1) return;
    setApplications((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateField(id, field, value) {
    if (!isAdmin) return;
    setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, [field]: value } : a)));
  }

  function updateStatus(id, status) {
    if (!isAdmin) return;
    setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  }

  function deleteApplication(id) {
    if (!isAdmin) return;
    setApplications((prev) => prev.filter((a) => a.id !== id));
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
    const toAdd = [];
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

  function updateCompany(company, edits) {
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

  function startEdit(company) {
    if (!isAdmin) return;
    setEditingId(company.id);
    setEditBuffer({ name: company.name, link: company.link, category: company.category });
  }

  function saveEdit(company) {
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
        setSelectedSuggestions(new Set((data.companies || []).map((c) => c.name)));
      }
    } catch (err) {
      setDiscoverError(String(err));
    } finally {
      setDiscovering(false);
    }
  }

  function toggleSuggestion(name) {
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

  function addQA() {
    if (!isAdmin) return;
    const question = newQA.question.trim();
    const wrongAnswer = newQA.wrongAnswer.trim();
    const rightAnswer = newQA.rightAnswer.trim();
    if (!question || !rightAnswer) return;
    setHrQuestions((prev) => [
      { id: `q${Date.now()}${Math.random()}`, question, wrongAnswer, rightAnswer },
      ...prev,
    ]);
    setNewQA({ question: '', wrongAnswer: '', rightAnswer: '' });
  }

  function deleteQA(id) {
    if (!isAdmin) return;
    setHrQuestions((prev) => prev.filter((q) => q.id !== id));
  }

  function startEditQA(qa) {
    if (!isAdmin) return;
    setEditingQAId(qa.id);
    setEditQABuffer({ question: qa.question, wrongAnswer: qa.wrongAnswer, rightAnswer: qa.rightAnswer });
  }

  function saveEditQA(id) {
    const question = editQABuffer.question.trim();
    const rightAnswer = editQABuffer.rightAnswer.trim();
    if (!question || !rightAnswer) return;
    setHrQuestions((prev) =>
      prev.map((q) =>
        q.id === id
          ? { ...q, question, wrongAnswer: editQABuffer.wrongAnswer.trim(), rightAnswer }
          : q
      )
    );
    setEditingQAId(null);
  }

  function cancelEditQA() {
    setEditingQAId(null);
  }

  const filteredQA = useMemo(() => {
    const s = hrSearch.trim().toLowerCase();
    if (!s) return hrQuestions;
    return hrQuestions.filter((q) => q.question.toLowerCase().includes(s));
  }, [hrQuestions, hrSearch]);

  const rungs = Array.from({ length: DAILY_GOAL }, (_, i) => i + 1 <= todayCount);

  if (!authChecked) {
    return (
      <div className="wrap">
        <div className="empty-state">Checking session…</div>
      </div>
    );
  }

  return (
    <div className="wrap">
      <header>
        <div>
          <div className="brand-eyebrow">Daily Discipline</div>
          <h1>The Logbook</h1>
          <div className="sub">
            Direct company career links only. No portals, no noise. Log what you apply to and keep the streak alive.
          </div>
          <div className="session-bar">
            <span className={`role-badge ${role}`}>{role === 'admin' ? 'Admin' : 'View only'}</span>
            <span className="total-badge">{totalCount} total applied</span>
            <button className="logout-link" onClick={handleLogout}>Sign out</button>
          </div>
          {stageCounts.length > 0 && (
            <div className="stage-counts">
              {stageCounts.map(({ status, count }) => (
                <span key={status} className={`stage-count-pill stage-${slugStatus(status)}`}>
                  {status} <b>{count}</b>
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="ladder-card">
          <div className="ladder-top">
            <div>
              <span className="ladder-count">{todayCount}</span>
              <span> / {DAILY_GOAL} today</span>
            </div>
            <div className="ladder-label">
              {new Date().toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
          </div>
          <div className="rungs">
            {rungs.map((filled, i) => (
              <div key={i} className={`rung${filled ? ' filled' : ''}`} />
            ))}
          </div>
          <div className="ladder-note">
            {todayCount >= DAILY_GOAL
              ? 'Goal hit for today. Anything past 15 is a bonus.'
              : `${DAILY_GOAL - todayCount} more to hit today's goal.`}
          </div>
          <div className={`sync-note ${syncStatus === 'saving' ? 'saving' : ''} ${syncStatus === 'error' ? 'error' : ''}`}>
            {syncStatus === 'saving' && 'Syncing…'}
            {syncStatus === 'saved' && 'Synced across your devices'}
            {syncStatus === 'error' && `Not synced — ${syncError || 'check database connection'}`}
            {syncStatus === 'idle' && loaded && 'Ready'}
          </div>
          {isAdmin && todayCount > 0 && (
            <button className="undo-link" onClick={undoLast}>Undo last apply</button>
          )}
        </div>
      </header>

      <div className="tabs">
        <button className={`tab${activeTab === 'directory' ? ' active' : ''}`} onClick={() => setActiveTab('directory')}>
          Career Links
        </button>
        <button className={`tab${activeTab === 'log' ? ' active' : ''}`} onClick={() => setActiveTab('log')}>
          Application Log
        </button>
        <button className={`tab${activeTab === 'hr' ? ' active' : ''}`} onClick={() => setActiveTab('hr')}>
          HR
        </button>
      </div>

      {activeTab === 'directory' && (
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
              <span className="discover-hint">Uses Claude with web search — small cost per click.</span>
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
                              onChange={(e) => updateStatus(app.id, e.target.value)}
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
      )}

      {activeTab === 'log' && (
        <div className="panel active">
          {applications.length === 0 ? (
            <div className="empty-state">
              Nothing logged yet — mark a company applied from Career Links to start today&apos;s count.
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Date applied</th>
                  <th>Company</th>
                  <th>Role</th>
                  <th>Posted date</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {applications.map((a) => (
                  <tr key={a.id}>
                    <td className="date-pill">{a.appliedDate}</td>
                    <td>{a.company}</td>
                    <td>
                      <input
                        className="inline-edit"
                        type="text"
                        value={a.role}
                        disabled={!isAdmin}
                        onChange={(e) => updateField(a.id, 'role', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        className="inline-edit"
                        type="text"
                        placeholder="—"
                        value={a.postedDate}
                        disabled={!isAdmin}
                        onChange={(e) => updateField(a.id, 'postedDate', e.target.value)}
                      />
                    </td>
                    <td>
                      <select
                        className={`status-select status-${slugStatus(a.status)}`}
                        value={a.status}
                        onChange={(e) => updateStatus(a.id, e.target.value)}
                        disabled={!isAdmin}
                      >
                        {statusOptions(a.status).map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      {isAdmin && (
                        <button className="del-btn" onClick={() => deleteApplication(a.id)} title="Remove entry">
                          ✕
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'hr' && (
        <div className="panel active">
          <div className="dir-controls">
            <input
              type="text"
              placeholder="Search your questions…"
              value={hrSearch}
              onChange={(e) => setHrSearch(e.target.value)}
            />
          </div>

          {isAdmin && (
            <div className="add-form qa-form">
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

          {filteredQA.length === 0 && (
            <div className="empty-state">
              {hrQuestions.length === 0
                ? 'No questions yet — add one above to start building your revision list.'
                : 'No questions match that search.'}
            </div>
          )}

          <div className="qa-list">
            {filteredQA.map((qa) => {
              const isEditing = editingQAId === qa.id;
              if (isEditing) {
                return (
                  <div className="qa-card editing" key={qa.id}>
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
                    <div className="qa-question">{qa.question}</div>
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
      )}
    </div>
  );
}
