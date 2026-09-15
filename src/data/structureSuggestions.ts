export interface LetterAnatomyStep {
  id: string;
  number: string;
  name: string;
  sectionTarget: 'subject' | 'salutation' | 'opening' | 'body' | 'callToAction' | 'signOff';
  summary: string;
  guidance: string;
  example: string;
}

export interface SentenceStarter {
  id: string;
  label: string;
  snippet: string;
  section: 'opening' | 'body' | 'callToAction' | 'signOff';
  tone: string;
}

export const LETTER_ANATOMY_STEPS: LetterAnatomyStep[] = [
  {
    id: 'step-subject',
    number: '01',
    name: 'Subject Line',
    sectionTarget: 'subject',
    summary: 'A concise, reference-keyed statement of intent',
    guidance: 'State the core objective, reference number, or appointment title within 6–10 words.',
    example: 'Subject: Application for Senior Research Fellow — Eleanor Vance',
  },
  {
    id: 'step-salutation',
    number: '02',
    name: 'Formal Salutation',
    sectionTarget: 'salutation',
    summary: 'Direct honorific address matching recipient rank',
    guidance: 'Use official titles (Dr., Dean, Justice, Commissioner, Mr./Ms.). Avoid casual greetings.',
    example: 'Dear Vice President Sterling,',
  },
  {
    id: 'step-opening',
    number: '03',
    name: 'The Hook & Statement of Purpose',
    sectionTarget: 'opening',
    summary: 'Direct, unambiguous declaration of why you are writing',
    guidance: 'Declare your purpose in the very first 1–2 sentences. Avoid preamble or small talk.',
    example: 'I am writing to formally submit my application for the Director of Communications position...',
  },
  {
    id: 'step-body',
    number: '04',
    name: 'Substance & Evidentiary Arguments',
    sectionTarget: 'body',
    summary: '1–3 structured paragraphs with facts, data, or narrative backing',
    guidance: 'Provide concrete metrics, project precedents, or personal achievements that substantiate your thesis.',
    example: 'Over the past four years, my department reduced operating latency by 32% while overseeing...',
  },
  {
    id: 'step-cta',
    number: '05',
    name: 'Call to Action & Forward Momentum',
    sectionTarget: 'callToAction',
    summary: 'A courteous, proactive proposal for the next step or timeline',
    guidance: 'Propose a specific next milestone (e.g. 20-minute discussion, submission of records, review date).',
    example: 'I would welcome the opportunity to discuss our collaborative synergies at your convenience.',
  },
  {
    id: 'step-signoff',
    number: '06',
    name: 'Formal Sign-off & Sender Coordinates',
    sectionTarget: 'signOff',
    summary: 'Dignified closure and complete contact coordinates',
    guidance: 'Choose a formal closing that respects seniority, followed by your name, title, and organization.',
    example: 'Respectfully yours,\nEleanor Vance, Ph.D.',
  },
];

export const SENTENCE_STARTERS: SentenceStarter[] = [
  // 1. Openings & Purpose
  {
    id: 'open-1',
    section: 'opening',
    label: 'Formal Job / Appointment Application',
    snippet: 'I am writing to formally submit my candidacy for the position of [Role/Title] at [Organization]. Having tracked your decisive expansion across [Industry/Sector], I welcome this opportunity to contribute a disciplined track record of [Core Skill] and [Achievement].',
    tone: 'Executive',
  },
  {
    id: 'open-2',
    section: 'opening',
    label: 'Respectful Recommendation Request',
    snippet: 'I am writing to respectfully request your consideration and support regarding a letter of recommendation for my application to [Program/Institution/Award].',
    tone: 'Deferential',
  },
  {
    id: 'open-3',
    section: 'opening',
    label: 'Follow-up on Prior Discussion / Proposal',
    snippet: 'Following our recent discussion regarding [Initiative/Matter], I am pleased to provide this formal overview outlining our proposed strategy and operational timeline.',
    tone: 'Professional',
  },
  {
    id: 'open-4',
    section: 'opening',
    label: 'Candidate Recommendation / Endorsement',
    snippet: 'It is with great pleasure and highest confidence that I write to recommend [Candidate Name] for [Opportunity/Award], having worked alongside them for [X] years in [Context].',
    tone: 'Warm & Authoritative',
  },
  {
    id: 'open-5',
    section: 'opening',
    label: 'Official Inquiry or Administrative Petition',
    snippet: 'I am writing to bring an important administrative matter to your official attention concerning [Subject/Determination], and to formally petition for [Specific Relief or Administrative Review].',
    tone: 'Diplomatic & Firm',
  },
  {
    id: 'open-6',
    section: 'opening',
    label: 'Executive Strategic Partnership',
    snippet: 'On behalf of [Organization], I am writing to propose a strategic collaboration that directly aligns with [Recipient Organization]\'s strategic objectives in [Field].',
    tone: 'Direct & Concise',
  },

  // 2. Substance & Evidence
  {
    id: 'body-1',
    section: 'body',
    label: 'Track Record & Core Specialization',
    snippet: 'Throughout my [X] years of experience directing [Function/Domain], my work has centered on engineering sustainable solutions that withstand rigorous operational challenges.',
    tone: 'Executive',
  },
  {
    id: 'body-2',
    section: 'body',
    label: 'Quantifiable Milestone & Metric',
    snippet: 'Specifically, my recent leadership of [Project/Initiative] delivered a [X]% increase in [Metric], while establishing disciplined governance covenants that ensured high stakeholder alignment.',
    tone: 'Evidence-backed',
  },
  {
    id: 'body-3',
    section: 'body',
    label: 'Academic / Scholarly Precedent',
    snippet: 'During my tenure in [Laboratory/Department], I focused on [Research Area], which culminated in [Publication/Defense] and provided deep technical grounding in [Methodology].',
    tone: 'Academic',
  },
  {
    id: 'body-4',
    section: 'body',
    label: 'Collaborative Philosophy & Values',
    snippet: 'My methodology combines exhaustive quantitative analysis with an intuitive grasp of stakeholder incentives, allowing our teams to consistently exceed commitments without sacrificing organizational values.',
    tone: 'Balanced',
  },
  {
    id: 'body-5',
    section: 'body',
    label: 'Addressing Complex Institutional Challenges',
    snippet: 'In reviewing the challenges currently facing [Industry/Organization], I observed that the primary impediment lies in [Root Cause]. Addressing this will require [Proposed Solution].',
    tone: 'Analytical',
  },

  // 3. Call to Action & Closing Momentum
  {
    id: 'cta-1',
    section: 'callToAction',
    label: 'Interview / Exploratory Discussion',
    snippet: 'I would welcome the opportunity to discuss how my strategic background aligns with [Organization]\'s long-term objectives. Thank you for your consideration, and I look forward to speaking with you at your convenience.',
    tone: 'Executive',
  },
  {
    id: 'cta-2',
    section: 'callToAction',
    label: 'Courteous Follow-up & Availability',
    snippet: 'Thank you for your thoughtful consideration of this correspondence. I remain entirely at your disposal should your team require supplementary records, portfolios, or references.',
    tone: 'Warmly Professional',
  },
  {
    id: 'cta-3',
    section: 'callToAction',
    label: 'Specific Timeline / Next Steps',
    snippet: 'I would be grateful for the opportunity to meet briefly next week to review this proposal in detail. Please let me know what day and time best suits your calendar.',
    tone: 'Direct & Concise',
  },
  {
    id: 'cta-4',
    section: 'callToAction',
    label: 'Deferential Gratitude for Mentorship',
    snippet: 'Regardless of your availability, I want to express my sincere appreciation for your ongoing mentorship and guidance throughout my career. Thank you for your time and counsel.',
    tone: 'Deferential',
  },

  // 4. Sign-offs
  {
    id: 'sign-1',
    section: 'signOff',
    label: 'Respectfully yours,',
    snippet: 'Respectfully yours,',
    tone: 'Formal & Deferential',
  },
  {
    id: 'sign-2',
    section: 'signOff',
    label: 'Sincerely,',
    snippet: 'Sincerely,',
    tone: 'Universal Standard',
  },
  {
    id: 'sign-3',
    section: 'signOff',
    label: 'With highest regards and appreciation,',
    snippet: 'With highest regards and appreciation,',
    tone: 'Warm Executive',
  },
  {
    id: 'sign-4',
    section: 'signOff',
    label: 'Cordially,',
    snippet: 'Cordially,',
    tone: 'Polite Business',
  },
];
