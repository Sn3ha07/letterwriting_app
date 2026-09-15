export type LetterType =
  | 'Cover Letter'
  | 'Formal Email'
  | 'Recommendation Request'
  | 'Formal Inquiry / Petition'
  | 'Salary & Promotion Review'
  | 'Executive Outreach'
  | 'Formal Resignation'
  | 'Custom Formal Letter';

export type ToneOption =
  | 'Executive & Authoritative'
  | 'Warmly Professional'
  | 'Deferential & Respectful'
  | 'Direct & Concise'
  | 'Persuasive & Compelling'
  | 'Diplomatic & Firm';

export type LengthOption = 'Concise' | 'Standard' | 'Comprehensive';

export type ComplexityOption =
  | 'Clear & Accessible'
  | 'Professional & Polished'
  | 'Sophisticated & Academic';

export type LetterheadStyle = 'classic' | 'modern' | 'academic' | 'corporate' | 'minimal';

export interface Recipient {
  id?: string;
  name: string;
  title: string;
  organization: string;
  email: string;
  address: string;
  salutation: string;
  relationship: string;
}

export interface SenderProfile {
  name: string;
  title: string;
  organization: string;
  email: string;
  phone: string;
  address: string;
  signOff: string;
}

export interface Contact {
  id: string;
  name: string;
  title: string;
  organization: string;
  email: string;
  phone?: string;
  address: string;
  salutation: string;
  relationship: string;
  notes?: string;
  createdAt: string;
}

export interface LetterTemplate {
  id: string;
  title: string;
  category: 'cover-letter' | 'recommendation' | 'inquiry' | 'formal-email' | 'corporate' | 'custom';
  description: string;
  letterType: LetterType;
  defaultTone: ToneOption;
  defaultLength: LengthOption;
  defaultComplexity: ComplexityOption;
  samplePurpose: string;
  sampleKeyDetails: string;
  isCustom?: boolean;
  createdAt?: string;
}

export interface GeneratedLetter {
  subject: string;
  salutation: string;
  opening: string;
  bodyParagraphs: string[];
  callToAction: string;
  signOff: string;
  senderBlock: string;
  executiveSummary?: string;
}

export interface LetterFormatting {
  fontFamily: 'serif' | 'sans' | 'mono';
  fontSize: 'compact' | 'standard' | 'spacious';
  letterheadStyle: LetterheadStyle;
  showDate: boolean;
  showSenderHeader: boolean;
  showRecipientHeader: boolean;
  date: string;
}

export interface OnboardingData {
  completed: boolean;
  sender: SenderProfile;
  primaryInterests: string[];
  defaultTone: ToneOption;
  defaultLetterhead: LetterheadStyle;
}

export type EditTypeOption =
  | 'full_edit'
  | 'partial_edit'
  | 'tone_shift'
  | 'tighten'
  | 'proofread'
  | 'custom';

export type SectionTarget = 'all' | 'opening' | 'body' | 'callToAction' | 'subject';

export interface AssistantEditRequest {
  letter: GeneratedLetter;
  rawText?: string;
  editType: EditTypeOption;
  sectionTarget?: SectionTarget;
  targetTone?: ToneOption;
  targetComplexity?: ComplexityOption;
  customInstruction?: string;
  recipient?: Recipient;
  sender?: SenderProfile;
  letterType?: LetterType;
}

export interface AssistantEditResponse extends GeneratedLetter {
  editorialNotes?: string[];
  diffSummary?: string;
}

export type AgentQuestionCategory =
  | 'evidence'
  | 'clarity'
  | 'stakes'
  | 'tone'
  | 'callToAction'
  | 'recipient'
  | 'structure';

export interface AgentQuestion {
  id: string;
  category: AgentQuestionCategory;
  question: string;
  contextExcerpt?: string; // The part of user's writing being questioned
  whyItMatters: string; // Explains why this is weak or needs clarification
  suggestedAnswers?: string[]; // Quick 1-click answer options
  userAnswer?: string;
  status?: 'unanswered' | 'answered' | 'dismissed';
}

export interface AgentCritique {
  id: string;
  type: 'weak_claim' | 'vague_metric' | 'passive_tone' | 'missing_context' | 'weak_cta';
  excerpt: string;
  critique: string;
  recommendation: string;
}

export interface FormulatedSentence {
  id?: string;
  section: 'subject' | 'opening' | 'body' | 'callToAction' | 'signOff';
  sentence: string;
  explanation?: string;
}

export interface AgentMessage {
  id: string;
  role: 'agent' | 'user';
  content: string;
  timestamp: string;
  questions?: AgentQuestion[];
  critiques?: AgentCritique[];
  proposedLetter?: Partial<GeneratedLetter>;
  formulatedSentences?: FormulatedSentence[];
  editorialNotes?: string[];
  actionType?: 'interview' | 'critique' | 'interrogate' | 'chat' | 'revision' | 'apply_answers';
}



