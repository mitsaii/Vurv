// Vercel Edge Function - iTunes Search API 代理
// 解決:Apple 擋掉了從瀏覽器直接打過去的請求(403 Forbidden)
// 走 server-side 代理,並依序嘗試 tw / jp / kr / us 找到第一個有結果的 store
// 結果在 Vercel edge cache 一天,大幅降低對 Apple 端的請求量

export const config = { runtime: 'edge' };

const COUNTRIES = ['tw', 'jp', 'kr', 'us'];

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const term = (searchParams.get('term') || '').trim();

  if (!term) {
    return jsonResponse({ results: [] }, 200, 3600);
  }

  // 依序試各國 store,找到有結果就回
  for (const country of COUNTRIES) {
    try {
      const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&country=${country}&limit=3&media=music&entity=song`;
      const response = await fetch(url, {
        headers: {
          // 用 iTunes 自己的 UA,避免被當瀏覽器爬蟲擋
          'User-Agent': 'iTunes/12.0 (Macintosh; OS X 10.15.7) AppleWebKit/600.1.25',
          'Accept': 'application/json, text/javascript, */*; q=0.01',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          return jsonResponse(data, 200, 86400); // 命中快取 1 天
        }
      }
    } catch (e) {
      // 試下一國
    }
  }

  // 沒任何 store 有資料
  return jsonResponse({ results: [] }, 200, 3600); // 沒命中快取 1 小時(避免持續打)
}

function jsonResponse(payload, status = 200, cacheSeconds = 0) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': cacheSeconds > 0
        ? `public, s-maxage=${cacheSeconds}, stale-while-revalidate=604800`
        : 'no-store',
    },
  });
}
