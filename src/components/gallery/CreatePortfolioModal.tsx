import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { TEMPLATES } from '../../data/templates';
import type { TemplateId } from '../../types/portfolio';

interface CreatePortfolioModalProps {
  templateId: TemplateId | null;
  onClose: () => void;
  onCreate: (params: {
    templateId: TemplateId;
    title: string;
    personName: string;
    roleTitle: string;
    populateSample: boolean;
  }) => Promise<void>;
}

export const CreatePortfolioModal: React.FC<CreatePortfolioModalProps> = ({
  templateId,
  onClose,
  onCreate,
}) => {
  const [title, setTitle] = useState('');
  const [personName, setPersonName] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [populateSample, setPopulateSample] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!templateId) return;
    setTitle('');
    setPersonName('');
    setRoleTitle(
      templateId === 'monolith-grid'
        ? 'Staff Software Engineer'
        : templateId === 'atelier-index'
          ? 'Principal Product Designer'
          : 'Creative Director & Brand Designer'
    );
    setPopulateSample(true);
    setError('');
  }, [templateId]);

  if (!templateId) return null;
  const tpl = TEMPLATES[templateId];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !personName.trim()) {
      setError('Please enter both a portfolio title and your name.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await onCreate({
        templateId,
        title: title.trim(),
        personName: personName.trim(),
        roleTitle: roleTitle.trim() || 'Digital Creative',
        populateSample,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(18, 18, 20, 0.72)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Create new portfolio"
    >
      <div
        className="wf-scroll max-h-[92vh] w-full max-w-lg overflow-y-auto border p-5 sm:p-8"
        style={{
          backgroundColor: 'var(--wf-gallery-surface)',
          color: 'var(--wf-gallery-ink)',
          borderColor: 'var(--wf-gallery-border)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b pb-4" style={{ borderColor: 'var(--wf-gallery-border)' }}>
          <div>
            <p
              className="text-xs uppercase tracking-[0.12em]"
              style={{ fontFamily: 'var(--wf-font-mono)', color: 'var(--wf-gallery-muted)' }}
            >
              Template · {tpl.name}
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              Create Portfolio Project
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="flex h-8 w-8 items-center justify-center border hover:bg-black/5"
            style={{ borderColor: 'var(--wf-gallery-border)' }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label htmlFor="pf-title" className="block text-xs font-semibold uppercase tracking-wider mb-1.5">
              Portfolio Title
            </label>
            <input
              id="pf-title"
              type="text"
              placeholder="e.g., Adaora Okafor Portfolio"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-[4px] border px-3 py-2.5 text-sm outline-none focus:border-[#D94E28]"
              style={{
                backgroundColor: '#FFFFFF',
                borderColor: 'var(--wf-gallery-border)',
              }}
              autoFocus
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="pf-name" className="block text-xs font-semibold uppercase tracking-wider mb-1.5">
                Your Name
              </label>
              <input
                id="pf-name"
                type="text"
                placeholder="e.g., Adaora Okafor"
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                className="w-full rounded-[4px] border px-3 py-2.5 text-sm outline-none focus:border-[#D94E28]"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderColor: 'var(--wf-gallery-border)',
                }}
              />
            </div>
            <div>
              <label htmlFor="pf-role" className="block text-xs font-semibold uppercase tracking-wider mb-1.5">
                Primary Role / Headline
              </label>
              <input
                id="pf-role"
                type="text"
                placeholder="e.g., Product Designer"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                className="w-full rounded-[4px] border px-3 py-2.5 text-sm outline-none focus:border-[#D94E28]"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderColor: 'var(--wf-gallery-border)',
                }}
              />
            </div>
          </div>

          <fieldset className="space-y-2.5 pt-1">
            <legend className="text-xs font-semibold uppercase tracking-wider mb-1">
              Starting Content
            </legend>
            <label
              className="flex items-start gap-3 rounded-[4px] border p-3 cursor-pointer"
              style={{
                borderColor: populateSample ? '#161618' : 'var(--wf-gallery-border)',
                backgroundColor: populateSample ? '#FFFFFF' : 'transparent',
              }}
            >
              <input
                type="radio"
                name="seedMode"
                checked={populateSample}
                onChange={() => setPopulateSample(true)}
                className="mt-1 accent-[#D94E28]"
              />
              <div>
                <div className="text-sm font-semibold">Populate with realistic sample content</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--wf-gallery-muted)' }}>
                  Includes 4 complete case studies, experience timeline, skills, and art-directed photography.
                </div>
              </div>
            </label>

            <label
              className="flex items-start gap-3 rounded-[4px] border p-3 cursor-pointer"
              style={{
                borderColor: !populateSample ? '#161618' : 'var(--wf-gallery-border)',
                backgroundColor: !populateSample ? '#FFFFFF' : 'transparent',
              }}
            >
              <input
                type="radio"
                name="seedMode"
                checked={!populateSample}
                onChange={() => setPopulateSample(false)}
                className="mt-1 accent-[#D94E28]"
              />
              <div>
                <div className="text-sm font-semibold">Start lean with my intro</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--wf-gallery-muted)' }}>
                  Begins with your personalized intro and 2 starter project slots ready to replace.
                </div>
              </div>
            </label>
          </fieldset>

          {error && (
            <p className="text-xs font-medium text-[#D94E28]" role="alert">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 border-t pt-5" style={{ borderColor: 'var(--wf-gallery-border)' }}>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border px-4 py-2 text-xs font-medium hover:bg-black/5"
              style={{ borderColor: 'var(--wf-gallery-border)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full px-5 py-2 text-xs font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: '#161618', color: '#F4F3EF' }}
            >
              {submitting ? 'Creating...' : 'Open in Studio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
