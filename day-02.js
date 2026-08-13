const key = 'atlas-30day-day-2-v1';
const defaults = { lesson:false, downloads:[], fit:false, questions:false, quiz:false, completed:false, owners:'', protection:'', scale:'', formalities:'', fitQuestions:'', fitLabel:'', notes:'' };
let state;
try { state = { ...defaults, ...JSON.parse(localStorage.getItem(key) || '{}') }; } catch { state = { ...defaults }; }
const save = () => localStorage.setItem(key, JSON.stringify(state));

document.querySelectorAll('.lesson-tabs button').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.lesson-tabs button').forEach(item => item.classList.remove('active'));
  document.querySelectorAll('.lesson-panel').forEach(panel => panel.classList.remove('active'));
  button.classList.add('active'); document.getElementById(button.dataset.tab).classList.add('active');
}));

['owners','protection','scale','formalities','fitQuestions'].forEach(id => document.getElementById(id).value = state[id] || '');
document.getElementById('lessonNotes').value = state.notes || '';
document.getElementById('lessonReviewed').checked = state.lesson;
document.getElementById('lessonReviewed').addEventListener('change', event => { state.lesson = event.target.checked; save(); render(); });
document.querySelectorAll('[data-download]').forEach(link => link.addEventListener('click', () => { if (!state.downloads.includes(link.dataset.download)) state.downloads.push(link.dataset.download); save(); render(); }));

document.getElementById('saveFit').addEventListener('click', () => {
  ['owners','protection','scale','formalities','fitQuestions'].forEach(id => state[id] = document.getElementById(id).value.trim());
  const answers = ['owners','protection','scale','formalities'].map(id => state[id]);
  state.fit = answers.every(Boolean); state.questions = Boolean(state.fitQuestions);
  if (state.fit) {
    const score = answers.reduce((totals, value) => ({ ...totals, [value]:(totals[value] || 0) + 1 }), {});
    const best = Object.keys(score).sort((a,b) => score[b] - score[a])[0];
    state.fitLabel = { sole:'Sole Proprietorship Discussion', llc:'LLC Discussion', corp:'C Corporation Discussion', scorp:'Underlying Entity + S Corporation Election Discussion' }[best];
  }
  document.getElementById('fitStatus').textContent = state.fit && state.questions ? 'Fit check saved' : 'Complete every selection and add your questions';
  save(); render();
});

document.getElementById('dayQuiz').addEventListener('submit', event => {
  event.preventDefault(); const data = new FormData(event.currentTarget); const correct = ['a','b','a','b','c'];
  const score = correct.filter((answer,index) => data.get(`q${index+1}`) === answer).length;
  state.quiz = score >= 4; document.getElementById('quizStatus').textContent = state.quiz ? `Passed - ${score*20}%` : `${score} of 5 correct - 80% required`; save(); render();
});
document.getElementById('saveNotes').addEventListener('click', () => { state.notes = document.getElementById('lessonNotes').value; document.getElementById('notesStatus').textContent = 'Notes saved'; save(); });
document.getElementById('completeDay').addEventListener('click', () => { if (!ready()) return; state.completed = true; save(); document.getElementById('completionModal').hidden = false; });

const ready = () => state.lesson && state.downloads.length === 2 && state.fit && state.questions && state.quiz;
function requirement(name, done, completeLabel) { const row = document.querySelector(`[data-requirement="${name}"]`); row.classList.toggle('done', done); row.querySelector('b').textContent = done ? completeLabel : name === 'downloads' ? `${state.downloads.length} of 2` : 'Pending'; }
function render() {
  requirement('lesson', state.lesson, 'Reviewed'); requirement('downloads', state.downloads.length === 2, 'Opened'); requirement('fit', state.fit, 'Saved'); requirement('questions', state.questions, 'Recorded'); requirement('quiz', state.quiz, 'Passed');
  const count = [state.lesson,state.downloads.length===2,state.fit,state.questions,state.quiz].filter(Boolean).length;
  document.getElementById('headerProgress').textContent = `${count} of 5 complete`; document.getElementById('headerProgressBar').style.width = `${count*20}%`;
  document.getElementById('completeDay').disabled = !ready(); document.getElementById('completionHelp').textContent = ready() ? 'All requirements complete. Day 3 is ready to unlock.' : 'Complete all five requirements to unlock Day 3.';
  document.getElementById('fitResult').hidden = !state.fit; if (state.fit) document.getElementById('fitLabel').textContent = state.fitLabel;
  if (state.fit && state.questions) document.getElementById('fitStatus').textContent = 'Fit check saved'; if (state.quiz) document.getElementById('quizStatus').textContent = 'Passed'; if (state.completed) document.getElementById('completeDay').textContent = 'Day 2 Complete';
}
render();
