import React, { useEffect, useRef, useState } from 'react';

interface EditableTextProps {
  value: string;
  onCommit?: (next: string) => void;
  canEdit: boolean;
  multiline?: boolean;
  className?: string;
  style?: React.CSSProperties;
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'p' | 'div';
  ariaLabel?: string;
}

export const EditableText: React.FC<EditableTextProps> = ({
  value,
  onCommit,
  canEdit,
  multiline = false,
  className = '',
  style,
  as: Tag = 'span',
  ariaLabel,
}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  if (!canEdit || !onCommit) {
    return (
      <Tag className={className} style={style}>
        {value}
      </Tag>
    );
  }

  if (editing) {
    const commit = () => {
      setEditing(false);
      const trimmed = draft;
      if (trimmed !== value) {
        onCommit(trimmed);
      }
    };

    const sharedStyle: React.CSSProperties = {
      ...style,
      background: 'rgba(217, 78, 40, 0.12)',
      color: 'inherit',
      font: 'inherit',
      letterSpacing: 'inherit',
      lineHeight: 'inherit',
      textTransform: 'inherit',
      textAlign: 'inherit',
      outline: '1.5px solid #D94E28',
      borderRadius: '2px',
      padding: '0 4px',
      margin: '0 -4px',
      width: '100%',
    };

    if (multiline) {
      return (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={draft}
          aria-label={ariaLabel || 'Edit text'}
          rows={Math.max(2, Math.min(6, Math.ceil(draft.length / 55)))}
          onChange={(e) => {
            setDraft(e.target.value);
            onCommit(e.target.value);
          }}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setDraft(value);
              setEditing(false);
            }
          }}
          onClick={(e) => e.stopPropagation()}
          className={`${className} resize-none`}
          style={sharedStyle}
        />
      );
    }

    return (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type="text"
        value={draft}
        aria-label={ariaLabel || 'Edit text'}
        onChange={(e) => {
          setDraft(e.target.value);
          onCommit(e.target.value);
        }}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            commit();
          } else if (e.key === 'Escape') {
            setDraft(value);
            setEditing(false);
          }
        }}
        onClick={(e) => e.stopPropagation()}
        className={className}
        style={sharedStyle}
      />
    );
  }

  return (
    <Tag
      className={`${className} transition-[outline] duration-150 hover:outline hover:outline-1 hover:outline-dashed hover:outline-[#D94E28]/70 cursor-text`}
      style={style}
      title="Click to edit text inline"
      onClick={(e: React.MouseEvent) => {
        e.stopPropagation();
        setEditing(true);
      }}
    >
      {value}
    </Tag>
  );
};
