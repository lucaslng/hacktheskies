(() => {
  const MODEL = "gemini-2.5-flash";

  async function getApiKey() {
    if (window.__geminiApiKey) return window.__geminiApiKey;

    let key = null;

    if (chrome?.storage?.local) {
      key = await new Promise((resolve) => {
        chrome.storage.local.get("geminiApiKey", (items) =>
          resolve(items.geminiApiKey)
        );
      });
    }

    if (!key && chrome?.runtime?.getURL) {
      try {
        const envUrl = chrome.runtime.getURL(".env");
        const response = await fetch(envUrl);
        if (response.ok) {
          const envText = await response.text();
          const match = envText.match(/^GEMINI_API_KEY\s*=\s*(.+)$/m);
          if (match) {
            key = match[1].trim().replace(/^['"]|['"]$/g, "");
          }
        }
      } catch (error) {
        console.warn("Failed to read .env for Gemini key:", error);
      }
    }

    window.__geminiApiKey = key;
    return key;
  }

  async function callGemini(apiKey, prompt, text) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${prompt}\n\nSource:\n${text}` }] }],
        }),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || "Gemini API error.");
    }

    const summary = data.candidates
      ?.flatMap((candidate) => candidate.content?.parts || [])
      .map((part) => part.text?.trim())
      .filter(Boolean)
      .join("\n")
      .trim();

    if (!summary) {
      throw new Error("Gemini returned no summary.");
    }

    return summary;
  }

  window.gemini = async function (prompt, text) {
    const apiKey = await getApiKey();
    if (!apiKey) throw new Error("Missing Gemini API key.");
    return callGemini(apiKey, prompt, text);
  };
})();