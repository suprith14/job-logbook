'use client';

import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { DEFAULT_RESUME } from '../screens/ResumeBuilder';
import { DEFAULT_COVER_LETTER } from '../screens/CoverLetterBuilder';
import type {
  Application,
  Company,
  CompanyOverrides,
  CorporateScenario,
  CoverLetterData,
  FlowSequence,
  HRQuestion,
  PrepSet,
  ResumeData,
  Snippet,
  SyncStatus,
  TechRefEntry,
} from '../types';

export interface AppState {
  applications: Application[];
  setApplications: Dispatch<SetStateAction<Application[]>>;
  customCompanies: Company[];
  setCustomCompanies: Dispatch<SetStateAction<Company[]>>;
  companyOverrides: CompanyOverrides;
  setCompanyOverrides: Dispatch<SetStateAction<CompanyOverrides>>;
  hrQuestions: HRQuestion[];
  setHrQuestions: Dispatch<SetStateAction<HRQuestion[]>>;
  snippets: Snippet[];
  setSnippets: Dispatch<SetStateAction<Snippet[]>>;
  techRefs: TechRefEntry[];
  setTechRefs: Dispatch<SetStateAction<TechRefEntry[]>>;
  flows: FlowSequence[];
  setFlows: Dispatch<SetStateAction<FlowSequence[]>>;
  prepSets: PrepSet[];
  setPrepSets: Dispatch<SetStateAction<PrepSet[]>>;
  corporateScenarios: CorporateScenario[];
  setCorporateScenarios: Dispatch<SetStateAction<CorporateScenario[]>>;
  resume: ResumeData;
  setResume: Dispatch<SetStateAction<ResumeData>>;
  coverLetter: CoverLetterData;
  setCoverLetter: Dispatch<SetStateAction<CoverLetterData>>;
  defaultRole: string;
  setDefaultRole: Dispatch<SetStateAction<string>>;
  loaded: boolean;
  syncStatus: SyncStatus;
  syncError: string;
}

// Holds every piece of state that gets persisted to /api/state (Redis), plus the
// load-on-mount and debounced-save-on-change effects. Adding a new persisted field
// in the future means: one useState here, one line in the load handler, one line
// in the save body, one line in the save effect's dependency array.
export function useAppState(authChecked: boolean, isAdmin: boolean): AppState {
  const [applications, setApplications] = useState<Application[]>([]);
  const [customCompanies, setCustomCompanies] = useState<Company[]>([]);
  const [companyOverrides, setCompanyOverrides] = useState<CompanyOverrides>({});
  const [hrQuestions, setHrQuestions] = useState<HRQuestion[]>([]);
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [techRefs, setTechRefs] = useState<TechRefEntry[]>([]);
  const [flows, setFlows] = useState<FlowSequence[]>([]);
  const [prepSets, setPrepSets] = useState<PrepSet[]>([]);
  const [corporateScenarios, setCorporateScenarios] = useState<CorporateScenario[]>([]);
  const [resume, setResume] = useState<ResumeData>(DEFAULT_RESUME);
  const [coverLetter, setCoverLetter] = useState<CoverLetterData>(DEFAULT_COVER_LETTER);
  const [defaultRole, setDefaultRole] = useState('Senior Frontend Developer');

  const [loaded, setLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [syncError, setSyncError] = useState('');

  // Load once, right after auth is confirmed.
  useEffect(() => {
    if (!authChecked) return;
    fetch('/api/state')
      .then((res) => res.json())
      .then((data) => {
        setApplications(data.applications || []);
        setCustomCompanies(data.customCompanies || []);
        setCompanyOverrides(data.companyOverrides || {});
        setHrQuestions(data.hrQuestions || []);
        setSnippets(data.snippets || []);
        setTechRefs(data.techRefs || []);
        setFlows(data.flows || []);
        setPrepSets(data.prepSets || []);
        setCorporateScenarios(data.corporateScenarios || []);
        setResume(data.resume || DEFAULT_RESUME);
        setCoverLetter(
          data.coverLetter && Array.isArray(data.coverLetter.achievements)
            ? data.coverLetter
            : DEFAULT_COVER_LETTER
        );
        if (data.settings && data.settings.defaultRole) setDefaultRole(data.settings.defaultRole);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [authChecked]);

  // Debounced save whenever any persisted field changes — admin only.
  useEffect(() => {
    if (!loaded || !isAdmin) return;
    setSyncStatus('saving');
    const t = setTimeout(() => {
      fetch('/api/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applications,
          customCompanies,
          companyOverrides,
          hrQuestions,
          snippets,
          techRefs,
          flows,
          prepSets,
          corporateScenarios,
          resume,
          coverLetter,
          settings: { defaultRole },
        }),
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
  }, [applications, customCompanies, companyOverrides, hrQuestions, snippets, techRefs, flows, prepSets, corporateScenarios, resume, coverLetter, defaultRole, loaded, isAdmin]);

  return {
    applications, setApplications,
    customCompanies, setCustomCompanies,
    companyOverrides, setCompanyOverrides,
    hrQuestions, setHrQuestions,
    snippets, setSnippets,
    techRefs, setTechRefs,
    flows, setFlows,
    prepSets, setPrepSets,
    corporateScenarios, setCorporateScenarios,
    resume, setResume,
    coverLetter, setCoverLetter,
    defaultRole, setDefaultRole,
    loaded, syncStatus, syncError,
  };
}
