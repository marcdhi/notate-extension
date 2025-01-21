import { callClaudeAPI } from './api.js';

export async function pushNotesToGithub(notes, pageUrl, apiKey, username) {
  if (!apiKey) {
    throw new Error('GitHub token is required');
  }

  const GITHUB_API = 'https://api.github.com';
  const REPO_NAME = 'notate-notes';
  const BRANCH = 'main';
  
  try {
    // First check if repo exists
    const repoResponse = await fetch(`${GITHUB_API}/repos/${username}/${REPO_NAME}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    // Log repo response for debugging
    console.log('Repo check response:', await repoResponse.clone().json().catch(() => 'No JSON'));

    // If repo doesn't exist, create it
    if (repoResponse.status === 404) {
      console.log('Repository not found, creating...');
      const createResponse = await fetch(`${GITHUB_API}/user/repos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: REPO_NAME,
          private: false,
          auto_init: true,
          description: 'AI-generated notes collection'
        })
      });

      if (!createResponse.ok) {
        const createError = await createResponse.json();
        console.error('Failed to create repository:', createError);
        throw new Error(`Failed to create repository: ${createError.message}`);
      }

      // Wait a moment for GitHub to initialize the repository
      await new Promise(resolve => setTimeout(resolve, 1000));
    } else if (!repoResponse.ok) {
      const repoError = await repoResponse.json();
      console.error('Failed to check repository:', repoError);
      throw new Error(`Failed to check repository: ${repoError.message}`);
    }

    // Generate title and create filename
    const title = await generateTitle(notes, pageUrl);
    const filename = `${title}.md`;
    console.log('Creating file:', filename);
    
    // Format content with metadata
    const content = await formatNoteContent(notes, pageUrl);
    
    // Convert to Base64
    const contentBase64 = btoa(unescape(encodeURIComponent(content)));

    // Create notes directory if it doesn't exist
    try {
      const dirResponse = await fetch(
        `${GITHUB_API}/repos/${username}/${REPO_NAME}/contents/notes`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );

      if (!dirResponse.ok && dirResponse.status === 404) {
        console.log('Creating notes directory...');
        await fetch(`${GITHUB_API}/repos/${username}/${REPO_NAME}/contents/notes/.gitkeep`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: 'Create notes directory',
            content: btoa(''),
            branch: BRANCH
          })
        });
      }
    } catch (error) {
      console.error('Error checking/creating directory:', error);
    }

    // Check if file exists
    const fileResponse = await fetch(
      `${GITHUB_API}/repos/${username}/${REPO_NAME}/contents/notes/${filename}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );

    const fileData = fileResponse.ok ? await fileResponse.json() : null;
    console.log('File exists:', !!fileData);
    
    // Push to GitHub
    const response = await fetch(`${GITHUB_API}/repos/${username}/${REPO_NAME}/contents/notes/${filename}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Add notes for ${new URL(pageUrl).hostname}`,
        content: contentBase64,
        branch: BRANCH,
        ...(fileData && { sha: fileData.sha })
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('GitHub API Error Details:', JSON.stringify(errorData, null, 2));
      throw new Error(errorData.message || 'Failed to push to GitHub');
    }

    return response.json();
  } catch (error) {
    console.error('GitHub API Error:', error);
    throw error;
  }
}

export async function generateTitle(content, url) {
  const prompt = `Create a concise title (2-3 words) for the following content. Return ONLY the title with no additional text or explanation: ${content}`;
  const title = await callClaudeAPI(prompt);
  return title.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

export async function formatNoteContent(notes, url) {
  const timestamp = new Date().toISOString();
  
  return `---
source_url: ${url}
date_created: ${timestamp}
---

# Notes: ${await generateTitle(notes, url)}

${notes}

---
Generated by Web Notes AI
`;
} 