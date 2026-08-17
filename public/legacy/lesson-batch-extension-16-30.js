(function () {
  const source = window.ATLAS_ADVANCED_DAYS || {};
  const existing = window.ATLAS_LESSON_BATCH || [];
  const resultWrong = ['A collection of ideas with no assigned owner','A purchase made before requirements are reviewed'];
  const controlWrong = ['Skip the control when volume increases','Rely on memory instead of the operating system'];
  const documentWrong = ['Only the final purchase receipt','A verbal agreement with no supporting record'];
  const avoidWrong = ['Use evidence, accountable ownership, and review','Document decisions and resolve critical gaps before advancing'];
  const convertQuiz = item => [
    ['Which result is this mission designed to produce?',[item.checks.result,...resultWrong],0],
    ['Which control belongs in this mission?',[...controlWrong,item.checks.control],2],
    ['What should the office document before moving forward?',[documentWrong[0],item.checks.document,documentWrong[1]],1],
    ['Which approach conflicts with this mission?',[...avoidWrong,item.checks.avoid],2],
    ['What must happen before the next mission unlocks?',['Open the toolkit only','Complete the lesson, both resources, action plan, review questions, and checkpoint','Watch only the video placeholder'],1]
  ];
  const extension = Object.keys(source).map(Number).filter(day => day >= 16).sort((a,b) => a-b).map(day => {
    const item = source[day];
    const sequence = ['First','Next','Then','Finally'];
    const focusScript = item.focuses.map((focus,index) => `${sequence[index]}, focus on ${focus[0].toLowerCase()}. ${focus[1]}. Do not mark this area ready based on intention alone. Record the current status, the accountable owner, the evidence that proves completion, and any dependency that could keep the office from moving forward.`);
    return {
      day,
      slug: item.slug,
      phase: `PHASE ${item.phase} - ${item.phaseTitle.toUpperCase()}`,
      title: item.title,
      tagline: item.hero,
      summary: item.summary,
      toolkit_pages: String(item.toolkitPage),
      duration: item.minutes,
      xp: 100,
      key_points: item.focuses,
      action_title: item.activityTitle,
      action_intro: item.activityIntro,
      fields: [
        ...item.focuses.map(focus => [focus[0], focus[1]]),
        ['Accountable owner','Name the role responsible for completion'],
        ['Completion evidence','Record the document, test, approval, or proof']
      ],
      professional_prompt: item.reflection,
      quiz: convertQuiz(item),
      script: [
        `Welcome to Day ${day}. Today your mission is to ${item.title.toLowerCase()}. ${item.hero} This mission turns an important launch decision into a documented operating standard that your office can repeat, review, and improve.`,
        item.summary,
        ...item.lesson,
        ...focusScript,
        `Keep this operating rule in view: ${item.warning} When something is uncertain, pause the affected decision, identify the official source or qualified professional who can resolve it, and preserve the answer with the mission records. A deadline, sales claim, or busy-season shortcut is not evidence.`,
        `Now complete the ${item.activityTitle}. Work through all four mission areas, name the accountable owner, and identify the document, test, approval, or other evidence that will prove each item is ready. Use the action plan to expose gaps early, while they can still be corrected without disrupting a client or filing deadline.`,
        `Your professional-review prompt is this: ${item.reflection} Write the answer in plain language. List the facts that support it, the questions that remain open, and the date or event that will trigger another review. Do not place Social Security numbers, client return information, account credentials, or other sensitive identifiers in the Academy worksheet.`,
        `Before you complete the checkpoint, review the mission from the client's point of view and the office owner's point of view. Ask whether the process is clear, secure, compliant, financially sustainable, and understandable to another trained team member. If the process depends on one person's memory, convert it into a written step, assigned control, or retained record.`,
        day === 30 ? 'Carry these documented standards into opening week and continuous improvement. Protect the controls you built, review the first week honestly, and correct issues before they become habits. Your office is not finished growing; it is ready to operate with intention.' : `When the action plan and checkpoint are complete, continue to ${item.next}. Bring the records from this mission forward so the next decision builds on verified work instead of starting over. I will meet you at the next mission.`
      ]
    };
  });
  window.ATLAS_LESSON_BATCH = existing.concat(extension);
})();
