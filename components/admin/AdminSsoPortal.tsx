'use client';

import { useEffect, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type ProviderRow = {
  providerKey: string;
  type: 'google' | 'microsoft';
  displayName: string;
  clientId: string;
  tenantId: string;
  redirectUri: string;
  scope: string;
  isActive: boolean;
  hasClientSecret: boolean;
};

type DomainMappingRow = {
  id: string;
  domain: string;
  providerKey: string;
  displayName: string | null;
  enforceSso: boolean;
  isActive: boolean;
};

type UserRow = {
  id: string;
  email: string;
  role: string;
  lastLoginAt: string | null;
  status: string;
};

const BLANK_PROVIDER: Omit<ProviderRow, 'hasClientSecret'> & { clientSecret: string } = {
  providerKey: '',
  type: 'microsoft',
  displayName: '',
  clientId: '',
  clientSecret: '',
  tenantId: '',
  redirectUri: '',
  scope: 'openid profile email',
  isActive: false,
};

const BLANK_MAPPING = {
  domain: '',
  providerKey: '',
  displayName: '',
  enforceSso: true,
  isActive: true,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function origin(): string {
  return typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com';
}

function callbackUrl(providerKey: string): string {
  return `${origin()}/api/auth/callback/${providerKey}`;
}

function formatDate(value: string | null): string {
  if (!value) return 'Never';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? 'Unknown' : d.toLocaleString();
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-gray-700">{label}</span>
      {children}
    </label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full border border-gray-300 rounded-md px-3 py-2 text-sm ${props.className ?? ''}`}
    />
  );
}

function Badge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
        active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
      }`}
    >
      {active ? 'Active' : 'Inactive'}
    </span>
  );
}

// ─── Provider form ────────────────────────────────────────────────────────────

type ProviderFormProps = {
  initial?: ProviderRow;
  isNew: boolean;
  providerKeys: string[];
  onSave: () => void;
  onCancel: () => void;
};

function ProviderForm({ initial, isNew, providerKeys, onSave, onCancel }: ProviderFormProps) {
  const [form, setForm] = useState({
    providerKey: initial?.providerKey ?? BLANK_PROVIDER.providerKey,
    type: initial?.type ?? BLANK_PROVIDER.type,
    displayName: initial?.displayName ?? BLANK_PROVIDER.displayName,
    clientId: initial?.clientId ?? BLANK_PROVIDER.clientId,
    clientSecret: '',
    tenantId: initial?.tenantId ?? BLANK_PROVIDER.tenantId,
    redirectUri: initial?.redirectUri ?? BLANK_PROVIDER.redirectUri,
    scope: initial?.scope ?? BLANK_PROVIDER.scope,
    isActive: initial?.isActive ?? BLANK_PROVIDER.isActive,
    hasClientSecret: initial?.hasClientSecret ?? false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const body: Record<string, unknown> = {
      displayName: form.displayName,
      clientId: form.clientId,
      tenantId: form.tenantId || undefined,
      redirectUri: form.redirectUri || undefined,
      scope: form.scope,
      isActive: form.isActive,
    };
    if (form.clientSecret) body.clientSecret = form.clientSecret;

    let res: Response;
    if (isNew) {
      body.providerKey = form.providerKey;
      body.type = form.type;
      if (!body.clientSecret) {
        setError('Client secret is required when creating a new provider.');
        setSaving(false);
        return;
      }
      res = await fetch('/api/admin/sso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } else {
      res = await fetch(`/api/admin/sso/${encodeURIComponent(form.providerKey)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    }

    const json = (await res.json()) as { error?: string };
    if (!res.ok) {
      setError(json.error ?? 'Failed to save provider.');
      setSaving(false);
      return;
    }
    onSave();
  }

  const suggestedCallback = form.providerKey ? callbackUrl(form.providerKey) : '';

  return (
    <form onSubmit={submit} className="space-y-4 p-5 rounded-lg border border-gray-200 bg-gray-50">
      <h3 className="font-semibold text-base">{isNew ? 'New SSO Provider' : `Edit: ${initial?.displayName}`}</h3>

      {isNew && (
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Provider Key">
            <Input
              value={form.providerKey}
              onChange={(e) => set('providerKey', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              placeholder="e.g. microsoft-mirk"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Lowercase, hyphens only. Used in the OAuth callback URL.</p>
          </Field>
          <Field label="Provider Type">
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              value={form.type}
              onChange={(e) => set('type', e.target.value as 'google' | 'microsoft')}
            >
              <option value="microsoft">Microsoft Entra ID</option>
              <option value="google">Google</option>
            </select>
          </Field>
        </div>
      )}

      <Field label="Display Name">
        <Input value={form.displayName} onChange={(e) => set('displayName', e.target.value)} required />
      </Field>

      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Client ID">
          <Input value={form.clientId} onChange={(e) => set('clientId', e.target.value)} required />
        </Field>
        <Field label={`Client Secret${form.hasClientSecret ? ' (leave blank to keep current)' : ''}`}>
          <Input
            type="password"
            value={form.clientSecret}
            onChange={(e) => set('clientSecret', e.target.value)}
            placeholder={form.hasClientSecret ? 'Stored – leave blank to keep' : ''}
          />
        </Field>
      </div>

      {(isNew ? form.type : initial?.type) === 'microsoft' && (
        <Field label="Tenant ID (Directory ID)">
          <Input value={form.tenantId} onChange={(e) => set('tenantId', e.target.value)} required />
        </Field>
      )}

      <Field label={`Redirect / Callback URI${suggestedCallback ? ` — suggested: ${suggestedCallback}` : ''}`}>
        <Input
          value={form.redirectUri}
          onChange={(e) => set('redirectUri', e.target.value)}
          placeholder={suggestedCallback || 'https://your-domain.com/api/auth/callback/...'}
          required
        />
      </Field>

      <Field label="Scopes">
        <Input value={form.scope} onChange={(e) => set('scope', e.target.value)} />
      </Field>

      <label className="inline-flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} />
        <span>Enable this provider for login</span>
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 rounded bg-plrei-navy text-white text-sm disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save Provider'}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded border border-gray-300 text-sm">
          Cancel
        </button>
      </div>
    </form>
  );
}

// ─── Domain mapping form ──────────────────────────────────────────────────────

type MappingFormProps = {
  initial?: DomainMappingRow;
  isNew: boolean;
  providerKeys: string[];
  onSave: () => void;
  onCancel: () => void;
};

function MappingForm({ initial, isNew, providerKeys, onSave, onCancel }: MappingFormProps) {
  const [form, setForm] = useState({
    domain: initial?.domain ?? BLANK_MAPPING.domain,
    providerKey: initial?.providerKey ?? (providerKeys[0] ?? ''),
    displayName: initial?.displayName ?? BLANK_MAPPING.displayName,
    enforceSso: initial?.enforceSso ?? BLANK_MAPPING.enforceSso,
    isActive: initial?.isActive ?? BLANK_MAPPING.isActive,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const body = {
      providerKey: form.providerKey,
      displayName: form.displayName || undefined,
      enforceSso: form.enforceSso,
      isActive: form.isActive,
    };

    let res: Response;
    if (isNew) {
      res = await fetch('/api/admin/sso/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: form.domain, ...body }),
      });
    } else {
      res = await fetch(`/api/admin/sso/domains/${encodeURIComponent(initial!.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    }

    const json = (await res.json()) as { error?: string };
    if (!res.ok) {
      setError(json.error ?? 'Failed to save domain mapping.');
      setSaving(false);
      return;
    }
    onSave();
  }

  return (
    <form onSubmit={submit} className="space-y-3 p-5 rounded-lg border border-gray-200 bg-gray-50">
      <h3 className="font-semibold text-base">{isNew ? 'New Domain Mapping' : `Edit: ${initial?.domain}`}</h3>

      <div className="grid sm:grid-cols-2 gap-3">
        {isNew && (
          <Field label="Domain">
            <Input
              value={form.domain}
              onChange={(e) => set('domain', e.target.value.toLowerCase().trim())}
              placeholder="e.g. mirkinc.us"
              required
            />
          </Field>
        )}
        <Field label="SSO Provider">
          <select
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            value={form.providerKey}
            onChange={(e) => set('providerKey', e.target.value)}
            required
          >
            <option value="">— select a provider —</option>
            {providerKeys.map((key) => (
              <option key={key} value={key}>{key}</option>
            ))}
          </select>
        </Field>
        <Field label="Display Name (optional)">
          <Input value={form.displayName} onChange={(e) => set('displayName', e.target.value)} placeholder="e.g. Mirk Inc" />
        </Field>
      </div>

      <div className="flex gap-4">
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.enforceSso} onChange={(e) => set('enforceSso', e.target.checked)} />
          <span>Enforce SSO (block password login for this domain)</span>
        </label>
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} />
          <span>Active</span>
        </label>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 rounded bg-plrei-navy text-white text-sm disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save Mapping'}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded border border-gray-300 text-sm">
          Cancel
        </button>
      </div>
    </form>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AdminSsoPortal() {
  const [providers, setProviders] = useState<ProviderRow[]>([]);
  const [mappings, setMappings] = useState<DomainMappingRow[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editingProvider, setEditingProvider] = useState<ProviderRow | null>(null);
  const [addingProvider, setAddingProvider] = useState(false);

  const [editingMapping, setEditingMapping] = useState<DomainMappingRow | null>(null);
  const [addingMapping, setAddingMapping] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'provider' | 'mapping'; id: string; label: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  async function loadAll() {
    setLoading(true);
    setError('');
    try {
      const [provRes, domRes, usrRes] = await Promise.all([
        fetch('/api/admin/sso'),
        fetch('/api/admin/sso/domains'),
        fetch('/api/admin/users'),
      ]);
      if (!provRes.ok || !domRes.ok || !usrRes.ok) throw new Error('Failed to load admin data.');
      const provJson = (await provRes.json()) as { providers: ProviderRow[] };
      const domJson = (await domRes.json()) as { mappings: DomainMappingRow[] };
      const usrJson = (await usrRes.json()) as { users: UserRow[] };
      setProviders(provJson.providers);
      setMappings(domJson.mappings);
      setUsers(usrJson.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load admin data.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadAll(); }, []);

  async function confirmDelete() {
    if (!deleteConfirm) return;
    setDeleting(true);
    setDeleteError('');

    const url =
      deleteConfirm.type === 'provider'
        ? `/api/admin/sso/${encodeURIComponent(deleteConfirm.id)}`
        : `/api/admin/sso/domains/${encodeURIComponent(deleteConfirm.id)}`;

    const res = await fetch(url, { method: 'DELETE' });
    const json = (await res.json()) as { error?: string };
    if (!res.ok) {
      setDeleteError(json.error ?? 'Delete failed.');
      setDeleting(false);
      return;
    }
    setDeleteConfirm(null);
    setDeleting(false);
    void loadAll();
  }

  const providerKeys = providers.map((p) => p.providerKey);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8">
        <p className="text-sm text-gray-500">Loading administrative settings…</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-10">
      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-4 py-3">{error}</p>}

      {/* ── Delete confirmation modal ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 max-w-sm w-full space-y-4">
            <h3 className="font-semibold">Confirm deletion</h3>
            <p className="text-sm text-gray-600">
              Delete <strong>{deleteConfirm.label}</strong>? This cannot be undone.
            </p>
            {deleteError && <p className="text-sm text-red-600">{deleteError}</p>}
            <div className="flex gap-2">
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="px-4 py-2 rounded bg-red-600 text-white text-sm disabled:opacity-50"
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
              <button
                onClick={() => { setDeleteConfirm(null); setDeleteError(''); }}
                className="px-4 py-2 rounded border border-gray-300 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SSO Providers ── */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">SSO Providers</h1>
            <p className="text-sm text-gray-500 mt-1">
              Each provider is a distinct OAuth app registration. Multiple tenants of the same type (e.g. two Microsoft orgs)
              each get their own entry with a unique provider key.
            </p>
          </div>
          {!addingProvider && !editingProvider && (
            <button
              onClick={() => setAddingProvider(true)}
              className="shrink-0 px-4 py-2 rounded bg-plrei-navy text-white text-sm"
            >
              + Add Provider
            </button>
          )}
        </div>

        {addingProvider && (
          <ProviderForm
            isNew
            providerKeys={providerKeys}
            onSave={() => { setAddingProvider(false); void loadAll(); }}
            onCancel={() => setAddingProvider(false)}
          />
        )}

        {editingProvider && (
          <ProviderForm
            initial={editingProvider}
            isNew={false}
            providerKeys={providerKeys}
            onSave={() => { setEditingProvider(null); void loadAll(); }}
            onCancel={() => setEditingProvider(null)}
          />
        )}

        {providers.length === 0 ? (
          <p className="text-sm text-gray-500">No providers configured yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-500 text-xs uppercase tracking-wide">
                  <th className="py-2 pr-4">Key</th>
                  <th className="py-2 pr-4">Type</th>
                  <th className="py-2 pr-4">Display Name</th>
                  <th className="py-2 pr-4">Tenant ID</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Callback URL</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {providers.map((p) => (
                  <tr key={p.providerKey} className="border-b border-gray-100 align-top">
                    <td className="py-2 pr-4 font-mono text-xs">{p.providerKey}</td>
                    <td className="py-2 pr-4 capitalize">{p.type}</td>
                    <td className="py-2 pr-4">{p.displayName}</td>
                    <td className="py-2 pr-4 font-mono text-xs text-gray-500">{p.tenantId || '—'}</td>
                    <td className="py-2 pr-4"><Badge active={p.isActive} /></td>
                    <td className="py-2 pr-4 font-mono text-xs text-gray-400 break-all">{callbackUrl(p.providerKey)}</td>
                    <td className="py-2 whitespace-nowrap">
                      <button
                        onClick={() => { setEditingProvider(p); setAddingProvider(false); }}
                        className="text-plrei-navy text-xs mr-3 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ type: 'provider', id: p.providerKey, label: p.providerKey })}
                        className="text-red-500 text-xs hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Domain Mappings ── */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Domain Mappings</h2>
            <p className="text-sm text-gray-500 mt-1">
              Map email domains to the SSO provider users on that domain should authenticate against.
              When "Enforce SSO" is on, password login is blocked for that domain.
            </p>
          </div>
          {!addingMapping && !editingMapping && (
            <button
              onClick={() => setAddingMapping(true)}
              className="shrink-0 px-4 py-2 rounded bg-plrei-navy text-white text-sm"
            >
              + Add Mapping
            </button>
          )}
        </div>

        {addingMapping && (
          <MappingForm
            isNew
            providerKeys={providerKeys}
            onSave={() => { setAddingMapping(false); void loadAll(); }}
            onCancel={() => setAddingMapping(false)}
          />
        )}

        {editingMapping && (
          <MappingForm
            initial={editingMapping}
            isNew={false}
            providerKeys={providerKeys}
            onSave={() => { setEditingMapping(null); void loadAll(); }}
            onCancel={() => setEditingMapping(null)}
          />
        )}

        {mappings.length === 0 ? (
          <p className="text-sm text-gray-500">No domain mappings configured yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-500 text-xs uppercase tracking-wide">
                  <th className="py-2 pr-4">Domain</th>
                  <th className="py-2 pr-4">Provider Key</th>
                  <th className="py-2 pr-4">Display Name</th>
                  <th className="py-2 pr-4">Enforce SSO</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {mappings.map((m) => (
                  <tr key={m.id} className="border-b border-gray-100">
                    <td className="py-2 pr-4 font-mono text-xs">{m.domain}</td>
                    <td className="py-2 pr-4 font-mono text-xs">{m.providerKey}</td>
                    <td className="py-2 pr-4 text-gray-600">{m.displayName ?? '—'}</td>
                    <td className="py-2 pr-4">{m.enforceSso ? 'Yes' : 'No'}</td>
                    <td className="py-2 pr-4"><Badge active={m.isActive} /></td>
                    <td className="py-2 whitespace-nowrap">
                      <button
                        onClick={() => { setEditingMapping(m); setAddingMapping(false); }}
                        className="text-plrei-navy text-xs mr-3 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ type: 'mapping', id: m.id, label: m.domain })}
                        className="text-red-500 text-xs hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── User List ── */}
      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-xl font-semibold mb-4">Users</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500 text-xs uppercase tracking-wide">
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Role</th>
                <th className="py-2 pr-4">Last Login</th>
                <th className="py-2 pr-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-gray-100">
                  <td className="py-2 pr-4">{u.email}</td>
                  <td className="py-2 pr-4">{u.role}</td>
                  <td className="py-2 pr-4">{formatDate(u.lastLoginAt)}</td>
                  <td className="py-2 pr-4">{u.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
