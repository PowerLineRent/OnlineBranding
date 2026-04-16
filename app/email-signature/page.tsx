import type { Metadata } from 'next';
import Link from 'next/link';
import EmailSignatureGenerator from '@/components/EmailSignatureGenerator';

export const metadata: Metadata = {
  title: 'Email Signature Generator',
  description: 'Generate a personalized PLREI email signature for Outlook and Gmail.',
};

interface Props {
  searchParams: Promise<{ s?: string; [key: string]: string | string[] | undefined }>;
}

export default async function EmailSignaturePage({ searchParams }: Props) {
  const params = await searchParams;
  const initialEncoded = typeof params.s === 'string' ? params.s : undefined;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-white border-b border-plrei-bg-border sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logos/plrei-mark.svg" alt="" className="h-7 w-auto" />
            <span className="font-semibold text-plrei-navy text-sm hidden sm:block">PLREI</span>
          </div>
          <Link href="/" className="text-sm text-gray-500 hover:text-plrei-navy transition-colors">
            ← Brand Guidelines
          </Link>
        </div>
      </header>

      <EmailSignatureGenerator initialEncoded={initialEncoded} />
    </div>
  );
}
