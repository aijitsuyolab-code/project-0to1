const store = new Map();

export default function handler(req, res) {
  const now = new Date();
  const day = now.toISOString().slice(0,10);
  const key = `${day}:${req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'anon'}:${req.headers['user-agent'] || ''}`;
  if (req.method === 'POST') {
    store.set(key, Date.now());
  }
  const cutoff = Date.now() - 24*60*60*1000;
  for (const [k,t] of store) if (t < cutoff) store.delete(k);
  const today = [...store.keys()].filter(k => k.startsWith(day+':')).length;
  res.setHeader('Cache-Control','no-store');
  res.status(200).json({today, active24h: store.size, note:'best-effort in-memory count'});
}
