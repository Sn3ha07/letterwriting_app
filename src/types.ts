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

