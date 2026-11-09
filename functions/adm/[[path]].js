const BASE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, private',
  'Pragma': 'no-cache',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-Robots-Tag': 'noindex, nofollow, noarchive',
  'Referrer-Policy': 'no-referrer',
  'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'"
};

function response(body, status = 200, extra = {}) {
  return new Response(body, { status, headers: { ...BASE_HEADERS, ...extra } });
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
}

function sameSecret(left, right) {
  const a = new TextEncoder().encode(left);
  const b = new TextEncoder().encode(right);
  let mismatch = a.length ^ b.length;
  const length = Math.max(a.length, b.length, 1);
  for (let i = 0; i < length; i++) mismatch |= (a[i] || 0) ^ (b[i] || 0);
  return mismatch === 0;
}

function isAuthorized(request, env) {
  if (typeof env.GAME_ADMIN_PASSWORD !== 'string' || !env.GAME_ADMIN_PASSWORD) return null;
  const header = request.headers.get('Authorization') || '';
  if (!header.startsWith('Basic ')) return false;
  try {
    const decoded = atob(header.slice(6));
    const separator = decoded.indexOf(':');
    if (separator < 0 || decoded.slice(0, separator) !== 'admin') return false;
    return sameSecret(decoded.slice(separator + 1), env.GAME_ADMIN_PASSWORD);
  } catch {
    return false;
  }
}

function unauthorized() {
  return response('Authentication required.', 401, {
    'WWW-Authenticate': 'Basic realm="Shop requests", charset="UTF-8"',
    'Content-Type': 'text/plain; charset=utf-8'
  });
}

async function getLeads(db, limit = null) {
  const query = limit
    ? db.prepare('SELECT email, consent_at, notice_version FROM game_leads ORDER BY consent_at DESC LIMIT ?').bind(limit)
    : db.prepare('SELECT email, consent_at, notice_version FROM game_leads ORDER BY consent_at DESC');
  const result = await query.all();
  return result.results || [];
}

async function getProductRequests(db, limit = null) {
  const query = limit
    ? db.prepare('SELECT id, email, product_name, consent_at, notice_version FROM product_requests ORDER BY consent_at DESC LIMIT ?').bind(limit)
    : db.prepare('SELECT id, email, product_name, consent_at, notice_version FROM product_requests ORDER BY consent_at DESC');
  const result = await query.all();
  return result.results || [];
}

function csvCell(value) {
  let text = String(value ?? '');
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

async function renderAdmin(db) {
  const [leads, productRequests] = await Promise.all([getLeads(db, 500), getProductRequests(db, 500)]);
  const rows = leads.length ? leads.map(lead => `
      <tr><td>${escapeHtml(lead.email)}</td><td>${escapeHtml(lead.consent_at)}</td><td>${escapeHtml(lead.notice_version)}</td><td><button class="delete-one" type="button" data-email="${escapeHtml(lead.email)}">Delete</button></td></tr>`).join('') : '<tr><td colspan="4" class="empty">No reservations yet.</td></tr>';
  const requestRows = productRequests.length ? productRequests.map(item => `
      <tr><td>${escapeHtml(item.product_name)}</td><td>${escapeHtml(item.email)}</td><td>${escapeHtml(item.consent_at)}</td><td>${escapeHtml(item.notice_version)}</td><td><button class="delete-request" type="button" data-id="${Number(item.id)}">Delete</button></td></tr>`).join('') : '<tr><td colspan="5" class="empty">No product inquiries yet.</td></tr>';
  const count = leads.length;
  const requestCount = productRequests.length;
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Game leads · Admin</title><style>
    *{box-sizing:border-box}body{margin:0;background:#f5f6f3;color:#17241f;font:14px/1.5 Arial,Helvetica,sans-serif}.wrap{width:min(1100px,calc(100% - 32px));margin:40px auto}.top{display:flex;justify-content:space-between;align-items:center;padding:0 0 14px;border-bottom:1px solid #17241f;color:#53625a;font-size:11px;letter-spacing:.12em;text-transform:uppercase}.top a{color:#173f37}.kicker{margin:34px 0 6px;color:#61776c;font-size:10px;font-weight:800;letter-spacing:.16em}h1{margin:0 0 18px;color:#173f37;font:700 clamp(30px,5vw,46px)/1 Georgia,serif}.summary{display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;margin-bottom:13px}.count{font-weight:800}.actions{display:flex;gap:9px;flex-wrap:wrap}.button{min-height:39px;padding:0 12px;border:1px solid #173f37;background:#173f37;color:white;font-size:10px;font-weight:800;letter-spacing:.1em;text-decoration:none;text-transform:uppercase;cursor:pointer}.button.secondary{background:#fff;color:#173f37}.table-wrap{overflow:auto;border:1px solid #17241f;background:#fff}table{width:100%;border-collapse:collapse;text-align:left;font-size:12px}th,td{padding:10px 12px;border-bottom:1px solid #d9dfdc;vertical-align:top}th{background:#f3f5f2;color:#425149;font-size:9px;letter-spacing:.1em;text-transform:uppercase}tr:last-child td{border-bottom:0}.delete-one,.delete-request{border:0;background:transparent;color:#a3342d;font-weight:700;text-decoration:underline;cursor:pointer}.empty{padding:25px;color:#68736d}.status{min-height:20px;margin:12px 0;color:#173f37}.status.error{color:#a3342d}.note{margin-top:16px;color:#69746e;font-size:11px}@media(max-width:600px){.wrap{margin:24px auto}.top{align-items:flex-start;gap:15px;flex-direction:column}th,td{padding:9px}}
  </style></head><body><main class="wrap"><header class="top"><strong>MK · KYIV / ADMIN</strong><a href="/">Open resume ↗</a></header><p class="kicker">PRIVATE CONTACT REQUESTS</p><h1>Shop requests</h1><div class="summary"><span class="count">${count} reservations shown${count === 500 ? ' · newest 500' : ''}</span><div class="actions"><a class="button secondary" href="/adm/export.csv">Download reservations CSV</a><button class="button" id="delete-all" type="button">Delete reservations</button></div></div><div class="table-wrap"><table><thead><tr><th>Email</th><th>Consent recorded</th><th>Notice version</th><th></th></tr></thead><tbody>${rows}</tbody></table></div><div class="summary" style="margin-top:30px"><span class="count">${requestCount} product inquiries shown${requestCount === 500 ? ' · newest 500' : ''}</span><div class="actions"><a class="button secondary" href="/adm/product-requests.csv">Download inquiries CSV</a><button class="button" id="delete-all-requests" type="button">Delete inquiries</button></div></div><div class="table-wrap"><table><thead><tr><th>Product</th><th>Email</th><th>Consent recorded</th><th>Notice version</th><th></th></tr></thead><tbody>${requestRows}</tbody></table></div><p class="status" id="status" role="status" aria-live="polite"></p><p class="note">Contact details are private. Use, export, and delete them only for the request purpose described in the Privacy Notice.</p></main><script>
    const statusEl=document.getElementById('status');async function removeLead(payload){statusEl.textContent='';try{const response=await fetch('/adm/delete',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});const data=await response.json();if(!response.ok||!data.ok)throw new Error(data.error||'Could not delete this entry.');location.reload()}catch(error){statusEl.className='status error';statusEl.textContent=error.message}}
    async function removeRequest(payload){statusEl.textContent='';try{const response=await fetch('/adm/product-request/delete',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});const data=await response.json();if(!response.ok||!data.ok)throw new Error(data.error||'Could not delete this inquiry.');location.reload()}catch(error){statusEl.className='status error';statusEl.textContent=error.message}}
    document.querySelectorAll('.delete-one').forEach(button=>button.addEventListener('click',()=>{if(confirm('Delete this email address from the reservation list?'))removeLead({email:button.dataset.email})}));document.getElementById('delete-all').addEventListener('click',()=>{if(confirm('Permanently delete every reservation? This cannot be undone.'))removeLead({all:true})});
    document.querySelectorAll('.delete-request').forEach(button=>button.addEventListener('click',()=>{if(confirm('Delete this product inquiry?'))removeRequest({id:Number(button.dataset.id)})}));document.getElementById('delete-all-requests').addEventListener('click',()=>{if(confirm('Permanently delete every product inquiry? This cannot be undone.'))removeRequest({all:true})});
  </script></body></html>`;
  return response(html, 200, { 'Content-Type': 'text/html; charset=utf-8' });
}

export async function onRequest({ request, env }) {
  const authorized = isAuthorized(request, env);
  if (authorized === null) return response('Admin password is not configured.', 503, { 'Content-Type': 'text/plain; charset=utf-8' });
  if (!authorized) return unauthorized();
  if (!env.LEADS_DB) return response('Lead database is not configured.', 503, { 'Content-Type': 'text/plain; charset=utf-8' });

  const url = new URL(request.url);
  if (url.pathname === '/adm/export.csv' && request.method === 'GET') {
    try {
      const leads = await getLeads(env.LEADS_DB);
      const lines = [['email', 'consent_at', 'notice_version'], ...leads.map(lead => [lead.email, lead.consent_at, lead.notice_version])]
        .map(row => row.map(csvCell).join(','));
      return response(`\uFEFF${lines.join('\r\n')}`, 200, {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="game_leads.csv"'
      });
    } catch {
      return response('The lead list could not be loaded.', 503, { 'Content-Type': 'text/plain; charset=utf-8' });
    }
  }

  if (url.pathname === '/adm/product-requests.csv' && request.method === 'GET') {
    try {
      const requests = await getProductRequests(env.LEADS_DB);
      const lines = [['product', 'email', 'consent_at', 'notice_version'], ...requests.map(item => [item.product_name, item.email, item.consent_at, item.notice_version])]
        .map(row => row.map(csvCell).join(','));
      return response(`\uFEFF${lines.join('\r\n')}`, 200, {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="product_requests.csv"'
      });
    } catch {
      return response('The product inquiry list could not be loaded.', 503, { 'Content-Type': 'text/plain; charset=utf-8' });
    }
  }

  if (url.pathname === '/adm/delete' && request.method === 'POST') {
    if (request.headers.get('Origin') !== url.origin) return response(JSON.stringify({ ok: false, error: 'Request not allowed.' }), 403, { 'Content-Type': 'application/json; charset=utf-8' });
    let body;
    try { body = await request.json(); } catch { return response(JSON.stringify({ ok: false, error: 'Invalid request.' }), 400, { 'Content-Type': 'application/json; charset=utf-8' }); }
    try {
      if (body.all === true) {
        await env.LEADS_DB.prepare('DELETE FROM game_leads').run();
      } else if (typeof body.email === 'string' && body.email.length <= 254) {
        await env.LEADS_DB.prepare('DELETE FROM game_leads WHERE email = ?').bind(body.email.trim().toLowerCase()).run();
      } else {
        return response(JSON.stringify({ ok: false, error: 'Choose an email entry to delete.' }), 400, { 'Content-Type': 'application/json; charset=utf-8' });
      }
      return response(JSON.stringify({ ok: true }), 200, { 'Content-Type': 'application/json; charset=utf-8' });
    } catch {
      return response(JSON.stringify({ ok: false, error: 'The entry could not be deleted.' }), 503, { 'Content-Type': 'application/json; charset=utf-8' });
    }
  }

  if (url.pathname === '/adm/product-request/delete' && request.method === 'POST') {
    if (request.headers.get('Origin') !== url.origin) return response(JSON.stringify({ ok: false, error: 'Request not allowed.' }), 403, { 'Content-Type': 'application/json; charset=utf-8' });
    let body;
    try { body = await request.json(); } catch { return response(JSON.stringify({ ok: false, error: 'Invalid request.' }), 400, { 'Content-Type': 'application/json; charset=utf-8' }); }
    try {
      if (body.all === true) {
        await env.LEADS_DB.prepare('DELETE FROM product_requests').run();
      } else if (Number.isSafeInteger(body.id) && body.id > 0) {
        await env.LEADS_DB.prepare('DELETE FROM product_requests WHERE id = ?').bind(body.id).run();
      } else {
        return response(JSON.stringify({ ok: false, error: 'Choose a product inquiry to delete.' }), 400, { 'Content-Type': 'application/json; charset=utf-8' });
      }
      return response(JSON.stringify({ ok: true }), 200, { 'Content-Type': 'application/json; charset=utf-8' });
    } catch {
      return response(JSON.stringify({ ok: false, error: 'The inquiry could not be deleted.' }), 503, { 'Content-Type': 'application/json; charset=utf-8' });
    }
  }

  if ((url.pathname === '/adm' || url.pathname === '/adm/') && request.method === 'GET') {
    try { return await renderAdmin(env.LEADS_DB); }
    catch { return response('The lead list could not be loaded.', 503, { 'Content-Type': 'text/plain; charset=utf-8' }); }
  }

  return response('Not found.', 404, { 'Content-Type': 'text/plain; charset=utf-8' });
}
