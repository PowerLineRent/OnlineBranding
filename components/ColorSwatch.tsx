'use client';

import { useState } from 'react';

interface ColorSwatchProps {
  name: string;
  hex: string;
  usage: string;
  light?: boolean;
}

export default function ColorSwatch({ name, hex, usage, light = false }: ColorSwatchProps) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      onClick={copy}
      title={`Copy ${hex}`}
      className="group text-left rounded-xl overflow-hidden border border-plrei-bg-border hover:shadow-md transition-shadow w-full"
    >
      <div
        className="h-24 w-full flex items-end justify-end p-2"
        style={{ backgroundColor: hex }}
      >
        <span
          className={`text-xs font-mono px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
            light ? 'bg-black/10 text-black' : 'bg-white/20 text-white'
          }`}
        >
          {copied ? 'Copied!' : 'Copy'}
        </span>
      </div>
      <div className="bg-white p-3">
        <div className="font-semibold text-sm text-gray-900">{name}</div>
        <div className="font-mono text-xs text-gray-500 mb-1">{hex}</div>
        <div className="text-xs text-plrei-text-body">{usage}</div>
      </div>
    </button>
  );
}
