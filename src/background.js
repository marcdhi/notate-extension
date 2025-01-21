import { clearOldNotes } from './utils/storage.js';
import { callClaudeAPI } from './utils/api.js';

// Handle messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'processContent') {
    handleContentProcessing(request.content, request.url)
      .then(notes => sendResponse({ success: true, notes }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

// Process webpage content
async function handleContentProcessing(content, url) {
  const prompt = `As an expert note-taking assistant, create comprehensive yet concise study notes from this webpage content. 

Create raw yet insightful study notes that are concise, covering only core and important points from the webpage.

- Highlight key ideas and concepts.
- Use short and simple explanations.
- Include relevant examples, technical details, or formulas if necessary.
- Keep the notes clear and straight to the point, ensuring no critical information is missed.
- Bold key terms for emphasis.

Format Guidelines:
- Use clear hierarchical structure (##, ###)
- Use bullet points for better readability
- Bold important terms and concepts
- Include any relevant code snippets or formulas
- Add brief explanations for complex terms

Webpage Content: ${content.text}
URL: ${url}

Make these notes perfect for revision and deep understanding.`;

  const notes = await callClaudeAPI(prompt);
  return notes;
}

// Clean up old notes periodically
chrome.alarms.create('cleanupNotes', { periodInMinutes: 1440 }); // Once a day
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'cleanupNotes') {
    clearOldNotes();
  }
}); 