import Link from 'next/link';

const reasonMap: Record<string, string> = {
  missing: 'The link is missing required security parameters.',
  missing_signature: 'The link is missing the signature payload.',
  missing_hash: 'The link is missing the signature hash.',
  invalid_base64: 'The signature payload is not valid.',
  malformed_json: 'The signature payload is malformed.',
  hash_mismatch: 'The signature hash did not match the payload.',
  invalid: 'The secure link is invalid.',
};

export default async function InvalidLinkPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const params = await searchParams;
  const reason = (params.reason ?? 'invalid').toLowerCase();
  const message = reasonMap[reason] ?? reasonMap.invalid;

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-white border border-gray-200 rounded-xl p-8">
        <h1 className="text-xl font-semibold mb-3">Invalid Secure Link</h1>
        <p className="mb-6">{message}</p>
        <p className="mb-6">Request a fresh link from the PLREI signature system and try again.</p>
        <Link href="/" className="inline-block px-4 py-2 rounded bg-plrei-navy text-white">
          Back To Home
        </Link>
      </div>
    </main>
  );
}
