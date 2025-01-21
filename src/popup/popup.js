import { pushNotesToGithub } from '../utils/github.js';
import { getConfig } from '../utils/config.js';
import { saveNotesToStorage, getNotesFromStorage } from '../utils/storage.js';

document.addEventListener('DOMContentLoaded', async () => {
  const takeNotesButton = document.getElementById('takeNotes');
  const statusDiv = document.getElementById('status');
  const notesDiv = document.getElementById('notes');
  const saveToGithubButton = document.createElement('button');
  saveToGithubButton.textContent = 'Save to GitHub';
  saveToGithubButton.style.display = 'none';
  
  document.querySelector('.container').appendChild(saveToGithubButton);

  let currentNotes = '';
  let currentUrl = '';

  // Check for existing notes when popup opens
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const existingNotes = await getNotesFromStorage(tab.url);
  
  if (existingNotes) {
    statusDiv.textContent = 'Loaded saved notes!';
    notesDiv.textContent = existingNotes.notes;
    currentNotes = existingNotes.notes;
    currentUrl = tab.url;
    saveToGithubButton.style.display = 'block';
  }

  takeNotesButton.addEventListener('click', async () => {
    try {
      statusDiv.textContent = 'Processing page...';
      saveToGithubButton.style.display = 'none';
      
      // Get the current active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      currentUrl = tab.url;
      
      // Inject content script if not already injected
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['src/content.js']
      });
      
      // Send message to content script
      const response = await chrome.tabs.sendMessage(tab.id, { 
        action: 'getPageContent' 
      });
      
      if (!response || !response.content) {
        throw new Error('Failed to get page content');
      }

      // Send content to background script for processing
      const result = await chrome.runtime.sendMessage({
        action: 'processContent',
        content: response.content,
        url: tab.url
      });

      if (!result || !result.success) {
        throw new Error(result?.error || 'Failed to process content');
      }

      // Display the notes
      statusDiv.textContent = 'Notes created!';
      notesDiv.textContent = result.notes;
      currentNotes = result.notes;
      
      // Show GitHub button
      saveToGithubButton.style.display = 'block';
      
      // Save notes locally
      await saveNotesToStorage(tab.url, result.notes);
      
    } catch (error) {
      console.error('Error:', error);
      statusDiv.textContent = 'Error: ' + error.message;
    }
  });

  saveToGithubButton.addEventListener('click', async () => {
    try {
      statusDiv.textContent = 'Saving to GitHub...';
      const config = await getConfig();
      
      if (!config.githubToken) {
        throw new Error('GitHub token not found. Please set it in the extension options.');
      }
      
      await pushNotesToGithub(currentNotes, currentUrl, config.githubToken, config.githubUsername);
      statusDiv.textContent = 'Saved to GitHub!';
    } catch (error) {
      console.error('GitHub Error:', error);
      statusDiv.textContent = 'Failed to save to GitHub: ' + error.message;
    }
  });
});

async function saveNotesToFile(notes, url) {
  const filename = `notes_${new Date().toISOString().split('T')[0]}.txt`;
  const blob = new Blob([`URL: ${url}\n\n${notes}`], { type: 'text/plain' });
  const downloadUrl = URL.createObjectURL(blob);
  
  await chrome.downloads.download({
    url: downloadUrl,
    filename: filename,
    saveAs: false
  });
} 