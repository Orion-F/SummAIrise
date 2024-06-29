document.getElementById('summarizeButton').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          function: summarizePage
        },
        (result) => {
          document.getElementById('summary').innerText = result[0].result;
        }
      );
    });
  });
  
  async function summarizePage() {
    const response = await fetch(window.location.href);
    const text = await response.text();
  
    const configResponse = await fetch(chrome.runtime.getURL('api_key.json'));
    const config = await configResponse.json();
    const apiKey = config.GEMINI_API_KEY;
  
    const apiUrl = 'https://api.gemini.com/v1/summarize';
    
    const requestBody = {
      model: "gemini-1.5-flash",
      prompt: text,
      temperature: 1,
      top_p: 0.95,
      max_output_tokens: 8192
    };
  
    const summaryResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });
  
    const summaryData = await summaryResponse.json();
    return summaryData.choices[0].text;
  }
  