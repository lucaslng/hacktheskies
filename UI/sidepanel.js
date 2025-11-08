console.log("Side panel loaded.");

const extractBtn = document.getElementById("extractBtn");
const output = document.getElementById("output");

extractBtn.addEventListener("click", async () => {
  output.value = "Working...";
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  try {
    const result = await ensureSummary(tab.id);
    if (result?.error) throw new Error(result.error);
    if (!result?.summary) {
      output.value = "No summary.";
      return;
    }
    window.scrapedData = result.article;
    output.value = result.summary;
  } catch (error) {
    console.error("Run failed:", error);
    output.value = error?.message || "Something went wrong.";
  }
});

async function ensureSummary(tabId) {
  try {
    return await sendSummaryRequest(tabId);
  } catch (error) {
    console.warn("Injecting scripts...", error);
    await chrome.scripting.executeScript({
      target: { tabId },
      files: [
        "backend/prompts.js",
        "backend/gemini.js",
        "backend/contentScript.js"
      ],
    });
    return await sendSummaryRequest(tabId);
  }
}

function sendSummaryRequest(tabId) {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(
      tabId,
      { action: "summarize" },
      (response) => {
        const err = chrome.runtime.lastError;
        if (err) reject(new Error(err.message));
        else resolve(response);
      }
    );
  });
}