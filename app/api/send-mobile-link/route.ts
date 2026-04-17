import { NextRequest, NextResponse } from 'next/server';
import { resolveEmailSignatureAssetUrl } from '@/lib/emailSignatureAssetUrls';
import { decodeSignaturePayload, createSignatureHash } from '@/lib/signature-validation';

export async function POST(req: NextRequest) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const resendFromEmail = process.env.RESEND_FROM_EMAIL;

  if (!resendApiKey) {
    return NextResponse.json({ error: 'RESEND_API_KEY is not configured.' }, { status: 500 });
  }
  if (!resendFromEmail) {
    return NextResponse.json({ error: 'RESEND_FROM_EMAIL is not configured.' }, { status: 500 });
  }

  let body: { to?: string; link?: string; signature?: { name?: string } };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON request body.' }, { status: 400 });
  }

  const to = String(body.to ?? '').trim();
  let link = String(body.link ?? '').trim();
  const name = String(body.signature?.name ?? 'PLREI user').trim();

  if (!to || !to.includes('@')) {
    return NextResponse.json({ error: 'A valid recipient email is required.' }, { status: 400 });
  }
  if (!link) {
    return NextResponse.json({ error: 'Permalink is required.' }, { status: 400 });
  }

  try {
    const url = new URL(link);
    const s = url.searchParams.get('s');
    const h = url.searchParams.get('h');
    const secretKey = process.env.SIGNATURE_SECRET_KEY;
    if (s && !h && secretKey) {
      const payloadJson = decodeSignaturePayload(s);
      url.searchParams.set('h', createSignatureHash(payloadJson, secretKey));
      link = url.toString();
    }
  } catch {
    // Keep original link if URL parsing fails.
  }

  try {
    // Use centralized resolver so email template generation follows the same
    // new-path-first, legacy-fallback behavior as frontend rendering.
    const logoUrl = await resolveEmailSignatureAssetUrl('EmailSignatureLogo-V3.png');

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: resendFromEmail,
        to: [to],
        subject: 'Your PLREI Email Signature Link',
        html: `
          <p>Hi ${name},</p>
          <p><img src="${logoUrl}" alt="PLREI logo" width="120" style="display:block;border:0;" /></p>
          <p>Open this link on your phone to access your customized PLREI email signature:</p>
          <p><a href="${link}">${link}</a></p>
          <p>If the link does not open directly, copy and paste it into your browser.</p>
        `,
        text: `Hi ${name},\n\nOpen this link on your phone:\n${link}`,
      }),
    });

    if (!resendResponse.ok) {
      const details = await resendResponse.text();
      return NextResponse.json({ error: 'Resend rejected the request.', details }, { status: 502 });
    }

    const result = await resendResponse.json();
    return NextResponse.json({ ok: true, id: result.id });
  } catch (error) {
    return NextResponse.json(
      { error: 'Unable to send email.', details: error instanceof Error ? error.message : 'Unknown error.' },
      { status: 500 }
    );
  }
}
