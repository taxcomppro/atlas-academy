import { neon } from "@neondatabase/serverless";
const sql=neon(process.env.DATABASE_URL);
const acknowledgement=`I acknowledge that I completed The Staff's Audit Ready Due Diligence Playbook training. I understand that completing Form 8867 alone does not satisfy all paid-preparer due-diligence requirements. I agree to follow office procedures, ask reasonable additional questions, document client responses, escalate unresolved inconsistencies, protect taxpayer information, and refuse to prepare or file information I know—or have reason to know—is false.`;
const [product]=await sql`INSERT INTO academy_products (product_key,title,product_type) VALUES ('training:irs-fine-defense','The Staff''s Audit Ready Due Diligence Course','COURSE') ON CONFLICT (product_key) DO UPDATE SET title=EXCLUDED.title,product_type=EXCLUDED.product_type,active=true RETURNING id`;
await sql`INSERT INTO academy_products (product_key,title,product_type) VALUES ('course:30-day-tax-office-launch','30 Day Tax Office Launch','COURSE') ON CONFLICT (product_key) DO UPDATE SET title=EXCLUDED.title,product_type=EXCLUDED.product_type`;
const [version]=await sql`INSERT INTO academy_training_versions (product_id,version_key,title,acknowledgement_text) VALUES (${product.id},'2027','The Staff''s Audit Ready Due Diligence Course',${acknowledgement}) ON CONFLICT (product_id,version_key) DO UPDATE SET title=EXCLUDED.title RETURNING id`;
const questions=[
  ["What is the purpose of paid-preparer due diligence?",["To replace all office procedures","To support accurate, documented eligibility decisions","To guarantee an IRS audit will not occur","To eliminate client interviews"],1],
  ["When information appears incomplete or inconsistent, a preparer should:",["Ignore it if the refund is small","Ask reasonable follow-up questions and document responses","Guess based on last year","File first and correct later"],1],
  ["Completing Form 8867 by itself:",["Always satisfies every requirement","Is optional","Does not by itself satisfy all due-diligence requirements","Replaces recordkeeping"],2],
  ["A preparer should protect:",["Only office passwords","Taxpayer information and supporting records","Only printed documents","Nothing after filing"],1],
  ["If a preparer knows information is false, the preparer should:",["File it if the client insists","Refuse to prepare or file the false information","Remove the notes","Ask another preparer to sign"],1],
  ["Good due-diligence records should show:",["Only the final refund","Questions asked, answers received, and conclusions","Only the software used","Only the client's signature"],1],
  ["An unresolved inconsistency should be:",["Hidden","Escalated under office procedures","Deleted","Automatically accepted"],1],
  ["Individual training accounts help document:",["Who completed training and when","Office rent","Advertising expenses","Client refunds"],0],
  ["The recommended minimum video completion is:",["10%","50%","90%","Opening the page"],2],
  ["A completion certificate represents:",["IRS certification","Completion of a Tax Compliance Pro educational program","A professional license","Guaranteed compliance"],1]
];
const [{count}]=await sql`SELECT count(*)::int AS count FROM academy_questions WHERE training_version_id=${version.id}`;
if(count===0) for(const [prompt,options,correct] of questions) await sql`INSERT INTO academy_questions (training_version_id,prompt,options,correct_option) VALUES (${version.id},${prompt},${JSON.stringify(options)}::jsonb,${correct})`;

const ecosystemProducts=[
  {key:'toolkit:irs-fine-defense',title:'IRS Fine Defense Toolkit',type:'TOOLKIT',version:'1.0',versionTitle:'IRS Fine Defense Toolkit'},
  {key:'training:schedule-c-reconstruction',title:'Schedule C Reconstruction Training',type:'TRAINING',version:'2027',versionTitle:'Schedule C Reconstruction Training'},
  {key:'training:audit-ready-playbook',title:'Audit Ready Due Diligence Playbook',type:'TRAINING',version:'2027',versionTitle:'Audit Ready Playbook Training'},
  {key:'course:30-day-tax-office-launch',title:'30 Day Tax Office Launch',type:'COURSE',version:'1.0',versionTitle:'30 Day Tax Office Launch'},
];

const curriculum={
  'toolkit:irs-fine-defense':[
    ['Toolkit Orientation','Use the IRS Fine Defense Toolkit as a repeatable office compliance resource.',[
      ['Start Here: Toolkit Overview','READING',8],
      ['Office Due-Diligence Resources','DOWNLOAD',10],
      ['Staff Training and Documentation Guide','DOWNLOAD',10],
    ]],
  ],
  'training:irs-fine-defense':[
    ['Foundations','Build a defensible office training standard.',[
      ['Why Due Diligence Matters','VIDEO',14],
      ['Spot the Documentation Gap','EXERCISE',8],
      ['Office Procedures Checklist','DOWNLOAD',5],
    ]],
    ['Audit Readiness','Turn staff decisions into a clear compliance record.',[
      ['Reasonable Questions and Escalation','READING',12],
      ['Final Assessment','ASSESSMENT',25],
    ]],
  ],
  'training:schedule-c-reconstruction':[
    ['Reconstruction Foundations','Understand when and how to reconstruct business income and expenses.',[
      ['When Records Are Incomplete','VIDEO',16],
      ['Choose a Defensible Source','EXERCISE',10],
      ['Reconstruction Interview Guide','DOWNLOAD',6],
    ]],
    ['Documentation','Build a consistent reconstruction workpaper.',[
      ['Corroborating Evidence','READING',12],
      ['Schedule C Reconstruction Assessment','ASSESSMENT',25],
    ]],
  ],
  'training:audit-ready-playbook':[
    ['Audit-Ready Intake','Identify issues before a return is prepared.',[
      ['The Audit-Ready Mindset','VIDEO',12],
      ['Escalate or Continue','EXERCISE',9],
      ['Preparer Playbook','DOWNLOAD',5],
    ]],
    ['Office Defense File','Create a repeatable record of staff decisions.',[
      ['Documenting Follow-Up Questions','READING',12],
      ['Audit Playbook Assessment','ASSESSMENT',25],
    ]],
  ],
  'course:30-day-tax-office-launch':[
    ['Business Foundation','Choose, form, and document the tax office entity.',[
      ['Choose Your Business Structure','VIDEO',18],
      ['Compare Entity Types','EXERCISE',12],
      ['Startup Record File','DOWNLOAD',8],
    ]],
    ['Preparer Readiness','Complete the operational requirements for launch.',[
      ['Secure Your EIN and PTIN','VIDEO',20],
      ['Launch Readiness Check','ASSESSMENT',15],
    ]],
  ],
};

await sql`UPDATE academy_products SET active=false WHERE product_key IN ('training:annual-due-diligence-refresher','training:ero-manager')`;

for(const item of ecosystemProducts){
  const [phase3Product]=await sql`INSERT INTO academy_products (product_key,title,product_type) VALUES (${item.key},${item.title},${item.type}) ON CONFLICT (product_key) DO UPDATE SET title=EXCLUDED.title,product_type=EXCLUDED.product_type,active=true RETURNING id`;
  await sql`INSERT INTO academy_training_versions (product_id,version_key,title,acknowledgement_text) VALUES (${phase3Product.id},${item.version},${item.versionTitle},${acknowledgement}) ON CONFLICT (product_id,version_key) DO UPDATE SET title=EXCLUDED.title,active=true`;
}

for(const [productKey,modules] of Object.entries(curriculum)){
  const [phase3Version]=await sql`SELECT tv.id FROM academy_training_versions tv JOIN academy_products p ON p.id=tv.product_id WHERE p.product_key=${productKey} AND tv.active=true ORDER BY tv.created_at DESC LIMIT 1`;
  if(!phase3Version)continue;
  for(let moduleIndex=0;moduleIndex<modules.length;moduleIndex++){
    const [moduleTitle,moduleDescription,lessons]=modules[moduleIndex];
    const [module]=await sql`INSERT INTO academy_learning_modules (training_version_id,module_key,title,description,position) VALUES (${phase3Version.id},${`module-${moduleIndex+1}`},${moduleTitle},${moduleDescription},${moduleIndex+1}) ON CONFLICT (training_version_id,module_key) DO UPDATE SET title=EXCLUDED.title,description=EXCLUDED.description,position=EXCLUDED.position RETURNING id`;
    for(let lessonIndex=0;lessonIndex<lessons.length;lessonIndex++){
      const [lessonTitle,lessonType,duration]=lessons[lessonIndex];
      const isExercise=lessonType==='EXERCISE';
      const content=isExercise?{
        scenario:`A staff member reaches the ${lessonTitle.toLowerCase()} step and the information provided does not fully support the requested tax treatment. No taxpayer names, identification numbers, or real client data should be entered in this exercise.`,
        prompt:'What is the strongest next action?',
        options:['Continue without documenting the concern','Ask reasonable follow-up questions, document the response, and escalate if unresolved','Delete the conflicting information','Use a prior-year answer without verification'],
        correctOption:1,
        explanation:'A defensible process requires reasonable follow-up, documentation, and escalation when an inconsistency remains unresolved.'
      }:null;
      await sql`INSERT INTO academy_learning_lessons (module_id,lesson_key,title,lesson_type,duration_minutes,content,position) VALUES (${module.id},${`lesson-${lessonIndex+1}`},${lessonTitle},${lessonType},${duration},${content?JSON.stringify(content):null}::jsonb,${lessonIndex+1}) ON CONFLICT (module_id,lesson_key) DO UPDATE SET title=EXCLUDED.title,lesson_type=EXCLUDED.lesson_type,duration_minutes=EXCLUDED.duration_minutes,content=EXCLUDED.content,position=EXCLUDED.position`;
    }
  }
}

console.log("Academy training ecosystem seeded");
