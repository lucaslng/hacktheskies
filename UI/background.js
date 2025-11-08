chrome.sidePanel.setOptions({ path: "sidepanel.html", enabled: true });

chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ windowId: tab.windowId });
});