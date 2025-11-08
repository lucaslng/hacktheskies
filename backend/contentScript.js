document.getElementById('scrapeBtn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: scrapeNewsArticle
  });

  document.getElementById('output').textContent = JSON.stringify(result, null, 2);
  window.scrapedData = result;
});

function scrapeNewsArticle() {
  const title =
    document.querySelector('h1')?.textContent?.trim() ||
    document.querySelector('[class*="title"]')?.textContent?.trim() ||
    document.querySelector('[class*="headline"]')?.textContent?.trim() ||
    document.title;

  const container =
    document.querySelector('article, [class*="article-body"], [class*="post-content"], main') ||
    document.body;

  const paragraphs = Array.from(container.querySelectorAll('p'))
    .map(p => p.textContent.trim())
    .filter(Boolean);

  return {
    url: window.location.href,
    title,
    paragraphs,
    scrapedAt: new Date().toISOString(),
    domain: window.location.hostname
  };
}
