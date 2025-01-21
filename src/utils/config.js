export async function getConfig() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['githubToken', 'anthropicKey', 'githubUsername'], (result) => {
      resolve({
        githubToken: result.githubToken,
        anthropicKey: result.anthropicKey,
        githubUsername: result.githubUsername
      });
    });
  });
}

export async function setConfig(config) {
  return new Promise((resolve) => {
    chrome.storage.local.set(config, resolve);
  });
} 