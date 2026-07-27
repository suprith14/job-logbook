'use client';

import { Dispatch, SetStateAction, useMemo } from 'react';
import { DAILY_GOAL, STATUSES, slugStatus, todayStr } from '../lib/status';
import type { Application, Role, SyncStatus } from '../types';

interface HeaderProps {
  role: Role | null;
  isAdmin: boolean;
  applications: Application[];
  setApplications: Dispatch<SetStateAction<Application[]>>;
  companiesCount: number;
  syncStatus: SyncStatus;
  syncError: string;
  loaded: boolean;
  onLogout: () => void;
}

export default function Header({
  role,
  isAdmin,
  applications,
  setApplications,
  companiesCount,
  syncStatus,
  syncError,
  loaded,
  onLogout,
}: HeaderProps) {
  const totalCount = applications.length;

  const todayCount = useMemo(
    () => applications.filter((a) => a.appliedDate === todayStr()).length,
    [applications]
  );

  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    applications.forEach((a) => {
      counts[a.status] = (counts[a.status] || 0) + 1;
    });
    return STATUSES.filter((s) => counts[s]).map((s) => ({ status: s, count: counts[s] }));
  }, [applications]);

  function undoLast() {
    if (!isAdmin) return;
    const t = todayStr();
    const idx = applications.findIndex((a) => a.appliedDate === t);
    if (idx === -1) return;
    setApplications((prev) => prev.filter((_, i) => i !== idx));
  }

  const rungs = Array.from({ length: DAILY_GOAL }, (_, i) => i + 1 <= todayCount);

  return (
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
          <span className="total-badge">{companiesCount} companies listed</span>
          <button className="logout-link" onClick={onLogout}>Sign out</button>
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
  );
}
