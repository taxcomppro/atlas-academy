function readProgress(key) {
  try { return JSON.parse(localStorage.getItem(key) || '{}'); }
  catch { return {}; }
}

const welcomeOne = readProgress('atlas-m0-l01-state-v1');
const welcomeTwo = readProgress('atlas-m0-l02-state-v1');
const completedCount = [welcomeOne.completed, welcomeTwo.completed].filter(Boolean).length;
const welcomePercent = completedCount * 50;
const progressBar = document.getElementById('welcomeProgressBar');
const progressText = document.getElementById('welcomeProgressText');
const welcomeButton = document.getElementById('welcomeButton');

progressBar.style.width = `${welcomePercent}%`;
progressText.textContent = completedCount === 2
  ? 'Academy Welcome complete'
  : `${completedCount} of 2 welcome missions complete`;

if (completedCount === 2) {
  welcomeButton.textContent = 'Review Academy Welcome';
  welcomeButton.classList.add('complete');
} else if (completedCount === 1) {
  welcomeButton.textContent = 'Continue Academy Welcome';
}
