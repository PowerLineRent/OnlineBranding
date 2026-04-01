import SectionNav from '@/components/SectionNav';
import ColorSwatch from '@/components/ColorSwatch';

const COLORS = [
  { name: 'Navy Blue', hex: '#000080', usage: 'Primary brand color — logos, headings, CTAs', light: false },
  { name: 'Navy Hover', hex: '#0000aa', usage: 'Interactive hover states on navy elements', light: false },
  { name: 'Navy Dark', hex: '#00004d', usage: 'Dark backgrounds and pressed states', light: false },
  { name: 'Black', hex: '#000000', usage: 'Primary body text and dark accents', light: false },
  { name: 'White', hex: '#FFFFFF', usage: 'Page backgrounds and reversed text', light: true },
  { name: 'Light Blue', hex: '#E8ECFF', usage: 'Page and section backgrounds', light: true },
  { name: 'Border', hex: '#D5DBF5', usage: 'Card and divider borders', light: true },
  { name: 'Body Text', hex: '#4A4A63', usage: 'Secondary and descriptive text', light: true },
  { name: 'Muted Text', hex: '#666666', usage: 'Placeholder and caption text', light: true },
  { name: 'Success', hex: '#2A7D2A', usage: 'Confirmation and success messages', light: false },
  { name: 'Error', hex: '#A02A2A', usage: 'Warnings and error messages', light: false },
];

const TYPE_SCALE = [
  { label: 'Display', size: '32px', weight: '700', sample: 'Power Line Rent-E-Quip' },
  { label: 'H1', size: '28px', weight: '700', sample: 'Brand Guidelines' },
  { label: 'H2', size: '24px', weight: '700', sample: 'Color Palette' },
  { label: 'H3', size: '20px', weight: '600', sample: 'Primary Colors' },
  { label: 'H4', size: '16px', weight: '600', sample: 'Usage Notes' },
  { label: 'Body', size: '14px', weight: '400', sample: 'Reliable equipment for utility and construction professionals.' },
  { label: 'Small', size: '12px', weight: '400', sample: '© 2025 Power Line Rent-E-Quip, Inc. All rights reserved.' },
];

const LOGOS = [
  {
    file: '/logos/plrei-primary.svg',
    name: 'Primary Logo',
    desc: 'Standard logo with full company name. Use this as the default in all communications.',
    bg: 'bg-white',
    border: true,
  },
  {
    file: '/logos/plrei-primary.svg',
    name: 'Reversed (on Navy)',
    desc: 'Logo on a navy background. Use for headers, slide decks, and branded materials.',
    bg: 'bg-plrei-navy',
    border: false,
  },
  {
    file: '/logos/plrei-mark.svg',
    name: 'Logo Mark',
    desc: 'Lightning bolt symbol only. Use where space is limited — app icons, favicons, social avatars.',
    bg: 'bg-white',
    border: true,
  },
  {
    file: '/logos/plrei-no-glow.svg',
    name: 'No-Glow Variant',
    desc: 'Flat version without the lightning glow effect. Best for print and small-size applications.',
    bg: 'bg-white',
    border: true,
  },
  {
    file: '/logos/plrei-crest.svg',
    name: 'Crest Variant',
    desc: 'Logo with crest emblem. Use for formal documents, certificates, and official correspondence.',
    bg: 'bg-white',
    border: true,
  },
  {
    file: '/logos/plrei-full-lockup.svg',
    name: 'Full Lockup',
    desc: 'Logo with phone number and website. Use on vehicles, equipment, and external signage.',
    bg: 'bg-white',
    border: true,
  },
];

const ICONS = [
  { file: '/EmailSignature/icon-address.png', name: 'Address', usage: 'Physical location in email signatures' },
  { file: '/EmailSignature/icon-phone.png', name: 'Phone', usage: 'Office, mobile, and fax in email signatures' },
  { file: '/EmailSignature/icon-email.png', name: 'Email', usage: 'Email address in email signatures' },
  { file: '/EmailSignature/icon-link.png', name: 'Link', usage: 'Website URL in email signatures' },
];

export default function BrandPage() {
  return (
    <>
      <SectionNav />

      <main className="bg-white">

        {/* ── HERO ── */}
        <section className="bg-plrei-navy text-white">
          <div className="max-w-5xl mx-auto px-6 py-20 flex flex-col items-center text-center gap-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logos/plrei-primary.svg" alt="PLREI Logo" className="h-28 w-auto" />
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3">Brand Guidelines</h1>
              <p className="text-lg sm:text-xl text-blue-200 max-w-xl">
                The official reference for Power Line Rent-E-Quip, Inc. identity — logos, colors, typography, and more.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <a href="#logo" className="px-5 py-2.5 rounded-lg bg-white text-plrei-navy font-semibold text-sm hover:bg-blue-50 transition-colors">
                Explore Guidelines
              </a>
              <a href="/email-signature" className="px-5 py-2.5 rounded-lg border border-white/40 text-white font-semibold text-sm hover:bg-white/10 transition-colors">
                Signature Tool →
              </a>
            </div>
          </div>
        </section>

        {/* ── OVERVIEW ── */}
        <section id="overview" className="bg-plrei-bg-light border-b border-plrei-bg-border">
          <div className="max-w-5xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-start">
            <div>
              <p className="section-label">01 — Overview</p>
              <h2 className="section-title">About the Brand</h2>
              <p className="section-body mb-4">
                Power Line Rent-E-Quip, Inc. (PLREI) is a full-service equipment rental company based in Roanoke, Virginia,
                serving utility, construction, and infrastructure professionals across the Mid-Atlantic region.
              </p>
              <p className="section-body">
                Our brand reflects the reliability, expertise, and professionalism that customers depend on — from a single job
                site to a fleet-wide deployment. Every visual choice communicates trustworthiness and capability.
              </p>
            </div>
            <div className="grid gap-4">
              {[
                { title: 'Professional', body: 'Clear, direct communication that respects customers&rsquo; time and expertise.' },
                { title: 'Reliable', body: 'Consistent visuals reinforce that PLREI delivers on its promises, every time.' },
                { title: 'Approachable', body: 'Friendly without being casual — expert guidance made accessible.' },
              ].map(({ title, body }) => (
                <div key={title} className="card">
                  <div className="font-bold text-plrei-navy mb-1">{title}</div>
                  <div className="text-sm text-plrei-text-body" dangerouslySetInnerHTML={{ __html: body }} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── LOGO ── */}
        <section id="logo" className="border-b border-plrei-bg-border">
          <div className="max-w-5xl mx-auto px-6 py-16">
            <p className="section-label">02 — Logo</p>
            <h2 className="section-title">Logo System</h2>
            <p className="section-body mb-10">
              The PLREI logo centers on a lightning bolt — a symbol of power, speed, and energy that reflects the company&rsquo;s
              utility roots. Always use official logo files. Never recreate or alter the logo.
            </p>

            {/* Logo grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
              {LOGOS.map(({ file, name, desc, bg, border }) => (
                <div key={name} className={`rounded-xl overflow-hidden border ${border ? 'border-plrei-bg-border' : 'border-plrei-navy'}`}>
                  <div className={`${bg} flex items-center justify-center h-40 p-6`}>
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
                    'Use official SVG or PNG files from the asset library',
                    'Place on white, light, or solid navy backgrounds',
                    'Maintain clear space equal to the height of the lightning bolt on all sides',
                    'Keep minimum digital width of 80px for the full logo',
                    'Use the logo mark for small sizes below 80px',
                  ].map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="card">
                <span className="dont-tag">Don&rsquo;t</span>
                <ul className="space-y-2 text-sm text-plrei-text-body">
                  {[
                    'Distort, stretch, or rotate the logo',
                    'Change the logo colors or add effects not in the original',
                    'Place on busy backgrounds or low-contrast surfaces',
                    'Recreate the logo using custom text or clip art',
                    'Use older logo versions or unofficial variants',
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
                  { fmt: 'JPG', desc: 'Photos, email, web backgrounds' },
                  { fmt: 'EPS', desc: 'Print production & vendors' },
                  { fmt: 'AI', desc: 'Editable source — designers only' },
                ].map(({ fmt, desc }) => (
                  <div key={fmt} className="bg-plrei-bg-light rounded-lg p-3 text-center">
                    <div className="font-bold text-plrei-navy text-sm">{fmt}</div>
                    <div className="text-xs text-plrei-text-body mt-1">{desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── COLORS ── */}
        <section id="colors" className="bg-plrei-bg-light border-b border-plrei-bg-border">
          <div className="max-w-5xl mx-auto px-6 py-16">
            <p className="section-label">03 — Colors</p>
            <h2 className="section-title">Color Palette</h2>
            <p className="section-body mb-10">
              Navy blue is the cornerstone of the PLREI palette — strong, trustworthy, and authoritative. Use it consistently
              across all brand materials. Click any swatch to copy its hex code.
            </p>

            <div className="mb-8">
              <h3 className="font-semibold text-gray-900 mb-4">Primary & Semantic Colors</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {COLORS.map((c) => (
                  <ColorSwatch key={c.hex} {...c} />
                ))}
              </div>
            </div>

            <div className="card">
              <div className="font-semibold text-gray-900 mb-3">Color Usage Guidelines</div>
              <div className="grid sm:grid-cols-3 gap-4 text-sm text-plrei-text-body">
                <div>
                  <div className="font-semibold text-gray-800 mb-1">Backgrounds</div>
                  Use White (#FFFFFF) as the primary background. Light Blue (#E8ECFF) for section backgrounds and
                  callout panels. Navy (#000080) for hero sections and full-bleed headers.
                </div>
                <div>
                  <div className="font-semibold text-gray-800 mb-1">Text</div>
                  Use Black (#000000) for headings and primary content. Body Text (#4A4A63) for paragraphs.
                  Never use navy blue for body text — reserve it for brand elements and links.
                </div>
                <div>
                  <div className="font-semibold text-gray-800 mb-1">Accessibility</div>
                  Navy on white passes WCAG AA contrast (7.5:1 ratio). White on navy passes AAA.
                  Avoid using Body Text color on Light Blue backgrounds for small text.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── TYPOGRAPHY ── */}
        <section id="typography" className="border-b border-plrei-bg-border">
          <div className="max-w-5xl mx-auto px-6 py-16">
            <p className="section-label">04 — Typography</p>
            <h2 className="section-title">Type System</h2>
            <p className="section-body mb-10">
              PLREI uses two complementary font systems: Aptos (falling back to Calibri) for email signatures and
              printed documents, and Arial for web interfaces. Both are professional, legible sans-serif choices.
            </p>

            {/* Font specimens */}
            <div className="grid sm:grid-cols-2 gap-6 mb-10">
              <div className="card">
                <div className="section-label">Print &amp; Email</div>
                <div style={{ fontFamily: 'Aptos, Calibri, sans-serif' }}>
                  <div className="text-4xl font-bold text-plrei-navy mb-1">Aptos</div>
                  <div className="text-sm text-plrei-text-body mb-4">Fallback: Calibri → sans-serif</div>
                  <div className="text-2xl mb-1" style={{ fontFamily: 'Aptos, Calibri, sans-serif' }}>
                    Power Line Rent-E-Quip
                  </div>
                  <div className="text-base text-gray-600" style={{ fontFamily: 'Aptos, Calibri, sans-serif' }}>
                    Reliable equipment for utility and construction professionals.
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-plrei-bg-border text-xs text-plrei-text-body">
                  Use in: Email signatures, Word documents, letterhead, printed forms
                </div>
              </div>
              <div className="card">
                <div className="section-label">Web &amp; Digital UI</div>
                <div style={{ fontFamily: 'Arial, sans-serif' }}>
                  <div className="text-4xl font-bold text-plrei-navy mb-1">Arial</div>
                  <div className="text-sm text-plrei-text-body mb-4">Fallback: sans-serif</div>
                  <div className="text-2xl mb-1">
                    Power Line Rent-E-Quip
                  </div>
                  <div className="text-base text-gray-600">
                    Reliable equipment for utility and construction professionals.
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-plrei-bg-border text-xs text-plrei-text-body">
                  Use in: Websites, web apps, digital presentations, online tools
                </div>
              </div>
            </div>

            {/* Type scale */}
            <div className="card overflow-hidden">
              <div className="font-semibold text-gray-900 mb-4">Type Scale</div>
              <div className="divide-y divide-plrei-bg-border">
                {TYPE_SCALE.map(({ label, size, weight, sample }) => (
                  <div key={label} className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6 py-4">
                    <div className="flex gap-4 sm:w-48 flex-shrink-0 items-baseline">
                      <span className="text-xs font-bold text-plrei-navy w-14">{label}</span>
                      <span className="text-xs text-gray-400 font-mono">{size} / {weight}w</span>
                    </div>
                    <div
                      className="text-gray-900 leading-none"
                      style={{ fontSize: size, fontWeight: weight }}
                    >
                      {sample}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── ICONOGRAPHY ── */}
        <section id="iconography" className="bg-plrei-bg-light border-b border-plrei-bg-border">
          <div className="max-w-5xl mx-auto px-6 py-16">
            <p className="section-label">05 — Iconography</p>
            <h2 className="section-title">Icon Set</h2>
            <p className="section-body mb-10">
              PLREI uses a small set of navy-on-white icons specifically designed for email signatures. These icons
              provide visual anchors for contact information and maintain consistent branding across all employee signatures.
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
                  <li className="flex gap-2"><span className="text-green-600">✓</span> Use at 18×18px in email signatures</li>
                  <li className="flex gap-2"><span className="text-green-600">✓</span> Available as PNG (standard) and WebP (modern browsers)</li>
                  <li className="flex gap-2"><span className="text-green-600">✓</span> Hosted via absolute URL for email client compatibility</li>
                </ul>
                <ul className="space-y-2">
                  <li className="flex gap-2"><span className="text-red-500">✗</span> Don&rsquo;t resize icons below 14px or above 24px in signatures</li>
                  <li className="flex gap-2"><span className="text-red-500">✗</span> Don&rsquo;t substitute different icon styles or libraries</li>
                  <li className="flex gap-2"><span className="text-red-500">✗</span> Don&rsquo;t use relative URLs in HTML emails (images won&rsquo;t load)</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── APPLICATIONS ── */}
        <section id="applications" className="border-b border-plrei-bg-border">
          <div className="max-w-5xl mx-auto px-6 py-16">
            <p className="section-label">06 — Applications</p>
            <h2 className="section-title">Brand in Use</h2>
            <p className="section-body mb-10">
              PLREI brand assets are used across several document types and digital tools. Here&rsquo;s where to find each one.
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">

              {/* Email Signature tool */}
              <div className="card flex flex-col">
                <div className="text-2xl mb-3">✉️</div>
                <div className="font-bold text-gray-900 mb-1">Email Signature</div>
                <p className="text-sm text-plrei-text-body mb-4 flex-1">
                  Generate a personalized PLREI email signature. Fill in your name, title, and contact details —
                  preview updates live. Then copy and paste into Outlook or Gmail.
                </p>
                <a
                  href="/email-signature"
                  className="inline-block text-center bg-plrei-navy text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-plrei-navy-hover transition-colors"
                >
                  Open Signature Generator →
                </a>
              </div>

              {/* Letterhead */}
              <div className="card flex flex-col">
                <div className="text-2xl mb-3">📄</div>
                <div className="font-bold text-gray-900 mb-1">Letterhead</div>
                <p className="text-sm text-plrei-text-body mb-4 flex-1">
                  The official PLREI letterhead is available as a Microsoft Word template (.dotx). Use it for all
                  formal correspondence, proposals, and customer communications.
                </p>
                <div className="text-xs text-gray-400 bg-plrei-bg-light rounded-lg px-3 py-2">
                  File: <span className="font-mono">PLREI Letterhead.dotx</span> — available on the PLREI server
                </div>
              </div>

              {/* Customer Forms */}
              <div className="card flex flex-col">
                <div className="text-2xl mb-3">📋</div>
                <div className="font-bold text-gray-900 mb-1">Customer Forms</div>
                <p className="text-sm text-plrei-text-body mb-4 flex-1">
                  Standardized forms for customer-facing interactions include accepted payment methods and
                  renters insurance requirements.
                </p>
                <div className="text-xs text-gray-400 bg-plrei-bg-light rounded-lg px-3 py-2">
                  Location: <span className="font-mono">PLREI Server → Customer Forms</span>
                </div>
              </div>

              {/* Employee Documents */}
              <div className="card flex flex-col">
                <div className="text-2xl mb-3">👤</div>
                <div className="font-bold text-gray-900 mb-1">Employee Documents</div>
                <p className="text-sm text-plrei-text-body mb-4 flex-1">
                  HR documents including the employee handbook, 90-day evaluations, driver sheets, and benefits handouts.
                </p>
                <div className="text-xs text-gray-400 bg-plrei-bg-light rounded-lg px-3 py-2">
                  Location: <span className="font-mono">PLREI Server → Employee Forms</span>
                </div>
              </div>

              {/* Logo Assets */}
              <div className="card flex flex-col">
                <div className="text-2xl mb-3">⚡</div>
                <div className="font-bold text-gray-900 mb-1">Logo Asset Library</div>
                <p className="text-sm text-plrei-text-body mb-4 flex-1">
                  Full logo library with all variants in AI, EPS, SVG, PNG, and JPG formats.
                  Includes special-purpose logos for trucks, USDOT, and return addresses.
                </p>
                <div className="text-xs text-gray-400 bg-plrei-bg-light rounded-lg px-3 py-2">
                  Location: <span className="font-mono">PLREI Server → PLREI Logos</span>
                </div>
              </div>

              {/* Contact */}
              <div className="card flex flex-col bg-plrei-bg-light">
                <div className="text-2xl mb-3">📞</div>
                <div className="font-bold text-gray-900 mb-1">Brand Contact</div>
                <p className="text-sm text-plrei-text-body mb-4 flex-1">
                  For brand questions, asset requests, or approval of new materials, reach out to the main office.
                </p>
                <div className="text-sm space-y-1">
                  <div className="text-plrei-text-body">Power Line Rent-E-Quip, Inc.</div>
                  <div className="text-plrei-text-body">42 Noble Avenue, NE, Roanoke, VA 24012</div>
                  <a href="tel:5406822126" className="text-plrei-navy font-medium hover:underline">540-682-2126</a>
                  <br />
                  <a href="https://plrei.com" target="_blank" rel="noopener noreferrer" className="text-plrei-navy font-medium hover:underline">plrei.com</a>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="bg-plrei-navy text-white/70 text-sm">
          <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logos/plrei-mark.svg" alt="" className="h-6 w-auto opacity-80" />
              <span>© {new Date().getFullYear()} Power Line Rent-E-Quip, Inc.</span>
            </div>
            <div className="flex gap-6">
              <a href="#overview" className="hover:text-white transition-colors">Overview</a>
              <a href="#logo" className="hover:text-white transition-colors">Logo</a>
              <a href="#colors" className="hover:text-white transition-colors">Colors</a>
              <a href="/email-signature" className="hover:text-white transition-colors">Signature Tool</a>
            </div>
          </div>
        </footer>

      </main>
    </>
  );
}
