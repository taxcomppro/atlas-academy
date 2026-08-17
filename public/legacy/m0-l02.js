const STORAGE_KEY = 'atlas-m0-l02-state-v1';
const priorMission = JSON.parse(localStorage.getItem('atlas-m0-l01-state-v1') || '{}');

const defaultState = {
  videoWatched: false,
  videoAvailable: true,
  downloads: [],
  strengths: ['', '', ''],
  strengthReflection: '',
  strengthsSaved: false,
  context: { state: '', timeline: '', budget: '', model: '' },
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
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return { ...defaultState, ...saved, context: { ...defaultState.context, ...(saved.context || {}) } };
  } catch {
    return structuredClone(defaultState);
  }
}

let state = loadState();
state.videoAvailable = true;
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
const titles = { dashboard: 'Mission Control', course: 'Course Player', downloads: 'Download Library', badges: 'Achievements', profile: 'My Profile' };

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
document.getElementById('backLesson01').addEventListener('click', () => { window.location.href = '30-day-tax-office-launch.html'; });

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
  modal.addEventListener('click', event => { if (event.target === modal) modal.classList.remove('open'); });
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

document.querySelectorAll('.resource-download').forEach(link => link.addEventListener('click', () => {
  const resource = link.dataset.resource;
  if (!state.downloads.includes(resource)) state.downloads.push(resource);
  saveState();
  showToast('Resource opened and recorded.');
}));

document.getElementById('lessonVideo').addEventListener('ended', () => {
  state.videoAvailable = true;
  state.videoWatched = true;
  saveState();
  showToast('Meet Atlas lesson completed.');
});

const strengthInputs = [1, 2, 3].map(number => document.getElementById(`strength${number}`));
const strengthReflection = document.getElementById('strengthReflection');
const atlasResponseArea = document.getElementById('atlasResponseArea');
const notesArea = document.getElementById('notesArea');
const contextInputs = {
  state: document.getElementById('contextState'),
  timeline: document.getElementById('contextTimeline'),
  budget: document.getElementById('contextBudget'),
  model: document.getElementById('contextModel')
};

strengthInputs.forEach((input, index) => {
  input.value = state.strengths[index] || '';
  input.addEventListener('input', () => { state.strengths[index] = input.value; state.strengthsSaved = false; saveState(); });
});
strengthReflection.value = state.strengthReflection;
strengthReflection.addEventListener('input', () => { state.strengthReflection = strengthReflection.value; state.strengthsSaved = false; saveState(); });
atlasResponseArea.value = state.atlasResponse;
atlasResponseArea.addEventListener('input', () => { state.atlasResponse = atlasResponseArea.value; state.atlasSaved = false; saveState(); });
notesArea.value = state.notes;
notesArea.addEventListener('input', () => { state.notes = notesArea.value; saveState(); });
Object.entries(contextInputs).forEach(([key, input]) => {
  input.value = state.context[key] || '';
  input.addEventListener('input', () => { state.context[key] = input.value; saveState(); });
});

document.getElementById('saveStrengths').addEventListener('click', () => {
  const validStrengths = strengthInputs.every(input => input.value.trim().length >= 3);
  if (!validStrengths || strengthReflection.value.trim().length < 20) {
    showToast('Add all three strengths and a short reflection.');
    return;
  }
  state.strengths = strengthInputs.map(input => input.value.trim());
  state.strengthReflection = strengthReflection.value.trim();
  state.strengthsSaved = true;
  saveState();
  showToast('Three strengths saved.');
});

document.getElementById('saveAtlasResponse').addEventListener('click', () => {
  const contextCount = Object.values(contextInputs).filter(input => input.value.trim().length >= 2).length;
  if (contextCount < 2 || atlasResponseArea.value.trim().length < 20) {
    showToast('Add at least two context details and save the useful response.');
    return;
  }
  Object.entries(contextInputs).forEach(([key, input]) => { state.context[key] = input.value.trim(); });
  state.atlasResponse = atlasResponseArea.value.trim();
  state.atlasSaved = true;
  saveState();
  showToast('Atlas response saved.');
});

document.getElementById('copyPrompt').addEventListener('click', async () => {
  const prompt = document.getElementById('atlasPromptText').textContent.trim();
  try { await navigator.clipboard.writeText(prompt); showToast('Atlas prompt copied.'); }
  catch { showToast('Select and copy the prompt manually.'); }
});

const answerKey = { q1: 'b', q2: 'a', q3: 'c', q4: 'a', q5: 'b' };
document.getElementById('quizForm').addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  if (Object.keys(answerKey).some(question => !data.get(question))) {
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
    video: state.videoAvailable && state.videoWatched,
    downloads: state.downloads.length >= 2,
    strengths: state.strengthsSaved,
    atlas: state.atlasSaved,
    quiz: state.quizPassed
  };
}
function allRequirementsComplete() { return Object.values(requirements()).every(Boolean); }

function renderRequirement(element, key, complete) {
  element.classList.toggle('done', complete);
  const status = element.querySelector('b');
  if (key === 'downloads') status.textContent = `${state.downloads.length} of 2`;
  else if (key === 'quiz' && state.quizScore !== null) status.textContent = complete ? `Passed ${state.quizScore}%` : `${state.quizScore}%`;
  else status.textContent = complete ? 'Complete' : 'Pending';
}

function renderState() {
  const current = requirements();
  document.querySelectorAll('[data-state]').forEach(element => renderRequirement(element, element.dataset.state, current[element.dataset.state]));
  document.getElementById('strengthsSaved').textContent = state.strengthsSaved ? 'Saved' : 'Not saved';
  document.getElementById('atlasSaved').textContent = state.atlasSaved ? 'Saved' : 'Not saved';
  document.getElementById('quizResult').textContent = state.quizScore === null ? 'Not attempted' : `${state.quizScore}% - ${state.quizPassed ? 'Passed' : 'Try again'}`;

  const completeButton = document.getElementById('completeMission');
  completeButton.disabled = state.completed || !allRequirementsComplete();
  completeButton.textContent = state.completed ? 'Mission Completed' : 'Complete Mission';
  document.getElementById('completionHelp').textContent = state.completed
      ? '75 XP awarded. M0-L03 is unlocked.'
      : allRequirementsComplete()
        ? 'All requirements complete. Finish the mission when ready.'
        : 'Complete all five requirements to unlock this button.';

  const courseProgress = state.completed ? 6 : 3;
  document.getElementById('progressPercent').textContent = `${courseProgress}%`;
  document.getElementById('progressFill').style.width = `${courseProgress}%`;
  document.getElementById('moduleProgress').style.width = state.completed ? '29%' : '14%';
  document.getElementById('heroProgress').textContent = `${courseProgress}% COMPLETE`;
  document.getElementById('heroXp').textContent = state.completed ? '75 XP EARNED' : '75 XP AVAILABLE';
  document.getElementById('progressLabel').textContent = state.completed ? 'Mission 0.2 complete' : 'Mission 0.2 ready';
  document.getElementById('missionCount').textContent = state.completed ? '2 missions complete' : '1 mission complete';
  document.getElementById('profileMissions').textContent = state.completed ? '2' : '1';
  document.getElementById('profileXp').textContent = state.completed ? '175' : '100';
  document.getElementById('nextLessonStatus').textContent = state.completed ? 'Unlocked' : 'Locked';
  const nextButton = document.getElementById('openLesson03');
  nextButton.disabled = !state.completed;
  nextButton.querySelector('span').textContent = state.completed ? 'Unlocked' : 'Locked';
}

document.getElementById('completeMission').addEventListener('click', () => {
  if (!allRequirementsComplete() || state.completed) return;
  state.completed = true;
  state.xp = 75;
  saveState();
  completeModal.classList.add('open');
});
document.getElementById('returnDashboard').addEventListener('click', () => { completeModal.classList.remove('open'); switchView('dashboard'); });
document.getElementById('openLesson03').addEventListener('click', () => { if (state.completed) showToast('M0-L03 is next in production.'); });

if (!priorMission.completed) document.getElementById('lockedOverlay').hidden = false;
renderState();
