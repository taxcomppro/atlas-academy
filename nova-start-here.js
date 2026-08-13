const storageKey = 'atlas-30day-nova-start-v1';
const defaults = { briefing: false, plan: false, downloads: [], quiz: false, completed: false, launchDate: '', officeModel: '', dailyTime: '', launchGoal: '', launchWhy: '' };
let state;
try { state = { ...defaults, ...JSON.parse(localStorage.getItem(storageKey) || '{}') }; }
catch { state = { ...defaults }; }

const save = () => localStorage.setItem(storageKey, JSON.stringify(state));
const fields = ['launchDate', 'officeModel', 'dailyTime', 'launchGoal', 'launchWhy'];
fields.forEach(id => { document.getElementById(id).value = state[id] || ''; });
document.getElementById('briefingReviewed').checked = state.briefing;

document.querySelectorAll('.lesson-tabs button').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.lesson-tabs button').forEach(item => item.classList.remove('active'));
  document.querySelectorAll('.lesson-panel').forEach(panel => panel.classList.remove('active'));
  button.classList.add('active');
  document.getElementById(button.dataset.tab).classList.add('active');
}));

document.querySelectorAll('[data-open-tab]').forEach(link => link.addEventListener('click', event => {
  event.preventDefault();
  const panelId = link.dataset.openTab;
  const button = document.querySelector(`.lesson-tabs button[data-tab="${panelId}"]`);
  if (button) button.click();
  document.getElementById(panelId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}));

document.getElementById('briefingReviewed').addEventListener('change', event => {
  state.briefing = event.target.checked;
  save();
  render();
});

document.getElementById('savePlan').addEventListener('click', () => {
  fields.forEach(id => { state[id] = document.getElementById(id).value.trim(); });
  state.plan = fields.every(id => Boolean(state[id]));
  document.getElementById('planStatus').textContent = state.plan ? 'Launch plan saved' : 'Complete every field before saving';
  save();
  render();
});

document.querySelectorAll('[data-download]').forEach(link => link.addEventListener('click', () => {
  if (!state.downloads.includes(link.dataset.download)) state.downloads.push(link.dataset.download);
  save();
  render();
}));

document.getElementById('orientationQuiz').addEventListener('submit', event => {
  event.preventDefault();
  const answers = new FormData(event.currentTarget);
  const score = ['q1', 'q2', 'q3'].filter((name, index) => answers.get(name) === ['b', 'a', 'b'][index]).length;
  state.quiz = score === 3;
  document.getElementById('quizStatus').textContent = state.quiz ? 'Passed - 100%' : `${score} of 3 correct - review and try again`;
  save();
  render();
});

document.getElementById('completeOrientation').addEventListener('click', () => {
  if (!ready()) return;
  state.completed = true;
  save();
  document.getElementById('completionModal').hidden = false;
});

function ready() { return state.briefing && state.plan && state.downloads.length === 2 && state.quiz; }

function renderRequirement(name, done, label) {
  const row = document.querySelector(`[data-requirement="${name}"]`);
  row.classList.toggle('done', done);
  row.querySelector('b').textContent = done ? label : name === 'downloads' ? `${state.downloads.length} of 2` : 'Pending';
}

function render() {
  renderRequirement('briefing', state.briefing, 'Reviewed');
  renderRequirement('plan', state.plan, 'Saved');
  renderRequirement('downloads', state.downloads.length === 2, 'Opened');
  renderRequirement('quiz', state.quiz, 'Passed');
  const count = [state.briefing, state.plan, state.downloads.length === 2, state.quiz].filter(Boolean).length;
  document.getElementById('headerProgress').textContent = `${count} of 4 complete`;
  document.getElementById('headerProgressBar').style.width = `${count * 25}%`;
  document.getElementById('completeOrientation').disabled = !ready();
  document.getElementById('completionHelp').textContent = ready() ? 'All requirements complete. Day 1 is ready to unlock.' : 'Complete all four requirements to unlock Day 1.';
  if (state.plan) document.getElementById('planStatus').textContent = 'Launch plan saved';
  if (state.quiz) document.getElementById('quizStatus').textContent = 'Passed - 100%';
  if (state.completed) document.getElementById('completeOrientation').textContent = 'Start Here Complete';
}

render();
