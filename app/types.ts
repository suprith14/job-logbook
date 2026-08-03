export type Role = 'admin' | 'viewer';

export interface Company {
  id: string;
  name: string;
  link: string;
  category: string;
  // ISO timestamp of when this company was added to the list — only set for
  // user-added companies (bundled seed companies have no real "added" date).
  addedAt?: string;
  // Optional highlighted metadata — filled in by hand or via "✦ Enrich with AI".
  industry?: string;
  country?: string;
  employeeSize?: string;
  tier?: CompanyTier;
  workPolicy?: string;
  foundedYear?: string;
  fundingStage?: string;
}

export type CompanyOverrides = Record<string, Partial<Omit<Company, 'id'>>>;

export interface Application {
  id: string | number;
  company: string;
  role: string;
  postedDate: string;
  appliedDate: string;
  status: string;
}

export interface HRQuestion {
  id: string;
  category: string;
  question: string;
  wrongAnswer: string;
  rightAnswer: string;
}

export interface Snippet {
  id: string;
  title: string;
  text: string;
}

export interface ResumeExperience {
  id: string;
  company: string;
  role: string;
  location: string;
  start: string;
  end: string;
  bullets: string;
}

export interface ResumeEducation {
  id: string;
  school: string;
  degree: string;
  start: string;
  end: string;
  details: string;
}

export interface ResumeProject {
  id: string;
  name: string;
  link: string;
  description: string;
}

export interface ResumeData {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
  summary: string;
  skills: string;
  experience: ResumeExperience[];
  education: ResumeEducation[];
  certifications: string;
  projects: ResumeProject[];
}

export interface CoverLetterAchievement {
  id: string;
  company: string;
  detail: string;
}

export interface CoverLetterData {
  yourName: string;
  yourEmail: string;
  yourPhone: string;
  company: string;
  role: string;
  hiringManager: string;
  opening: string;
  achievements: CoverLetterAchievement[];
  closing: string;
}

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type StepStatus = 'success' | 'error';

export interface TechRefStep {
  title: string;
  detail: string;
  // Which actor sends this step's message and which receives it (e.g. "Browser" -> "Server").
  // Optional — when a flow's steps don't set these, ProcessFlow falls back to a plain step chain.
  // from === to represents an actor doing internal work rather than sending anything.
  from?: string;
  to?: string;
  // What's actually sent on the wire for this step — e.g. "POST /login", "200 OK", a short
  // JSON snippet. Shown as a label riding along with the traveling packet.
  payload?: string;
  // Roughly how long this step takes in the real world — e.g. "~40ms". Purely illustrative.
  latency?: string;
  // 'error' colors this step's packet/line/actors red instead of the default amber —
  // for showing a rejection or failure path distinctly from the success case.
  status?: StepStatus;
  // The actual code behind this step (e.g. the bcrypt.compare call for a password check).
  // Shown in a code panel beside the diagram in "system view" mode.
  code?: string;
}

export interface TechRefEntry {
  id: string;
  category: string;
  topic: string;
  explanation: string;
  code: string;
  difficulty?: Difficulty;
  steps?: TechRefStep[];
}

export interface FlowSequence {
  id: string;
  title: string;
  category?: string;
  steps: TechRefStep[];
}

export type CompanyTier = 'FAANG / Tier-1' | 'Product-based Tier-2' | 'Service-based / IT-services' | 'Startup';

export type PrepQuestionCategory = 'Technical' | 'System Design' | 'Behavioral' | 'Coding/DSA';

export interface PrepQuestion {
  id: string;
  category: PrepQuestionCategory;
  question: string;
  guidance: string;
}

export interface PrepSet {
  id: string;
  company: string;
  tier: CompanyTier;
  years: number;
  questions: PrepQuestion[];
}

export interface DialogueLine {
  speaker: string;
  line: string;
}

export interface CorporateScenario {
  id: string;
  category: string;
  situation: string;
  dialogue: DialogueLine[];
  takeaway: string;
}

export interface StructureEntry {
  path: string;
  why: string;
  when: string;
  content?: string;
}

export interface StructureSet {
  id: string;
  stackName: string;
  entries: StructureEntry[];
}

export interface DBRecommendation {
  name: string;
  why: string;
  tradeoffs: string;
  usedBy?: string;
}

export interface DBScenarioSet {
  id: string;
  scenario: string;
  recommendations: DBRecommendation[];
}

export type SyncStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface AppSettings {
  defaultRole?: string;
}

export interface PersistedState {
  applications?: Application[];
  customCompanies?: Company[];
  companyOverrides?: CompanyOverrides;
  hrQuestions?: HRQuestion[];
  snippets?: Snippet[];
  resume?: ResumeData;
  coverLetter?: CoverLetterData;
  techRefs?: TechRefEntry[];
  flows?: FlowSequence[];
  prepSets?: PrepSet[];
  corporateScenarios?: CorporateScenario[];
  structureSets?: StructureSet[];
  dbScenarioSets?: DBScenarioSet[];
  favoriteCompanyIds?: string[];
  settings?: AppSettings;
}
