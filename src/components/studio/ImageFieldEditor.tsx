import React, { useRef, useState } from 'react';
import { Crosshair, Upload } from 'lucide-react';
import type { ImageAssetRef, StoredAsset } from '../../types/portfolio';
import { processUploadedImageFile, resolveImageSrc } from '../../utils/imagePipeline';

interface ImageFieldEditorProps {
  label: string;
  portfolioId: string;
  value: ImageAssetRef;
  assetMap: Record<string, string>;
  onRegisterAsset: (asset: StoredAsset) => Promise<void>;
  onChange: (next: ImageAssetRef) => void;
}

export const ImageFieldEditor: React.FC<ImageFieldEditorProps> = ({
  label,
  portfolioId,
  value,
  assetMap,
  onRegisterAsset,
  onChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const resolvedSrc = resolveImageSrc(value.src, assetMap);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const { asset, assetRef } = await processUploadedImageFile(file, portfolioId);
      await onRegisterAsset(asset);
      onChange({
        ...value,
        src: assetRef,
        alt: value.alt || file.name.replace(/\.[^.]+$/, ''),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process image.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const updateFocalFromPointer = (clientX: number, clientY: number) => {
    const rect = pickerRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return;
    const x = Math.round(Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100)));
    const y = Math.round(Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100)));
    onChange({ ...value, focalPoint: { x, y } });
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium" style={{ color: 'var(--wf-ink-secondary)' }}>
          {label}
        </span>
        <span
          className="text-[11px] tabular-nums"
          style={{ fontFamily: 'var(--wf-font-mono)', color: 'var(--wf-ink-muted)' }}
        >
          Focal {value.focalPoint.x}% · {value.focalPoint.y}%
        </span>
      </div>

      {/* Interactive Focal Point Crosshair Picker */}
      <div
        ref={pickerRef}
        onPointerDown={(e) => {
          setDragging(true);
          (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
          updateFocalFromPointer(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => {
          if (dragging) updateFocalFromPointer(e.clientX, e.clientY);
        }}
        onPointerUp={() => setDragging(false)}
        role="slider"
        aria-label={`${label} focal point picker`}
        aria-valuetext={`${value.focalPoint.x}% horizontal, ${value.focalPoint.y}% vertical`}
        tabIndex={0}
        className="relative aspect-[16/10] w-full overflow-hidden rounded-[4px] border cursor-crosshair select-none"
        style={{
          borderColor: 'var(--wf-chrome-border)',
          backgroundColor: 'var(--wf-chrome-input)',
        }}
      >
        {resolvedSrc ? (
          <img
            src={resolvedSrc}
            alt={value.alt || label}
            referrerPolicy="no-referrer"
            draggable={false}
            className="h-full w-full object-cover pointer-events-none"
            style={{
              objectPosition: `${value.focalPoint.x}% ${value.focalPoint.y}%`,
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs" style={{ color: 'var(--wf-ink-muted)' }}>
            No image selected
          </div>
        )}

        {/* Crosshair indicator */}
        <div
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${value.focalPoint.x}%`,
            top: `${value.focalPoint.y}%`,
          }}
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#D94E28] shadow">
            <Crosshair className="h-3 w-3 text-white" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          aria-label={`Upload ${label}`}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-1.5 rounded-[4px] border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-white/10 disabled:opacity-50"
          style={{
            borderColor: 'var(--wf-chrome-border)',
            backgroundColor: 'var(--wf-chrome-input)',
            color: 'var(--wf-ink-primary)',
          }}
        >
          <Upload className="h-3.5 w-3.5" />
          <span>{uploading ? 'Optimizing...' : 'Replace Image'}</span>
        </button>

        <input
          type="text"
          value={value.alt}
          onChange={(e) => onChange({ ...value, alt: e.target.value })}
          placeholder="Accessible alt description"
          aria-label={`${label} alt text`}
          className="flex-1 rounded-[4px] border px-2.5 py-1.5 text-xs outline-none focus:border-[#D94E28]"
          style={{
            borderColor: 'var(--wf-chrome-border)',
            backgroundColor: 'var(--wf-chrome-input)',
            color: 'var(--wf-ink-primary)',
          }}
        />
      </div>

      {error && (
        <p className="text-xs text-[#D94E28]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};
