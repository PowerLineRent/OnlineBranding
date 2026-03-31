module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  const resendFromEmail = process.env.RESEND_FROM_EMAIL;

  if (!resendApiKey) {
    return res.status(500).json({ error: "RESEND_API_KEY is not configured." });
  }

  if (!resendFromEmail) {
    return res.status(500).json({ error: "RESEND_FROM_EMAIL is not configured." });
  }

  let body = req.body || {};
  if (typeof req.body === "string") {
    try {
      body = JSON.parse(req.body);
    } catch {
      return res.status(400).json({ error: "Invalid JSON request body." });
    }
  }
  const to = String(body.to || "").trim();
  const link = String(body.link || "").trim();
  const name = String(body?.signature?.name || "PLREI user").trim();

  if (!to || !to.includes("@")) {
    return res.status(400).json({ error: "A valid recipient email is required." });
  }

  if (!link) {
    return res.status(400).json({ error: "Permalink is required." });
  }

  try {
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: resendFromEmail,
        to: [to],
        subject: "Your PLREI Email Signature Link",
        html: `
          <p>Hi ${name},</p>
          <p>Open this link on your phone to access your customized PLREI email signature:</p>
          <p><a href="${link}">${link}</a></p>
          <p>If the link does not open directly, copy and paste it into your browser.</p>
        `,
        text: `Hi ${name},\n\nOpen this link on your phone to access your customized PLREI email signature:\n${link}\n\nIf the link does not open directly, copy and paste it into your browser.`,
      }),
    });

    if (!resendResponse.ok) {
      const resendError = await resendResponse.text();
      return res.status(502).json({
        error: "Resend rejected the request.",
        details: resendError,
      });
    }

    const result = await resendResponse.json();
    return res.status(200).json({ ok: true, id: result.id });
  } catch (error) {
    return res.status(500).json({
      error: "Unable to send email.",
      details: error instanceof Error ? error.message : "Unknown server error.",
    });
  }
};
