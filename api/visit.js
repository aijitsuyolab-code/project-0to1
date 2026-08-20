const SUPABASE_URL = 'https://gpvntywlwbbqmanlvvzr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_jEl9GTU-EELPin5nbg39dg_UxbV2dM_';

function headers(res){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  res.setHeader('Cache-Control','no-store');
}

async function sb(path, options={}){
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers:{apikey:SUPABASE_KEY, Authorization:`Bearer ${SUPABASE_KEY}`, ...(options.headers||{})}
  });
  if(!r.ok) throw new Error(`Supabase ${r.status}`);
  const text = await r.text();
  return text ? JSON.parse(text) : null;
}

export default async function handler(req,res){
  headers(res);
  if(req.method==='OPTIONS') return res.status(204).end();
  try{
    if(req.method==='POST'){
      const body = typeof req.body === 'string' ? JSON.parse(req.body||'{}') : (req.body||{});
      const site = String(body.site||req.headers.origin||'unknown').slice(0,120);
      const path = String(body.path||'/').slice(0,500);
      const session_id = String(body.session_id||'').slice(0,100);
      const referrer_host = body.referrer_host ? String(body.referrer_host).slice(0,255) : null;
      if(session_id.length < 8) return res.status(400).json({ok:false,error:'invalid_session'});
      await sb('site_analytics_events',{method:'POST',headers:{'Content-Type':'application/json','Prefer':'return=minimal'},body:JSON.stringify({site,path,session_id,referrer_host})});
      return res.status(200).json({ok:true});
    }
    const summary = await sb('site_analytics_summary?select=*&order=visitors_24h.desc');
    const top = await sb('site_analytics_top_pages?select=*&order=pageviews.desc&limit=50');
    return res.status(200).json({ok:true,summary,top,privacy:'No IP address, name, email or exact device fingerprint is stored.'});
  }catch(e){
    return res.status(500).json({ok:false,error:'analytics_unavailable'});
  }
}
