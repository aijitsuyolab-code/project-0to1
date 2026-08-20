import { next } from '@vercel/functions';

export const config = {
  matcher: '/((?!api/|favicon.ico|robots.txt|sitemap.xml|ads.txt|llms.txt).*)',
};

export default function middleware(request: Request) {
  const url = new URL(request.url);
  const referrer = request.headers.get('referer') || '';
  let refHost = '';
  try { refHost = referrer ? new URL(referrer).hostname : ''; } catch {}
  console.log(JSON.stringify({
    type: 'pageview',
    path: url.pathname,
    referrerHost: refHost,
    at: new Date().toISOString(),
  }));
  return next();
}
