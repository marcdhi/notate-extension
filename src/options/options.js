import { setConfig, getConfig } from '../utils/config.js';

document.addEventListener('DOMContentLoaded', async () => {
  const config = await getConfig();
  
  // Set existing values
  document.getElementById('anthropicKey').value = config.anthropicKey || '';
  document.getElementById('githubToken').value = config.githubToken || '';
  document.getElementById('githubUsername').value = config.githubUsername || '';
  // Save settings
  document.getElementById('save').addEventListener('click', async () => {
    const anthropicKey = document.getElementById('anthropicKey').value;
    const githubToken = document.getElementById('githubToken').value;
    const githubUsername = document.getElementById('githubUsername').value;
    
    await setConfig({ anthropicKey, githubToken, githubUsername });
    
    const status = document.getElementById('status');
    status.textContent = 'Settings saved!';
    setTimeout(() => {
      status.textContent = '';
    }, 2000);
  });
}); 