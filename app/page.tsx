'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppState } from './hooks/useAppState';
import { mergeCompanies } from './data/companies';
import Header from './components/Header';
import CareerLinks from './screens/CareerLinks';
import ApplicationLog from './screens/ApplicationLog';
import HRPrep from './screens/HRPrep';
import SnippetsPanel from './screens/SnippetsPanel';
import CompGuide from './screens/CompGuide';
import ResumeBuilder from './screens/ResumeBuilder';
import CoverLetterBuilder from './screens/CoverLetterBuilder';
import type { Role } from './types';

const TABS = [
  { id: 'directory', label: 'Career Links' },
  { id: 'log', label: 'Application Log' },
  { id: 'hr', label: 'HR' },
  { id: 'snippets', label: 'Snippets' },
  { id: 'comp', label: 'Comp Guide' },
  { id: 'resume', label: 'Resume' },
  { id: 'coverLetter', label: 'Cover Letter' },
];

export default function Home() {
  const router = useRouter();
  const [role, setRole] = useState<Role | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [activeTab, setActiveTab] = useState('directory');

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

  const {
    applications, setApplications,
    customCompanies, setCustomCompanies,
    companyOverrides, setCompanyOverrides,
    hrQuestions, setHrQuestions,
    snippets, setSnippets,
    resume, setResume,
    coverLetter, setCoverLetter,
    defaultRole, setDefaultRole,
    loaded, syncStatus, syncError,
  } = useAppState(authChecked, isAdmin);

  const companiesCount = useMemo(
    () => mergeCompanies(customCompanies, companyOverrides).length,
    [customCompanies, companyOverrides]
  );

  if (!authChecked) {
    return (
      <div className="wrap">
        <div className="empty-state">Checking session…</div>
      </div>
    );
  }

  return (
    <div className="wrap">
      <Header
        role={role}
        isAdmin={isAdmin}
        applications={applications}
        setApplications={setApplications}
        companiesCount={companiesCount}
        syncStatus={syncStatus}
        syncError={syncError}
        loaded={loaded}
        onLogout={handleLogout}
      />

      <div className="tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`tab${activeTab === tab.id ? ' active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'directory' && (
        <CareerLinks
          applications={applications}
          setApplications={setApplications}
          customCompanies={customCompanies}
          setCustomCompanies={setCustomCompanies}
          companyOverrides={companyOverrides}
          setCompanyOverrides={setCompanyOverrides}
          defaultRole={defaultRole}
          setDefaultRole={setDefaultRole}
          isAdmin={isAdmin}
        />
      )}

      {activeTab === 'log' && (
        <ApplicationLog applications={applications} setApplications={setApplications} isAdmin={isAdmin} />
      )}

      {activeTab === 'hr' && (
        <HRPrep hrQuestions={hrQuestions} setHrQuestions={setHrQuestions} isAdmin={isAdmin} />
      )}

      {activeTab === 'snippets' && (
        <SnippetsPanel snippets={snippets} setSnippets={setSnippets} isAdmin={isAdmin} />
      )}

      {activeTab === 'comp' && <CompGuide />}

      {activeTab === 'resume' && <ResumeBuilder resume={resume} setResume={setResume} isAdmin={isAdmin} />}

      {activeTab === 'coverLetter' && (
        <CoverLetterBuilder coverLetter={coverLetter} setCoverLetter={setCoverLetter} isAdmin={isAdmin} />
      )}
    </div>
  );
}
