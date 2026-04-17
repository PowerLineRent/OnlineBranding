'use client';

import { FormEvent, useState } from 'react';
import { signIn } from 'next-auth/react';

type DiscoverResponse = { mode: 'password' } | { mode: 'sso'; providerId: string };

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'email' | 'password'>('email');
  const [providerId, setProviderId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function onEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setProviderId(null);

    try {
      const response = await fetch('/api/auth/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const payload = (await response.json()) as DiscoverResponse & { error?: string };
      if (!response.ok) {
        setError(payload.error ?? 'Unable to continue sign in.');
        setSubmitting(false);
        return;
      }

      if (payload.mode === 'password') {
        setMode('password');
        setSubmitting(false);
        return;
      }

      setProviderId(payload.providerId);
      const result = (await signIn(payload.providerId, {
        callbackUrl: '/',
        login_hint: email,
      })) as { error?: string } | undefined;
      if (result?.error) {
        setError('Single sign-on redirect failed. Use retry below.');
        setSubmitting(false);
      }
    } catch {
      setError('Unable to continue sign in.');
      setSubmitting(false);
    }
  }

  async function onPasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    const result = (await signIn('credentials', {
      email,
      password,
      redirect: false,
    })) as { ok?: boolean; error?: string } | undefined;

    if (result?.ok) {
      window.location.assign('/');
      return;
    }

    setError('Invalid email or password.');
    setSubmitting(false);
  }

  async function retrySso() {
    if (!providerId) return;
    setSubmitting(true);
    setError('');
    const result = (await signIn(providerId, {
      callbackUrl: '/',
      login_hint: email,
    })) as { error?: string } | undefined;
    if (result?.error) {
      setError('Single sign-on redirect failed.');
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white border border-gray-200 rounded-xl p-8 space-y-4">
        <h1 className="text-2xl font-semibold">Sign In</h1>
        {mode === 'email' && (
          <form className="space-y-4" onSubmit={onEmailSubmit}>
            <label className="block">
              <span className="block mb-1">Email</span>
              <input
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <button className="px-4 py-2 rounded bg-plrei-navy text-white disabled:opacity-50" disabled={submitting}>
              {submitting ? 'Checking...' : 'Continue'}
            </button>
          </form>
        )}

        {mode === 'password' && (
          <form className="space-y-4" onSubmit={onPasswordSubmit}>
            <label className="block">
              <span className="block mb-1">Email</span>
              <input className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50" type="email" value={email} readOnly />
            </label>
            <label className="block">
              <span className="block mb-1">Password</span>
              <input
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
            <button className="px-4 py-2 rounded bg-plrei-navy text-white disabled:opacity-50" disabled={submitting}>
              {submitting ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        )}

        {providerId && !submitting && (
          <button onClick={retrySso} className="px-4 py-2 rounded border border-plrei-navy">
            Retry SSO Redirect
          </button>
        )}

        {error && <p className="text-red-700">{error}</p>}
      </div>
    </main>
  );
}
