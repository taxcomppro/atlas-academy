function completed(key) {
  try { return Boolean(JSON.parse(localStorage.getItem(key) || '{}').completed); }
  catch { return false; }
}

const welcomeComplete = completed('atlas-m0-l01-state-v1') && completed('atlas-m0-l02-state-v1');
const statusCard = document.getElementById('academyStatus');
const statusTitle = document.getElementById('academyStatusTitle');
const statusText = document.getElementById('academyStatusText');
const statusLink = document.getElementById('academyStatusLink');

if (welcomeComplete) {
  statusCard.classList.add('complete');
  statusTitle.textContent = 'Welcome complete';
  statusText.textContent = 'Your one-time Academy onboarding is complete.';
  statusLink.textContent = 'Review Academy Welcome';
} else {
  statusTitle.textContent = 'Welcome available';
  statusText.textContent = 'Complete the one-time Academy Welcome whenever you are ready.';
  statusLink.textContent = 'Open Academy Welcome';
}

const course = window.ATLAS_LAUNCH_COURSE;
const orientationComplete = completed('atlas-30day-nova-start-v1');
// Temporary owner-review mode. Set to false before opening enrollment.
const reviewMode = true;
const allDays = course.phases.flatMap(phase => phase.days);
const completedDays = allDays.filter(day => completed(`atlas-30day-day-${day[0]}-v1`)).length;
const percent = Math.round((completedDays / 30) * 100);

document.getElementById('courseProgressPercent').textContent = `${percent}%`;
document.getElementById('courseProgressBar').style.width = `${percent}%`;
document.getElementById('courseMissionCount').textContent = `${completedDays} of 30 daily missions complete`;
document.getElementById('courseProgressTitle').textContent = reviewMode ? 'Owner review access enabled' : completedDays ? 'Launch plan in progress' : orientationComplete ? 'Day 1 unlocked' : 'Ready to begin';
document.getElementById('courseNextMission').textContent = reviewMode ? 'All 30 lessons are temporarily open for review' : orientationComplete ? (completedDays ? `Continue with Day ${Math.min(completedDays + 1, 30)}` : 'Day 1 is ready') : 'Start Here with Nova is next';

if (orientationComplete) {
  document.getElementById('orientationStatus').textContent = 'COMPLETE';
  document.getElementById('orientationStatus').classList.add('complete');
  document.getElementById('orientationAction').textContent = 'Review Start Here';
  document.getElementById('resumeCourse').textContent = completedDays ? `Continue Day ${Math.min(completedDays + 1, 30)}` : 'Continue to Day 1';
  document.getElementById('resumeCourse').href = completedDays ? '#roadmap' : 'day-01-business-structure.html';
}

const roadmap = document.getElementById('missionRoadmap');
course.phases.forEach(phase => {
  const section = document.createElement('section');
  section.className = 'roadmap-phase';
  const dayCards = phase.days.map(([number, title, description, href]) => {
    const done = completed(`atlas-30day-day-${number}-v1`);
    const unlocked = reviewMode || (orientationComplete && number <= completedDays + 1);
    const state = done ? 'complete' : unlocked && href ? 'ready' : unlocked ? 'upcoming' : 'locked';
    const label = done ? 'Complete' : unlocked && href ? 'Open Mission' : unlocked ? 'Next in production' : 'Locked';
    const content = `<div class="day-number">DAY <strong>${number}</strong></div><div><h5>${title}</h5><p>${description}</p></div><span>${label}</span>`;
    return unlocked && href ? `<a class="day-card ${state}" href="${href}">${content}</a>` : `<article class="day-card ${state}">${content}</article>`;
  }).join('');

  section.innerHTML = `<header><div><span>PHASE ${phase.number}</span><h4>${phase.title}</h4></div><p>${phase.subtitle}</p></header><div class="day-grid">${dayCards}</div>`;
  roadmap.appendChild(section);
});
