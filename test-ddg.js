async function test() {
  const q = encodeURIComponent('ร้านอาหาร หาดใหญ่ แนะนำ');
  const response = await fetch('https://html.duckduckgo.com/html/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'q=' + q
  });
  const html = await response.text();
  const titles = html.match(/class="result__title"[^>]*>[\s\S]*?<\/h2>/g);
  const snippets = html.match(/class="result__snippet[^>]*>([^<]+)/g);
  if (titles) {
      console.log(titles.map(s => s.replace(/<[^>]+>/g, '').trim()).join('\n'));
  }
  if (snippets) {
      console.log(snippets.map(s => s.replace(/<[^>]+>/g, '').replace('class="result__snippet"','').trim()).join('\n'));
  }
}
test();
