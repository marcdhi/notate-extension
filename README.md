# Notate Agent Chrome Extension

A Chrome agent that uses Claude AI to automatically generate study notes from web pages and save them to GitHub.

## Installation & Setup

1. Clone this repository:
   ```
   git clone https://github.com/marcdhi/notate-extension.git
   ```

2. Open Chrome and go to `chrome://extensions/`

3. Enable "Developer mode" in the top right corner

4. Click "Load unpacked" and select the extension directory

## Configuration

1. Get your API keys:
   - Create an Anthropic API key at https://console.anthropic.com/
   - Generate a GitHub Personal Access Token at https://github.com/settings/tokens
     (Needs repo scope permissions)

2. Configure the extension:
   - Click the extension icon in Chrome
   - Go to Options/Settings
   - Enter your Anthropic API key and GitHub PAT
   - Github username
   - Click Save

## Usage

1. Visit any webpage you want to take notes from
2. Click the extension icon
3. Click "Take Notes"
4. The AI agent will create study notes that will be:
   - Saved locally in Chrome
   - Pushed to your GitHub repository (notate-notes)

Notes are automatically organized in the `notes/` directory of your GitHub repo.

