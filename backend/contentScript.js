function extractTitle() {
    const selectors = ["h1", '[class*="title"]', '[class*="headline"]'];

    for (const sel of selectors) {
		const el = document.querySelector(sel);
		if (el?.textContent?.trim()) 
			return el.textContent.trim();
	}
	return document.title;
}

function scrapeNewsArticle() {
	const title = extractTitle();
	const container = document.querySelector('article, [class*="article-body"], [class*="post-content"], main') || document.body;
	const paragraphs = Array.from(container.querySelectorAll("p")).map((p) => p.textContent.trim()).filter(Boolean);

	return {
		url: window.location.href,
		title,
		paragraphs,
		scrapedAt: new Date().toISOString(),
		domain: window.location.hostname,
	};
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === "summarize") {
		summarize().then((result) => sendResponse(result)).catch((error) => {
			console.error("summarize failed:", error);
			sendResponse({ error: error?.message || "Unable to summarize." });
		});
		return true;
	}

	if (request.action === "extractArticle") {
		const article = scrapeNewsArticle();
		sendResponse({...article, text: article.paragraphs.join("\n\n"),});
	}
});

async function summarize() {
	const article = scrapeNewsArticle();
	const text = article.paragraphs.join("\n\n");
	
	if (!text) {
		throw new Error("No readable content found.");
	}

	if (typeof window.gemini !== "function") {
		throw new Error("Gemini helper is unavailable.");
	}

	const prompt = window.SUMMARIZE_PROMPT || "";
	const summary = await window.gemini(prompt, text);
	
	return { summary, article };
}
