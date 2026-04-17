'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { EyeClosedIcon, EyeOpenIcon } from '@radix-ui/react-icons';
import { signIn } from 'next-auth/react';
import { PasswordToggleField } from '@/components/PasswordToggleField';

type DiscoverResponse = { mode: 'password' } | { mode: 'sso'; providerId: string };
type CredentialStatusResponse = { accountExists: boolean; error?: string };

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'email' | 'password'>('email');
  const [providerId, setProviderId] = useState<string | null>(null);
  const [logoSrc, setLogoSrc] = useState('/logos/plrei-mark.svg');
  const [hideLogo, setHideLogo] = useState(false);
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
    setError('');
  }

  return (
    <main className="min-h-screen bg-[#f3f4f6] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current" strokeWidth="2">
              <rect x="4" y="10" width="16" height="10" rx="2" />
              <path d="M8 10V7a4 4 0 018 0v3" />
            </svg>
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900">Access Portal</h1>
          <p className="mt-2 text-lg text-slate-600">Sign in to your account</p>
          {!hideLogo && (
            <div className="mt-4 flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoSrc}
                alt="PLREI logo"
                className="h-5 w-5 object-contain"
                onError={() => {
                  if (logoSrc !== '/logos/plrei-mark.png') {
                    setLogoSrc('/logos/plrei-mark.png');
                    return;
                  }
                  setHideLogo(true);
                }}
              />
              <span className="text-xs font-medium tracking-wide text-slate-700">Power Line Rent-E-Quip, Inc.</span>
            </div>
          )}
        </div>

        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {mode === 'email' && (
            <form className="space-y-4" onSubmit={onEmailSubmit}>
              <label className="block">
                <span className="mb-2 block text-xl font-medium text-slate-800">Email</span>
                <input
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-lg text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>
              <button
                className="w-full rounded-xl bg-blue-600 px-4 py-3 text-lg font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={submitting}
              >
                {submitting ? 'Checking...' : 'Continue'}
              </button>
            </form>
          )}

          {mode === 'password' && (
            <form className="space-y-4" onSubmit={onPasswordSubmit}>
              <label className="block">
                <span className="mb-2 block text-xl font-medium text-slate-800">Email</span>
                <input
                  className="w-full rounded-xl border border-slate-300 bg-slate-100 px-4 py-3 text-lg text-slate-700"
                  type="email"
                  value={email}
                  readOnly
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-xl font-medium text-slate-800">Password</span>
                <PasswordToggleField.Root className="relative">
                  <PasswordToggleField.Input
                    ref={passwordInputRef}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-24 text-lg text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    name="password"
                    autoComplete="current-password"
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <PasswordToggleField.Toggle className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center rounded-md border border-slate-300 bg-slate-100 p-1.5 text-slate-700 transition hover:bg-slate-200">
                    <PasswordToggleField.Icon
                      visible={<EyeOpenIcon className="h-4 w-4" />}
                      hidden={<EyeClosedIcon className="h-4 w-4" />}
                    />
                  </PasswordToggleField.Toggle>
                </PasswordToggleField.Root>
              </label>
              <div className="flex items-center justify-end">
                <span className="text-sm text-blue-600">Forgot password?</span>
              </div>
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={goBackToEmailStep}
                  className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={submitting}
                >
                  Back
                </button>
                <button
                  className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-lg font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={submitting}
                >
                  {submitting ? 'Signing In...' : 'Sign In'}
                </button>
              </div>
            </form>
          )}

          {providerId && !submitting && (
            <button
              onClick={retrySso}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Retry SSO Redirect
            </button>
          )}

          {error && <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        </div>
      </div>
    </main>
  );
}
