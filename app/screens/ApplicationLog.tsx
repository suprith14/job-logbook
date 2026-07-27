'use client';

import { Dispatch, SetStateAction } from 'react';
import { slugStatus, statusOptions } from '../lib/status';
import type { Application } from '../types';

interface ApplicationLogProps {
  applications: Application[];
  setApplications: Dispatch<SetStateAction<Application[]>>;
  isAdmin: boolean;
}

export default function ApplicationLog({ applications, setApplications, isAdmin }: ApplicationLogProps) {
  function updateField(id: Application['id'], field: 'role' | 'postedDate', value: string) {
    if (!isAdmin) return;
    setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, [field]: value } : a)));
  }

  function updateStatus(id: Application['id'], status: string) {
    if (!isAdmin) return;
    setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  }

  function deleteApplication(id: Application['id']) {
    if (!isAdmin) return;
    setApplications((prev) => prev.filter((a) => a.id !== id));
  }

  return (
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
  );
}
