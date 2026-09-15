import { useState } from 'react';
import {
  LETTER_ANATOMY_STEPS,
  SENTENCE_STARTERS,
  SentenceStarter,
} from '../data/structureSuggestions';
import {
  BookOpen,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Plus,
  Info,
  Check,
  Compass,
  FileText,
} from 'lucide-react';

interface StructureGuideProps {
  onInsertSnippet: (snippet: string, section: string) => void;
  wordsWritten: number;
  minWordsRequired: number;
}

export function StructureGuide({
  onInsertSnippet,
  wordsWritten,
  minWordsRequired,
}: StructureGuideProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'starters' | 'anatomy'>('starters');
  const [selectedSection, setSelectedSection] = useState<string>('opening');
  const [lastInsertedId, setLastInsertedId] = useState<string | null>(null);

  const handleInsert = (starter: SentenceStarter) => {
    onInsertSnippet(starter.snippet, starter.section);
    setLastInsertedId(starter.id);
    setTimeout(() => setLastInsertedId(null), 2200);
  };

  const filteredStarters = SENTENCE_STARTERS.filter((s) => s.section === selectedSection);

  const isUnlocked = wordsWritten >= minWordsRequired;

  return (
    <div className="bg-white border border-neutral-300/80 rounded-xl shadow-xs overflow-hidden transition-all duration-150">
      {/* Header bar with toggle */}
      <div className="bg-neutral-50 px-4 py-3 border-b border-neutral-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-amber-100 flex items-center justify-center text-amber-900">
            <Compass className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-neutral-900 font-serif-formal tracking-wide">
              Structure & Sentence Suggestions
            </h4>
            <p className="text-[11px] text-neutral-500">
              Guidance & starter clauses to help you write your initial draft
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Unlock Status Pill */}
          <div
            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 ${
              isUnlocked
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                : 'bg-amber-50 text-amber-800 border border-amber-300'
            }`}
          >
            {isUnlocked ? (
              <>
                <Check className="w-3 h-3 text-emerald-600" />
                <span>Assistant Unlocked ({wordsWritten} words)</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>
                  {wordsWritten}/{minWordsRequired} words to unlock AI Polish
                </span>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/50 transition-colors"
            title={isOpen ? 'Collapse Suggestions' : 'Expand Suggestions'}
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="p-4 space-y-3.5">
          {/* Tab Selection */}
          <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveTab('starters')}
                className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  activeTab === 'starters'
                    ? 'bg-amber-800 text-white shadow-2xs'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span>Potential Sentence Structures</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('anatomy')}
                className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  activeTab === 'anatomy'
                    ? 'bg-amber-800 text-white shadow-2xs'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                }`}
              >
                <BookOpen className="w-3 h-3" />
                <span>Letter Anatomy & Layout</span>
              </button>
            </div>

            <div className="text-[11px] text-neutral-500 hidden sm:flex items-center gap-1">
              <Info className="w-3 h-3 text-neutral-400" />
              <span>Click any starter to insert into your draft</span>
            </div>
          </div>

          {activeTab === 'starters' && (
            <div className="space-y-3">
              {/* Category Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'opening', label: '1. Hook & Purpose' },
                  { id: 'body', label: '2. Evidence & Arguments' },
                  { id: 'callToAction', label: '3. Call to Action' },
                  { id: 'signOff', label: '4. Sign-offs' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedSection(cat.id)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                      selectedSection === cat.id
                        ? 'bg-amber-100 text-amber-900 border border-amber-300 font-semibold'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200/70 border border-transparent'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Starter Snippets List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
                {filteredStarters.map((starter) => {
                  const wasJustInserted = lastInsertedId === starter.id;
                  return (
                    <div
                      key={starter.id}
                      className="p-3 rounded-lg border border-neutral-200 bg-neutral-50/50 hover:bg-white hover:border-amber-400 transition-all flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-xs font-bold text-neutral-800">
                            {starter.label}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100/70 text-amber-800 font-medium shrink-0">
                            {starter.tone}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-600 font-serif-formal leading-relaxed italic line-clamp-3">
                          "{starter.snippet}"
                        </p>
                      </div>

                      <div className="mt-2 pt-2 border-t border-neutral-200/60 flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => handleInsert(starter)}
                          className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 transition-all ${
                            wasJustInserted
                              ? 'bg-emerald-700 text-white'
                              : 'bg-white hover:bg-amber-800 hover:text-white text-neutral-700 border border-neutral-300 shadow-2xs'
                          }`}
                        >
                          {wasJustInserted ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span>Inserted!</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3 h-3" />
                              <span>Insert into Draft</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'anatomy' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
              {LETTER_ANATOMY_STEPS.map((step) => (
                <div
                  key={step.id}
                  className="p-3 rounded-lg border border-neutral-200 bg-white hover:border-amber-300 transition-colors space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                      STEP {step.number}
                    </span>
                    <span className="text-xs font-bold text-neutral-900">{step.name}</span>
                  </div>
                  <p className="text-xs text-neutral-700 font-medium">{step.summary}</p>
                  <p className="text-[11px] text-neutral-500 leading-snug">{step.guidance}</p>
                  <div className="pt-1.5 border-t border-neutral-100">
                    <span className="text-[10px] text-neutral-400 font-mono block mb-0.5">
                      Sample:
                    </span>
                    <span className="text-[11px] text-neutral-700 font-serif-formal italic block leading-tight">
                      "{step.example}"
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Assistant Philosophy Note */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg p-2.5 flex items-start gap-2 text-[11px] text-amber-900">
            <Sparkles className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Collaborative Drafting Philosophy:</span> You write your
              authentic core thoughts first. Once you write at least {minWordsRequired} words, the
              Assistant is unlocked to polish phrasing, refine paragraph transitions, and align the tone
              without manufacturing text from scratch.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
