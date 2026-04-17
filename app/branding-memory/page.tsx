import type { Metadata } from 'next';
import SectionNav from '@/components/SectionNav';
import BrandingMemoryPanel from '@/components/BrandingMemoryPanel';
import { auth } from '@/lib/auth';
import { isAdminSession } from '@/lib/auth/admin';

export const metadata: Metadata = {
  title: 'Branding Memory Summary',
  description: 'AI-friendly PLREI branding memory summary for consistent and compliant output generation.',
};

export default async function BrandingMemoryPage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SectionNav
        showOverview={Boolean(session?.user)}
        userEmail={session?.user?.email ?? undefined}
        userName={session?.user?.name ?? undefined}
        isAdmin={isAdminSession(session)}
      />

      <section style={{ backgroundColor: '#000080' }}>
        <div className="max-w-5xl mx-auto px-6 py-14" style={{ color: '#FFFFFF' }}>
          <a
            href="/"
            className="mb-5 inline-flex items-center gap-2 rounded border px-3 py-1.5 text-sm font-semibold transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#000080]"
            style={{ borderColor: '#F5C518', color: '#F5C518' }}
          >
            <span aria-hidden="true">←</span>
            <span>Back To Home</span>
          </a>
          <h1 style={{ margin: 0, marginBottom: '12px', fontSize: '42px', fontWeight: 800, lineHeight: 1.08, color: '#F5C518' }}>
            Branding Memory Summary
          </h1>
          <p style={{ margin: 0, color: '#E7ECFF', maxWidth: '860px', fontSize: '24px', lineHeight: 1.35 }}>
            AI-ready condensed guidelines for consistent brand-compliant implementation.
          </p>
        </div>
        <div className="h-2" style={{ backgroundColor: '#F5C518' }} />
      </section>

      <main className="flex-1 border-b border-plrei-bg-border">
        <div className="max-w-5xl mx-auto px-6 py-14">
          <p className="section-label">05 - Applications</p>
          <h2 className="section-title">Branding Memory</h2>
          <BrandingMemoryPanel />
        </div>
      </main>

      <footer>
        <div className="h-2" style={{ backgroundColor: '#F5C518' }} />
        <div style={{ backgroundColor: '#000080', color: '#FFFFFF' }}>
          <div className="max-w-5xl mx-auto px-6 py-6">
            Official brand compliance reference. (c) {new Date().getFullYear()} Power Line Rent-E-Quip, Inc.
          </div>
        </div>
      </footer>
    </div>
  );
}
