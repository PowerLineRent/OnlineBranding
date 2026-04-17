import SectionNav from '@/components/SectionNav';
import ColorSwatch from '@/components/ColorSwatch';
import FallbackImg from '@/components/FallbackImg';
import { auth } from '@/lib/auth';
import { isAdminSession } from '@/lib/auth/admin';
import {
  getEmailSignatureIconFileName,
  getLegacyEmailSignatureAssetUrl,
  getPreferredEmailSignatureAssetUrl,
  resolveEmailSignatureAssetUrls } from '@/lib/emailSignatureAssetUrls';

const APPROVED_COLOR_SYSTEM = [
  {
    name: 'Navy Blue',
    hex: '#000080',
    usage: 'Primary digital color for UI, headings, links, and controls.',
    light: false },
  {
    name: 'Brand Yellow',
    hex: '#F5C518',
    usage: 'Digital accent color for highlights and call-to-action elements.',
    light: false },
  {
    name: 'Charcoal',
    hex: '#3F4042',
    usage: 'Crest body fill.',
    light: false },
  {
    name: 'Gradient Dark',
    hex: '#4A4A4B',
    usage: 'Crest gradient dark stop.',
    light: false },
] as const;

type LogoVariant = {
  name: string;
  preview: string;
  files: string[];
  context?: string;
  guidance?: string;
};

type LogoSection = {
  name: string;
  context: string;
  guidance: string;
  variants: LogoVariant[];
};

const AUTHORIZED_LOGO_SECTIONS: LogoSection[] = [
  {
    name: 'Primary Lockup',
    context: 'Default logo treatment for general brand use on light backgrounds.',
    guidance: 'Use for websites, internal docs, and presentations where the full wordmark is preferred.',
    variants: [
      {
        name: 'White style (with glow)',
        preview: '/logos/authorized/PLREI Lightning.svg',
        files: [
          '/logos/authorized/PLREI Lightning.svg',
          '/logos/authorized/PLREI Lightning.png',
          '/logos/authorized/PLREI Lightning.jpg',
        ],
      },
      {
        name: 'Blue style (with glow)',
        preview: '/logos/authorized/PLREI Lightning (Blue).svg',
        files: [
          '/logos/authorized/PLREI Lightning (Blue).svg',
          '/logos/authorized/PLREI Lightning (Blue).png',
          '/logos/authorized/PLREI Lightning (Blue).jpg',
        ],
      },
      {
        name: 'White style (no glow)',
        preview: '/logos/authorized/PLREI Lightning without Glow.svg',
        files: [
          '/logos/authorized/PLREI Lightning without Glow.svg',
          '/logos/authorized/PLREI Lightning without Glow.png',
          '/logos/authorized/PLREI Lightning without Glow.jpg',
        ],
      },
      {
        name: 'Blue style (no glow)',
        preview: '/logos/authorized/PLREI Lightning (Blue) without Glow.svg',
        files: [
          '/logos/authorized/PLREI Lightning (Blue) without Glow.svg',
          '/logos/authorized/PLREI Lightning (Blue) without Glow.png',
          '/logos/authorized/PLREI Lightning (Blue) without Glow.jpg',
        ],
      },
    ],
  },
  {
    name: 'Mark Only',
    context: 'Lightning symbol only for avatars, badges, and compact placements.',
    guidance: 'Use only when full wordmark is not legible at target size.',
    variants: [
      {
        name: 'White style (with glow)',
        preview: '/logos/authorized/PLREI Lightning No Name.svg',
        files: [
          '/logos/authorized/PLREI Lightning No Name.svg',
          '/logos/authorized/PLREI Lightning No Name.png',
          '/logos/authorized/PLREI Lightning No Name.jpg',
        ],
      },
      {
        name: 'Blue style (with glow)',
        preview: '/logos/authorized/PLREI Lightning (Blue) No Name.svg',
        files: [
          '/logos/authorized/PLREI Lightning (Blue) No Name.svg',
          '/logos/authorized/PLREI Lightning (Blue) No Name.png',
          '/logos/authorized/PLREI Lightning (Blue) No Name.jpg',
        ],
      },
      {
        name: 'White style (no glow)',
        preview: '/logos/authorized/PLREI Lightning without Glow No Name.svg',
        files: [
          '/logos/authorized/PLREI Lightning without Glow No Name.svg',
          '/logos/authorized/PLREI Lightning without Glow No Name.png',
          '/logos/authorized/PLREI Lightning without Glow No Name.jpg',
        ],
      },
      {
        name: 'Blue style (no glow)',
        preview: '/logos/authorized/PLREI Lightning (Blue) without Glow No Name.svg',
        files: [
          '/logos/authorized/PLREI Lightning (Blue) without Glow No Name.svg',
          '/logos/authorized/PLREI Lightning (Blue) without Glow No Name.png',
          '/logos/authorized/PLREI Lightning (Blue) without Glow No Name.jpg',
        ],
      },
    ],
  },
  {
    name: 'Full Lockup with Phone & Web',
    context: 'Operational lockup including contact details for external/public contexts.',
    guidance: 'Use on vehicles, signage, and collateral where direct contact details are required.',
    variants: [
      {
        name: 'White style (with glow)',
        preview: '/logos/authorized/PLREI Lightning Phone Number and Website.svg',
        files: [
          '/logos/authorized/PLREI Lightning Phone Number and Website.svg',
          '/logos/authorized/PLREI Lightning Phone Number and Website.png',
          '/logos/authorized/PLREI Lightning Phone Number and Website.jpg',
        ],
      },
      {
        name: 'Blue style (with glow)',
        preview: '/logos/authorized/PLREI Lightning Phone Number and Website (Blue).svg',
        files: [
          '/logos/authorized/PLREI Lightning Phone Number and Website (Blue).svg',
          '/logos/authorized/PLREI Lightning Phone Number and Website (Blue).png',
          '/logos/authorized/PLREI Lightning Phone Number and Website (Blue).jpg',
        ],
      },
      {
        name: 'White style (no glow)',
        preview: '/logos/authorized/PLREI Lightning Phone Number and Website without Glow.svg',
        files: [
          '/logos/authorized/PLREI Lightning Phone Number and Website without Glow.svg',
          '/logos/authorized/PLREI Lightning Phone Number and Website without Glow.png',
          '/logos/authorized/PLREI Lightning Phone Number and Website without Glow.jpg',
        ],
      },
      {
        name: 'Blue style (no glow)',
        preview: '/logos/authorized/PLREI Lightning Phone Number and Website (Blue) without Glow.svg',
        files: [
          '/logos/authorized/PLREI Lightning Phone Number and Website (Blue) without Glow.svg',
          '/logos/authorized/PLREI Lightning Phone Number and Website (Blue) without Glow.png',
          '/logos/authorized/PLREI Lightning Phone Number and Website (Blue) without Glow.jpg',
        ],
      },
    ],
  },
  {
    name: 'Crest Lockup',
    context: 'Formal crest-inclusive lockup for official or ceremonial materials.',
    guidance: 'Use on documents and assets that require the crest treatment.',
    variants: [
      {
        name: 'With phone and web',
        preview: '/logos/authorized/PLREI Lightning Phone Number and Website with Crest.svg',
        files: [
          '/logos/authorized/PLREI Lightning Phone Number and Website with Crest.svg',
          '/logos/authorized/PLREI Lightning Phone Number and Website with Crest.png',
          '/logos/authorized/PLREI Lightning Phone Number and Website with Crest.jpg',
        ],
      },
      {
        name: 'Without phone and web',
        preview: '/logos/authorized/PLREI Lightning with Crest.svg',
        files: [
          '/logos/authorized/PLREI Lightning with Crest.svg',
          '/logos/authorized/PLREI Lightning with Crest.png',
          '/logos/authorized/PLREI Lightning with Crest.jpg',
        ],
      },
    ],
  },
  {
    name: 'Full Lockup with Crest & Phone & Web',
    context: 'Contact lockup with crest for formal external applications.',
    guidance: 'Reserve for official fleet/signage uses requiring both contact details and crest.',
    variants: [
      {
        name: 'All elements combined',
        preview: '/logos/authorized/PLREI Lightning Phone Number and Website with Crest.svg',
        files: [
          '/logos/authorized/PLREI Lightning Phone Number and Website with Crest.svg',
          '/logos/authorized/PLREI Lightning Phone Number and Website with Crest.png',
          '/logos/authorized/PLREI Lightning Phone Number and Website with Crest.jpg',
        ],
      },
    ],
  },
  {
    name: 'Special Purpose',
    context: 'Special-purpose marks are reserved for workflow-specific operational uses.',
    guidance: 'Phone and web contact details always appear together as a paired lockup and are not split into separate marks.',
    variants: [
      {
        name: 'Return Address',
        preview: '/logos/authorized/Special Purpose Logos/Return Address/PLREI Return Address.svg',
        context: 'Return-address signature mark for envelopes and mailing collateral.',
        guidance: 'Use only in addressing workflows where compact return identity is needed.',
        files: [
          '/logos/authorized/Special Purpose Logos/Return Address/PLREI Return Address.svg',
          '/logos/authorized/Special Purpose Logos/Return Address/PLREI Return Address.png',
          '/logos/authorized/Special Purpose Logos/Return Address/PLREI Return Address.jpg',
          '/logos/authorized/Special Purpose Logos/Return Address/PLREI Return Address.ai',
          '/logos/authorized/Special Purpose Logos/Return Address/PLREI Return Address.eps',
        ],
      },
      {
        name: 'Trucks Rented From',
        preview: '/logos/authorized/Special Purpose Logos/Trucks Rented From/PLREI Rented From.svg',
        context: 'Vehicle-specific compliance mark for rental/fleet identification.',
        guidance: 'Apply to truck decals and transport labeling where this language is required.',
        files: [
          '/logos/authorized/Special Purpose Logos/Trucks Rented From/PLREI Rented From.svg',
          '/logos/authorized/Special Purpose Logos/Trucks Rented From/PLREI Rented From.png',
          '/logos/authorized/Special Purpose Logos/Trucks Rented From/PLREI Rented From.jpg',
          '/logos/authorized/Special Purpose Logos/Trucks Rented From/PLREI Rented From.ai',
          '/logos/authorized/Special Purpose Logos/Trucks Rented From/PLREI Rented From.eps',
        ],
      },
      {
        name: 'USDOT',
        preview: '/logos/authorized/Special Purpose Logos/Trucks Rented From/PLREI USDOT.svg',
        context: 'Regulatory USDOT signature variant used for fleet/legal transport labeling.',
        guidance: 'Use where transport regulation requires explicit USDOT identification.',
        files: [
          '/logos/authorized/Special Purpose Logos/Trucks Rented From/PLREI USDOT.svg',
          '/logos/authorized/Special Purpose Logos/Trucks Rented From/PLREI USDOT.png',
          '/logos/authorized/Special Purpose Logos/Trucks Rented From/PLREI USDOT.jpg',
          '/logos/authorized/Special Purpose Logos/Trucks Rented From/PLREI USDOT.ai',
          '/logos/authorized/Special Purpose Logos/Trucks Rented From/PLREI USDOT.eps',
        ],
      },
      {
        name: 'Website Label',
        preview: '/logos/authorized/Special Purpose Logos/Trucks Rented From/PLREI Website.svg',
        context: 'Fleet/operational website-only mark variant.',
        guidance: 'Use where only the website line is required in transport or utility labeling.',
        files: [
          '/logos/authorized/Special Purpose Logos/Trucks Rented From/PLREI Website.svg',
          '/logos/authorized/Special Purpose Logos/Trucks Rented From/PLREI Website.png',
          '/logos/authorized/Special Purpose Logos/Trucks Rented From/PLREI Website.jpg',
          '/logos/authorized/Special Purpose Logos/Trucks Rented From/PLREI Website.ai',
          '/logos/authorized/Special Purpose Logos/Trucks Rented From/PLREI Website.eps',
        ],
      },
    ],
  },
];

const LETTERHEAD_SPECIFICATIONS = [
  'Template file: PLREI Letterhead.dotx',
  'Page size: US Letter (8.5 in x 11 in).',
  'Page margins: 1.0 in on all sides.',
  'Header artwork spans 8.5 in x 2.0 in and is anchored to page-right in the header region.',
  'Use the template directly for formal correspondence so branding, spacing, and header scale remain consistent.',
] as const;

const ICONS = [
  {
    name: 'Address',
    fileName: getEmailSignatureIconFileName('address'),
    slug: 'address' },
  {
    name: 'Phone',
    fileName: getEmailSignatureIconFileName('phone'),
    slug: 'phone' },
  {
    name: 'Email',
    fileName: getEmailSignatureIconFileName('email'),
    slug: 'email' },
  {
    name: 'Link',
    fileName: getEmailSignatureIconFileName('link'),
    slug: 'link' },
] as const;

export default async function BrandPage() {
  const currentYear = new Date().getFullYear();
  const [session, resolvedIconUrls] = await Promise.all([
    auth(),
    resolveEmailSignatureAssetUrls(ICONS.map((icon) => icon.fileName)),
  ]);

  return (
    <>
      <SectionNav userEmail={session?.user?.email ?? undefined} isAdmin={isAdminSession(session)} />

      <main className="bg-white">
        <section style={{ backgroundColor: '#000080' }}>
          <div className="max-w-5xl mx-auto px-6 py-14" style={{ color: '#FFFFFF' }}>
            <h1 style={{ margin: 0, marginBottom: '12px', fontSize: '42px', fontWeight: 800, lineHeight: 1.08, color: '#F5C518' }}>
              Power Line Rent-E-Quip, Inc.
              <br />
              Brand Reference
            </h1>
            <p style={{ margin: 0, color: '#E7ECFF', maxWidth: '860px', fontSize: '24px', lineHeight: 1.35 }}>
              Official standards for logo usage, color, typography, and signature iconography.
            </p>
          </div>
          <div className="h-2" style={{ backgroundColor: '#F5C518' }} />
        </section>

        <section id="overview" className="border-b border-plrei-bg-border">
          <div className="max-w-5xl mx-auto px-6 py-14">
            <p className="section-label">01 - Overview</p>
            <h2 className="section-title">Core Standards</h2>
            <p className="section-body mb-4">
              Power Line Rent-E-Quip, Inc. is represented by approved logo files only. Never redraw, retype, recolor,
              stretch, squash, or rebuild the logo from fonts.
            </p>
            <div className="rounded-xl border p-4" style={{ backgroundColor: '#EFF3FF', borderColor: '#B7C5EE' }}>
              <p className="section-body mb-3">
                This implementation is aligned to the authoritative PLREI asset library.
              </p>
              <a
                href="https://plrei.sharepoint.com/sites/PLREIServer/SitePages/Forms-&-Templates.aspx"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md border font-semibold transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#000080', borderColor: '#000080', color: '#FFFFFF' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 3h7m0 0v7m0-7L10 14" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5h6M5 5v14h14v-6" />
                </svg>
                <span>Open PLREI Forms &amp; Templates Library</span>
              </a>
            </div>
          </div>
        </section>

        <section id="logo" className="bg-plrei-bg-light border-b border-plrei-bg-border">
          <div className="max-w-5xl mx-auto px-6 py-14">
            <p className="section-label">02 - Authorized Logos</p>
            <h2 className="section-title">Complete Logo Library And Letterhead</h2>
            <p className="section-body mb-8">
              This catalog groups logo families by core type so each approved variant can be referenced in one place.
              Use each variant only in its intended context.
            </p>

            <div className="space-y-6 mb-8">
              {AUTHORIZED_LOGO_SECTIONS.map((section) => (
                <div key={section.name} className="card p-5">
                  <h3 className="text-xl mb-2">{section.name}</h3>
                  <p className="mb-2">{section.context}</p>
                  <p className="mb-4">{section.guidance}</p>

                  <div className="grid sm:grid-cols-2 gap-5">
                    {section.variants.map((variant) => (
                      <div key={`${section.name}-${variant.name}`} className="rounded-lg border border-plrei-bg-border bg-white p-4">
                        <div className="h-36 flex items-center justify-center p-3 mb-3" style={{ backgroundColor: '#FFFFFF' }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={encodeURI(variant.preview)} alt={`PLREI ${section.name} ${variant.name}`} className="max-h-24 max-w-full object-contain" />
                        </div>
                        <div className="mb-1">{variant.name}</div>
                        {variant.context && <p className="mb-2">{variant.context}</p>}
                        {variant.guidance && <p className="mb-3">{variant.guidance}</p>}
                        <div className="flex flex-wrap gap-2">
                          {variant.files.map((filePath) => (
                            <a
                              key={filePath}
                              href={encodeURI(filePath)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-1 rounded border border-plrei-bg-border text-xs hover:bg-plrei-bg-light"
                            >
                              {filePath.split('/').pop()}
                            </a>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div className="card">
                <span className="do-tag">Do</span>
                <ul className="space-y-2">
                  <li className="flex gap-2"><span style={{}}>+</span><span>Use only approved files from the authoritative PLREI logo directory.</span></li>
                  <li className="flex gap-2"><span style={{}}>+</span><span>Preserve original proportions and vector geometry.</span></li>
                  <li className="flex gap-2"><span style={{}}>+</span><span>Use white or very light fields for all logo lockups.</span></li>
                  <li className="flex gap-2"><span style={{}}>+</span><span>Prefer SVG/AI/EPS for production and print. Use PNG/JPG for quick placement only.</span></li>
                </ul>
              </div>
              <div className="card">
                <span className="dont-tag">Do Not</span>
                <ul className="space-y-2">
                  <li className="flex gap-2"><span className="">x</span><span>Place logo files directly on dark navy fills without a white hold shape.</span></li>
                  <li className="flex gap-2"><span className="">x</span><span>Stretch, skew, rotate, recolor, or add effects to any logo variant.</span></li>
                  <li className="flex gap-2"><span className="">x</span><span>Recreate the wordmark from any font. It is outlined vector artwork only.</span></li>
                  <li className="flex gap-2"><span className="">x</span><span>Substitute special-purpose marks (Return Address, Rented From, USDOT, Website) outside their intended use case.</span></li>
                </ul>
              </div>
            </div>

            <div className="card mt-8">
              <div className="mb-3">Letterhead Template</div>
              <p className="mb-4">
                The official letterhead template has been audited and added to the repository with a preview image.
                Use this template for formal correspondence to preserve exact brand layout.
              </p>
              <div className="grid lg:grid-cols-2 gap-5 items-start">
                <div className="rounded-lg border border-plrei-bg-border bg-white p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/letterhead/plrei-letterhead-preview.png"
                    alt="PLREI letterhead template preview"
                    className="w-full h-auto object-contain"
                  />
                </div>
                <div>
                  <ul className="space-y-2 mb-4">
                    {LETTERHEAD_SPECIFICATIONS.map((spec) => (
                      <li key={spec} className="flex gap-2"><span>+</span><span>{spec}</span></li>
                    ))}
                  </ul>
                  <a
                    href="/letterhead/plrei-letterhead.dotx"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-2 rounded border border-plrei-bg-border hover:bg-plrei-bg-light"
                  >
                    Download Letterhead Template (.dotx)
                  </a>
                </div>
              </div>
            </div>

          </div>
        </section>

        <section id="colors" className="border-b border-plrei-bg-border">
          <div className="max-w-5xl mx-auto px-6 py-14">
            <p className="section-label">03 - Colors</p>
            <h2 className="section-title">Approved Color System</h2>
            <p className="section-body mb-8">
              Use these four approved tokens consistently across digital UI and brand-support applications.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {APPROVED_COLOR_SYSTEM.map((color) => (
                <ColorSwatch key={color.name} {...color} />
              ))}
            </div>
          </div>
        </section>

        <section id="iconography" className="border-b border-plrei-bg-border">
          <div className="max-w-5xl mx-auto px-6 py-14">
            <p className="section-label">05 - Iconography</p>
            <h2 className="section-title">Email Signature Icons</h2>
            <div
              className="rounded-xl border mb-8 p-5"
              style={{ backgroundColor: '#000080', borderColor: '#D5DBF5' }}
            >
              <div className="mb-2" style={{ color: '#FFFFFF' }}>Official PLREI Brand Guidelines Reference</div>
              <p style={{ color: '#E7ECFF' }}>
                This section defines the only approved email signature icons and implementation methods for
                Power Line Rent-E-Quip, Inc. Use these rules for the web app, exported signatures, and email template
                generation.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-5 mb-6">
              {ICONS.map((icon) => (
                <div key={icon.name} className="card">
                  <div className="flex items-center gap-3 mb-3">
                    <FallbackImg
                      src={resolvedIconUrls[icon.fileName] ?? getPreferredEmailSignatureAssetUrl(icon.fileName)}
                      fallbackSrc={getLegacyEmailSignatureAssetUrl(icon.fileName)}
                      alt={`${icon.name} icon`}
                      width={18}
                      height={18}
                      className=""
                    />
                    <div>{icon.name}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="card mb-6">
              <div className="mb-3">Technical Requirements</div>
              <ul className="space-y-2">
                <li className="flex gap-2"><span>+</span><span>Icons must be navy-on-white approved assets only.</span></li>
                <li className="flex gap-2"><span>+</span><span>Render every icon at exactly 18x18 pixels.</span></li>
                <li className="flex gap-2"><span>x</span><span>Do not substitute Font Awesome, Heroicons, Lucide, or any generic icon library.</span></li>
              </ul>
            </div>

          </div>
        </section>

        <section id="applications" className="bg-plrei-bg-light border-b border-plrei-bg-border">
          <div className="max-w-5xl mx-auto px-6 py-14">
            <p className="section-label">06 - Applications</p>
            <h2 className="section-title">Operational Usage</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="card border-t-4" style={{ borderTopColor: '#F5C518' }}>
                <div className="mb-2">Email Signature Tool</div>
                <p className="mb-4">Generate compliant employee signatures using approved logo/icon assets.</p>
                <a href="/email-signature" className="inline-block px-4 py-2 rounded" style={{ backgroundColor: '#F5C518' }}>
                  Open Signature Generator
                </a>
              </div>
              <div className="card border-t-4" style={{ borderTopColor: '#000080' }}>
                <div className="mb-2">Logo Asset Library</div>
                <p className="">
                  Use only files from the approved PLREI logo source directory and its controlled exports.
                </p>
              </div>
            </div>
          </div>
        </section>

        <footer>
          <div className="h-2" style={{ backgroundColor: '#F5C518' }} />
          <div className="" style={{ backgroundColor: '#000080', color: '#FFFFFF' }}>
            <div className="max-w-5xl mx-auto px-6 py-6 flex items-center gap-3">
              <span>Official brand compliance reference. (c) {currentYear} Power Line Rent-E-Quip, Inc.</span>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}




