const NOTICE_VERSION = 'rusty-drop-reservation-2026-11-06-v1';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(body, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff'
    }
  });
}

export async function onRequestPost({ request, env }) {
  const requestUrl = new URL(request.url);
  if (request.headers.get('Origin') !== requestUrl.origin) {
    return json({ ok: false, error: 'This request could not be verified.' }, 403);
  }
  if (!env.LEADS_DB) {
    return json({ ok: false, error: 'The reservation form is not available yet.' }, 503);
  }

  const contentType = request.headers.get('Content-Type') || '';
  if (!contentType.toLowerCase().includes('application/json')) {
    return json({ ok: false, error: 'Please submit the form again.' }, 415);
  }

  let body;
  try {
    const raw = await request.text();
    if (raw.length > 4096) return json({ ok: false, error: 'The request is too large.' }, 413);
    body = JSON.parse(raw);
  } catch {
    return json({ ok: false, error: 'Please check the form and try again.' }, 400);
  }

  // A filled honeypot is treated as accepted but is not written to the database.
  if (typeof body.website === 'string' && body.website.trim()) return json({ ok: true }, 202);

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (email.length > 254 || !EMAIL_RE.test(email)) {
    return json({ ok: false, error: 'Enter a valid email address.' }, 400);
  }
  if (body.consent !== true) {
    return json({ ok: false, error: 'Please agree to the Privacy Notice to send your request.' }, 400);
  }

  try {
    await env.LEADS_DB.prepare(
      `INSERT INTO game_leads (email, consent_at, notice_version)
       VALUES (?, ?, ?)
       ON CONFLICT(email) DO UPDATE SET
         consent_at = excluded.consent_at,
         notice_version = excluded.notice_version`
    ).bind(email, new Date().toISOString(), NOTICE_VERSION).run();
    return json({ ok: true }, 202);
  } catch {
    return json({ ok: false, error: 'The request could not be saved. Please try again later.' }, 503);
  }
}

export async function onRequest({ request }) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { Allow: 'POST, OPTIONS' } });
  return json({ ok: false, error: 'Method not allowed.' }, 405);
}
