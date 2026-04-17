'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { signIn } from 'next-auth/react';

type DiscoverResponse = { mode: 'password' } | { mode: 'sso'; providerId: string };
type CredentialStatusResponse = { accountExists: boolean; error?: string };

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'email' | 'password'>('email');
  const [providerId, setProviderId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mode === 'password') {
      passwordInputRef.current?.focus();
    }
  }, [mode]);

  async function resolveCredentialErrorMessage(): Promise<string> {
    try {
      // UX requirement: differentiate "account not found" from bad password
      // without changing credentials sign-in semantics.
      const response = await fetch('/api/auth/credentials-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const payload = (await response.json()) as CredentialStatusResponse;
      if (response.ok) {
        return payload.accountExists ? 'Incorrect password.' : 'Account not found.';
      }
    } catch {
      // Fallback below
    }
    return 'Invalid email or password.';
  }

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

    setError(await resolveCredentialErrorMessage());
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

  function goBackToEmailStep() {
    setMode('email');
    setPassword('');
    setShowPassword(false);
    setError('');
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white border border-gray-200 rounded-xl p-8 space-y-4">
        <div className="pb-3 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logos/plrei-mark.svg" alt="PLREI logo" className="h-8 w-8 object-contain" />
            <h1 className="text-2xl font-semibold">PLREI Sign In</h1>
          </div>
          <p className="text-sm text-gray-600">Power Line Rent-E-Quip, Inc. account access</p>
        </div>

        {mode === 'email' && (
          <form className="space-y-4" onSubmit={onEmailSubmit}>
            <label className="block">
              <span className="block mb-1">Email</span>
              <input
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                type="email"
                name="email"
                autoComplete="email"
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
              <div className="relative">
                <input
                  ref={passwordInputRef}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 pr-24"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs rounded border border-gray-300 bg-white"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </label>
            <div className="flex items-center gap-3">
              <button type="button" onClick={goBackToEmailStep} className="px-4 py-2 rounded border border-gray-300" disabled={submitting}>
                Back
              </button>
              <button className="px-4 py-2 rounded bg-plrei-navy text-white disabled:opacity-50" disabled={submitting}>
                {submitting ? 'Signing In...' : 'Sign In'}
              </button>
            </div>
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
