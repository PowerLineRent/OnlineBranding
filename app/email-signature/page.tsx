import type { Metadata } from 'next';
import EmailSignatureGenerator from '@/components/EmailSignatureGenerator';
import SectionNav from '@/components/SectionNav';
import { auth } from '@/lib/auth';
import { isAdminSession } from '@/lib/auth/admin';

export const metadata: Metadata = {
  title: 'Email Signature Generator',
  description:
    'Generate a personalized PLREI email signature for Google Workspace, Microsoft 365, Outlook, and other clients.',
};

interface Props {
  searchParams: Promise<{ s?: string; [key: string]: string | string[] | undefined }>;
}

export default async function EmailSignaturePage({ searchParams }: Props) {
  const session = await auth();
  const params = await searchParams;
  const initialEncoded = typeof params.s === 'string' ? params.s : undefined;

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
            Email Signature Tool
          </h1>
          <p style={{ margin: 0, color: '#E7ECFF', maxWidth: '860px', fontSize: '24px', lineHeight: 1.35 }}>
            Create a compliant signature for Google Workspace, Microsoft 365, Outlook, and other email clients.
          </p>
        </div>
        <div className="h-2" style={{ backgroundColor: '#F5C518' }} />
      </section>

      <div className="flex-1 py-8" style={{ backgroundColor: '#F9FAFB' }}>
        <EmailSignatureGenerator initialEncoded={initialEncoded} />
      </div>

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

