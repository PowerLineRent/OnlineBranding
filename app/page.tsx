import SectionNav from '@/components/SectionNav';
import ColorSwatch from '@/components/ColorSwatch';

// ── COLOR DATA ──────────────────────────────────────────────────────────────

// Two authorized digital brand colors
const BRAND_PRIMARY = [
  {
    name: 'Navy Blue',
    hex: '#000080',
    usage: 'Primary brand color — logos, headings, buttons, all digital use',
    light: false,
  },
  {
    name: 'Brand Yellow',
    hex: '#F5C518',
    usage: 'Secondary brand color — accents, highlights, and CTAs',
    light: false,
  },
];

// Exact values used in the official logo SVG source files
const LOGO_SOURCE = [
  { name: 'Logo Navy',    hex: '#282973', usage: 'Navy fill in logo SVG paths & letterhead rule', light: false },
  { name: 'Gold Dark',    hex: '#F1BF24', usage: 'Lightning bolt gradient — dark end (0% stop)',  light: false },
  { name: 'Gold Light',   hex: '#FFD456', usage: 'Lightning bolt gradient — light end (76% stop)',light: false },
  { name: 'Gold Solid',   hex: '#FFD555', usage: 'Solid gold — letterhead bottom accent stripe',  light: false },
  { name: 'Logo Glow',    hex: '#F6F4B3', usage: 'Soft halo filter on glow-variant logos only',   light: true  },
];

// Exact grey values from the crest SVG cls definitions — do not approximate
const CREST_COLORS = [
  { name: 'Crest Medium Grey', hex: '#78787A', usage: 'Crest border & outline — cls-1 in SVG source', light: true  },
  { name: 'Crest Dark Grey',   hex: '#595A5A', usage: 'Crest shadow polygons — cls-2 in SVG source',  light: false },
  { name: 'Crest Charcoal',    hex: '#3F4042', usage: 'Crest body fill and gradient base stop',        light: false },
  { name: 'Crest Grad. Dark',  hex: '#4A4A4B', usage: 'Crest gradient — secondary dark stop',          light: false },
];

// UI support colors for web/digital interfaces
const UI_SUPPORT = [
  { name: 'Black',        hex: '#000000', usage: 'Primary body text and dark accents',           light: false },
  { name: 'White',        hex: '#FFFFFF', usage: 'Page backgrounds and reversed text',           light: true  },
  { name: 'Light Blue',   hex: '#E8ECFF', usage: 'Section & panel backgrounds',                  light: true  },
  { name: 'Border',       hex: '#D5DBF5', usage: 'Card borders and dividers',                    light: true  },
  { name: 'Body Text',    hex: '#4A4A63', usage: 'Secondary and descriptive text',               light: true  },
  { name: 'Success',      hex: '#2A7D2A', usage: 'Confirmation and success messages',            light: false },
  { name: 'Error',        hex: '#A02A2A', usage: 'Warnings and error messages',                  light: false },
];

// ── TYPE SCALE ───────────────────────────────────────────────────────────────

const TYPE_SCALE = [
  { label: 'Display', size: '32px', weight: '700', sample: 'Power Line Rent-E-Quip' },
  { label: 'H1',      size: '28px', weight: '700', sample: 'Brand Guidelines' },
  { label: 'H2',      size: '24px', weight: '700', sample: 'Color Palette' },
  { label: 'H3',      size: '20px', weight: '600', sample: 'Primary Colors' },
  { label: 'H4',      size: '16px', weight: '600', sample: 'Usage Notes' },
  { label: 'Body',    size: '14px', weight: '400', sample: 'Reliable equipment for utility and construction professionals.' },
  { label: 'Small',   size: '12px', weight: '400', sample: '© 2025 Power Line Rent-E-Quip, Inc. All rights reserved.' },
];

// ── LOGO VARIANTS ────────────────────────────────────────────────────────────

const LOGOS = [
  {
    file: '/logos/plrei-primary.svg',
    name: 'Primary Logo',
    desc: 'Gold bolt + full company name on white. Default for all print and digital communications.',
    bg: 'white',
    dark: false,
  },
  {
    file: '/logos/plrei-primary.svg',
    name: 'Reversed (on Navy)',
    desc: 'Logo reversed onto navy. Use for headers, slide decks, and branded collateral.',
    bg: '#000080',
    dark: true,
  },
  {
    file: '/logos/plrei-mark.svg',
    name: 'Logo Mark',
    desc: 'Lightning bolt symbol only. Use at small sizes — app icons, favicons, social avatars.',
    bg: 'white',
    dark: false,
  },
  {
    file: '/logos/plrei-no-glow.svg',
    name: 'No-Glow Variant',
    desc: 'Flat version without the outer lightning halo. Best for small print and tight contexts.',
    bg: 'white',
    dark: false,
  },
  {
    file: '/logos/plrei-crest.svg',
    name: 'Crest Variant',
    desc: 'Shield crest emblem with two-tone grey detail: #78787A (border) and #595A5A (shadow). Use for formal documents, certificates, and legal correspondence.',
    bg: 'white',
    dark: false,
  },
  {
    file: '/logos/plrei-full-lockup.svg',
    name: 'Full Lockup',
    desc: 'Logo with phone number and website. Use on vehicles, equipment tags, and external signage.',
    bg: 'white',
    dark: false,
  },
];

// ── ICON SET ─────────────────────────────────────────────────────────────────

const ICONS = [
  { file: '/EmailSignature/icon-address.png', name: 'Address', usage: 'Physical location in email signatures' },
  { file: '/EmailSignature/icon-phone.png',   name: 'Phone',   usage: 'Office, mobile, and fax lines'        },
  { file: '/EmailSignature/icon-email.png',   name: 'Email',   usage: 'Email address row'                    },
  { file: '/EmailSignature/icon-link.png',    name: 'Link',    usage: 'Website URL row'                      },
];

// ── PAGE ─────────────────────────────────────────────────────────────────────

export default function BrandPage() {
  return (
    <>
      <SectionNav />

      <main className="bg-white">

        {/* ══ HERO ══════════════════════════════════════════════════════════ */}
        <section style={{ backgroundColor: '#000080' }} className="text-white relative overflow-hidden">
          {/* Subtle diagonal yellow accent — echoes the lightning bolt shape */}
          <div
            className="absolute right-0 top-0 bottom-0 w-2"
            style={{ backgroundColor: '#F5C518' }}
          />
          <div className="max-w-5xl mx-auto px-6 py-20 flex flex-col items-center text-center gap-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logos/plrei-primary.svg" alt="PLREI Logo" className="h-28 w-auto drop-shadow-lg" />
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3">Brand Guidelines</h1>
              <p className="text-lg sm:text-xl max-w-xl" style={{ color: '#FEF9E3' }}>
                The official reference for Power Line Rent-E-Quip,&nbsp;Inc. identity —
                logos, colors, typography, and more.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              {/* Primary CTA: yellow on navy — on-brand combination */}
              <a
                href="#logo"
                className="px-5 py-2.5 rounded-lg text-sm font-bold transition-colors"
                style={{ backgroundColor: '#F5C518', color: '#000080' }}
              >
                Explore Guidelines
              </a>
              <a
                href="/email-signature"
                className="px-5 py-2.5 rounded-lg border text-white text-sm font-semibold hover:bg-white/10 transition-colors"
                style={{ borderColor: 'rgba(245,197,24,0.5)' }}
              >
                Signature Tool →
              </a>
            </div>
          </div>
          {/* Gold bottom stripe — mirrors the letterhead accent */}
          <div className="h-2 w-full" style={{ backgroundColor: '#F5C518' }} />
        </section>

        {/* ══ OVERVIEW ══════════════════════════════════════════════════════ */}
        <section id="overview" className="bg-plrei-bg-light border-b border-plrei-bg-border">
          <div className="max-w-5xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-start">
            <div>
              <p className="section-label">01 — Overview</p>
              <h2 className="section-title">About the Brand</h2>
              <p className="section-body mb-4">
                Power Line Rent-E-Quip,&nbsp;Inc. (PLREI) is a full-service equipment rental company
                headquartered at 42 Noble Avenue, NE, Roanoke, VA 24012. PLREI serves utility,
                construction, and infrastructure professionals across the Mid-Atlantic region.
              </p>
              <p className="section-body mb-4">
                The name <strong>POWER LINE RENT-E-QUIP®</strong> is a federally registered
                trademark (Reg.&nbsp;No.&nbsp;7682616, IC&nbsp;039). Always display the mark with the
                ® symbol in its first prominent use in any document or communication.
              </p>
              <p className="section-body">
                The brand&rsquo;s two authorized colors — navy blue and gold yellow — reflect power,
                precision, and reliability. Navy grounds the identity in authority and trust; gold
                signals the energy and capability behind every rental.
              </p>
            </div>
            <div className="grid gap-4">
              {[
                {
                  title: 'Professional',
                  body: 'Clear, direct communication that respects customers&rsquo; time and expertise.',
                },
                {
                  title: 'Reliable',
                  body: 'Consistent visuals reinforce that PLREI delivers on its promises, every time.',
                },
                {
                  title: 'Capable',
                  body: 'Imagery and language that convey the power and range of PLREI&rsquo;s fleet.',
                },
              ].map(({ title, body }) => (
                <div
                  key={title}
                  className="card border-l-4"
                  style={{ borderLeftColor: '#F5C518' }}
                >
                  <div className="font-bold mb-1" style={{ color: '#000080' }}>{title}</div>
                  <div className="text-sm text-plrei-text-body" dangerouslySetInnerHTML={{ __html: body }} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ LOGO ══════════════════════════════════════════════════════════ */}
        <section id="logo" className="border-b border-plrei-bg-border">
          <div className="max-w-5xl mx-auto px-6 py-16">
            <p className="section-label">02 — Logo</p>
            <h2 className="section-title">Logo System</h2>
            <p className="section-body mb-10">
              The PLREI logo centers on a gold lightning bolt — a symbol of power, speed, and energy
              that reflects the company&rsquo;s utility roots. The bolt uses a warm gold gradient
              (#F1BF24 → #FFD456) in print files; use the authorized brand yellow (#F5C518) for any
              digital reproductions. Always use official logo files. Never recreate or alter the logo.
            </p>

            {/* Logo grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
              {LOGOS.map(({ file, name, desc, bg, dark }) => (
                <div
                  key={name}
                  className="rounded-xl overflow-hidden border"
                  style={{ borderColor: dark ? '#000080' : '#D5DBF5' }}
                >
                  <div
                    className="flex items-center justify-center h-40 p-6"
                    style={{ backgroundColor: bg }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={file} alt={name} className="max-h-24 max-w-full object-contain" />
                  </div>
                  <div className="bg-white p-4">
                    <div className="font-semibold text-sm text-gray-900 mb-1">{name}</div>
                    <div className="text-xs text-plrei-text-body leading-relaxed">{desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Usage rules */}
            <div className="grid sm:grid-cols-2 gap-6 mb-10">
              <div className="card">
                <span className="do-tag">Do</span>
                <ul className="space-y-2 text-sm text-plrei-text-body">
                  {[
                    'Use official SVG or PNG files from the PLREI server asset library',
                    'Place on white, light, or solid navy (#000080) backgrounds',
                    'Maintain clear space equal to the height of the bolt on all sides',
                    'Minimum digital width: 80px for the full logo, 32px for the mark',
                    'Use the logo mark alone at sizes below 80px wide',
                    'Use exact crest greys #78787A and #595A5A — never approximate',
                  ].map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-0.5 font-bold" style={{ color: '#000080' }}>✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="card">
                <span className="dont-tag">Don&rsquo;t</span>
                <ul className="space-y-2 text-sm text-plrei-text-body">
                  {[
                    'Distort, stretch, skew, or rotate the logo',
                    'Substitute the gold bolt with any other color or gradient',
                    'Place on busy, low-contrast, or patterned backgrounds',
                    'Recreate the PLREI wordmark using any font — it is outlined vector art',
                    'Use legacy versions or files not sourced from the PLREI server',
                  ].map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="text-red-500 mt-0.5">✗</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* File formats */}
            <div className="card">
              <div className="font-semibold text-gray-900 mb-3">Available File Formats</div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { fmt: 'SVG', desc: 'Web & digital — scales infinitely' },
                  { fmt: 'PNG', desc: 'Presentations, documents, web' },
                  { fmt: 'JPG', desc: 'Photos, email, backgrounds' },
                  { fmt: 'EPS', desc: 'Print production & vendors' },
                  { fmt: 'AI',  desc: 'Editable source — designers only' },
                ].map(({ fmt, desc }) => (
                  <div key={fmt} className="rounded-lg p-3 text-center" style={{ backgroundColor: '#E8ECFF' }}>
                    <div className="font-bold text-sm" style={{ color: '#000080' }}>{fmt}</div>
                    <div className="text-xs text-plrei-text-body mt-1">{desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══ COLORS ════════════════════════════════════════════════════════ */}
        <section id="colors" className="bg-plrei-bg-light border-b border-plrei-bg-border">
          <div className="max-w-5xl mx-auto px-6 py-16">
            <p className="section-label">03 — Colors</p>
            <h2 className="section-title">Color Palette</h2>
            <p className="section-body mb-10">
              PLREI has two authorized brand colors: <strong>Navy Blue #000080</strong> and{' '}
              <strong>Brand Yellow #F5C518</strong>. Navy anchors every visual with authority and
              trust; yellow energizes it. All other values below are sourced directly from the
              official logo and letterhead SVG files. Click any swatch to copy its hex code.
            </p>

            {/* Primary brand colors — large and prominent */}
            <div className="mb-10">
              <h3 className="font-semibold text-gray-900 mb-1">Authorized Brand Colors</h3>
              <p className="text-sm text-plrei-text-body mb-4">
                The only two colors approved for use in all brand materials — print, digital, and signage.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {BRAND_PRIMARY.map((c) => (
                  <ColorSwatch key={c.hex} {...c} />
                ))}
              </div>
            </div>

            {/* Logo source colors */}
            <div className="mb-10">
              <h3 className="font-semibold text-gray-900 mb-1">Logo Source Colors</h3>
              <p className="text-sm text-plrei-text-body mb-4">
                Exact values extracted from the official logo SVG files. These appear in print assets;
                use the authorized brand colors above for digital reproductions.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {LOGO_SOURCE.map((c) => (
                  <ColorSwatch key={c.hex} {...c} />
                ))}
              </div>
            </div>

            {/* UI support */}
            <div className="mb-10">
              <h3 className="font-semibold text-gray-900 mb-1">UI Support Colors</h3>
              <p className="text-sm text-plrei-text-body mb-4">
                Supporting colors for web and digital interfaces — not used in printed brand materials.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {UI_SUPPORT.map((c) => (
                  <ColorSwatch key={c.hex} {...c} />
                ))}
              </div>
            </div>

            {/* Crest / special-purpose greys */}
            <div className="mb-10">
              <h3 className="font-semibold text-gray-900 mb-1">Crest &amp; Special-Purpose Greys</h3>
              <p className="text-sm text-plrei-text-body mb-4">
                Exact grey values extracted directly from the crest SVG <code className="bg-gray-100 px-1 rounded text-xs">cls</code> class
                definitions. <strong>#78787A</strong> and <strong>#595A5A</strong> are the two protected
                grey tones — do not substitute or approximate them in any reproduction of the crest.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {CREST_COLORS.map((c) => (
                  <ColorSwatch key={c.hex} {...c} />
                ))}
              </div>
            </div>

            {/* Usage guidelines */}
            <div className="card">
              <div className="font-semibold text-gray-900 mb-3">Color Usage Guidelines</div>
              <div className="grid sm:grid-cols-3 gap-4 text-sm text-plrei-text-body">
                <div>
                  <div className="font-semibold text-gray-800 mb-1">Navy Blue (#000080)</div>
                  Primary color for all brand elements — logos, headings, buttons, borders, and
                  backgrounds. Pairs naturally with white and gold yellow. Never thin it out or
                  mix it toward teal or purple.
                </div>
                <div>
                  <div className="font-semibold text-gray-800 mb-1">Brand Yellow (#F5C518)</div>
                  Use as an accent and highlight — CTA buttons, active indicators, stripes, and
                  borders. Always pair yellow with navy or black backgrounds; avoid yellow text on
                  white (insufficient contrast for body copy).
                </div>
                <div>
                  <div className="font-semibold text-gray-800 mb-1">Accessibility</div>
                  Navy on white: 7.5:1 contrast (WCAG AAA). White on navy: passes AAA. Yellow on
                  navy: 8.6:1 (passes AAA). Yellow text on white: 1.9:1 — do not use for body text.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ TYPOGRAPHY ════════════════════════════════════════════════════ */}
        <section id="typography" className="border-b border-plrei-bg-border">
          <div className="max-w-5xl mx-auto px-6 py-16">
            <p className="section-label">04 — Typography</p>
            <h2 className="section-title">Type System</h2>
            <p className="section-body mb-10">
              PLREI uses three font contexts. The main PLREI wordmark is <strong>fully outlined
              vector art</strong> — not a live font. Do not attempt to recreate it with any typeface.
            </p>

            {/* Font specimens */}
            <div className="grid sm:grid-cols-3 gap-5 mb-10">

              {/* Print / Email */}
              <div className="card flex flex-col">
                <div className="section-label mb-3">Print &amp; Email</div>
                <div style={{ fontFamily: 'Aptos, Calibri, sans-serif' }} className="flex-1">
                  <div className="text-3xl font-bold mb-1" style={{ color: '#000080' }}>Aptos</div>
                  <div className="text-xs text-plrei-text-body mb-4">Fallback: Calibri → sans-serif</div>
                  <div className="text-lg font-semibold mb-1">Power Line Rent-E-Quip</div>
                  <div className="text-sm text-gray-600">
                    Reliable equipment for utility and construction professionals.
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-plrei-bg-border text-xs text-plrei-text-body">
                  Use in: Email signatures, Word documents, letterhead, forms
                </div>
              </div>

              {/* Web / UI */}
              <div className="card flex flex-col">
                <div className="section-label mb-3">Web &amp; Digital UI</div>
                <div style={{ fontFamily: 'Arial, sans-serif' }} className="flex-1">
                  <div className="text-3xl font-bold mb-1" style={{ color: '#000080' }}>Arial</div>
                  <div className="text-xs text-plrei-text-body mb-4">Fallback: sans-serif</div>
                  <div className="text-lg font-semibold mb-1">Power Line Rent-E-Quip</div>
                  <div className="text-sm text-gray-600">
                    Reliable equipment for utility and construction professionals.
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-plrei-bg-border text-xs text-plrei-text-body">
                  Use in: Websites, web apps, digital presentations
                </div>
              </div>

              {/* Logo labels */}
              <div className="card flex flex-col">
                <div className="section-label mb-3">Logo Labels &amp; Signage</div>
                <div style={{ fontFamily: '\'Microsoft Tai Le\', \'Microsoft New Tai Lue\', sans-serif' }} className="flex-1">
                  <div className="text-3xl font-bold mb-1" style={{ color: '#000080' }}>Tai Le</div>
                  <div className="text-xs text-plrei-text-body mb-4">Microsoft Tai Le / New Tai Lue</div>
                  <div className="text-lg font-semibold mb-1">www.plrei.com</div>
                  <div className="text-sm text-gray-600">
                    USDOT 585279 &nbsp;·&nbsp; 540-682-2126
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-plrei-bg-border text-xs text-plrei-text-body">
                  Use in: Truck logos, USDOT markings, return address labels
                </div>
              </div>

            </div>

            {/* PLREI wordmark note */}
            <div
              className="rounded-xl p-5 mb-10 flex gap-4 items-start border"
              style={{ backgroundColor: '#FEF9E3', borderColor: '#F5C518' }}
            >
              <span className="text-2xl mt-0.5">⚡</span>
              <div>
                <div className="font-semibold text-gray-900 mb-1">The PLREI Wordmark Is Not a Font</div>
                <div className="text-sm text-plrei-text-body">
                  The large P-L-R-E-I lettering in the logo is custom-drawn outlined vector art — there
                  is no matching typeface. Never attempt to recreate it using any font. Always use the
                  official logo files from the PLREI server asset library.
                </div>
              </div>
            </div>

            {/* Type scale */}
            <div className="card overflow-hidden">
              <div className="font-semibold text-gray-900 mb-4">Type Scale (Web / Aptos)</div>
              <div className="divide-y divide-plrei-bg-border">
                {TYPE_SCALE.map(({ label, size, weight, sample }) => (
                  <div key={label} className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6 py-4">
                    <div className="flex gap-4 sm:w-48 flex-shrink-0 items-baseline">
                      <span className="text-xs font-bold w-14" style={{ color: '#000080' }}>{label}</span>
                      <span className="text-xs text-gray-400 font-mono">{size} / {weight}w</span>
                    </div>
                    <div className="text-gray-900 leading-none" style={{ fontSize: size, fontWeight: weight }}>
                      {sample}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══ ICONOGRAPHY ═══════════════════════════════════════════════════ */}
        <section id="iconography" className="bg-plrei-bg-light border-b border-plrei-bg-border">
          <div className="max-w-5xl mx-auto px-6 py-16">
            <p className="section-label">05 — Iconography</p>
            <h2 className="section-title">Icon Set</h2>
            <p className="section-body mb-10">
              PLREI uses a small set of navy-on-white icons specifically designed for email signatures.
              These icons provide visual anchors for contact information and maintain consistent
              branding across all employee signatures.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mb-10">
              {ICONS.map(({ file, name, usage }) => (
                <div key={name} className="card text-center">
                  <div className="flex items-center justify-center h-16 mb-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={file} alt={name} className="w-10 h-10 object-contain" />
                  </div>
                  <div className="font-semibold text-sm text-gray-900 mb-1">{name}</div>
                  <div className="text-xs text-plrei-text-body">{usage}</div>
                </div>
              ))}
            </div>

            <div className="card">
              <div className="font-semibold text-gray-900 mb-3">Icon Usage Guidelines</div>
              <div className="grid sm:grid-cols-2 gap-4 text-sm text-plrei-text-body">
                <ul className="space-y-2">
                  <li className="flex gap-2"><span className="font-bold" style={{ color: '#000080' }}>✓</span> Use at 18×18px in email signatures</li>
                  <li className="flex gap-2"><span className="font-bold" style={{ color: '#000080' }}>✓</span> Available as PNG (standard) and WebP (modern browsers)</li>
                  <li className="flex gap-2"><span className="font-bold" style={{ color: '#000080' }}>✓</span> Use absolute URLs — email clients block relative paths</li>
                </ul>
                <ul className="space-y-2">
                  <li className="flex gap-2"><span className="text-red-500">✗</span> Don&rsquo;t resize below 14px or above 24px in signatures</li>
                  <li className="flex gap-2"><span className="text-red-500">✗</span> Don&rsquo;t substitute with generic icon libraries</li>
                  <li className="flex gap-2"><span className="text-red-500">✗</span> Don&rsquo;t use the gold/yellow version — navy-on-white only</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ══ APPLICATIONS ══════════════════════════════════════════════════ */}
        <section id="applications" className="border-b border-plrei-bg-border">
          <div className="max-w-5xl mx-auto px-6 py-16">
            <p className="section-label">06 — Applications</p>
            <h2 className="section-title">Brand in Use</h2>
            <p className="section-body mb-10">
              PLREI brand assets are used across several document types and digital tools.
              Here&rsquo;s where to find each one.
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">

              {/* Email Signature */}
              <div className="card flex flex-col border-t-4" style={{ borderTopColor: '#F5C518' }}>
                <div className="text-2xl mb-3">✉️</div>
                <div className="font-bold text-gray-900 mb-1">Email Signature</div>
                <p className="text-sm text-plrei-text-body mb-4 flex-1">
                  Generate a personalized PLREI email signature. Fill in your name, title, and
                  contact details — preview updates live. Then copy and paste into Outlook or Gmail.
                </p>
                <a
                  href="/email-signature"
                  className="inline-block text-center text-sm font-bold px-4 py-2.5 rounded-lg transition-colors"
                  style={{ backgroundColor: '#F5C518', color: '#000080' }}
                >
                  Open Signature Generator →
                </a>
              </div>

              {/* Letterhead */}
              <div className="card flex flex-col border-t-4" style={{ borderTopColor: '#000080' }}>
                <div className="text-2xl mb-3">📄</div>
                <div className="font-bold text-gray-900 mb-1">Letterhead</div>
                <p className="text-sm text-plrei-text-body mb-4 flex-1">
                  Official letterhead as a Word template (.dotx). Navy logo top-left, gold accent
                  stripe at the bottom — matches the brand exactly. Use for all formal correspondence.
                </p>
                <div className="text-xs text-gray-400 bg-plrei-bg-light rounded-lg px-3 py-2">
                  File: <span className="font-mono">PLREI Letterhead.dotx</span> — PLREI server
                </div>
              </div>

              {/* Customer Forms */}
              <div className="card flex flex-col border-t-4" style={{ borderTopColor: '#000080' }}>
                <div className="text-2xl mb-3">📋</div>
                <div className="font-bold text-gray-900 mb-1">Customer Forms</div>
                <p className="text-sm text-plrei-text-body mb-4 flex-1">
                  Standardized customer-facing forms: accepted forms of payment and renters
                  insurance requirements.
                </p>
                <div className="text-xs text-gray-400 bg-plrei-bg-light rounded-lg px-3 py-2">
                  Location: <span className="font-mono">PLREI Server → Customer Forms</span>
                </div>
              </div>

              {/* Employee Documents */}
              <div className="card flex flex-col border-t-4" style={{ borderTopColor: '#000080' }}>
                <div className="text-2xl mb-3">👤</div>
                <div className="font-bold text-gray-900 mb-1">Employee Documents</div>
                <p className="text-sm text-plrei-text-body mb-4 flex-1">
                  HR documents: employee handbook, 90-day evaluations, driver sheets, healthcare
                  cost handouts, and FormFire enrollment instructions.
                </p>
                <div className="text-xs text-gray-400 bg-plrei-bg-light rounded-lg px-3 py-2">
                  Location: <span className="font-mono">PLREI Server → Employee Forms</span>
                </div>
              </div>

              {/* Logo Assets */}
              <div className="card flex flex-col border-t-4" style={{ borderTopColor: '#F5C518' }}>
                <div className="text-2xl mb-3">⚡</div>
                <div className="font-bold text-gray-900 mb-1">Logo Asset Library</div>
                <p className="text-sm text-plrei-text-body mb-4 flex-1">
                  Full logo library in AI, EPS, SVG, PNG, and JPG. Includes glow and no-glow
                  variants, crest, full lockup, truck/USDOT markings, and return address labels.
                </p>
                <div className="text-xs text-gray-400 bg-plrei-bg-light rounded-lg px-3 py-2">
                  Location: <span className="font-mono">PLREI Server → PLREI Logos</span>
                </div>
              </div>

              {/* Trademark */}
              <div className="card flex flex-col border-t-4" style={{ borderTopColor: '#F5C518' }}>
                <div className="text-2xl mb-3">™</div>
                <div className="font-bold text-gray-900 mb-1">Registered Trademark</div>
                <p className="text-sm text-plrei-text-body mb-4 flex-1">
                  <strong>POWER LINE RENT-E-QUIP®</strong> is a federally registered trademark of
                  Power Line Rent-E-Quip, Inc., covering equipment and truck rental services.
                </p>
                <div className="space-y-1 text-xs text-gray-500 bg-plrei-bg-light rounded-lg px-3 py-2 font-mono">
                  <div>Reg. No. &nbsp;&nbsp;<span className="text-gray-800 font-semibold">7682616</span></div>
                  <div>Serial &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-gray-800">97871840</span></div>
                  <div>IC 039 — Aerial bucket, sign &amp; forestry truck rental; crane rental &amp; leasing</div>
                </div>
              </div>

              {/* Contact */}
              <div className="card flex flex-col" style={{ backgroundColor: '#E8ECFF', borderTopWidth: '4px', borderTopColor: '#000080' }}>
                <div className="text-2xl mb-3">📞</div>
                <div className="font-bold text-gray-900 mb-1">Contact</div>
                <p className="text-sm text-plrei-text-body mb-4 flex-1">
                  For brand questions, asset requests, or approval of new materials.
                </p>
                <div className="text-sm space-y-1">
                  <div className="font-semibold text-gray-800">Power Line Rent-E-Quip, Inc.</div>
                  <div className="text-plrei-text-body">42 Noble Avenue, NE</div>
                  <div className="text-plrei-text-body">Roanoke, VA 24012</div>
                  <a href="tel:5406822126" className="font-medium hover:underline block" style={{ color: '#000080' }}>
                    540-682-2126
                  </a>
                  <a href="tel:5403454400" className="font-medium hover:underline block" style={{ color: '#000080' }}>
                    Fax: 540-345-4400
                  </a>
                  <a href="https://plrei.com" target="_blank" rel="noopener noreferrer" className="font-medium hover:underline block" style={{ color: '#000080' }}>
                    www.plrei.com
                  </a>
                  <div className="text-xs text-gray-400 pt-1">USDOT 585279</div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ══ FOOTER ════════════════════════════════════════════════════════ */}
        {/* Gold top stripe matches the letterhead bottom accent */}
        <footer>
          <div className="h-2 w-full" style={{ backgroundColor: '#F5C518' }} />
          <div style={{ backgroundColor: '#000080' }} className="text-white/70 text-sm">
            <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logos/plrei-mark.svg" alt="" className="h-6 w-auto opacity-80" />
                <span>© {new Date().getFullYear()} Power Line Rent-E-Quip,&nbsp;Inc. &nbsp;·&nbsp; POWER LINE RENT-E-QUIP® Reg.&nbsp;No.&nbsp;7682616</span>
              </div>
              <div className="flex gap-6">
                <a href="#overview"  className="hover:text-white transition-colors">Overview</a>
                <a href="#logo"      className="hover:text-white transition-colors">Logo</a>
                <a href="#colors"    className="hover:text-white transition-colors">Colors</a>
                <a href="#typography" className="hover:text-white transition-colors">Typography</a>
                <a href="/email-signature" className="font-semibold hover:text-white transition-colors" style={{ color: '#F5C518' }}>
                  Signature Tool
                </a>
              </div>
            </div>
          </div>
        </footer>

      </main>
    </>
  );
}
