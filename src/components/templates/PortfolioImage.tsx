import React, { useState } from 'react';
import type { ImageAssetRef } from '../../types/portfolio';
import { resolveImageSrc } from '../../utils/imagePipeline';

interface PortfolioImageProps {
  image: ImageAssetRef;
  assetMap: Record<string, string>;
  className?: string;
  style?: React.CSSProperties;
  fallbackTitle?: string;
}

export const PortfolioImage: React.FC<PortfolioImageProps> = ({
  image,
  assetMap,
  className = '',
  style,
  fallbackTitle,
}) => {
  const [failed, setFailed] = useState(false);
  const resolved = resolveImageSrc(image.src, assetMap);

  if (!resolved || failed) {
    return (
      <div
        className={`flex items-center justify-center p-4 text-center ${className}`}
        style={{
          backgroundColor: 'var(--tpl-surface, #222)',
          color: 'var(--tpl-muted, #999)',
          border: '1px solid var(--tpl-border, rgba(128,128,128,0.2))',
          ...style,
        }}
        role="img"
        aria-label={image.alt || fallbackTitle || 'Portfolio media'}
      >
        <span className="text-xs tracking-wide opacity-75">
          {fallbackTitle || image.alt || 'Image Frame'}
        </span>
      </div>
    );
  }

  return (
    <img
      src={resolved}
      alt={image.alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
      style={{
        objectFit: 'cover',
        objectPosition: `${image.focalPoint.x}% ${image.focalPoint.y}%`,
        ...style,
      }}
    />
  );
};
