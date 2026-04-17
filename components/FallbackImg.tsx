'use client';

import type { SyntheticEvent } from 'react';

type FallbackImgProps = {
  src: string;
  fallbackSrc?: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
};

export default function FallbackImg({
  src,
  fallbackSrc,
  alt,
  width,
  height,
  className,
}: FallbackImgProps) {
  const handleError = (event: SyntheticEvent<HTMLImageElement>) => {
    if (!fallbackSrc) return;

    const img = event.currentTarget;
    if (img.src !== fallbackSrc) {
      img.src = fallbackSrc;
    }
  };

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} width={width} height={height} className={className} onError={handleError} />;
}
