const SUPABASE_URL = 'https://gpvntywlwbbqmanlvvzr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_jEl9GTU-EELPin5nbg39dg_UxbV2dM_';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'no-store',
  'Content-Type': 'application/json; charset=utf-8',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: CORS_HEADERS });
}

async function sb(path, options = {}) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      ...(options.headers || {}),
    },
  });
  if (!r.ok) throw new Error(`Supabase ${r.status}`);
  const text = await r.text();
  return text ? JSON.parse(text) : null;
}

export async function onRequest(context) {
  const request = context.request;

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  try {
    if (request.method === 'POST') {
      let body = {};
      try {
        body = await request.json();
      } catch {}

      const site = String(body.site || request.headers.get('origin') || 'unknown').slice(0, 120);
      const path = String(body.path || '/').slice(0, 500);
      const session_id = String(body.session_id || '').slice(0, 100);
      const referrer_host = body.referrer_host ? String(body.referrer_host).slice(0, 255) : null;

      if (session_id.length < 8) {
        return json({ ok: false, error: 'invalid_session' }, 400);
      }

      await sb('site_analytics_events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({ site, path, session_id, referrer_host }),
      });

      return json({ ok: true });
    }

    if (request.method === 'GET') {
      const summary = await sb('site_analytics_summary?select=*&order=visitors_24h.desc');
      const top = await sb('site_analytics_top_pages?select=*&order=pageviews.desc&limit=50');
      const conversions = await sb('site_analytics_conversion_events?select=*&order=events.desc&limit=50');
      return json({
        ok: true,
        summary,
        top,
        conversions,
        privacy: 'No IP address, name, email or exact device fingerprint is stored.',
      });
    }

    return json({ ok: false, error: 'method_not_allowed' }, 405);
  } catch {
    return json({ ok: false, error: 'analytics_unavailable' }, 500);
  }
}
