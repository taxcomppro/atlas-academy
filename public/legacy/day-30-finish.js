(function(){
  if (Number(document.body.dataset.day) !== 30) return;
  const setText = () => {
    const checklistTitle = document.querySelector('.batch-checklist h3');
    const help = document.getElementById('completionHelp');
    const modal = document.getElementById('completionModal');
    if (checklistTitle) checklistTitle.textContent = 'Complete the Course';
    if (help && !help.textContent.startsWith('All requirements')) help.textContent = 'Complete all five requirements to finish the course.';
    if (help && help.textContent.startsWith('All requirements')) help.textContent = 'All requirements complete. The course is ready to finish.';
    if (modal) {
      modal.querySelector('.number').innerHTML = '&#9733;';
      modal.querySelector('span').textContent = 'COURSE COMPLETE';
      modal.querySelector('p').textContent = 'Your 30-day launch plan is complete. Carry these documented standards into opening week and continuous improvement.';
      const link = modal.querySelector('a'); link.textContent = 'Return to Course Mission Control'; link.href = '30-day-tax-office-launch.html#roadmap';
    }
  };
  setText();
  const target = document.getElementById('completionHelp');
  if (target) new MutationObserver(setText).observe(target,{childList:true,characterData:true,subtree:true});
})();
