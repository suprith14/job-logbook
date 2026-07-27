export type Role = 'admin' | 'viewer';

export interface Company {
  id: string;
  name: string;
  link: string;
  category: string;
}

export type CompanyOverrides = Record<string, Partial<Pick<Company, 'name' | 'link' | 'category'>>>;

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

export interface TechRefEntry {
  id: string;
  category: string;
  topic: string;
  explanation: string;
  code: string;
  difficulty?: Difficulty;
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
  settings?: AppSettings;
}
