// Vercel Edge Function - iTunes 專輯圖片代理
// 讓前端可以帶 CORS 載入 Apple CDN 圖片（供 html2canvas 使用）

export const config = { runtime: 'edge' };

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const url = decodeURIComponent(searchParams.get('url') || '');

  if (!url) {
    return new Response('Missing url', { status: 400 });
  }

  // 只允許 Apple/iTunes CDN 網域
  if (!url.match(/^https:\/\/(is\d+-ssl\.mzstatic\.com|a\d+\.mzstatic\.com|itunes\.apple\.com)\//)) {
    return new Response('Forbidden', { status: 403 });
  }

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'iTunes/12.0' }
    });
    if (!res.ok) return new Response('Upstream error', { status: res.status });

    const buf = await res.arrayBuffer();
    const ct = res.headers.get('content-type') || 'image/jpeg';

    return new Response(buf, {
      status: 200,
      headers: {
        'Content-Type': ct,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=86400, immutable',
      }
    });
  } catch (e) {
    return new Response('Error: ' + e.message, { status: 500 });
  }
}
