import { getConfig } from './config.js';

export async function callClaudeAPI(prompt) {
  const config = await getConfig();
  const apiKey = config.anthropicKey;
  
  if (!apiKey) {
    throw new Error('API key not found. Please set it in the extension options.');
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: "claude-3-sonnet-20240229",
        max_tokens: 1024,
        system: "You are a helpful note-taking assistant that creates concise, well-structured summaries.",
        messages: [{
          role: "user",
          content: prompt
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error:', errorData);
      throw new Error(`API request failed: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.content[0].text;
  } catch (error) {
    console.error('Error calling Claude API:', error);
    if (error.status === 401) {
      throw new Error('Invalid API key - Please check the extension options');
    } else if (error.status === 429) {
      throw new Error('Rate limit exceeded');
    } else if (error.message.includes('Failed to fetch')) {
      throw new Error('Network error - Please check your internet connection');
    }
    throw new Error(error.message || 'Unknown error occurred');
  }
} 