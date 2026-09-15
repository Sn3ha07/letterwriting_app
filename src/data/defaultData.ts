import {
  Contact,
  LetterTemplate,
  SenderProfile,
  ToneOption,
  ComplexityOption,
  LengthOption,
  GeneratedLetter,
} from '../types';

export const DEFAULT_SENDER: SenderProfile = {
  name: 'Eleanor Vance',
  title: 'Senior Research Fellow',
  organization: 'Institute for Strategic Policy',
  email: 'e.vance@isp-global.org',
  phone: '+1 (415) 890-2341',
  address: '450 Mission Street, Suite 800\nSan Francisco, CA 94105',
  signOff: 'Respectfully yours,',
};

export const SAMPLE_CONTACTS: Contact[] = [
  {
    id: 'c-1',
    name: 'Dr. Alistair Thorne',
    title: 'Dean of Graduate Studies & Professor of Applied Mathematics',
    organization: 'Stanford University',
    email: 'athorne@stanford.edu',
    phone: '+1 (650) 723-2300',
    address: 'Building 380, Sloan Mathematics Center\nStanford, CA 94305',
    salutation: 'Dear Dean Thorne,',
    relationship: 'Former Academic Advisor & Thesis Committee Chair',
    notes: 'Prefers formal academic protocol. Values rigorous empirical data and specific citation of collaborative papers.',
    createdAt: '2026-08-15',
  },
  {
    id: 'c-2',
    name: 'Marcus Sterling',
    title: 'Executive Vice President of Technology & Infrastructure',
    organization: 'Apex Global Enterprises',
    email: 'm.sterling@apexglobal.com',
    phone: '+1 (212) 555-0198',
    address: 'One World Trade Center, 64th Floor\nNew York, NY 10007',
    salutation: 'Dear Mr. Sterling,',
    relationship: 'Prospective Employer / Corporate Leadership Contact',
    notes: 'Executive demeanor. High priority on ROI, strategic delivery, and team leadership metrics.',
    createdAt: '2026-08-20',
  },
  {
    id: 'c-3',
    name: 'The Hon. Evelyn St. Claire',
    title: 'Chairperson, Ethics & Oversight Commission',
    organization: 'Metropolitan Development Authority',
    email: 'oversight@mda.gov',
    phone: '+1 (202) 555-4321',
    address: 'Civic Plaza, Chambers 4B\nWashington, DC 20004',
    salutation: 'Dear Commissioner St. Claire,',
    relationship: 'Regulatory & Civic Inquiries',
    notes: 'Requires precise legalistic/administrative framing with explicit statutory or policy references.',
    createdAt: '2026-08-28',
  },
];

export const PRESET_TEMPLATES: LetterTemplate[] = [
  {
    id: 'tpl-1',
    title: 'Executive Cover Letter',
    category: 'cover-letter',
    description: 'A commanding, evidence-backed cover letter designed for director, VP, or C-suite executive appointments.',
    letterType: 'Cover Letter',
    defaultTone: 'Executive & Authoritative',
    defaultLength: 'Standard',
    defaultComplexity: 'Professional & Polished',
    samplePurpose: 'Application for Vice President of Engineering and Technology Strategy',
    sampleKeyDetails: '- Led engineering organization of 85+ engineers across 4 international hubs.\n- Reduced infrastructure overhead by $2.4M while increasing uptime to 99.99%.\n- Spearheaded enterprise transition to modern AI-driven cloud workflows.\n- Track record of high-retention cultural leadership and cross-functional synergy with Product and Board.',
  },
  {
    id: 'tpl-2',
    title: 'Academic Recommendation Request',
    category: 'recommendation',
    description: 'A deferential yet comprehensive request to a professor or mentor for graduate school, fellowship, or award recommendation.',
    letterType: 'Recommendation Request',
    defaultTone: 'Deferential & Respectful',
    defaultLength: 'Standard',
    defaultComplexity: 'Sophisticated & Academic',
    samplePurpose: 'Requesting a letter of recommendation for admission into Ph.D. Program in Computer Science at MIT',
    sampleKeyDetails: '- Enrolled in CS 281 (Advanced Distributed Systems) in Fall 2025, receiving final grade of A+.\n- Conducted independent research under your mentorship examining consensus latency.\n- Co-authored manuscript currently under review for OSDI.\n- Application deadline is December 15; all submission links will be delivered electronically.',
  },
  {
    id: 'tpl-3',
    title: 'Formal Salary & Equity Review',
    category: 'corporate',
    description: 'A structured, professional business case for compensation adjustment based on high performance and market alignment.',
    letterType: 'Salary & Promotion Review',
    defaultTone: 'Persuasive & Compelling',
    defaultLength: 'Standard',
    defaultComplexity: 'Professional & Polished',
    samplePurpose: 'Formal request for annual compensation benchmark and merit review',
    sampleKeyDetails: '- Exceeded annual team OKRs by 142% for FY25-26.\n- Closed enterprise client partnerships contributing $1.8M in net new ARR.\n- Absorbed interim department leadership duties across Q2 and Q3.\n- Benchmark survey reflects 18-22% variance between current base and prevailing industry market rate.',
  },
  {
    id: 'tpl-4',
    title: 'Formal Regulatory / Civic Inquiry',
    category: 'inquiry',
    description: 'An official petition, complaint, or formal inquiry directed to regulatory, governmental, or corporate oversight bodies.',
    letterType: 'Formal Inquiry / Petition',
    defaultTone: 'Diplomatic & Firm',
    defaultLength: 'Comprehensive',
    defaultComplexity: 'Sophisticated & Academic',
    samplePurpose: 'Formal petition for administrative review of zoning determination #B-8491',
    sampleKeyDetails: '- Property located at Parcel 14A, Downtown Historical District.\n- Discrepancy observed in notice period compliance under Municipal Ordinance Sec 14-B.\n- Impact assessment omitted pedestrian setback calculations.\n- Requesting formal hearing or 30-day evidentiary stay.',
  },
  {
    id: 'tpl-5',
    title: 'Executive Client Outreach / Partnership Email',
    category: 'formal-email',
    description: 'A punchy, high-prestige formal email establishing collaborative partnership with C-level stakeholders.',
    letterType: 'Formal Email',
    defaultTone: 'Direct & Concise',
    defaultLength: 'Concise',
    defaultComplexity: 'Professional & Polished',
    samplePurpose: 'Strategic partnership proposal for Q4 enterprise data integration',
    sampleKeyDetails: '- Mutually complementary capabilities across our real-time processing and your distribution channels.\n- Potential to reduce client churn by an estimated 15% through unified integration.\n- Requesting a brief 20-minute exploratory briefing next Wednesday or Thursday.',
  },
  {
    id: 'tpl-6',
    title: 'Gracious Formal Resignation',
    category: 'corporate',
    description: 'A dignified, impeccably courteous notice of departure preserving relationships and establishing a seamless transition plan.',
    letterType: 'Formal Resignation',
    defaultTone: 'Warmly Professional',
    defaultLength: 'Concise',
    defaultComplexity: 'Professional & Polished',
    samplePurpose: 'Notice of resignation from position as Director of Communications',
    sampleKeyDetails: '- Effective final date of service: October 15, 2026.\n- Deep appreciation for mentorship, camaraderie, and organizational growth over past 4 years.\n- Commitment to complete comprehensive handover documentation and assist in training successor.',
  },
];

export const TONE_GUIDES: Record<
  ToneOption,
  { label: string; badge: string; description: string; bestFor: string }
> = {
  'Executive & Authoritative': {
    label: 'Executive & Authoritative',
    badge: 'Executive',
    description: 'Decisive, confident, and high-stature prose. Eliminates passive hedges and commands institutional respect.',
    bestFor: 'Board correspondence, C-level applications, formal proposals, high-stakes mandates.',
  },
  'Warmly Professional': {
    label: 'Warmly Professional',
    badge: 'Balanced',
    description: 'Courteous, collaborative, and approachable while maintaining strict business decorum and respectful bounds.',
    bestFor: 'Client communications, partner check-ins, job cover letters, team transitions.',
  },
  'Deferential & Respectful': {
    label: 'Deferential & Respectful',
    badge: 'Deferential',
    description: 'Reverent and humble syntax honoring senior rank, academic prestige, or judicial seniority.',
    bestFor: 'Tenured professors, grant committees, executive sponsors, judicial petitions.',
  },
  'Direct & Concise': {
    label: 'Direct & Concise',
    badge: 'Concise',
    description: 'High-density, action-first phrasing. Respects executive time with immediate clarity and crisp sentences.',
    bestFor: 'Formal executive emails, time-sensitive inquiries, urgent approvals, busy leaders.',
  },
  'Persuasive & Compelling': {
    label: 'Persuasive & Compelling',
    badge: 'Persuasive',
    description: 'Builds an unassailable thesis using structured logic, evidential backing, and value-focused outcomes.',
    bestFor: 'Salary negotiation, competitive job applications, funding pitches, contract amendments.',
  },
  'Diplomatic & Firm': {
    label: 'Diplomatic & Firm',
    badge: 'Diplomatic',
    description: 'Maintains absolute civility and poise while asserting firm boundaries, deadlines, or resolution mandates.',
    bestFor: 'Formal disputes, contract breach notices, administrative appeals, vendor escalations.',
  },
};

export const LENGTH_GUIDES: Record<
  LengthOption,
  { label: string; wordCount: string; paragraphs: string; description: string }
> = {
  Concise: {
    label: 'Concise',
    wordCount: '150–220 words',
    paragraphs: '1–2 paragraphs',
    description: 'Lean, distilled prose ideal for emails and fast executive review.',
  },
  Standard: {
    label: 'Standard',
    wordCount: '300–420 words',
    paragraphs: '3–4 paragraphs',
    description: 'Traditional standard formal letter. Comprehensive opening, evidence body, and distinct call to action.',
  },
  Comprehensive: {
    label: 'Comprehensive',
    wordCount: '500–650 words',
    paragraphs: '4–5 paragraphs',
    description: 'In-depth multi-clause presentation. Ideal for complex petitions, tenure reviews, and detailed grant letters.',
  },
};

export const COMPLEXITY_GUIDES: Record<
  ComplexityOption,
  { label: string; style: string; description: string }
> = {
  'Clear & Accessible': {
    label: 'Clear & Accessible',
    style: 'Plain English, direct syntax',
    description: 'Eliminates archaic corporate legalese. Prioritizes transparent clarity, active verbs, and readability.',
  },
  'Professional & Polished': {
    label: 'Professional & Polished',
    style: 'Standard executive register',
    description: 'Balanced, dignified business English with articulate phrasing and measured cadence.',
  },
  'Sophisticated & Academic': {
    label: 'Sophisticated & Academic',
    style: 'Elevated vocabulary & syntactic depth',
    description: 'Rich lexical depth, formal classical phrasing, and nuanced academic/legal syntax.',
  },
};

export const INITIAL_SAMPLE_LETTER: GeneratedLetter = {
  subject: '',
  salutation: '',
  opening: '',
  bodyParagraphs: [''],
  callToAction: '',
  signOff: 'Sincerely,',
  senderBlock: '',
  executiveSummary: 'Empty draft pad. Start writing your letter or choose a sentence starter to guide your thoughts.',
};
