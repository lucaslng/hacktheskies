console.log("Popup loaded");

const extractBtn = document.getElementById("extractBtn");
const output = document.getElementById("output");

extractBtn.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  chrome.tabs.sendMessage(tab.id, { action: "extractArticle" }, (response) => {
    if (chrome.runtime.lastError) {
      console.error("Error:", chrome.runtime.lastError.message);
      output.value = "Couldn't read from this page. Try reloading.";
      return;
    }

    if (response?.text) {
      output.value = response.text;
    } else {
      output.value = "No article text found.";
    }
  });
});
