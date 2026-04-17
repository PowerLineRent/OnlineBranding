'use client';

import { useEffect, useMemo, useState } from 'react';

type SsoConfigResponse = {
  google: {
    clientId: string;
    callbackUrl: string;
    scope: string;
    isActive: boolean;
    hasClientSecret: boolean;
  };
  microsoft: {
    tenantId: string;
    clientId: string;
    redirectUri: string;
    scope: string;
    isActive: boolean;
    hasClientSecret: boolean;
  };
};

type UserListResponse = {
  users: Array<{
    id: string;
    email: string;
    role: string;
    lastLoginAt: string | null;
    status: string;
  }>;
};

type SsoFormState = {
  google: {
    clientId: string;
    clientSecret: string;
    callbackUrl: string;
    scope: string;
    isActive: boolean;
    hasClientSecret: boolean;
  };
  microsoft: {
    tenantId: string;
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    scope: string;
    isActive: boolean;
    hasClientSecret: boolean;
  };
};

const initialFormState: SsoFormState = {
  google: {
    clientId: '',
    clientSecret: '',
    callbackUrl: '',
    scope: 'openid profile email',
    isActive: false,
    hasClientSecret: false,
  },
  microsoft: {
    tenantId: '',
    clientId: '',
    clientSecret: '',
    redirectUri: '',
    scope: 'openid profile email',
    isActive: false,
    hasClientSecret: false,
  },
};

function toFormState(payload: SsoConfigResponse): SsoFormState {
  return {
    google: {
      clientId: payload.google.clientId,
      clientSecret: '',
      callbackUrl: payload.google.callbackUrl,
      scope: payload.google.scope,
      isActive: payload.google.isActive,
      hasClientSecret: payload.google.hasClientSecret,
    },
    microsoft: {
      tenantId: payload.microsoft.tenantId,
      clientId: payload.microsoft.clientId,
      clientSecret: '',
      redirectUri: payload.microsoft.redirectUri,
      scope: payload.microsoft.scope,
      isActive: payload.microsoft.isActive,
      hasClientSecret: payload.microsoft.hasClientSecret,
    },
  };
}

function formatLastLogin(value: string | null): string {
  if (!value) return 'Never';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return date.toLocaleString();
}

export default function AdminSsoPortal() {
  const [formState, setFormState] = useState<SsoFormState>(initialFormState);
  const [users, setUsers] = useState<UserListResponse['users']>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [ssoRes, usersRes] = await Promise.all([fetch('/api/admin/sso'), fetch('/api/admin/users')]);
      if (!ssoRes.ok || !usersRes.ok) {
        throw new Error('Unable to load admin data.');
      }
      const ssoPayload = (await ssoRes.json()) as SsoConfigResponse;
      const userPayload = (await usersRes.json()) as UserListResponse;
      setFormState(toFormState(ssoPayload));
      setUsers(userPayload.users);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load admin data.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  const googleCallbackSuggestion = useMemo(
    () => `${typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com'}/api/auth/callback/google`,
    []
  );
  const microsoftCallbackSuggestion = useMemo(
    () => `${typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com'}/api/auth/callback/microsoft`,
    []
  );

  async function saveConfig() {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch('/api/admin/sso', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          google: {
            clientId: formState.google.clientId,
            clientSecret: formState.google.clientSecret || undefined,
            callbackUrl: formState.google.callbackUrl,
            scope: formState.google.scope,
            isActive: formState.google.isActive,
          },
          microsoft: {
            tenantId: formState.microsoft.tenantId,
            clientId: formState.microsoft.clientId,
            clientSecret: formState.microsoft.clientSecret || undefined,
            redirectUri: formState.microsoft.redirectUri,
            scope: formState.microsoft.scope,
            isActive: formState.microsoft.isActive,
          },
        }),
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? 'Unable to save SSO configuration.');
      }
      setSuccess('SSO configuration saved.');
      await loadData();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save SSO configuration.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8">
        <p>Loading administrative settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
      <section className="rounded-xl border border-gray-200 bg-white p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Administrative SSO Configuration</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage Google and Microsoft OAuth credentials here. Secrets are stored encrypted in the database.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <article className="rounded-lg border border-gray-200 p-4 space-y-3">
            <h2 className="text-lg font-semibold">Google OAuth Setup</h2>
            <ol className="list-decimal pl-5 space-y-1 text-sm text-gray-700">
              <li>Open Google Cloud Console and select your project.</li>
              <li>Go to APIs & Services, then Credentials, and create an OAuth 2.0 Client ID (Web application).</li>
              <li>Add an authorized redirect URI: <code>{formState.google.callbackUrl || googleCallbackSuggestion}</code>.</li>
              <li>Copy Client ID and Client Secret into the fields below.</li>
              <li>Recommended scopes: <code>openid profile email</code>.</li>
            </ol>

            <label className="block text-sm">
              <span className="mb-1 block">Client ID</span>
              <input
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={formState.google.clientId}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    google: { ...prev.google, clientId: event.target.value },
                  }))
                }
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block">Client Secret</span>
              <input
                type="password"
                placeholder={formState.google.hasClientSecret ? 'Stored (leave blank to keep current secret)' : ''}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={formState.google.clientSecret}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    google: { ...prev.google, clientSecret: event.target.value },
                  }))
                }
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block">Callback URL</span>
              <input
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={formState.google.callbackUrl}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    google: { ...prev.google, callbackUrl: event.target.value },
                  }))
                }
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block">Scopes</span>
              <input
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={formState.google.scope}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    google: { ...prev.google, scope: event.target.value },
                  }))
                }
              />
            </label>

            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formState.google.isActive}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    google: { ...prev.google, isActive: event.target.checked },
                  }))
                }
              />
              <span>Enable Google SSO</span>
            </label>
          </article>

          <article className="rounded-lg border border-gray-200 p-4 space-y-3">
            <h2 className="text-lg font-semibold">Microsoft Entra ID Setup</h2>
            <ol className="list-decimal pl-5 space-y-1 text-sm text-gray-700">
              <li>Open Microsoft Entra admin center and go to App registrations.</li>
              <li>Create or open the app registration used for PLREI authentication.</li>
              <li>Copy Directory (tenant) ID, Application (client) ID, and create a client secret.</li>
              <li>Add a web redirect URI: <code>{formState.microsoft.redirectUri || microsoftCallbackSuggestion}</code>.</li>
              <li>Recommended scopes: <code>openid profile email</code>.</li>
            </ol>

            <label className="block text-sm">
              <span className="mb-1 block">Tenant ID</span>
              <input
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={formState.microsoft.tenantId}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    microsoft: { ...prev.microsoft, tenantId: event.target.value },
                  }))
                }
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block">Client ID</span>
              <input
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={formState.microsoft.clientId}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    microsoft: { ...prev.microsoft, clientId: event.target.value },
                  }))
                }
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block">Client Secret</span>
              <input
                type="password"
                placeholder={formState.microsoft.hasClientSecret ? 'Stored (leave blank to keep current secret)' : ''}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={formState.microsoft.clientSecret}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    microsoft: { ...prev.microsoft, clientSecret: event.target.value },
                  }))
                }
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block">Redirect URI</span>
              <input
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={formState.microsoft.redirectUri}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    microsoft: { ...prev.microsoft, redirectUri: event.target.value },
                  }))
                }
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block">Scopes</span>
              <input
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={formState.microsoft.scope}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    microsoft: { ...prev.microsoft, scope: event.target.value },
                  }))
                }
              />
            </label>

            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formState.microsoft.isActive}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    microsoft: { ...prev.microsoft, isActive: event.target.checked },
                  }))
                }
              />
              <span>Enable Microsoft SSO</span>
            </label>
          </article>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={saveConfig}
            disabled={saving}
            className="px-4 py-2 rounded bg-plrei-navy text-white disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
          {success && <span className="text-sm text-green-700">{success}</span>}
          {error && <span className="text-sm text-red-700">{error}</span>}
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-xl font-semibold mb-4">User List</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Role</th>
                <th className="py-2 pr-4">Last Login</th>
                <th className="py-2 pr-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-100">
                  <td className="py-2 pr-4">{user.email}</td>
                  <td className="py-2 pr-4">{user.role}</td>
                  <td className="py-2 pr-4">{formatLastLogin(user.lastLoginAt)}</td>
                  <td className="py-2 pr-4">{user.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
