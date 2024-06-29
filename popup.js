document.getElementById('summarizeButton').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          function: summarizePage
        },
        (result) => {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
          } else {
            document.getElementById('summary').innerText = result[0].result;
          }
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
  
    return new Promise((resolve, reject) => {
      callGeminiAPI(text, apiKey, (result) => {
        if (result.error) {
          reject(result.error);
        } else {
          resolve(result);
        }
      });
    });
  }
  
  function callGeminiAPI(text, apiKey, sendResponse) {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
    const data = {
      contents: [{
        parts: [{
          text: text
        }]
      }]
    };
  
    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
      const generatedText = data.contents[0].parts[0].text;
      sendResponse(generatedText);
    })
    .catch((error) => {
      console.error('Error:', error);
      sendResponse({ error: error.toString() });
    });
  }
  