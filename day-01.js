const key = 'atlas-30day-day-1-v1';
const defaults = { lesson:false, downloads:[], decision:false, source:false, quiz:false, completed:false, ownership:'', liability:'', growth:'', administration:'', workingDirection:'', directionReason:'', professionalSource:'', notes:'' };
let state;
try { state = { ...defaults, ...JSON.parse(localStorage.getItem(key) || '{}') }; } catch { state = { ...defaults }; }
const save = () => localStorage.setItem(key, JSON.stringify(state));

document.querySelectorAll('.lesson-tabs button').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.lesson-tabs button').forEach(item => item.classList.remove('active'));
  document.querySelectorAll('.lesson-panel').forEach(panel => panel.classList.remove('active'));
  button.classList.add('active'); document.getElementById(button.dataset.tab).classList.add('active');
}));

const decisionFields = ['ownership','liability','growth','administration','workingDirection','directionReason','professionalSource'];
decisionFields.forEach(id => document.getElementById(id).value = state[id] || '');
document.getElementById('lessonNotes').value = state.notes || '';
document.getElementById('lessonReviewed').checked = state.lesson;

document.getElementById('lessonReviewed').addEventListener('change', event => { state.lesson = event.target.checked; save(); render(); });
document.querySelectorAll('[data-download]').forEach(link => link.addEventListener('click', () => { if (!state.downloads.includes(link.dataset.download)) state.downloads.push(link.dataset.download); save(); render(); }));
document.getElementById('saveDecision').addEventListener('click', () => {
  decisionFields.forEach(id => state[id] = document.getElementById(id).value.trim());
  state.decision = ['ownership','liability','growth','administration','workingDirection','directionReason'].every(id => Boolean(state[id]));
  state.source = Boolean(state.professionalSource);
  document.getElementById('decisionStatus').textContent = state.decision && state.source ? 'Working direction saved' : 'Complete every field before saving';
  save(); render();
});
document.getElementById('dayQuiz').addEventListener('submit', event => {
  event.preventDefault(); const data = new FormData(event.currentTarget); const correct = ['b','c','a','b','a'];
  const score = correct.filter((answer,index) => data.get(`q${index+1}`) === answer).length;
  state.quiz = score >= 4; document.getElementById('quizStatus').textContent = state.quiz ? `Passed - ${score*20}%` : `${score} of 5 correct - 80% required`; save(); render();
});
document.getElementById('saveNotes').addEventListener('click', () => { state.notes = document.getElementById('lessonNotes').value; document.getElementById('notesStatus').textContent = 'Notes saved'; save(); });
document.getElementById('completeDay').addEventListener('click', () => { if (!ready()) return; state.completed = true; save(); document.getElementById('completionModal').hidden = false; });

const ready = () => state.lesson && state.downloads.length === 2 && state.decision && state.source && state.quiz;
function requirement(name, done, completeLabel) { const row = document.querySelector(`[data-requirement="${name}"]`); row.classList.toggle('done', done); row.querySelector('b').textContent = done ? completeLabel : name === 'downloads' ? `${state.downloads.length} of 2` : 'Pending'; }
function render() {
  requirement('lesson', state.lesson, 'Reviewed'); requirement('downloads', state.downloads.length === 2, 'Opened'); requirement('decision', state.decision, 'Saved'); requirement('source', state.source, 'Identified'); requirement('quiz', state.quiz, 'Passed');
  const count = [state.lesson,state.downloads.length===2,state.decision,state.source,state.quiz].filter(Boolean).length; document.getElementById('headerProgress').textContent = `${count} of 5 complete`; document.getElementById('headerProgressBar').style.width = `${count*20}%`; document.getElementById('completeDay').disabled = !ready(); document.getElementById('completionHelp').textContent = ready() ? 'All requirements complete. Day 2 is ready to unlock.' : 'Complete all five requirements to unlock Day 2.';
  if (state.decision && state.source) document.getElementById('decisionStatus').textContent = 'Working direction saved'; if (state.quiz) document.getElementById('quizStatus').textContent = 'Passed'; if (state.completed) document.getElementById('completeDay').textContent = 'Day 1 Complete';
}
render();
