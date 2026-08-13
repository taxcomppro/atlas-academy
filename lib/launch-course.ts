export type LaunchDay={day:number;slug:string;title:string;description:string;phase:number;phaseTitle:string;video?:string;poster?:string;captions?:string;worksheet:string;mission:string};

const phaseData=[
  {number:1,title:"Plan and Form",subtitle:"Choose the legal and financial foundation for your tax office."},
  {number:2,title:"Register and Set Up",subtitle:"Complete preparer registrations and establish the office environment."},
  {number:3,title:"Systems and Compliance",subtitle:"Select core vendors and construct an audit-ready operating system."},
  {number:4,title:"Team and Launch",subtitle:"Turn the system into a trained, tested, launch-ready office."},
];

const rawDays:[number,string,string,string,number,string][]=[
  [1,"choose-business-structure","Choose Your Business Structure","Select the structure that fits your ownership, risk, and growth plan.",1,"Business-Structure-Decision"],
  [2,"compare-entity-types","Compare Entity Types","Understand sole proprietorships, LLCs, and corporations.",1,"Entity-Comparison"],
  [3,"liability-tax-impact","Evaluate Liability and Tax Impact","Connect entity choice to protection, taxation, and recordkeeping.",1,"Liability-Tax-Impact"],
  [4,"secure-ein","Secure Your EIN","Prepare for and obtain the office's federal tax identification number.",1,"Secure-Ein"],
  [5,"form-legal-entity","Form Your Legal Entity","Complete the state formation and organizing steps that apply to you.",1,"Form-Legal-Entity"],
  [6,"business-bank-account","Open Your Business Bank Account","Separate business funds and establish clean financial controls.",1,"Business-Bank-Account"],
  [7,"startup-record-file","Build Your Startup Record File","Organize formation, ownership, banking, and registration records.",1,"Startup-Record-File"],
  [8,"obtain-ptin","Obtain Your PTIN","Complete the preparer tax identification process.",2,"Obtain-Ptin"],
  [9,"efin-irs-registration","Begin EFIN and IRS Registration","Prepare the e-services and EFIN application requirements.",2,"Efin-Irs-Registration"],
  [10,"office-model","Choose Your Office Model","Evaluate home, virtual, shared, and storefront operations.",2,"Office-Model"],
  [11,"right-location","Choose the Right Location","Use demographics, access, privacy, and visibility to guide the decision.",2,"Right-Location"],
  [12,"negotiate-lease","Negotiate Your Lease","Review space, terms, costs, and responsibilities before committing.",2,"Negotiate-Lease"],
  [13,"signage-window-displays","Plan Signage and Window Displays","Create compliant, visible, and professional exterior messaging.",2,"Signage-Window-Displays"],
  [14,"office-supplies-technology","Select Office Supplies and Technology","Equip the office for secure, efficient client service.",2,"Office-Supplies-Technology"],
  [15,"brand-tax-office","Brand Your Tax Office","Align the office, messaging, and client experience with a trustworthy brand.",2,"Brand-Tax-Office"],
  [16,"choose-tax-software","Choose Tax Software","Compare workflow, security, support, integration, and scaling needs.",3,"Choose-Tax-Software"],
  [17,"select-bank-product-partner","Select a Bank Product Partner","Evaluate funding products, fees, safeguards, and operational fit.",3,"Select-Bank-Product-Partner"],
  [18,"vendor-due-diligence","Complete Vendor Due Diligence","Use references, demonstrations, and documented questions.",3,"Complete-Vendor-Due-Diligence"],
  [19,"compliance-infrastructure","Build Your Compliance Infrastructure","Create the policies and controls that support defensible work.",3,"Build-Compliance-Infrastructure"],
  [20,"due-diligence-questionnaires","Use Due Diligence Questionnaires","Standardize questions and evidence required for common tax benefits.",3,"Use-Due-Diligence-Questionnaires"],
  [21,"staff-accountability-forms","Create Staff Accountability Forms","Document responsibilities, acknowledgments, and escalation rules.",3,"Create-Staff-Accountability-Forms"],
  [22,"audit-ready-client-files","Build Audit-Ready Client Files","Use organized evidence, notes, and review checkpoints.",3,"Build-Audit-Ready-Client-Files"],
  [23,"review-fraud-safeguards","Install Review and Fraud Safeguards","Add internal review, consistency checks, and identity controls.",3,"Install-Review-Fraud-Safeguards"],
  [24,"client-intake-workflow","Design Client Intake and Workflow","Map the client journey from first contact through completed return.",4,"Design-Client-Intake-Workflow"],
  [25,"documentation-quality-review","Standardize Documentation and Quality Review","Define handoffs, notes, status tracking, and final checks.",4,"Standardize-Documentation-Quality-Review"],
  [26,"hire-right-roles","Hire the Right Roles","Match preparer, reviewer, administrative, and support work to accountable owners.",4,"Hire-The-Right-Roles"],
  [27,"train-your-team","Train Your Team","Deliver technical, operational, security, and service training.",4,"Train-Your-Team"],
  [28,"grand-opening-checklist","Run the Grand Opening Checklist","Confirm legal, IRS, technology, security, staffing, and facility readiness.",4,"Run-Grand-Opening-Checklist"],
  [29,"mock-client-session","Complete a Mock Client Session","Test the full experience and correct gaps before opening day.",4,"Complete-Mock-Client-Session"],
  [30,"open-tax-office","Open Your Tax Office","Launch with a documented announcement, client standard, and operating rhythm.",4,"Open-Your-Tax-Office"],
];

const videos:Record<number,string>={1:"Day-01-Choose-Your-Business-Structure.mp4",2:"Day-02-Compare-Entity-Types.mp4",3:"Day-03-Evaluate-Liability-and-Tax-Impact.mp4",4:"Day-04-Secure-Your-EIN.mp4",5:"Day-05-Form-Your-Legal-Entity.mp4",6:"Day-06-Open-Your-Business-Bank-Account.mp4",7:"Day-07-Build-Your-Startup-Record-File.mp4",8:"Day-08-Obtain-Your-PTIN.mp4"};

export const launchDays:LaunchDay[]=rawDays.map(([day,slug,title,description,phase,worksheet])=>({
  day,slug,title,description,phase,phaseTitle:phaseData[phase-1].title,
  video:videos[day]?`/assets/${videos[day]}`:undefined,
  poster:day===1?"/assets/Day-01-Nova-Choose-Your-Business-Structure.jpg":undefined,
  captions:day===1?"/assets/Day-01-Nova-Choose-Your-Business-Structure.vtt":undefined,
  worksheet:`/downloads/30-day-launch/Day-${String(day).padStart(2,"0")}-${worksheet}-Worksheet.pdf`,
  mission:`Document the decisions and next actions you will take to ${title.toLowerCase()}. Do not enter taxpayer information or sensitive identification numbers.`,
}));

export const launchPhases=phaseData.map(phase=>({...phase,days:launchDays.filter(day=>day.phase===phase.number)}));
export function getLaunchDay(day:number){return launchDays.find(item=>item.day===day);}
