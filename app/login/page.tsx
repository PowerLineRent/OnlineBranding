'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { EyeClosedIcon, EyeOpenIcon } from '@radix-ui/react-icons';
import { signIn } from 'next-auth/react';
import { PasswordToggleField } from '@/components/PasswordToggleField';

type DiscoverResponse = { mode: 'password' } | { mode: 'sso'; providerId: string };
type CredentialStatusResponse = { accountExists: boolean; error?: string };

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [mode, setMode] = useState<'email' | 'password'>('email');
  const [providerId, setProviderId] = useState<string | null>(null);
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
    const passwordValue = passwordInputRef.current?.value ?? '';

    const result = (await signIn('credentials', {
      email,
      password: passwordValue,
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
    setError('');
  }

  return (
    <main className="min-h-screen bg-[#f3f4f6] flex items-center justify-center p-6">
      <div className="w-full max-w-3xl -translate-y-14">
        <div className="mb-8 flex flex-col items-center text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logos/plrei-primary.svg"
            alt="Power Line Rent-E-Quip, Inc. Primary Lockup (Blue)"
            className="mb-5 h-40 w-auto max-w-[min(94vw,760px)] object-contain"
            onError={(event) => {
              event.currentTarget.src = '/logos/plrei-primary.png';
            }}
          />
          <h1
            className="max-w-2xl"
            style={{ margin: 0, marginBottom: '12px', fontSize: '42px', fontWeight: 800, lineHeight: 1.08, color: '#000080', hyphens: 'none' }}
          >
            Power Line <span className="whitespace-nowrap">Rent-E-Quip</span>, Inc. Brand Reference
          </h1>
          <p className="mt-2 text-lg text-slate-600">Sign in to your account</p>
        </div>

        <div className="mx-auto max-w-md space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {mode === 'email' && (
            <form className="space-y-4" onSubmit={onEmailSubmit}>
              <label className="block">
                <span className="mb-2 block text-base font-medium text-slate-800">Email</span>
                <input
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-base text-slate-900 outline-none transition focus:border-[#000080] focus:ring-2 focus:ring-[#000080]/20"
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
                className="w-full rounded-xl bg-[#000080] px-4 py-2.5 text-base font-semibold text-white transition hover:bg-[#000066] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={submitting}
              >
                {submitting ? 'Checking...' : 'Continue'}
              </button>
            </form>
          )}

          {mode === 'password' && (
            <form className="space-y-4" onSubmit={onPasswordSubmit}>
              <div>
                <button
                  type="button"
                  onClick={goBackToEmailStep}
                  className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-[#000080] hover:text-[#000080] hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={submitting}
                >
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path
                      d="M8.84182 3.13514C9.04327 3.32401 9.05348 3.64042 8.86462 3.84188L5.43521 7.49991L8.86462 11.1579C9.05348 11.3594 9.04327 11.6758 8.84182 11.8647C8.64036 12.0535 8.32394 12.0433 8.13508 11.8419L4.38508 7.84188C4.20477 7.64955 4.20477 7.35027 4.38508 7.15794L8.13508 3.15794C8.32394 2.95648 8.64036 2.94628 8.84182 3.13514Z"
                      fill="currentColor"
                      fillRule="evenodd"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Back</span>
                </button>
              </div>
              <label className="block">
                <span className="mb-2 block text-base font-medium text-slate-800">Email</span>
                <input
                  className="w-full rounded-xl border border-slate-300 bg-slate-100 px-4 py-2.5 text-base text-slate-700"
                  type="email"
                  value={email}
                  readOnly
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-base font-medium text-slate-800">Password</span>
                <PasswordToggleField.Root className="relative">
                  <PasswordToggleField.Input
                    ref={passwordInputRef}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 pr-24 text-base text-slate-900 outline-none transition focus:border-[#000080] focus:ring-2 focus:ring-[#000080]/20"
                    name="password"
                    autoComplete="current-password"
                    placeholder="********"
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
              <div className="flex items-center gap-3 pt-1">
                <button
                  className="flex-1 rounded-xl bg-[#000080] px-4 py-2.5 text-base font-semibold text-white transition hover:bg-[#000066] disabled:cursor-not-allowed disabled:opacity-60"
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
