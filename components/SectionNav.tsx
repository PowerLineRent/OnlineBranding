'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '@/app/actions/auth';

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview' },
] as const;

interface SectionNavProps {
  showOverview?: boolean;
  userEmail?: string;
  isAdmin?: boolean;
}

export default function SectionNav({ showOverview = true, userEmail, isAdmin = false }: SectionNavProps) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const [active, setActive] = useState('overview');
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navItems = showOverview ? NAV_ITEMS : [];

  useEffect(() => {
    if (!isHomePage) {
      return;
    }

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
      if (!showOverview) {
        return;
      }
      const el = document.getElementById(id);
      if (el) {
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }, [isHomePage, showOverview]);

  useEffect(() => {
    if (!dropdownOpen) return;
    function handleOutsideClick(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [dropdownOpen]);

  return (
    <header className="sticky top-0 z-50 bg-white border-b-4" style={{ borderBottomColor: '#F5C518' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <Link
          href="/"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logos/plrei-mark.svg" alt="PLREI Mark" className="h-8 w-auto" />
          <span className="hidden sm:block">Brand Guidelines</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(({ id, label }) => (
            <a
              key={id}
              href="/"
              className={`px-3 py-1.5 rounded-md transition-colors ${
                isHomePage && active === id
                  ? 'bg-plrei-bg-light'
                  : 'hover:bg-gray-50'
              }`}
            >
              {label}
            </a>
          ))}
          <a
            href="/email-signature"
            className="ml-3 px-4 py-1.5 rounded-md transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#F5C518' }}
          >
            Signature Tool
          </a>
          {isAdmin && (
            <a
              href="/admin/sso"
              className="ml-2 px-4 py-1.5 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Administrative
            </a>
          )}

          {userEmail && (
            <div className="relative ml-3" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-gray-50 transition-colors max-w-[180px]"
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="truncate text-sm">{userEmail}</span>
                <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-1 w-56 bg-white border border-gray-200 rounded-md shadow-sm z-50 overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-gray-100">
                    <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                  </div>
                  {isAdmin && (
                    <a
                      href="/admin/sso"
                      className="block w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors border-b border-gray-100"
                    >
                      Administrative
                    </a>
                  )}
                  <form action={logout}>
                    <button
                      type="submit"
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                    >
                      Sign out
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </nav>

        <button
          onClick={() => setMenuOpen((value) => !value)}
          className="md:hidden p-2 rounded-md"
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

      {menuOpen && (
        <div className="md:hidden border-t border-plrei-bg-border bg-white">
          {navItems.map(({ id, label }) => (
            <a
              key={id}
              href="/"
              onClick={() => setMenuOpen(false)}
              className="block px-6 py-3 hover:bg-plrei-bg-light"
            >
              {label}
            </a>
          ))}
          <a
            href="/email-signature"
            className="block px-6 py-3 border-t border-plrei-bg-border"
          >
            Signature Tool
          </a>
          {isAdmin && (
            <a href="/admin/sso" className="block px-6 py-3 border-t border-plrei-bg-border">
              Administrative
            </a>
          )}
          {userEmail && (
            <>
              <div className="px-6 py-2 border-t border-plrei-bg-border">
                <p className="text-xs text-gray-500 truncate">{userEmail}</p>
              </div>
              <form action={logout}>
                <button
                  type="submit"
                  className="block w-full text-left px-6 py-3 hover:bg-gray-50 transition-colors"
                >
                  Sign out
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </header>
  );
}
