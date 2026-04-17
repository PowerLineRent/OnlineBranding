'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { resolveEmailSignatureAssetUrls } from '@/lib/emailSignatureAssetUrls';
import {
  buildSignatureHtml,
  DEFAULT_SIGNATURE_ASSET_URLS,
  DEFAULT_SIGNATURE_DATA,
  SIGNATURE_ASSET_FILES,
  LOGO_FILE,
  ADDRESS_ICON_FILE,
  PHONE_ICON_FILE,
  EMAIL_ICON_FILE,
  LINK_ICON_FILE,
  type SignatureAssetUrls,
  type SignatureFormData,
} from '@/lib/emailSignatureTemplate';

const STORAGE_KEY = 'plrei-email-signature-v1';

function encodeState(data: Partial<SignatureFormData>): string {
  const json = JSON.stringify(data);
  const bytes = new TextEncoder().encode(json);
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function decodeState(encoded: string): Partial<SignatureFormData> {
  const normalized = encoded.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
  const json = new TextDecoder().decode(bytes);
  return JSON.parse(json);
}

function getCustomized(data: SignatureFormData): Partial<SignatureFormData> {
  const result: Partial<SignatureFormData> = {};
  (Object.keys(DEFAULT_SIGNATURE_DATA) as (keyof SignatureFormData)[]).forEach((key) => {
    if (data[key] !== DEFAULT_SIGNATURE_DATA[key]) result[key] = data[key];
  });
  return result;
}

interface Props {
  initialEncoded?: string;
}

export default function EmailSignatureGenerator({ initialEncoded }: Props) {
  const [data, setData] = useState<SignatureFormData>(() => {
    // Start with defaults; will be overwritten by storage/permalink on mount
    return { ...DEFAULT_SIGNATURE_DATA };
  });
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [permalink, setPermalink] = useState('');
  const [mobileRecipient, setMobileRecipient] = useState('');
  const [mobileStatus, setMobileStatus] = useState('');
  const [mobileIsError, setMobileIsError] = useState(false);
  const [sending, setSending] = useState(false);
  const [assetUrls, setAssetUrls] = useState<SignatureAssetUrls>(DEFAULT_SIGNATURE_ASSET_URLS);

  const signatureRef = useRef<HTMLDivElement>(null);

  const buildPermalink = useCallback(async (current: SignatureFormData) => {
    if (typeof window === 'undefined') return '';
    const customized = getCustomized(current);
    if (Object.keys(customized).length === 0) {
      const url = new URL(window.location.href);
      url.search = '';
      url.hash = '';
      return url.toString();
    }

    const s = encodeState(customized);
    const url = new URL(window.location.href);
    url.search = `?s=${s}`;
    url.hash = '';

    try {
      const response = await fetch('/api/signature-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ s }),
      });
      const payload = (await response.json()) as { s?: string };
      if (response.ok && payload.s) {
        url.searchParams.set('s', payload.s);
      }
    } catch {
      // Keep fallback URL with ?s only if signing endpoint is unavailable.
    }

    return url.toString();
  }, []);

  function set(field: keyof SignatureFormData) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setData((prev) => {
        const next = { ...prev, [field]: e.target.value };
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
        return next;
      });
    };
  }

  // On mount: hydrate from storage, then from permalink
  useEffect(() => {
    let merged = { ...DEFAULT_SIGNATURE_DATA };

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) merged = { ...merged, ...JSON.parse(raw) };
    } catch { /* ignore */ }

    if (initialEncoded) {
      try {
        const decoded = decodeState(initialEncoded);
        merged = { ...merged, ...decoded };
      } catch { /* ignore */ }
    }

    setData(merged);
    setMobileRecipient(merged.email);

    // Clear URL params after loading
    if (typeof window !== 'undefined' && window.location.search) {
      const url = new URL(window.location.href);
      url.search = '';
      window.history.replaceState({}, '', url.toString());
    }

    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (initialEncoded) {
        url.searchParams.set('s', initialEncoded);
      }
      setPermalink(url.toString());
    }
  }, [initialEncoded]);

  useEffect(() => {
    let active = true;
    void (async () => {
      const nextPermalink = await buildPermalink(data);
      if (active) {
        setPermalink(nextPermalink);
      }
    })();
    return () => {
      active = false;
    };
  }, [data, buildPermalink]);

  useEffect(() => {
    let isMounted = true;

    async function resolveAssetUrls() {
      const resolved = await resolveEmailSignatureAssetUrls(SIGNATURE_ASSET_FILES);
      if (!isMounted) {
        return;
      }

      setAssetUrls({
        logo: resolved[LOGO_FILE] ?? DEFAULT_SIGNATURE_ASSET_URLS.logo,
        address: resolved[ADDRESS_ICON_FILE] ?? DEFAULT_SIGNATURE_ASSET_URLS.address,
        phone: resolved[PHONE_ICON_FILE] ?? DEFAULT_SIGNATURE_ASSET_URLS.phone,
        email: resolved[EMAIL_ICON_FILE] ?? DEFAULT_SIGNATURE_ASSET_URLS.email,
        link: resolved[LINK_ICON_FILE] ?? DEFAULT_SIGNATURE_ASSET_URLS.link });
    }

    void resolveAssetUrls();

    return () => {
      isMounted = false;
    };
  }, []);

  async function copySignature() {
    if (!signatureRef.current) return;

    // Build the HTML from state rather than serialising the live DOM.
    // DOM serialisation (innerHTML) converts colours like #000080 to rgb(0,0,128),
    // which Outlook (pre-2019) does not support, breaking all colour rendering.
    const html = buildSignatureHtml(data, assetUrls);

    try {
      // Force exact HTML onto the clipboard without DOM serialization.
      let copied = false;
      const onCopy = (event: ClipboardEvent) => {
        event.preventDefault();
        if (!event.clipboardData) {
          return;
        }
        event.clipboardData.setData('text/html', html);
        event.clipboardData.setData('text/plain', '');
        copied = true;
      };

      document.addEventListener('copy', onCopy);
      document.execCommand('copy');
      document.removeEventListener('copy', onCopy);

      if (!copied) {
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html': new Blob([html], { type: 'text/html' }) }),
        ]);
      }

      setCopyStatus('success');
      setTimeout(() => setCopyStatus('idle'), 3000);
    } catch {
      // Fallback: select the element
      const range = document.createRange();
      range.selectNodeContents(signatureRef.current);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
      setCopyStatus('error');
      setTimeout(() => setCopyStatus('idle'), 4000);
    }
  }

  async function copyPermalink() {
    try {
      await navigator.clipboard.writeText(permalink);
      setMobileStatus('Permalink copied.');
      setMobileIsError(false);
    } catch {
      setMobileStatus('Auto-copy failed - select the field and press Ctrl+C.');
      setMobileIsError(true);
    }
    setTimeout(() => setMobileStatus(''), 3000);
  }

  async function sendEmail() {
    if (!mobileRecipient || !mobileRecipient.includes('@')) {
      setMobileStatus('Enter a valid recipient email before sending.');
      setMobileIsError(true);
      return;
    }

    setSending(true);
    setMobileStatus('');

    try {
      const response = await fetch('/api/send-mobile-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: mobileRecipient, link: permalink, signature: data }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Failed to send email.');
      setMobileStatus('Email sent successfully.');
      setMobileIsError(false);
    } catch (err) {
      setMobileStatus(err instanceof Error ? err.message : 'Unable to send email.');
      setMobileIsError(true);
    } finally {
      setSending(false);
    }
  }

  const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-plrei-navy';
  const labelCls = 'block mb-1';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      <h1 className="mb-1">PLREI Email Signature Generator</h1>
      <p className="mb-6">Fill in your details - the preview updates live. Then copy and paste into your email client.</p>

      <div className="flex flex-col lg:flex-row gap-5 items-start">

        {/* FORM */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 w-full lg:w-72 flex-shrink-0">
          <h2 className="mb-4">Your Details</h2>

          <div className="space-y-3">
            <div>
              <label className={labelCls}>Full Name</label>
              <input className={inputCls} value={data.name} onChange={set('name')} />
            </div>
            <div>
              <label className={labelCls}>Title</label>
              <input className={inputCls} value={data.title} onChange={set('title')} />
            </div>

            <hr className="border-gray-100" />

            <div>
              <label className={labelCls}>Office Phone</label>
              <input className={inputCls} value={data.office} onChange={set('office')} />
            </div>
            <div>
              <label className={labelCls}>Mobile Phone</label>
              <input className={inputCls} value={data.mobile} onChange={set('mobile')} />
            </div>
            <div>
              <label className={labelCls}>
                Fax <span className="">(optional)</span>
              </label>
              <input className={inputCls} value={data.fax} onChange={set('fax')} placeholder="Leave blank to hide" />
            </div>

            <hr className="border-gray-100" />

            <div>
              <label className={labelCls}>Email</label>
              <input className={inputCls} type="email" value={data.email} onChange={set('email')} />
            </div>

            <hr className="border-gray-100" />

            <div>
              <label className={labelCls}>
                Address Line 1 <span className="">(optional)</span>
              </label>
              <input className={inputCls} value={data.addr1} onChange={set('addr1')} placeholder="Leave blank to hide" />
            </div>
            <div>
              <label className={labelCls}>
                Address Line 2 <span className="">(optional)</span>
              </label>
              <input className={inputCls} value={data.addr2} onChange={set('addr2')} placeholder="Leave blank to hide" />
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Preview */}
          <div className="preview-box">
            <div className="preview-label">Preview</div>
            <div className="signature-wrap">
              <div id="signature" ref={signatureRef} dangerouslySetInnerHTML={{ __html: buildSignatureHtml(data, assetUrls) }} />
            </div>
          </div>

          {/* Copy action */}
          <div className="flex flex-wrap gap-3 items-center">
            <button
              onClick={copySignature}
              className={`px-5 py-2.5 rounded-lg transition-colors ${
                copyStatus === 'success'
                  ? 'bg-green-700'
                  : 'bg-plrei-navy hover:opacity-90'
              }`}
              style={{ color: '#FFFFFF' }}
            >
              {copyStatus === 'success' ? 'Copied!' : 'Copy Signature'}
            </button>
            {copyStatus === 'success' && (
              <span className="">Now paste into your email client.</span>
            )}
            {copyStatus === 'error' && (
              <span className="">Auto-copy failed. The signature is selected - press Ctrl+C.</span>
            )}
          </div>

          {/* Mobile share */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="mb-2">Send To Mobile</h2>
            <p className="mb-4">
              Create a permalink for your customized signature fields, then copy it or email it to your phone.
            </p>

            <div className="space-y-3">
              <div>
                <label className={labelCls}>Permalink</label>
                <input className={inputCls + ' bg-gray-50'} value={permalink} readOnly />
              </div>
              <div>
                <label className={labelCls}>Recipient Email</label>
                <input
                  className={inputCls}
                  type="email"
                  placeholder="you@phone-email-gateway.com or your mobile email"
                  value={mobileRecipient}
                  onChange={(e) => setMobileRecipient(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-3 items-center">
                <button
                  onClick={copyPermalink}
                  className="px-4 py-2 rounded-lg bg-plrei-navy hover:opacity-90 transition-colors"
                  style={{ color: '#FFFFFF' }}
                >
                  Copy Permalink
                </button>
                <button
                  onClick={sendEmail}
                  disabled={sending}
                  className="px-4 py-2 rounded-lg border border-plrei-navy hover:bg-plrei-navy transition-colors disabled:opacity-50"
                >
                  {sending ? 'Sending...' : 'Email Link'}
                </button>
                {mobileStatus && (
                  <span className="">
                    {mobileStatus}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="mb-4">How to Add Your Signature</h2>

            <div className="space-y-5">
              <div>
                <div className="mb-2">Outlook desktop (Windows/Mac)</div>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Fill in your details on the left.</li>
                  <li>Click <strong>Copy Signature</strong> above.</li>
                  <li>In Outlook: <strong>File -&gt; Options -&gt; Mail -&gt; Signatures</strong>.</li>
                  <li>Create or select a signature, click inside the text area, then press <kbd className="bg-gray-100 border border-gray-300 rounded px-1.5 py-0.5">Ctrl+V</kbd>.</li>
                  <li>Set the signature as default for <strong>New messages</strong> and <strong>Replies/forwards</strong>.</li>
                  <li>Click <strong>OK</strong>.</li>
                </ol>
              </div>

              <div>
                <div className="mb-2">Outlook mobile app (iPhone/Android)</div>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Open Outlook app -&gt; tap your profile icon -&gt; tap <strong>Settings</strong>.</li>
                  <li>Tap <strong>Signature</strong>.</li>
                  <li>Paste your text signature and save.</li>
                </ol>
              </div>

              <div>
                <div className="mb-2">Gmail (web)</div>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Open Gmail -&gt; click <strong>Settings</strong> -&gt; <strong>See all settings</strong>.</li>
                  <li>In <strong>General -&gt; Signature</strong>, create a new signature and paste.</li>
                  <li>Set <strong>Signature defaults</strong> for new emails and replies.</li>
                  <li>Scroll down and click <strong>Save Changes</strong>.</li>
                </ol>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}




