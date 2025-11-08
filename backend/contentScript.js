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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractArticle') {
    const article = scrapeNewsArticle();
    sendResponse({
      ...article,
      text: article.paragraphs.join('\n\n')
    });
    return true;
  }
});
