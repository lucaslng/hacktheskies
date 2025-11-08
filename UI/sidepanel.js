console.log("Side panel loaded.");

const extractBtn = document.getElementById("extractBtn");
const output = document.getElementById("output");

extractBtn.addEventListener("click", async () => {
  output.value = "Extracting article...";
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  async function extract() {
    const response = await sendExtractRequest(tab.id);
    output.value = response?.text || "No readable content found.";
  }

  try {
    await extract();
  } catch (error) {
    console.warn("Content script missing, injecting...", error);
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["contentScript.js"],
      });
      await extract();
    } catch (injectError) {
      console.error("Extraction failed:", injectError);
      output.value = "Couldn't read from this page.";
    }
  }
});

function sendExtractRequest(tabId) {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, { action: "extractArticle" }, (response) => {
      const err = chrome.runtime.lastError;
      if (err) reject(new Error(err.message));
      else resolve(response);
    });
  });
}