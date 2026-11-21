import React from 'react';
import type { SectionId } from '../../types/portfolio';

interface SectionShellProps {
  sectionId: SectionId;
  indexNumber: string;
  label: string;
  interactiveMode: 'gallery-thumb' | 'studio' | 'preview';
  selectedSectionId?: SectionId;
  onSelectSection?: (id: SectionId) => void;
  children: React.ReactNode;
}

export const SectionShell: React.FC<SectionShellProps> = ({
  sectionId,
  indexNumber,
  label,
  interactiveMode,
  selectedSectionId,
  onSelectSection,
  children,
}) => {
  const isStudio = interactiveMode === 'studio';
  const isSelected = isStudio && selectedSectionId === sectionId;

  return (
    <div
      id={sectionId}
      className="wf-section-wrapper"
      data-section-id={sectionId}
      data-studio-interactive={isStudio ? 'true' : 'false'}
      data-studio-selected={isSelected ? 'true' : 'false'}
      onClick={
        isStudio && onSelectSection
          ? (e) => {
              e.stopPropagation();
              onSelectSection(sectionId);
            }
          : undefined
      }
    >
      {isSelected && (
        <div
          className="pointer-events-none absolute top-2 left-2 z-40 flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-medium tracking-wide text-white shadow-sm"
          style={{
            backgroundColor: '#D94E28',
            fontFamily: "var(--wf-font-mono, 'IBM Plex Mono', monospace)",
            borderRadius: '2px',
          }}
        >
          <span className="tabular-nums">{indexNumber}</span>
          <span>·</span>
          <span style={{ fontFamily: 'var(--wf-font-sans)' }}>{label}</span>
        </div>
      )}
      {children}
    </div>
  );
};
