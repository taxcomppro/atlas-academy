const STORAGE_KEY = 'atlas-m0-l01-state-v1';

const defaultState = {
  videoWatched: false,
  downloads: [],
  reflection: '',
  reflectionSaved: false,
  atlasResponse: '',
  atlasSaved: false,
  quizPassed: false,
  quizScore: null,
  notes: '',
  completed: false,
  xp: 0
};

function loadState() {
  try {
    return { ...defaultState, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') };
  } catch {
    return { ...defaultState };
  }
}

let state = loadState();

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  renderState();
}

const navItems = [...document.querySelectorAll('.nav-item')];
const views = {
  dashboard: document.getElementById('dashboardView'),
  course: document.getElementById('courseView'),
  downloads: document.getElementById('downloadsView'),
  badges: document.getElementById('badgesView'),
  profile: document.getElementById('profileView')
};
const titles = {
  dashboard: 'Mission Control',
  course: 'Course Player',
  downloads: 'Download Library',
  badges: 'Achievements',
  profile: 'My Profile'
};

function switchView(name) {
  Object.values(views).forEach(view => view.classList.remove('active'));
  views[name].classList.add('active');
  navItems.forEach(item => item.classList.toggle('active', item.dataset.view === name));
  document.getElementById('pageTitle').textContent = titles[name];
  document.getElementById('sidebar').classList.remove('open');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

navItems.forEach(item => item.addEventListener('click', () => switchView(item.dataset.view)));
document.querySelectorAll('[data-jump]').forEach(button => button.addEventListener('click', () => switchView(button.dataset.jump)));
document.getElementById('menuBtn').addEventListener('click', () => document.getElementById('sidebar').classList.toggle('open'));

const toast = document.getElementById('toast');
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 2400);
}

function bindModal(openId, modalId, closeId) {
  const modal = document.getElementById(modalId);
  document.getElementById(openId)?.addEventListener('click', () => modal.classList.add('open'));
  document.getElementById(closeId)?.addEventListener('click', () => modal.classList.remove('open'));
  modal.addEventListener('click', event => {
    if (event.target === modal) modal.classList.remove('open');
  });
  return modal;
}

const atlasModal = bindModal('openAtlas', 'atlasModal', 'closeAtlas');
const completeModal = bindModal('unusedCompleteOpen', 'completeModal', 'closeComplete');
document.getElementById('goToAtlas').addEventListener('click', () => {
  atlasModal.classList.remove('open');
  switchView('course');
  document.querySelector('[data-tab="atlas"]').click();
});

document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => {
  document.querySelectorAll('.tab').forEach(item => item.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
  tab.classList.add('active');
  document.getElementById(`${tab.dataset.tab}Tab`).classList.add('active');
}));

const lessonVideo = document.getElementById('lessonVideo');
lessonVideo.addEventListener('ended', () => {
  state.videoWatched = true;
  saveState();
  showToast('Welcome lesson completed.');
});

document.querySelectorAll('.resource-download').forEach(link => link.addEventListener('click', () => {
  const resource = link.dataset.resource;
  if (!state.downloads.includes(resource)) state.downloads.push(resource);
  saveState();
  showToast('Resource opened and recorded.');
}));

const reflectionArea = document.getElementById('reflectionArea');
const atlasResponseArea = document.getElementById('atlasResponseArea');
const notesArea = document.getElementById('notesArea');
reflectionArea.value = state.reflection;
atlasResponseArea.value = state.atlasResponse;
notesArea.value = state.notes;

reflectionArea.addEventListener('input', () => {
  state.reflection = reflectionArea.value;
  state.reflectionSaved = false;
  saveState();
});
atlasResponseArea.addEventListener('input', () => {
  state.atlasResponse = atlasResponseArea.value;
  state.atlasSaved = false;
  saveState();
});
notesArea.addEventListener('input', () => {
  state.notes = notesArea.value;
  saveState();
});

document.getElementById('saveReflection').addEventListener('click', () => {
  if (reflectionArea.value.trim().length < 20) {
    showToast('Add a few sentences before saving.');
    return;
  }
  state.reflection = reflectionArea.value.trim();
  state.reflectionSaved = true;
  saveState();
  showToast('Reflection saved.');
});

document.getElementById('saveAtlasResponse').addEventListener('click', () => {
  if (atlasResponseArea.value.trim().length < 20) {
    showToast('Paste or summarize the Atlas response first.');
    return;
  }
  state.atlasResponse = atlasResponseArea.value.trim();
  state.atlasSaved = true;
  saveState();
  showToast('Atlas response saved.');
});

document.getElementById('copyPrompt').addEventListener('click', async () => {
  const prompt = document.getElementById('atlasPromptText').textContent.trim();
  try {
    await navigator.clipboard.writeText(prompt);
    showToast('Atlas prompt copied.');
  } catch {
    showToast('Select and copy the prompt manually.');
  }
});

const answerKey = { q1: 'a', q2: 'b', q3: 'a', q4: 'a', q5: 'a' };
document.getElementById('quizForm').addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const unanswered = Object.keys(answerKey).filter(question => !data.get(question));
  if (unanswered.length) {
    showToast('Answer all five questions before submitting.');
    return;
  }
  const correct = Object.entries(answerKey).filter(([question, answer]) => data.get(question) === answer).length;
  state.quizScore = correct * 20;
  state.quizPassed = state.quizScore >= 80;
  saveState();
  showToast(state.quizPassed ? `Quiz passed: ${state.quizScore}%` : `Quiz score: ${state.quizScore}%. Review and try again.`);
});

function requirements() {
  return {
    video: state.videoWatched,
    downloads: state.downloads.length >= 3,
    reflection: state.reflectionSaved,
    atlas: state.atlasSaved,
    quiz: state.quizPassed
  };
}

function allRequirementsComplete() {
  return Object.values(requirements()).every(Boolean);
}

function renderRequirement(element, key, complete) {
  element.classList.toggle('done', complete);
  const status = element.querySelector('b');
  if (key === 'downloads') status.textContent = `${state.downloads.length} of 3`;
  else if (key === 'quiz' && state.quizScore !== null) status.textContent = complete ? `Passed ${state.quizScore}%` : `${state.quizScore}%`;
  else status.textContent = complete ? 'Complete' : 'Pending';
}

function renderState() {
  const current = requirements();
  document.querySelectorAll('[data-state]').forEach(element => renderRequirement(element, element.dataset.state, current[element.dataset.state]));

  document.getElementById('reflectionSaved').textContent = state.reflectionSaved ? 'Saved' : 'Not saved';
  document.getElementById('atlasSaved').textContent = state.atlasSaved ? 'Saved' : 'Not saved';
  document.getElementById('quizResult').textContent = state.quizScore === null ? 'Not attempted' : `${state.quizScore}% - ${state.quizPassed ? 'Passed' : 'Try again'}`;

  const completeButton = document.getElementById('completeMission');
  completeButton.disabled = state.completed || !allRequirementsComplete();
  completeButton.textContent = state.completed ? 'Mission Completed' : 'Complete Mission';
  document.getElementById('completionHelp').textContent = state.completed
    ? '100 XP awarded. M0-L02 is unlocked in this prototype.'
    : allRequirementsComplete()
      ? 'All requirements complete. Finish the mission when ready.'
      : 'Complete all five requirements to unlock this button.';

  const progress = state.completed ? 3 : 0;
  document.getElementById('progressPercent').textContent = `${progress}%`;
  document.getElementById('progressFill').style.width = `${progress}%`;
  document.getElementById('moduleProgress').style.width = state.completed ? '14%' : '0%';
  document.getElementById('heroProgress').textContent = `${progress}% COMPLETE`;
  document.getElementById('heroXp').textContent = state.completed ? '100 XP EARNED' : '100 XP AVAILABLE';
  document.getElementById('progressLabel').textContent = state.completed ? 'Mission 0.1 complete' : 'Orientation not started';
  document.getElementById('missionCount').textContent = state.completed ? '1 mission complete' : '0 missions complete';
  document.getElementById('profileMissions').textContent = state.completed ? '1' : '0';
  document.getElementById('profileXp').textContent = String(state.xp);
  document.getElementById('profileBadges').textContent = state.completed ? '1' : '0';
  document.getElementById('badgeStatus').textContent = state.completed ? 'Progress started' : 'Not started';
  document.getElementById('atlasExplorerText').textContent = state.completed ? 'Progress started' : 'Not started';
  [document.getElementById('atlasExplorerBadge'), document.getElementById('atlasExplorerBadgeLarge')].forEach(badge => badge.classList.toggle('earned', state.completed));

  document.querySelectorAll('.lesson-link')[1].disabled = !state.completed;
  document.querySelectorAll('.lesson-link')[1].querySelector('span').textContent = state.completed ? 'Unlocked' : 'Locked';
}

document.getElementById('completeMission').addEventListener('click', () => {
  if (!allRequirementsComplete() || state.completed) return;
  state.completed = true;
  state.xp = 100;
  saveState();
  completeModal.classList.add('open');
});

document.getElementById('openLesson02').addEventListener('click', () => {
  if (state.completed) window.location.href = 'm0-l02.html';
});

document.getElementById('returnDashboard').addEventListener('click', () => {
  completeModal.classList.remove('open');
  switchView('dashboard');
});

renderState();
