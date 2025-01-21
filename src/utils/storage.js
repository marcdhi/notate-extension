export async function saveNotesToStorage(url, notes) {
  const storageKey = 'webNotesAI_notes';
  try {
    // Get existing notes
    const existingNotes = await chrome.storage.local.get(storageKey);
    const notesMap = existingNotes[storageKey] || {};
    
    // Add new notes with timestamp
    notesMap[url] = {
      notes,
      timestamp: new Date().toISOString()
    };
    
    // Store back
    await chrome.storage.local.set({ [storageKey]: notesMap });
    
  } catch (error) {
    console.error('Error saving notes to storage:', error);
  }
}

export async function getNotesFromStorage(url) {
  const storageKey = 'webNotesAI_notes';
  try {
    const data = await chrome.storage.local.get(storageKey);
    const notesMap = data[storageKey] || {};
    return notesMap[url];
  } catch (error) {
    console.error('Error getting notes from storage:', error);
    return null;
  }
}

export async function clearOldNotes() {
  const storageKey = 'webNotesAI_notes';
  try {
    const data = await chrome.storage.local.get(storageKey);
    const notesMap = data[storageKey] || {};
    
    // Keep notes for 7 days
    const now = new Date();
    const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7));
    
    // Filter out old notes
    const filteredNotes = Object.entries(notesMap).reduce((acc, [url, noteData]) => {
      if (new Date(noteData.timestamp) > sevenDaysAgo) {
        acc[url] = noteData;
      }
      return acc;
    }, {});
    
    await chrome.storage.local.set({ [storageKey]: filteredNotes });
  } catch (error) {
    console.error('Error clearing old notes:', error);
  }
} 