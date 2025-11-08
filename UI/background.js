chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed and background service worker loaded.");
});

chrome.action.onClicked.addListener(async (tab) => {
  await chrome.sidePanel.open({ windowId: tab.windowId });
});