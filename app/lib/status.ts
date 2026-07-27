export const DAILY_GOAL = 15;

export const STATUSES = [
  'Applied',
  'Online Assessment',
  'Phone/Recruiter Screen',
  'Technical Interview',
  'Final/HR Round',
  'Offer',
  'Rejected',
  'Ghosted (no response)',
];

export function slugStatus(status: string): string {
  return status.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function statusOptions(current: string): string[] {
  return STATUSES.includes(current) ? STATUSES : [current, ...STATUSES];
}

export function todayStr(): string {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
