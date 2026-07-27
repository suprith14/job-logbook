'use client';

import { Dispatch, SetStateAction, useMemo, useState } from 'react';
import type { Snippet } from '../types';

interface SnippetsPanelProps {
  snippets: Snippet[];
  setSnippets: Dispatch<SetStateAction<Snippet[]>>;
  isAdmin: boolean;
}

interface SnippetForm {
  title: string;
  text: string;
}

export default function SnippetsPanel({ snippets, setSnippets, isAdmin }: SnippetsPanelProps) {
  const [newSnippet, setNewSnippet] = useState<SnippetForm>({ title: '', text: '' });
  const [snippetSearch, setSnippetSearch] = useState('');
  const [editingSnippetId, setEditingSnippetId] = useState<string | null>(null);
  const [editSnippetBuffer, setEditSnippetBuffer] = useState<SnippetForm>({ title: '', text: '' });
  const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null);

  function addSnippet() {
    if (!isAdmin) return;
    const title = newSnippet.title.trim();
    const text = newSnippet.text.trim();
    if (!title || !text) return;
    setSnippets((prev) => [{ id: `s${Date.now()}${Math.random()}`, title, text }, ...prev]);
    setNewSnippet({ title: '', text: '' });
  }

  function deleteSnippet(id: string) {
    if (!isAdmin) return;
    setSnippets((prev) => prev.filter((s) => s.id !== id));
  }

  function startEditSnippet(snippet: Snippet) {
    if (!isAdmin) return;
    setEditingSnippetId(snippet.id);
    setEditSnippetBuffer({ title: snippet.title, text: snippet.text });
  }

  function saveEditSnippet(id: string) {
    const title = editSnippetBuffer.title.trim();
    const text = editSnippetBuffer.text.trim();
    if (!title || !text) return;
    setSnippets((prev) => prev.map((s) => (s.id === id ? { ...s, title, text } : s)));
    setEditingSnippetId(null);
  }

  function cancelEditSnippet() {
    setEditingSnippetId(null);
  }

  async function copySnippet(snippet: Snippet) {
    try {
      await navigator.clipboard.writeText(snippet.text);
    } catch (err) {
      return;
    }
    setCopiedSnippetId(snippet.id);
    setTimeout(() => setCopiedSnippetId((cur) => (cur === snippet.id ? null : cur)), 1500);
  }

  const filteredSnippets = useMemo(() => {
    const s = snippetSearch.trim().toLowerCase();
    if (!s) return snippets;
    return snippets.filter((sn) => sn.title.toLowerCase().includes(s) || sn.text.toLowerCase().includes(s));
  }, [snippets, snippetSearch]);

  return (
    <div className="panel active">
      <div className="dir-controls">
        <input
          type="text"
          placeholder="Search your snippets…"
          value={snippetSearch}
          onChange={(e) => setSnippetSearch(e.target.value)}
        />
      </div>

      {isAdmin && (
        <div className="add-form qa-form">
          <input
            type="text"
            placeholder="Title (e.g. Why this role, Notice period, Portfolio link)…"
            value={newSnippet.title}
            onChange={(e) => setNewSnippet({ ...newSnippet, title: e.target.value })}
          />
          <textarea
            className="qa-textarea"
            rows={3}
            placeholder="Text to paste into applications…"
            value={newSnippet.text}
            onChange={(e) => setNewSnippet({ ...newSnippet, text: e.target.value })}
          />
          <button onClick={addSnippet}>Add snippet</button>
        </div>
      )}

      {filteredSnippets.length === 0 && (
        <div className="empty-state">
          {snippets.length === 0
            ? 'No snippets yet — add one above (e.g. a standard answer or your portfolio link) to copy into applications.'
            : 'No snippets match that search.'}
        </div>
      )}

      <div className="qa-list">
        {filteredSnippets.map((snippet) => {
          const isEditing = editingSnippetId === snippet.id;
          if (isEditing) {
            return (
              <div className="qa-card editing" key={snippet.id}>
                <input
                  type="text"
                  value={editSnippetBuffer.title}
                  onChange={(e) => setEditSnippetBuffer({ ...editSnippetBuffer, title: e.target.value })}
                  placeholder="Title"
                />
                <textarea
                  className="qa-textarea"
                  rows={3}
                  value={editSnippetBuffer.text}
                  onChange={(e) => setEditSnippetBuffer({ ...editSnippetBuffer, text: e.target.value })}
                  placeholder="Text"
                />
                <div className="edit-actions">
                  <button onClick={() => saveEditSnippet(snippet.id)}>Save</button>
                  <button className="ghost-btn" onClick={cancelEditSnippet}>Cancel</button>
                </div>
              </div>
            );
          }
          return (
            <div className="qa-card" key={snippet.id}>
              <div className="qa-question-row">
                <div className="qa-question">{snippet.title}</div>
                <div className="qa-actions">
                  <button className="copy-btn" onClick={() => copySnippet(snippet)}>
                    {copiedSnippetId === snippet.id ? '✓ Copied' : 'Copy'}
                  </button>
                  {isAdmin && (
                    <>
                      <button className="edit-icon" onClick={() => startEditSnippet(snippet)} title="Edit">
                        ✎
                      </button>
                      <button className="del-btn" onClick={() => deleteSnippet(snippet.id)} title="Delete">
                        ✕
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="snippet-text">{snippet.text}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
