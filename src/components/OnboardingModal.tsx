import { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  User,
  Compass,
  Sliders,
  X,
  Building,
  Mail,
  PenTool,
} from 'lucide-react';
import { OnboardingData, SenderProfile, ToneOption, LetterheadStyle } from '../types';

interface OnboardingModalProps {
  isOpen: boolean;
  initialData: OnboardingData;
  onComplete: (data: OnboardingData) => void;
  onDismiss: () => void;
}

export function OnboardingModal({
  isOpen,
  initialData,
  onComplete,
  onDismiss,
}: OnboardingModalProps) {
  const [step, setStep] = useState<number>(1);
  const [sender, setSender] = useState<SenderProfile>(initialData.sender);
  const [primaryInterests, setPrimaryInterests] = useState<string[]>(
    initialData.primaryInterests || [
      'Cover Letters & Career Appointments',
      'Formal Recommendation Requests',
    ]
  );
  const [defaultTone, setDefaultTone] = useState<ToneOption>(
    initialData.defaultTone || 'Warmly Professional'
  );
  const [defaultLetterhead, setDefaultLetterhead] = useState<LetterheadStyle>(
    initialData.defaultLetterhead || 'classic'
  );

  if (!isOpen) return null;

  const letterCategories = [
    {
      id: 'cover-letters',
      label: 'Cover Letters & Career Appointments',
      desc: 'C-suite, senior director, academic faculty, and executive applications',
    },
    {
      id: 'recommendations',
      label: 'Formal Recommendation Requests',
      desc: 'Requests to professors, mentors, former executives, and thesis advisors',
    },
    {
      id: 'executive-emails',
      label: 'Executive Formal Emails & Client Outreach',
      desc: 'High-stakes B2B proposals, partner alignment, and boardroom communications',
    },
    {
      id: 'formal-inquiries',
      label: 'Official Inquiries, Petitions & Reviews',
      desc: 'Administrative disputes, civic petitions, grant queries, salary reviews',
    },
  ];

  const tones: { id: ToneOption; title: string; desc: string }[] = [
    {
      id: 'Warmly Professional',
      title: 'Warmly Professional',
      desc: 'Courteous, dignified, and collaborative. Ideal for standard business decorum.',
    },
    {
      id: 'Executive & Authoritative',
      title: 'Executive & Authoritative',
      desc: 'High-stature, decisive, and confident. Eliminates passive language.',
    },
    {
      id: 'Deferential & Respectful',
      title: 'Deferential & Respectful',
      desc: 'Reverent syntax honoring senior rank, academic prestige, or judicial seniority.',
    },
    {
      id: 'Direct & Concise',
      title: 'Direct & Concise',
      desc: 'Crisp, high-density phrasing respecting executive time constraints.',
    },
  ];

  const letterheads: { id: LetterheadStyle; title: string; desc: string }[] = [
    {
      id: 'classic',
      title: 'Classic Executive',
      desc: 'Traditional left-aligned header with subtle rule and complete credentials.',
    },
    {
      id: 'modern',
      title: 'Modern Minimalist',
      desc: 'Understated inline single-line subhead with high negative space.',
    },
    {
      id: 'academic',
      title: 'Academic Traditional',
      desc: 'Centered institutional titling with formal double divider bars.',
    },
    {
      id: 'corporate',
      title: 'Clean Corporate',
      desc: 'Vertical accent band with structured company and sender hierarchy.',
    },
  ];

  const toggleInterest = (label: string) => {
    if (primaryInterests.includes(label)) {
      setPrimaryInterests(primaryInterests.filter((item) => item !== label));
    } else {
      setPrimaryInterests([...primaryInterests, label]);
    }
  };

  const handleFinish = () => {
    onComplete({
      completed: true,
      sender,
      primaryInterests,
      defaultTone,
      defaultLetterhead,
    });
  };

  return (
    <div
      id="onboarding-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
    >
      <div
        id="onboarding-dialog"
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden"
      >
        {/* Progress Bar & Header */}
        <div className="border-b border-neutral-200 bg-neutral-50/70 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-800 text-white flex items-center justify-center font-serif-formal text-sm font-bold shadow-xs">
                LC
              </div>
              <span className="font-semibold text-neutral-900 text-sm tracking-tight">
                Welcome to LetterCraft
              </span>
            </div>
            <button
              id="skip-onboarding-btn"
              onClick={onDismiss}
              className="text-xs text-neutral-400 hover:text-neutral-700 transition-colors"
            >
              Skip for now
            </button>
          </div>

          <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
            <span>
              Step {step} of 3:{' '}
              {step === 1
                ? 'Your Sender Identity'
                : step === 2
                ? 'Your Letter Writing Needs'
                : 'Default Tone & Style'}
            </span>
            <span className="font-medium text-amber-800">{Math.round((step / 3) * 100)}%</span>
          </div>

          <div className="w-full bg-neutral-200 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-amber-800 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-semibold text-neutral-900">
                  Who will be sending these formal letters?
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  We will automatically format your name, title, and contact details into the formal letterhead and sign-off block.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    id="onboarding-sender-name"
                    type="text"
                    value={sender.name}
                    onChange={(e) => setSender({ ...sender, name: e.target.value })}
                    placeholder="e.g. Eleanor Vance"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-amber-700/30 focus:border-amber-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Professional Title
                  </label>
                  <input
                    id="onboarding-sender-title"
                    type="text"
                    value={sender.title}
                    onChange={(e) => setSender({ ...sender, title: e.target.value })}
                    placeholder="e.g. Senior Research Fellow / Director"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-amber-700/30 focus:border-amber-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Organization / Affiliation
                  </label>
                  <input
                    id="onboarding-sender-org"
                    type="text"
                    value={sender.organization}
                    onChange={(e) => setSender({ ...sender, organization: e.target.value })}
                    placeholder="e.g. Stanford University / Acme Corp"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-amber-700/30 focus:border-amber-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Official Email
                  </label>
                  <input
                    id="onboarding-sender-email"
                    type="email"
                    value={sender.email}
                    onChange={(e) => setSender({ ...sender, email: e.target.value })}
                    placeholder="e.g. e.vance@institution.org"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-amber-700/30 focus:border-amber-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    id="onboarding-sender-phone"
                    type="text"
                    value={sender.phone}
                    onChange={(e) => setSender({ ...sender, phone: e.target.value })}
                    placeholder="e.g. +1 (415) 555-0199"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-amber-700/30 focus:border-amber-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Preferred Formal Sign-Off
                  </label>
                  <select
                    id="onboarding-sender-signoff"
                    value={sender.signOff}
                    onChange={(e) => setSender({ ...sender, signOff: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-amber-700/30 focus:border-amber-700 bg-white"
                  >
                    <option value="Sincerely,">Sincerely,</option>
                    <option value="Respectfully yours,">Respectfully yours,</option>
                    <option value="Warm regards,">Warm regards,</option>
                    <option value="With highest regards,">With highest regards,</option>
                    <option value="Faithfully yours,">Faithfully yours,</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-semibold text-neutral-900">
                  What types of formal letters do you write most often?
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Select all that apply. We will customize your quick-access templates and prompt defaults accordingly.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {letterCategories.map((cat) => {
                  const isSelected = primaryInterests.includes(cat.label);
                  return (
                    <div
                      key={cat.id}
                      onClick={() => toggleInterest(cat.label)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start justify-between ${
                        isSelected
                          ? 'border-amber-700 bg-amber-50/70 shadow-xs'
                          : 'border-neutral-200 hover:border-neutral-300 bg-white'
                      }`}
                    >
                      <div className="pr-4">
                        <div className="text-xs font-semibold text-neutral-900 flex items-center gap-2">
                          {cat.label}
                        </div>
                        <div className="text-[11px] text-neutral-500 mt-0.5">{cat.desc}</div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center border mt-0.5 transition-colors ${
                          isSelected
                            ? 'bg-amber-800 border-amber-800 text-white'
                            : 'border-neutral-300 bg-white'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-semibold text-neutral-900">
                  Choose your default tone & presentation style
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  You can always adjust these sliders on individual letters for each specific recipient.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-2">
                  Default Communication Tone
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {tones.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setDefaultTone(t.id)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        defaultTone === t.id
                          ? 'border-amber-700 bg-amber-50/70 text-neutral-900 ring-1 ring-amber-700'
                          : 'border-neutral-200 hover:border-neutral-300 text-neutral-700'
                      }`}
                    >
                      <div className="text-xs font-semibold">{t.title}</div>
                      <div className="text-[11px] text-neutral-500 mt-0.5">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-2">
                  Default Letterhead Layout
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {letterheads.map((lh) => (
                    <button
                      key={lh.id}
                      type="button"
                      onClick={() => setDefaultLetterhead(lh.id)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        defaultLetterhead === lh.id
                          ? 'border-amber-700 bg-amber-50/70 text-neutral-900 ring-1 ring-amber-700'
                          : 'border-neutral-200 hover:border-neutral-300 text-neutral-700'
                      }`}
                    >
                      <div className="text-xs font-semibold">{lh.title}</div>
                      <div className="text-[11px] text-neutral-500 mt-0.5">{lh.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Controls */}
        <div className="border-t border-neutral-200 bg-neutral-50/70 px-6 py-4 flex items-center justify-between">
          {step > 1 ? (
            <button
              id="onboarding-prev-btn"
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 rounded-lg text-xs font-medium text-neutral-700 hover:bg-neutral-200/70 transition-colors"
            >
              Previous
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-3">
            {step < 3 ? (
              <button
                id="onboarding-next-btn"
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-5 py-2 rounded-lg text-xs font-medium bg-amber-800 hover:bg-amber-900 text-white flex items-center gap-1.5 transition-colors shadow-xs"
              >
                Continue
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                id="onboarding-finish-btn"
                type="button"
                onClick={handleFinish}
                className="px-6 py-2 rounded-lg text-xs font-medium bg-amber-800 hover:bg-amber-900 text-white flex items-center gap-1.5 transition-colors shadow-xs"
              >
                Finish Setup & Start Writing
                <Sparkles className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
