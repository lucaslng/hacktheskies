console.log("Content script active on:", window.location.href);

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "extractArticle") {
    const text = extractMainText();
    sendResponse({ text });
  }
});

function extractMainText() {
  const article = document.querySelector("article");
  if (article) return article.innerText.trim();

  // fallback: combine all <p> tags
  const paragraphs = Array.from(document.querySelectorAll("p"))
    .map(p => p.innerText.trim())
    .filter(p => p.length > 50);

  return paragraphs.join("\n\n") || "No readable content found.";
}
