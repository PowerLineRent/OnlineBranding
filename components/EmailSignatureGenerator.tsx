'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface FormData {
  name: string;
  title: string;
  office: string;
  mobile: string;
  fax: string;
  email: string;
  addr1: string;
  addr2: string;
}

const DEFAULT_DATA: FormData = {
  name: 'Tim Kingery',
  title: 'President',
  office: '540-682-2126',
  mobile: '540-815-3752',
  fax: '540-345-4400',
  email: 'timkingery@plrei.com',
  addr1: '42 Noble Avenue, NE',
  addr2: 'Roanoke, VA 24012',
};

const STORAGE_KEY = 'plrei-email-signature-v1';

function encodeState(data: Partial<FormData>): string {
  const json = JSON.stringify(data);
  const bytes = new TextEncoder().encode(json);
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function decodeState(encoded: string): Partial<FormData> {
  const normalized = encoded.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
  const json = new TextDecoder().decode(bytes);
  return JSON.parse(json);
}

function getCustomized(data: FormData): Partial<FormData> {
  const result: Partial<FormData> = {};
  (Object.keys(DEFAULT_DATA) as (keyof FormData)[]).forEach((key) => {
    if (data[key] !== DEFAULT_DATA[key]) result[key] = data[key];
  });
  return result;
}

// Absolute URLs required for email clients
const IMG_BASE = 'https://raw.githubusercontent.com/PowerLineRent/OnlineBranding/refs/heads/main/EmailSignature';

interface Props {
  initialEncoded?: string;
}

export default function EmailSignatureGenerator({ initialEncoded }: Props) {
  const [data, setData] = useState<FormData>(() => {
    // Start with defaults; will be overwritten by storage/permalink on mount
    return { ...DEFAULT_DATA };
  });
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [permalink, setPermalink] = useState('');
  const [mobileRecipient, setMobileRecipient] = useState('');
  const [mobileStatus, setMobileStatus] = useState('');
  const [mobileIsError, setMobileIsError] = useState(false);
  const [sending, setSending] = useState(false);

  const signatureRef = useRef<HTMLDivElement>(null);

  const buildPermalink = useCallback((current: FormData) => {
    if (typeof window === 'undefined') return '';
    const customized = getCustomized(current);
    const url = new URL(window.location.href);
    url.search = Object.keys(customized).length > 0 ? `?s=${encodeState(customized)}` : '';
    url.hash = '';
    return url.toString();
  }, []);

  function set(field: keyof FormData) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setData((prev) => {
        const next = { ...prev, [field]: e.target.value };
        setPermalink(buildPermalink(next));
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
        return next;
      });
    };
  }

  // On mount: hydrate from storage, then from permalink
  useEffect(() => {
    let merged = { ...DEFAULT_DATA };

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

    setPermalink(buildPermalink(merged));
  }, [initialEncoded, buildPermalink]);

  async function copySignature() {
    if (!signatureRef.current) return;

    const clone = signatureRef.current.cloneNode(true) as HTMLElement;
    const html = clone.innerHTML;

    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([html], { type: 'text/html' }),
          'text/plain': new Blob(['Power Line Rent-E-Quip Email Signature'], { type: 'text/plain' }),
        }),
      ]);
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
      setMobileStatus('Auto-copy failed — select the field and press Ctrl+C.');
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
        body: JSON.stringify({ to: mobileRecipient, link: permalink, signature: data }),
      });
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

  const hasAddr = !!(data.addr1 || data.addr2);
  const hasBothAddr = !!(data.addr1 && data.addr2);

  const inputCls = 'w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-plrei-navy font-sans text-gray-800';
  const labelCls = 'block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      <h1 className="text-xl font-bold text-plrei-navy mb-1">PLREI Email Signature Generator</h1>
      <p className="text-sm text-gray-500 mb-6">Fill in your details — the preview updates live. Then copy and paste into Outlook.</p>

      <div className="flex flex-col lg:flex-row gap-5 items-start">

        {/* ── FORM ── */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 w-full lg:w-72 flex-shrink-0">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Your Details</h2>

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
                Fax <span className="font-normal text-gray-400 normal-case tracking-normal">(optional)</span>
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
                Address Line 1 <span className="font-normal text-gray-400 normal-case tracking-normal">(optional)</span>
              </label>
              <input className={inputCls} value={data.addr1} onChange={set('addr1')} placeholder="Leave blank to hide" />
            </div>
            <div>
              <label className={labelCls}>
                Address Line 2 <span className="font-normal text-gray-400 normal-case tracking-normal">(optional)</span>
              </label>
              <input className={inputCls} value={data.addr2} onChange={set('addr2')} placeholder="Leave blank to hide" />
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Preview */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Preview</div>
            <div className="overflow-x-auto -webkit-overflow-scrolling-touch">
              <div ref={signatureRef}>
                <table cellSpacing={0} cellPadding={0} style={{ fontFamily: 'Aptos, Calibri, sans-serif', color: '#000080', width: '480px', background: 'transparent' }}>
                  <tbody>
                    <tr>
                      <td width={126} style={{ fontSize: '10pt', fontFamily: 'Aptos, Calibri, sans-serif', color: '#000080', lineHeight: '12pt', paddingBottom: '23px', paddingRight: '10px', textAlign: 'center', width: '126px', verticalAlign: 'top' }} valign="bottom">
                        <a href="https://plrei.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', border: 0 }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img alt="Logo" width={94} style={{ width: '94px', height: 'auto', border: 0, display: 'block' }}
                            src={`${IMG_BASE}/EmailSignatureLogo-V3.png`} />
                        </a>
                      </td>
                      <td valign="top" style={{ paddingBottom: '20px', fontFamily: 'Aptos, Calibri, sans-serif', verticalAlign: 'top' }}>
                        <p style={{ borderBottom: '3px solid #000080', paddingBottom: '5px', margin: '0 0 8px 0' }}>
                          <span style={{ fontSize: '20px', color: '#000000', fontFamily: 'Aptos, Calibri, sans-serif' }}>
                            <strong>{data.name}</strong>
                          </span>
                          <br />
                          <span style={{ fontSize: '16px', color: '#000000' }}>{data.title}</span>
                        </p>
                        <p style={{ margin: '0 0 10px 0' }}>
                          <span style={{ fontSize: '18px', color: '#000000' }}>
                            <strong>Power Line Rent-E-Quip, Inc.</strong>
                          </span>
                        </p>
                        <table cellPadding={0} cellSpacing={0} style={{ fontFamily: 'Arial', fontSize: '14px', lineHeight: 1, borderCollapse: 'collapse' }}>
                          <tbody>
                            {hasAddr && (
                              <tr style={{ height: hasBothAddr ? '36px' : '26px' }}>
                                <td width={26} valign="top" style={{ width: '26px', verticalAlign: 'top', paddingTop: '4px' }}>
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={`${IMG_BASE}/icon-address.png`} alt="" width={18} height={18} style={{ display: 'block' }} />
                                </td>
                                <td style={{ padding: '0 0 0 4px', fontSize: '14px', color: '#000000', lineHeight: 1.5 }}>
                                  {data.addr1 && <span style={{ fontSize: '14px', color: '#000000' }}>{data.addr1}</span>}
                                  {hasBothAddr && <br />}
                                  {data.addr2 && <span style={{ fontSize: '14px', color: '#000000' }}>{data.addr2}</span>}
                                </td>
                              </tr>
                            )}
                            {data.office && (
                              <tr style={{ height: '26px' }}>
                                <td width={26} valign="middle" style={{ width: '26px', verticalAlign: 'middle' }}>
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={`${IMG_BASE}/icon-phone.png`} alt="" width={18} height={18} style={{ display: 'block' }} />
                                </td>
                                <td style={{ padding: '0 0 0 4px', fontSize: '14px', color: '#000000' }}>
                                  <span style={{ fontSize: '14px', color: '#000000' }}>Office: {data.office}</span>
                                </td>
                              </tr>
                            )}
                            {data.mobile && (
                              <tr style={{ height: '26px' }}>
                                <td width={26} valign="middle" style={{ width: '26px', verticalAlign: 'middle' }}>
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={`${IMG_BASE}/icon-phone.png`} alt="" width={18} height={18} style={{ display: 'block' }} />
                                </td>
                                <td style={{ padding: '0 0 0 4px', fontSize: '14px', color: '#000000' }}>
                                  <span style={{ fontSize: '14px', color: '#000000' }}>Mobile: {data.mobile}</span>
                                </td>
                              </tr>
                            )}
                            {data.fax && (
                              <tr style={{ height: '26px' }}>
                                <td width={26} valign="middle" style={{ width: '26px', verticalAlign: 'middle' }}>
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={`${IMG_BASE}/icon-phone.png`} alt="" width={18} height={18} style={{ display: 'block' }} />
                                </td>
                                <td style={{ padding: '0 0 0 4px', fontSize: '14px', color: '#000000' }}>
                                  <span style={{ fontSize: '14px', color: '#000000' }}>Fax: {data.fax}</span>
                                </td>
                              </tr>
                            )}
                            {data.email && (
                              <tr style={{ height: '26px' }}>
                                <td width={26} valign="middle" style={{ width: '26px', verticalAlign: 'middle' }}>
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={`${IMG_BASE}/icon-email.png`} alt="" width={18} height={18} style={{ display: 'block' }} />
                                </td>
                                <td style={{ padding: '0 0 0 4px', fontSize: '14px', color: '#000000' }}>
                                  <a href={`mailto:${data.email}`} style={{ fontSize: '14px', color: '#000000', textDecoration: 'none' }}>
                                    <span style={{ textDecoration: 'none', color: '#000080' }}>{data.email}</span>
                                  </a>
                                </td>
                              </tr>
                            )}
                            <tr style={{ height: '26px' }}>
                              <td width={26} valign="middle" style={{ width: '26px', verticalAlign: 'middle' }}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={`${IMG_BASE}/icon-link.png`} alt="" width={18} height={18} style={{ display: 'block' }} />
                              </td>
                              <td style={{ padding: '0 0 0 4px', fontSize: '14px', color: '#000080' }}>
                                <a href="https://www.plrei.com" style={{ fontSize: '14px', color: '#000080', textDecoration: 'none' }}>
                                  <span style={{ textDecoration: 'none', color: '#000080' }}>www.plrei.com</span>
                                </a>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Copy action */}
          <div className="flex flex-wrap gap-3 items-center">
            <button
              onClick={copySignature}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                copyStatus === 'success'
                  ? 'bg-green-700 text-white'
                  : 'bg-plrei-navy text-white hover:bg-plrei-navy-hover'
              }`}
            >
              {copyStatus === 'success' ? 'Copied!' : 'Copy Signature'}
            </button>
            {copyStatus === 'success' && (
              <span className="text-sm text-green-700">Now paste into Outlook.</span>
            )}
            {copyStatus === 'error' && (
              <span className="text-sm text-red-600">Auto-copy failed. The signature is selected — press Ctrl+C.</span>
            )}
          </div>

          {/* Mobile share */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Send To Mobile</h2>
            <p className="text-sm text-gray-500 mb-4">
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
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-plrei-navy text-white hover:bg-plrei-navy-hover transition-colors"
                >
                  Copy Permalink
                </button>
                <button
                  onClick={sendEmail}
                  disabled={sending}
                  className="px-4 py-2 rounded-lg text-sm font-semibold border border-plrei-navy text-plrei-navy hover:bg-plrei-navy hover:text-white transition-colors disabled:opacity-50"
                >
                  {sending ? 'Sending…' : 'Email Link'}
                </button>
                {mobileStatus && (
                  <span className={`text-sm ${mobileIsError ? 'text-red-600' : 'text-green-700'}`}>
                    {mobileStatus}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 text-sm leading-relaxed text-gray-600">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">How to Add Your Signature</h2>

            <div className="space-y-5">
              <div>
                <div className="font-semibold text-gray-800 mb-2">Outlook desktop (Windows/Mac)</div>
                <ol className="list-decimal list-inside space-y-1 text-gray-600">
                  <li>Fill in your details on the left.</li>
                  <li>Click <strong>Copy Signature</strong> above.</li>
                  <li>In Outlook: <strong>File → Options → Mail → Signatures</strong>.</li>
                  <li>Create or select a signature, click inside the text area, then press <kbd className="bg-gray-100 border border-gray-300 rounded px-1.5 py-0.5 text-xs">Ctrl+V</kbd>.</li>
                  <li>Set the signature as default for <strong>New messages</strong> and <strong>Replies/forwards</strong>.</li>
                  <li>Click <strong>OK</strong>.</li>
                </ol>
              </div>

              <div>
                <div className="font-semibold text-gray-800 mb-2">Outlook mobile app (iPhone/Android)</div>
                <ol className="list-decimal list-inside space-y-1 text-gray-600">
                  <li>Open Outlook app → tap your profile icon → tap <strong>Settings</strong>.</li>
                  <li>Tap <strong>Signature</strong>.</li>
                  <li>Paste your text signature and save.</li>
                </ol>
              </div>

              <div>
                <div className="font-semibold text-gray-800 mb-2">Gmail (web)</div>
                <ol className="list-decimal list-inside space-y-1 text-gray-600">
                  <li>Open Gmail → click <strong>Settings</strong> → <strong>See all settings</strong>.</li>
                  <li>In <strong>General → Signature</strong>, create a new signature and paste.</li>
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
