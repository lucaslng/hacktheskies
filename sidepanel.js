console.log("Side panel loaded.");

const extractBtn = document.getElementById("extractBtn");
const output = document.getElementById("output");

extractBtn.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.tabs.sendMessage(tab.id, { action: "extractArticle" }, (response) => {
    if (chrome.runtime.lastError) {
      console.error("Error:", chrome.runtime.lastError.message);
      output.value = "Couldn't read from this page.";
      return;
    }

    if (response?.text) {
      output.value = response.text;
    } else {
      output.value = "No readable content found.";
    }
  });
});
