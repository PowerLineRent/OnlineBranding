'use client';

import { useState } from 'react';
import { BRANDING_MEMORY_SUMMARY } from '@/lib/brandingMemorySummary';

export default function BrandingMemoryPanel() {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'error'>('idle');

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(BRANDING_MEMORY_SUMMARY);
      setCopyStatus('success');
      window.setTimeout(() => setCopyStatus('idle'), 2500);
    } catch {
      setCopyStatus('error');
      window.setTimeout(() => setCopyStatus('idle'), 3500);
    }
  }

  return (
    <div className="card">
      <p className="section-body mb-4">
        This memory summary gives AI systems a concise, reusable version of the PLREI guidelines.
        Reference it before generating new brand content to keep outputs compliant and consistent.
      </p>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleCopy}
          className="inline-block rounded px-4 py-2 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#000080] focus-visible:ring-offset-2"
          style={{ backgroundColor: '#F5C518', color: '#000080' }}
        >
          {copyStatus === 'success' ? 'Copied!' : 'Copy Summary'}
        </button>
        {copyStatus === 'error' && (
          <span className="text-sm text-red-700">Clipboard copy failed. Please copy manually from the text box.</span>
        )}
      </div>

      <textarea
        readOnly
        value={BRANDING_MEMORY_SUMMARY}
        className="w-full min-h-[560px] rounded-lg border border-gray-300 bg-gray-100 p-4 text-sm leading-relaxed text-gray-700"
        aria-label="PLREI AI memory guidance"
      />
    </div>
  );
}
