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
    light: true },
  {
    name: 'Tinted Background',
    hex: '#EFF3FF',
    usage: 'Alternate section background tint for visual separation on web layouts.',
    light: true },
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

const NEUTRAL_COLOR_SYSTEM = [
  {
    name: 'Black',
    hex: '#000000',
    usage: 'High-contrast text and monochrome utility use only.',
    light: false },
  {
    name: 'White',
    hex: '#FFFFFF',
    usage: 'Card surfaces, logo hold shapes, and reverse text/background applications.',
    light: true },
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
        context: 'Full wordmark with white lightning and glow effect.',
        preview: '/logos/authorized/PLREI Lightning.svg',
        files: [
          '/logos/authorized/PLREI Lightning.svg',
          '/logos/authorized/PLREI Lightning.png',
          '/logos/authorized/PLREI Lightning.jpg',
        ],
      },
      {
        name: 'Blue style (with glow)',
        context: 'Full wordmark with navy lightning and glow effect.',
        preview: '/logos/authorized/PLREI Lightning (Blue).svg',
        files: [
          '/logos/authorized/PLREI Lightning (Blue).svg',
          '/logos/authorized/PLREI Lightning (Blue).png',
          '/logos/authorized/PLREI Lightning (Blue).jpg',
        ],
      },
      {
        name: 'White style (no glow)',
        context: 'Clean white wordmark without glow. Preferred for print.',
        preview: '/logos/authorized/PLREI Lightning without Glow.svg',
        files: [
          '/logos/authorized/PLREI Lightning without Glow.svg',
          '/logos/authorized/PLREI Lightning without Glow.png',
          '/logos/authorized/PLREI Lightning without Glow.jpg',
        ],
      },
      {
        name: 'Blue style (no glow)',
        context: 'Clean navy wordmark without glow. Preferred for print.',
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
        context: 'White lightning mark with glow. For digital avatars and badges.',
        preview: '/logos/authorized/PLREI Lightning No Name.svg',
        files: [
          '/logos/authorized/PLREI Lightning No Name.svg',
          '/logos/authorized/PLREI Lightning No Name.png',
          '/logos/authorized/PLREI Lightning No Name.jpg',
        ],
      },
      {
        name: 'Blue style (with glow)',
        context: 'Navy lightning mark with glow. For digital avatars and badges.',
        preview: '/logos/authorized/PLREI Lightning (Blue) No Name.svg',
        files: [
          '/logos/authorized/PLREI Lightning (Blue) No Name.svg',
          '/logos/authorized/PLREI Lightning (Blue) No Name.png',
          '/logos/authorized/PLREI Lightning (Blue) No Name.jpg',
        ],
      },
      {
        name: 'White style (no glow)',
        context: 'White lightning mark without glow. For print or tight placements.',
        preview: '/logos/authorized/PLREI Lightning without Glow No Name.svg',
        files: [
          '/logos/authorized/PLREI Lightning without Glow No Name.svg',
          '/logos/authorized/PLREI Lightning without Glow No Name.png',
          '/logos/authorized/PLREI Lightning without Glow No Name.jpg',
        ],
      },
      {
        name: 'Blue style (no glow)',
        context: 'Navy lightning mark without glow. For print or tight placements.',
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
        context: 'White wordmark with phone, website, and glow effect.',
        preview: '/logos/authorized/PLREI Lightning Phone Number and Website.svg',
        files: [
          '/logos/authorized/PLREI Lightning Phone Number and Website.svg',
          '/logos/authorized/PLREI Lightning Phone Number and Website.png',
          '/logos/authorized/PLREI Lightning Phone Number and Website.jpg',
        ],
      },
      {
        name: 'Blue style (with glow)',
        context: 'Navy wordmark with phone, website, and glow effect.',
        preview: '/logos/authorized/PLREI Lightning Phone Number and Website (Blue).svg',
        files: [
          '/logos/authorized/PLREI Lightning Phone Number and Website (Blue).svg',
          '/logos/authorized/PLREI Lightning Phone Number and Website (Blue).png',
          '/logos/authorized/PLREI Lightning Phone Number and Website (Blue).jpg',
        ],
      },
      {
        name: 'White style (no glow)',
        context: 'White wordmark with phone and website, no glow. For print.',
        preview: '/logos/authorized/PLREI Lightning Phone Number and Website without Glow.svg',
        files: [
          '/logos/authorized/PLREI Lightning Phone Number and Website without Glow.svg',
          '/logos/authorized/PLREI Lightning Phone Number and Website without Glow.png',
          '/logos/authorized/PLREI Lightning Phone Number and Website without Glow.jpg',
        ],
      },
      {
        name: 'Blue style (no glow)',
        context: 'Navy wordmark with phone and website, no glow. For print.',
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
        context: 'Crest with full wordmark, phone number, and website.',
        preview: '/logos/authorized/PLREI Lightning Phone Number and Website with Crest.svg',
        files: [
          '/logos/authorized/PLREI Lightning Phone Number and Website with Crest.svg',
          '/logos/authorized/PLREI Lightning Phone Number and Website with Crest.png',
          '/logos/authorized/PLREI Lightning Phone Number and Website with Crest.jpg',
        ],
      },
      {
        name: 'Without phone and web',
        context: 'Crest with wordmark only. For formal identity use without contact details.',
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
        context: 'Complete logo with crest, wordmark, phone number, and website.',
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
        ],
      },
    ],
  },
];

const LETTERHEAD_SPECIFICATIONS = [
  'Template file: PLREI Letterhead.dotx',
  'Page size: US Letter (8.5 in × 11 in).',
  'Page margins: 1.0 in on all sides.',
  'Header artwork spans 8.5 in × 2.0 in, anchored to the top-right of the header region.',
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
      <SectionNav
        userEmail={session?.user?.email ?? undefined}
        userName={session?.user?.name ?? undefined}
        isAdmin={isAdminSession(session)}
      />

      <main className="bg-white">
        <section style={{ backgroundColor: '#000080' }}>
          <div className="max-w-5xl mx-auto px-6 py-14" style={{ color: '#FFFFFF' }}>
            <h1 style={{ margin: 0, marginBottom: '12px', fontSize: '42px', fontWeight: 800, lineHeight: 1.08, color: '#F5C518' }}>
              Power Line Rent-E-Quip, Inc.
              <br />
              Brand Reference
            </h1>
            <p style={{ margin: 0, color: '#FFFFFF', maxWidth: '860px', fontSize: '24px', lineHeight: 1.35 }}>
              Official standards for logo usage, color, typography, and signature iconography.
            </p>
            <p className="mt-5 text-sm font-semibold uppercase tracking-wider" style={{ color: '#E7ECFF' }}>
              Jump to...
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <a
                href="#overview"
                className="inline-flex items-center rounded border px-3 py-1.5 text-sm font-semibold transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#000080]"
                style={{ borderColor: '#FFFFFF', color: '#FFFFFF' }}
              >
                Overview
              </a>
              <a
                href="#logo"
                className="inline-flex items-center rounded border px-3 py-1.5 text-sm font-semibold transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#000080]"
                style={{ borderColor: '#FFFFFF', color: '#FFFFFF' }}
              >
                Logos
              </a>
              <a
                href="#colors"
                className="inline-flex items-center rounded border px-3 py-1.5 text-sm font-semibold transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#000080]"
                style={{ borderColor: '#FFFFFF', color: '#FFFFFF' }}
              >
                Colors
              </a>
              <a
                href="#iconography"
                className="inline-flex items-center rounded border px-3 py-1.5 text-sm font-semibold transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#000080]"
                style={{ borderColor: '#FFFFFF', color: '#FFFFFF' }}
              >
                Icons
              </a>
              <a
                href="#applications"
                className="inline-flex items-center rounded border px-3 py-1.5 text-sm font-semibold transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#000080]"
                style={{ borderColor: '#FFFFFF', color: '#FFFFFF' }}
              >
                Applications
              </a>
              <a
                href="/branding-memory"
                className="inline-flex items-center rounded border px-3 py-1.5 text-sm font-semibold transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#000080]"
                style={{ backgroundColor: '#F5C518', borderColor: '#F5C518', color: '#000080' }}
              >
                AI Memory
              </a>
            </div>
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
            <div className="rounded-xl border p-4" style={{ backgroundColor: '#FFFFFF', borderColor: '#000080' }}>
              <p className="section-body mb-3">
                This implementation is aligned to the authoritative PLREI asset library.
              </p>
              <a
                href="https://plrei.sharepoint.com/sites/PLREIServer/SitePages/Forms-&-Templates.aspx"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md border font-semibold transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#000080] focus-visible:ring-offset-2"
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
                  <h3 className="text-xl font-bold mb-1" style={{ color: '#000080' }}>{section.name}</h3>
                  <p className="text-base mb-0.5 leading-snug" style={{ color: '#4A4A4B' }}>{section.context}</p>
                  <p className="text-base mb-4 leading-snug" style={{ color: '#4A4A4B' }}>{section.guidance}</p>

                  <div className="grid sm:grid-cols-2 gap-5">
                    {section.variants.map((variant) => (
                      <div key={`${section.name}-${variant.name}`} className="flex flex-col rounded-lg border border-plrei-bg-border bg-white p-4">
                        <div className="h-48 flex items-center justify-center p-4 mb-3" style={{ backgroundColor: '#FFFFFF' }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={encodeURI(variant.preview)} alt={`PLREI ${section.name} ${variant.name}`} className="max-h-40 max-w-full object-contain" />
                        </div>
                        <div className="font-bold text-base mb-1" style={{ color: '#000080' }}>{variant.name}</div>
                        {variant.context && <p className="text-xs mb-1 leading-snug" style={{ color: '#6B7280' }}>{variant.context}</p>}
                        {variant.guidance && <p className="text-xs leading-snug mb-4" style={{ color: '#6B7280' }}>{variant.guidance}</p>}
                        <div className="grid gap-2 mt-auto pt-3" style={{ gridTemplateColumns: `repeat(${variant.files.length}, 1fr)` }}>
                          {[...variant.files].sort((a, b) => {
                            const order = ['png', 'jpg', 'svg'];
                            return order.indexOf(a.split('.').pop()!) - order.indexOf(b.split('.').pop()!);
                          }).map((filePath) => {
                            const ext = filePath.split('.').pop();
                            return (
                              <a
                                key={filePath}
                                href={encodeURI(filePath)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-1.5 py-2.5 rounded text-sm font-semibold uppercase tracking-wide transition-colors bg-plrei-bg-light text-plrei-navy border border-plrei-bg-border hover:bg-plrei-navy hover:text-white hover:border-plrei-navy"
                              >
                                <svg width="13" height="13" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M7.50005 1.04999C7.74858 1.04999 7.95005 1.25146 7.95005 1.49999V8.41359L10.1819 6.18179C10.3576 6.00605 10.6425 6.00605 10.8182 6.18179C10.994 6.35753 10.994 6.64245 10.8182 6.81819L7.81825 9.81819C7.64251 9.99392 7.35759 9.99392 7.18185 9.81819L4.18185 6.81819C4.00611 6.64245 4.00611 6.35753 4.18185 6.18179C4.35759 6.00605 4.64251 6.00605 4.81825 6.18179L7.05005 8.41359V1.49999C7.05005 1.25146 7.25152 1.04999 7.50005 1.04999ZM2.5 10C2.77614 10 3 10.2239 3 10.5V12C3 12.5539 3.44565 13 3.99635 13H11.0012C11.5529 13 12 12.5528 12 12V10.5C12 10.2239 12.2239 10 12.5 10C12.7761 10 13 10.2239 13 10.5V12C13 13.1041 12.1062 14 11.0012 14H3.99635C2.89019 14 2 13.103 2 12V10.5C2 10.2239 2.22386 10 2.5 10Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"/></svg>
                                {ext}
                              </a>
                            );
                          })}
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
              <div className="font-bold text-base mb-1" style={{ color: '#000080' }}>Letterhead Template</div>
              <p className="mb-4" style={{ color: '#4A4A4B' }}>
                Use this template for all formal correspondence. It preserves the correct brand layout, header scale, and spacing.
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
                    className="inline-block px-4 py-2 rounded border hover:bg-plrei-bg-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#000080] focus-visible:ring-offset-2"
                    style={{ borderColor: '#000080' }}
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
              These are the only approved colors for PLREI digital and brand materials. Use them consistently across all applications.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {APPROVED_COLOR_SYSTEM.map((color) => (
                <ColorSwatch key={color.name} {...color} />
              ))}
            </div>

            <h3 className="text-xl font-bold mt-8 mb-3" style={{ color: '#3F4042' }}>Neutrals</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {NEUTRAL_COLOR_SYSTEM.map((color) => (
                <ColorSwatch key={color.name} {...color} />
              ))}
            </div>
          </div>
        </section>

        <section id="iconography" className="bg-plrei-bg-light border-b border-plrei-bg-border">
          <div className="max-w-5xl mx-auto px-6 py-14">
            <p className="section-label">04 - Iconography</p>
            <h2 className="section-title">Email Signature Icons</h2>
            <div
              className="rounded-xl border mb-8 p-5"
              style={{ backgroundColor: '#000080', borderColor: '#F5C518' }}
            >
              <div className="mb-2" style={{ color: '#FFFFFF' }}>Official PLREI Brand Guidelines Reference</div>
              <p style={{ color: '#FFFFFF' }}>
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

        <section id="applications" className="border-b border-plrei-bg-border">
          <div className="max-w-5xl mx-auto px-6 py-14">
            <p className="section-label">05 - Applications</p>
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
              <div className="card border-t-4" style={{ borderTopColor: '#3F4042' }}>
                <div className="mb-2">Branding Memory Summary</div>
                <p className="mb-4">
                  Review a condensed, AI-friendly summary of the official guidelines and copy it for reuse in tools and prompts.
                </p>
                <a href="/branding-memory" className="inline-block px-4 py-2 rounded border" style={{ borderColor: '#000080' }}>
                  Open Branding Memory
                </a>
              </div>
            </div>
          </div>
        </section>

        <footer>
          <div className="h-2" style={{ backgroundColor: '#F5C518' }} />
          <div className="" style={{ backgroundColor: '#000080', color: '#FFFFFF' }}>
            <div className="max-w-5xl mx-auto px-6 py-6 flex items-center gap-3">
              <span>Official brand compliance reference. © {currentYear} Power Line Rent-E-Quip, Inc.</span>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
