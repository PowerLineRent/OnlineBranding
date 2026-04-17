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
      className="group flex flex-col w-full appearance-none rounded-xl overflow-hidden ring-1 ring-plrei-bg-border bg-white p-0 m-0 text-left hover:shadow-md transition-shadow"
    >
      <div
        className="h-24 w-full flex items-end justify-end p-2 border-b border-plrei-bg-border"
        style={{
          backgroundColor: hex,
        }}
      >
        <span
          className={`px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
            light ? 'bg-black/10 text-black' : 'bg-white/20 text-white'
          }`}
        >
          {copied ? 'Copied!' : 'Copy'}
        </span>
      </div>
      <div className="bg-white p-3">
        <div className="text-xl font-extrabold leading-tight mb-1" style={{ color: '#000080' }}>{name}</div>
        <div className="text-base font-semibold mb-2" style={{ color: '#3F4042' }}>{hex}</div>
        <div className="text-base leading-relaxed" style={{ color: '#4A4A4B' }}>{usage}</div>
      </div>
    </button>
  );
}


