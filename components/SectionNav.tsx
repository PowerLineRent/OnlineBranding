'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview' },
  { id: 'logo', label: 'Logo' },
  { id: 'colors', label: 'Colors' },
  { id: 'typography', label: 'Typography' },
  { id: 'iconography', label: 'Iconography' },
  { id: 'applications', label: 'Applications' },
];

export default function SectionNav() {
  const [active, setActive] = useState('overview');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        }
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );

    NAV_ITEMS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-plrei-bg-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-3 text-plrei-navy font-bold text-lg tracking-tight hover:opacity-80 transition-opacity">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logos/plrei-mark.svg" alt="" className="h-8 w-auto" />
          <span className="hidden sm:block">Brand Guidelines</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                active === id
                  ? 'bg-plrei-bg-light text-plrei-navy'
                  : 'text-gray-600 hover:text-plrei-navy hover:bg-gray-50'
              }`}
            >
              {label}
            </a>
          ))}
          <a
            href="/email-signature"
            className="ml-3 px-4 py-1.5 rounded-md text-sm font-semibold bg-plrei-navy text-white hover:bg-plrei-navy-hover transition-colors"
          >
            Signature Tool
          </a>
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="md:hidden p-2 rounded-md text-gray-600 hover:text-plrei-navy"
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-plrei-bg-border bg-white">
          {NAV_ITEMS.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={() => setMenuOpen(false)}
              className="block px-6 py-3 text-sm text-gray-700 hover:bg-plrei-bg-light hover:text-plrei-navy"
            >
              {label}
            </a>
          ))}
          <a
            href="/email-signature"
            className="block px-6 py-3 text-sm font-semibold text-plrei-navy border-t border-plrei-bg-border"
          >
            Signature Tool →
          </a>
        </div>
      )}
    </header>
  );
}
