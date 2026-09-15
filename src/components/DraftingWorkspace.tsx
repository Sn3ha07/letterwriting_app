import { useState, useMemo } from 'react';
import {
  GeneratedLetter,
  LetterFormatting,
  Recipient,
  SenderProfile,
  EditTypeOption,
  SectionTarget,
  ToneOption,
  ComplexityOption,
  LetterType,
  LetterheadStyle,
} from '../types';
import { LetterCanvas } from './LetterCanvas';
import { StructureGuide } from './StructureGuide';
import { exportLetterToPDF, printLetterNative } from '../utils/pdfExport';
import {
  downloadLetterTextFile,
  copyLetterToClipboard,
  createMailtoLink,
} from '../utils/textExport';
import {
  Wand2,
  Sparkles,
  RefreshCw,
  Download,
  Printer,
  Copy,
  Mail,
  BookmarkPlus,
  Type,
  Layout,
  SlidersHorizontal,
  ChevronDown,
  Check,
  RotateCcw,
  FileText,
  AlertCircle,
  Eye,
  Edit3,
  AlignLeft,
  Scissors,
  CheckCheck,
  Send,
  X,
  Compass,
} from 'lucide-react';

interface DraftingWorkspaceProps {
  currentLetter: GeneratedLetter;
  originalDraft: GeneratedLetter | null;
  formatting: LetterFormatting;
  sender: SenderProfile;
  recipient: Recipient;
  targetTone: ToneOption;
  targetComplexity: ComplexityOption;
  onUpdateLetter: (updated: GeneratedLetter) => void;
  onUpdateFormatting: (formatting: LetterFormatting) => void;
  onSaveAsTemplate: (letter: GeneratedLetter, type: LetterType, tone: ToneOption) => void;
  onSetOriginalDraft: (draft: GeneratedLetter | null) => void;
  onSelectTone: (tone: ToneOption) => void;
  onSelectComplexity: (complexity: ComplexityOption) => void;
}

export function DraftingWorkspace({
  currentLetter,
  originalDraft,
  formatting,
  sender,
  recipient,
  targetTone,
  targetComplexity,
  onUpdateLetter,
  onUpdateFormatting,
  onSaveAsTemplate,
  onSetOriginalDraft,
  onSelectTone,
  onSelectComplexity,
}: DraftingWorkspaceProps) {
  // Editing Options State
  const [editType, setEditType] = useState<EditTypeOption>('full_edit');
  const [sectionTarget, setSectionTarget] = useState<SectionTarget>('all');
  const [customInstruction, setCustomInstruction] = useState('');

  // Dropdown states
  const [isEditMenuOpen, setIsEditMenuOpen] = useState(false);
  const [isFormatMenuOpen, setIsFormatMenuOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  // View state: 'canvas' (paper layout) or 'freeform' (raw text drafting) - default to freeform draft pad
  const [viewMode, setViewMode] = useState<'canvas' | 'freeform'>('freeform');
  const [showStructureGuide, setShowStructureGuide] = useState(true);

  const [rawDraftText, setRawDraftText] = useState(() => {
    return [
      currentLetter.subject ? `Subject: ${currentLetter.subject}` : '',
      currentLetter.salutation,
      currentLetter.opening,
      ...(currentLetter.bodyParagraphs || []),
      currentLetter.callToAction,
      currentLetter.signOff,
      currentLetter.senderBlock,
    ]
      .filter(Boolean)
      .join('\n\n');
  });

  // Minimum user-written words required before generation/editing is unlocked
  const MIN_WORDS_REQUIRED = 8;

  const wordsWritten = useMemo(() => {
    if (viewMode === 'freeform') {
      return rawDraftText.trim().split(/\s+/).filter(Boolean).length;
    }
    const canvasContent = [
      currentLetter.subject,
      currentLetter.opening,
      ...(currentLetter.bodyParagraphs || []),
      currentLetter.callToAction,
    ]
      .filter(Boolean)
      .join(' ');
    return canvasContent.trim().split(/\s+/).filter(Boolean).length;
  }, [viewMode, rawDraftText, currentLetter]);

  const hasEnoughWriting = wordsWritten >= MIN_WORDS_REQUIRED;

  // Insert sentence starter or snippet from guide
  const handleInsertSnippet = (snippet: string, section: string) => {
    if (viewMode === 'freeform') {
      setRawDraftText((prev) => {
        const trimmed = prev.trim();
        if (!trimmed) return snippet;
        return `${trimmed}\n\n${snippet}`;
      });
    } else {
      if (section === 'opening') {
        onUpdateLetter({
          ...currentLetter,
          opening: currentLetter.opening ? `${currentLetter.opening} ${snippet}` : snippet,
        });
      } else if (section === 'body') {
        const paras = [...(currentLetter.bodyParagraphs || [])].filter(Boolean);
        paras.push(snippet);
        onUpdateLetter({
          ...currentLetter,
          bodyParagraphs: paras.length > 0 ? paras : [snippet],
        });
      } else if (section === 'callToAction') {
        onUpdateLetter({
          ...currentLetter,
          callToAction: currentLetter.callToAction ? `${currentLetter.callToAction} ${snippet}` : snippet,
        });
      } else if (section === 'signOff') {
        onUpdateLetter({ ...currentLetter, signOff: snippet });
      } else if (section === 'subject') {
        onUpdateLetter({ ...currentLetter, subject: snippet });
      }
    }
  };

  // Assistant State
  const [isAssistantEditing, setIsAssistantEditing] = useState(false);
  const [editorialNotes, setEditorialNotes] = useState<string[] | null>(null);
  const [editorialSummary, setEditorialSummary] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showingDiffView, setShowingDiffView] = useState<'current' | 'original'>('current');
  const [copySuccess, setCopySuccess] = useState(false);
  const [savedTemplateSuccess, setSavedTemplateSuccess] = useState(false);

  // Call assistant to edit the user's draft
  const handleAssistantEdit = async (
    overrideType?: EditTypeOption,
    overrideSection?: SectionTarget,
    overrideCustom?: string
  ) => {
    // Guard: User must write part of the letter before AI generation/editing
    if (!hasEnoughWriting) {
      setErrorMessage(
        `Please write a part of your letter first (at least ${MIN_WORDS_REQUIRED} words). The Assistant's role is to refine and polish your authentic draft, not generate the entire letter from scratch.`
      );
      return;
    }

    const activeType = overrideType || editType;
    const activeSection = overrideSection || sectionTarget;
    const activeCustom = overrideCustom || customInstruction;

    setIsAssistantEditing(true);
    setErrorMessage(null);
    setIsEditMenuOpen(false);

    // Save snapshot of user's current draft for comparison/undo if not already saved
    if (!originalDraft) {
      onSetOriginalDraft(JSON.parse(JSON.stringify(currentLetter)));
    }

    try {
      const response = await fetch('/api/assistant-edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          letter: currentLetter,
          rawText: viewMode === 'freeform' ? rawDraftText : undefined,
          editType: activeType,
          sectionTarget: activeSection,
          targetTone,
          targetComplexity,
          customInstruction: activeCustom,
          recipient,
          sender,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Assistant edit failed (${response.status})`);
      }

      const data = await response.json();
      onUpdateLetter({
        subject: data.subject || currentLetter.subject,
        salutation: data.salutation || currentLetter.salutation,
        opening: data.opening || currentLetter.opening,
        bodyParagraphs: data.bodyParagraphs || currentLetter.bodyParagraphs,
        callToAction: data.callToAction || currentLetter.callToAction,
        signOff: data.signOff || currentLetter.signOff,
        senderBlock: data.senderBlock || currentLetter.senderBlock,
        executiveSummary: data.executiveSummary,
      });

      if (data.editorialNotes && data.editorialNotes.length > 0) {
        setEditorialNotes(data.editorialNotes);
      }
      if (data.executiveSummary) {
        setEditorialSummary(data.executiveSummary);
      }

      // Sync raw draft text
      const newRaw = [
        data.subject ? `Subject: ${data.subject}` : '',
        data.salutation,
        data.opening,
        ...(data.bodyParagraphs || []),
        data.callToAction,
        data.signOff,
        data.senderBlock,
      ]
        .filter(Boolean)
        .join('\n\n');
      setRawDraftText(newRaw);

      setShowingDiffView('current');
      setViewMode('canvas');
    } catch (err: any) {
      console.error('Assistant error:', err);
      setErrorMessage(err.message || 'Assistant encountered an error editing your draft.');
    } finally {
      setIsAssistantEditing(false);
    }
  };

  // Trigger partial edit on specific section from canvas
  const handleTriggerSectionEdit = (section: SectionTarget) => {
    setSectionTarget(section);
    handleAssistantEdit('partial_edit', section);
  };

  // Undo / Revert to original user draft
  const handleRevertToOriginal = () => {
    if (originalDraft) {
      onUpdateLetter(JSON.parse(JSON.stringify(originalDraft)));
      onSetOriginalDraft(null);
      setEditorialNotes(null);
      setEditorialSummary(null);
    }
  };

  const handleAcceptEdits = () => {
    onSetOriginalDraft(null);
    setEditorialNotes(null);
    setEditorialSummary(null);
  };

  // Harmonized view mode switching ensuring user draft is preserved across both modes
  const handleToggleViewMode = (mode: 'canvas' | 'freeform') => {
    if (mode === 'canvas' && viewMode === 'freeform') {
      if (
        rawDraftText.trim() &&
        !currentLetter.opening &&
        (!currentLetter.bodyParagraphs || currentLetter.bodyParagraphs.join('').trim() === '')
      ) {
        const sections = rawDraftText.trim().split(/\n\n+/).filter(Boolean);
        if (sections.length > 0) {
          onUpdateLetter({
            ...currentLetter,
            opening: sections[0] || '',
            bodyParagraphs: sections.slice(1).length > 0 ? sections.slice(1) : [''],
          });
        }
      }
    } else if (mode === 'freeform' && viewMode === 'canvas') {
      if (!rawDraftText.trim()) {
        const constructed = [
          currentLetter.subject ? `Subject: ${currentLetter.subject}` : '',
          currentLetter.salutation,
          currentLetter.opening,
          ...(currentLetter.bodyParagraphs || []),
          currentLetter.callToAction,
          currentLetter.signOff,
          currentLetter.senderBlock,
        ]
          .filter(Boolean)
          .join('\n\n');
        setRawDraftText(constructed);
      }
    }
    setViewMode(mode);
  };

  // Export handlers
  const handleExportPDF = () => {
    exportLetterToPDF(currentLetter, formatting, sender, recipient);
    setIsExportMenuOpen(false);
  };

  const handleCopy = async () => {
    const ok = await copyLetterToClipboard(currentLetter, formatting, sender, recipient);
    if (ok) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      setIsExportMenuOpen(false);
    }
  };

  const handleDownloadText = () => {
    downloadLetterTextFile(currentLetter, formatting, sender, recipient);
    setIsExportMenuOpen(false);
  };

  const handleSaveAsTemplate = () => {
    onSaveAsTemplate(currentLetter, 'Custom Formal Letter', targetTone);
    setSavedTemplateSuccess(true);
    setTimeout(() => setSavedTemplateSuccess(false), 2000);
    setIsExportMenuOpen(false);
  };

  // Helper labels for edit modes
  const getEditTypeLabel = (type: EditTypeOption) => {
    switch (type) {
      case 'full_edit':
        return 'Full Polish & Restructure';
      case 'partial_edit':
        return `Partial: ${sectionTarget.toUpperCase()}`;
      case 'tone_shift':
        return `Tone: ${targetTone}`;
      case 'tighten':
        return 'Tighten & Cut Fluff';
      case 'proofread':
        return 'Light Proofread & Grammar';
      case 'custom':
        return 'Custom Direction';
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-neutral-100 overflow-hidden relative">
      {/* 1. CLUTTER-FREE TOP TOOLBAR: Assistant Edit Dropdown, Formatting Dropdown, Export Dropdown */}
      <div className="bg-white/95 backdrop-blur-xs border-b border-neutral-200/90 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 no-print z-20">
        {/* Left: View Mode Toggle, Suggestions Toggle & Active Edit Option Dropdown */}
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg border border-neutral-200/80">
            <button
              type="button"
              onClick={() => handleToggleViewMode('canvas')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                viewMode === 'canvas'
                  ? 'bg-white text-neutral-900 shadow-2xs font-semibold'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
              title="Formatted Paper Canvas"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Letter Sheet</span>
            </button>
            <button
              type="button"
              onClick={() => handleToggleViewMode('freeform')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                viewMode === 'freeform'
                  ? 'bg-white text-neutral-900 shadow-2xs font-semibold'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
              title="Plaintext Freeform Drafting Pad"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Draft Pad</span>
            </button>
          </div>

          {/* Structure & Suggestions Guide Toggle */}
          <button
            id="toggle-structure-guide-btn"
            type="button"
            onClick={() => setShowStructureGuide(!showStructureGuide)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
              showStructureGuide
                ? 'bg-amber-100 text-amber-900 border-amber-300 font-semibold'
                : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
            }`}
            title="Toggle structure checklist & sentence starters"
          >
            <Compass className="w-3.5 h-3.5 text-amber-800" />
            <span className="hidden md:inline">Suggestions & Starters</span>
          </button>

          <div className="h-4 w-px bg-neutral-200 mx-1 hidden sm:block" />

          {/* Assistant Edit Option Dropdown */}
          <div className="relative">
            <button
              id="assistant-edit-dropdown-btn"
              type="button"
              onClick={() => {
                setIsEditMenuOpen(!isEditMenuOpen);
                setIsFormatMenuOpen(false);
                setIsExportMenuOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-1.5 bg-neutral-50 hover:bg-neutral-100 border border-neutral-300 rounded-lg text-xs font-medium text-neutral-800 transition-colors shadow-2xs"
            >
              <Wand2 className="w-3.5 h-3.5 text-amber-800" />
              <span>Edit Mode:</span>
              <span className="font-semibold text-neutral-950">{getEditTypeLabel(editType)}</span>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
            </button>

            {/* Dropdown Menu */}
            {isEditMenuOpen && (
              <div
                id="assistant-edit-menu"
                className="absolute left-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-neutral-200 p-3 text-xs z-40 space-y-2 animate-in fade-in zoom-in-95"
              >
                <div className="font-semibold text-neutral-900 pb-1.5 border-b border-neutral-100 flex items-center justify-between">
                  <span>Assistant Editing Modes</span>
                  <span className="text-[10px] text-neutral-400 font-normal">
                    Choose how the assistant edits your draft
                  </span>
                </div>

                {/* Option 1: Full Edit */}
                <button
                  type="button"
                  onClick={() => {
                    setEditType('full_edit');
                    setIsEditMenuOpen(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-start gap-2.5 ${
                    editType === 'full_edit'
                      ? 'border-amber-700 bg-amber-50/70 text-neutral-900'
                      : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold flex items-center gap-1.5">
                      Full Polish & Restructure
                      {editType === 'full_edit' && (
                        <Check className="w-3.5 h-3.5 text-amber-800" />
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      Polishes entire draft, improves narrative flow, elevates vocabulary, and perfects transitions.
                    </p>
                  </div>
                </button>

                {/* Option 2: Partial / Sectional Edit */}
                <div
                  className={`p-2.5 rounded-lg border transition-all ${
                    editType === 'partial_edit'
                      ? 'border-amber-700 bg-amber-50/70'
                      : 'border-neutral-200 bg-white'
                  }`}
                >
                  <div
                    onClick={() => setEditType('partial_edit')}
                    className="cursor-pointer font-semibold text-neutral-900 flex items-center gap-2"
                  >
                    <AlignLeft className="w-4 h-4 text-amber-800 shrink-0" />
                    <span>Partial / Sectional Edit</span>
                    {editType === 'partial_edit' && (
                      <Check className="w-3.5 h-3.5 text-amber-800" />
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-0.5 mb-2">
                    Focus assistant edits exclusively on a targeted section.
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {(['opening', 'body', 'callToAction', 'subject'] as SectionTarget[]).map((sec) => (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => {
                          setEditType('partial_edit');
                          setSectionTarget(sec);
                        }}
                        className={`px-2 py-0.5 rounded text-[10.5px] font-medium transition-colors ${
                          sectionTarget === sec && editType === 'partial_edit'
                            ? 'bg-amber-800 text-white'
                            : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                        }`}
                      >
                        {sec === 'callToAction' ? 'Closing' : sec}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Option 3: Tone Recalibration */}
                <div
                  className={`p-2.5 rounded-lg border transition-all ${
                    editType === 'tone_shift'
                      ? 'border-amber-700 bg-amber-50/70'
                      : 'border-neutral-200 bg-white'
                  }`}
                >
                  <div
                    onClick={() => setEditType('tone_shift')}
                    className="cursor-pointer font-semibold text-neutral-900 flex items-center gap-2"
                  >
                    <SlidersHorizontal className="w-4 h-4 text-amber-800 shrink-0" />
                    <span>Tone Recalibration</span>
                    {editType === 'tone_shift' && (
                      <Check className="w-3.5 h-3.5 text-amber-800" />
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-0.5 mb-2">
                    Shift register to match recipient hierarchy.
                  </p>
                  <select
                    value={targetTone}
                    onChange={(e) => {
                      setEditType('tone_shift');
                      onSelectTone(e.target.value as ToneOption);
                    }}
                    className="w-full px-2 py-1 rounded border border-neutral-300 bg-white text-neutral-800 text-[11px]"
                  >
                    <option value="Executive & Authoritative">Executive & Authoritative</option>
                    <option value="Warmly Professional">Warmly Professional</option>
                    <option value="Deferential & Respectful">Deferential & Respectful</option>
                    <option value="Direct & Concise">Direct & Concise</option>
                    <option value="Persuasive & Compelling">Persuasive & Compelling</option>
                    <option value="Diplomatic & Firm">Diplomatic & Firm</option>
                  </select>
                </div>

                {/* Option 4: Tighten & Cut Fluff */}
                <button
                  type="button"
                  onClick={() => {
                    setEditType('tighten');
                    setIsEditMenuOpen(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-start gap-2.5 ${
                    editType === 'tighten'
                      ? 'border-amber-700 bg-amber-50/70 text-neutral-900'
                      : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                  }`}
                >
                  <Scissors className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold flex items-center gap-1.5">
                      Tighten & Cut Fluff
                      {editType === 'tighten' && (
                        <Check className="w-3.5 h-3.5 text-amber-800" />
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      Trim wordiness by ~20-30% and convert passive verbs to decisive active voice.
                    </p>
                  </div>
                </button>

                {/* Option 5: Proofread & Grammar */}
                <button
                  type="button"
                  onClick={() => {
                    setEditType('proofread');
                    setIsEditMenuOpen(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-start gap-2.5 ${
                    editType === 'proofread'
                      ? 'border-amber-700 bg-amber-50/70 text-neutral-900'
                      : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                  }`}
                >
                  <CheckCheck className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold flex items-center gap-1.5">
                      Light Proofread & Grammar
                      {editType === 'proofread' && (
                        <Check className="w-3.5 h-3.5 text-amber-800" />
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      Fix typos, punctuation, and syntax without modifying your words or voice.
                    </p>
                  </div>
                </button>

                {/* Option 6: Custom Direction */}
                <div className="pt-2 border-t border-neutral-100">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={customInstruction}
                      onChange={(e) => {
                        setCustomInstruction(e.target.value);
                        setEditType('custom');
                      }}
                      placeholder="Custom instruction (e.g. emphasize deadline)..."
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-amber-700"
                    />
                    <button
                      type="button"
                      disabled={!customInstruction.trim()}
                      onClick={() => handleAssistantEdit('custom', undefined, customInstruction)}
                      className="p-1.5 bg-amber-800 text-white rounded-lg hover:bg-amber-900 disabled:opacity-40"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Primary Action Button: "Apply Edit" */}
          <button
            id="apply-assistant-edit-btn"
            type="button"
            disabled={isAssistantEditing || !hasEnoughWriting}
            onClick={() => handleAssistantEdit()}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-all ${
              !hasEnoughWriting
                ? 'bg-neutral-100 text-neutral-400 border border-neutral-200 cursor-not-allowed'
                : 'bg-amber-800 hover:bg-amber-900 text-white shadow-2xs'
            }`}
            title={
              !hasEnoughWriting
                ? `Draft at least ${MIN_WORDS_REQUIRED} words to unlock AI Assistant (${wordsWritten}/${MIN_WORDS_REQUIRED})`
                : 'Run Assistant on current draft'
            }
          >
            {isAssistantEditing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-200" />
                <span>Editing Draft...</span>
              </>
            ) : !hasEnoughWriting ? (
              <>
                <Sparkles className="w-3.5 h-3.5 text-neutral-400" />
                <span>Draft to Unlock ({wordsWritten}/{MIN_WORDS_REQUIRED})</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                <span>Apply Assistant Polish</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Formatting Menu & Export Menu */}
        <div className="flex items-center gap-2">
          {/* Format / Style Dropdown */}
          <div className="relative">
            <button
              id="format-dropdown-btn"
              type="button"
              onClick={() => {
                setIsFormatMenuOpen(!isFormatMenuOpen);
                setIsEditMenuOpen(false);
                setIsExportMenuOpen(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-neutral-300 hover:bg-neutral-50 rounded-lg text-xs text-neutral-700 transition-colors"
              title="Formatting & Typography Presets"
            >
              <Type className="w-3.5 h-3.5 text-neutral-500" />
              <span className="hidden md:inline">Formatting</span>
              <ChevronDown className="w-3 h-3 text-neutral-400" />
            </button>

            {isFormatMenuOpen && (
              <div
                id="format-menu"
                className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-neutral-200 p-3 text-xs z-40 space-y-3 animate-in fade-in"
              >
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                    Typography Family
                  </label>
                  <select
                    value={formatting.fontFamily}
                    onChange={(e) =>
                      onUpdateFormatting({
                        ...formatting,
                        fontFamily: e.target.value as 'serif' | 'sans' | 'mono',
                      })
                    }
                    className="w-full px-2 py-1 rounded border border-neutral-300 bg-white"
                  >
                    <option value="serif">EB Garamond (Executive Serif)</option>
                    <option value="sans">Plus Jakarta Sans (Modern Clean)</option>
                    <option value="mono">Monospace (Technical / Formal)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                    Font Scaling
                  </label>
                  <div className="flex bg-neutral-100 p-0.5 rounded border border-neutral-200">
                    {(['compact', 'standard', 'spacious'] as const).map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => onUpdateFormatting({ ...formatting, fontSize: sz })}
                        className={`flex-1 py-1 rounded text-[11px] capitalize font-medium ${
                          formatting.fontSize === sz
                            ? 'bg-white text-neutral-900 shadow-2xs'
                            : 'text-neutral-500'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                    Letterhead Style
                  </label>
                  <select
                    value={formatting.letterheadStyle}
                    onChange={(e) =>
                      onUpdateFormatting({
                        ...formatting,
                        letterheadStyle: e.target.value as LetterheadStyle,
                      })
                    }
                    className="w-full px-2 py-1 rounded border border-neutral-300 bg-white"
                  >
                    <option value="classic">Classic Executive</option>
                    <option value="academic">Academic Traditional</option>
                    <option value="corporate">Clean Corporate</option>
                    <option value="modern">Modern Minimalist</option>
                    <option value="minimal">Plain (No Header)</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              id="export-dropdown-btn"
              type="button"
              onClick={() => {
                setIsExportMenuOpen(!isExportMenuOpen);
                setIsEditMenuOpen(false);
                setIsFormatMenuOpen(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-medium transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-amber-300" />
              <span>Export</span>
              <ChevronDown className="w-3 h-3 text-neutral-400" />
            </button>

            {isExportMenuOpen && (
              <div
                id="export-menu"
                className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-neutral-200 p-2 text-xs z-40 space-y-1 animate-in fade-in"
              >
                <button
                  type="button"
                  onClick={handleExportPDF}
                  className="w-full text-left p-2 rounded-lg hover:bg-neutral-100 flex items-center gap-2 text-neutral-800 font-medium"
                >
                  <Download className="w-4 h-4 text-amber-800" />
                  <span>Download PDF (Vector)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    printLetterNative();
                    setIsExportMenuOpen(false);
                  }}
                  className="w-full text-left p-2 rounded-lg hover:bg-neutral-100 flex items-center gap-2 text-neutral-800 font-medium"
                >
                  <Printer className="w-4 h-4 text-neutral-600" />
                  <span>Print / Native Save</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="w-full text-left p-2 rounded-lg hover:bg-neutral-100 flex items-center gap-2 text-neutral-800 font-medium"
                >
                  <Copy className="w-4 h-4 text-neutral-600" />
                  <span>{copySuccess ? 'Copied to Clipboard!' : 'Copy Formatted Text'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadText}
                  className="w-full text-left p-2 rounded-lg hover:bg-neutral-100 flex items-center gap-2 text-neutral-800 font-medium"
                >
                  <FileText className="w-4 h-4 text-neutral-600" />
                  <span>Export as .TXT File</span>
                </button>

                <a
                  href={createMailtoLink(currentLetter, recipient.email)}
                  className="w-full text-left p-2 rounded-lg hover:bg-neutral-100 flex items-center gap-2 text-neutral-800 font-medium"
                >
                  <Mail className="w-4 h-4 text-neutral-600" />
                  <span>Open in Email Client</span>
                </a>

                <div className="pt-1 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={handleSaveAsTemplate}
                    className="w-full text-left p-2 rounded-lg hover:bg-amber-50 text-amber-900 font-medium flex items-center gap-2"
                  >
                    <BookmarkPlus className="w-4 h-4 text-amber-800" />
                    <span>{savedTemplateSuccess ? 'Saved Template!' : 'Save as Reusable Template'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. EDITORIAL REVISION BANNER (Displays when assistant edits have been applied) */}
      {originalDraft && (
        <div className="bg-amber-50 border-b border-amber-200/80 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs no-print z-10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-800 shrink-0" />
            <div>
              <span className="font-semibold text-neutral-900">Assistant Review Applied:</span>{' '}
              <span className="text-neutral-700">
                {editorialSummary || `Edited using ${getEditTypeLabel(editType)} mode.`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Comparison Toggle */}
            <div className="flex bg-amber-100/70 p-0.5 rounded border border-amber-300">
              <button
                type="button"
                onClick={() => setShowingDiffView('current')}
                className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-all ${
                  showingDiffView === 'current'
                    ? 'bg-white shadow-2xs text-neutral-900 font-semibold'
                    : 'text-neutral-600'
                }`}
              >
                Edited Version
              </button>
              <button
                type="button"
                onClick={() => setShowingDiffView('original')}
                className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-all ${
                  showingDiffView === 'original'
                    ? 'bg-white shadow-2xs text-neutral-900 font-semibold'
                    : 'text-neutral-600'
                }`}
              >
                My Original Draft
              </button>
            </div>

            <button
              type="button"
              onClick={handleRevertToOriginal}
              className="px-2.5 py-1 bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-700 rounded-md text-[11px] font-medium flex items-center gap-1 transition-colors"
              title="Revert back to your authentic draft"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Revert to Original</span>
            </button>

            <button
              type="button"
              onClick={handleAcceptEdits}
              className="px-3 py-1 bg-amber-800 hover:bg-amber-900 text-white rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors shadow-2xs"
            >
              <Check className="w-3 h-3" />
              <span>Accept Edits</span>
            </button>
          </div>
        </div>
      )}

      {/* Editorial Notes Drawer if notes exist */}
      {editorialNotes && editorialNotes.length > 0 && (
        <div className="bg-white border-b border-neutral-200 px-6 py-2.5 flex items-start justify-between text-xs no-print text-neutral-700">
          <div className="space-y-0.5">
            <span className="font-semibold text-neutral-900 text-[11px] uppercase tracking-wider block">
              Editorial Changes & Rationale:
            </span>
            <ul className="list-disc list-inside space-y-0.5 text-[11px] text-neutral-600">
              {editorialNotes.map((note, idx) => (
                <li key={idx}>{note}</li>
              ))}
            </ul>
          </div>
          <button
            type="button"
            onClick={() => setEditorialNotes(null)}
            className="text-neutral-400 hover:text-neutral-600 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Error notification banner */}
      {errorMessage && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-2 text-xs text-red-800 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-red-500 hover:text-red-700"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 3. WRITING CANVAS OR FREEFORM DRAFT PAD */}
      <div className="flex-1 overflow-hidden flex flex-col relative">
        {viewMode === 'freeform' ? (
          /* Freeform Draft Pad for fast, unconstrained writing */
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex flex-col items-center bg-neutral-200/50 space-y-4">
            {/* Guidance Component: Structure and Layout Suggestions with clickable sentence starters */}
            {showStructureGuide && (
              <div className="w-full max-w-4xl animate-in fade-in slide-in-from-top-2 duration-200">
                <StructureGuide
                  onInsertSnippet={handleInsertSnippet}
                  wordsWritten={wordsWritten}
                  minWordsRequired={MIN_WORDS_REQUIRED}
                />
              </div>
            )}

            <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg border border-neutral-300 p-6 sm:p-8 flex flex-col">
              {/* Draft Pad Header with real-time threshold status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-neutral-200 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-neutral-900 font-serif-formal">
                      Empty Draft Pad
                    </h3>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        hasEnoughWriting
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}
                    >
                      {hasEnoughWriting
                        ? 'Ready for Polish'
                        : `${wordsWritten} / ${MIN_WORDS_REQUIRED} words drafted`}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Write a basic draft or jot down key thoughts. The assistant will refine and format it once you write a portion of your letter (at least {MIN_WORDS_REQUIRED} words).
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleAssistantEdit('full_edit')}
                  disabled={isAssistantEditing || !hasEnoughWriting}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-2xs transition-all shrink-0 ${
                    !hasEnoughWriting
                      ? 'bg-neutral-100 text-neutral-400 border border-neutral-200 cursor-not-allowed'
                      : 'bg-amber-800 hover:bg-amber-900 text-white'
                  }`}
                  title={
                    !hasEnoughWriting
                      ? `Draft at least ${MIN_WORDS_REQUIRED} words to unlock (${wordsWritten}/${MIN_WORDS_REQUIRED})`
                      : 'Polish this draft into a formal executive letter'
                  }
                >
                  {isAssistantEditing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-200" />
                      <span>Formatting Letter...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles
                        className={`w-3.5 h-3.5 ${
                          hasEnoughWriting ? 'text-amber-200' : 'text-neutral-400'
                        }`}
                      />
                      <span>Turn into Formal Letter</span>
                    </>
                  )}
                </button>
              </div>

              {/* Real-time word progress bar */}
              <div className="mb-4 bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                <div className="flex items-center justify-between text-xs text-neutral-600 mb-1.5 font-medium">
                  <span>
                    {hasEnoughWriting ? (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        AI Assistance Unlocked ({wordsWritten} words written)
                      </span>
                    ) : (
                      <span className="text-amber-800">
                        ✍️ Draft at least {MIN_WORDS_REQUIRED} words to unlock AI polishing ({wordsWritten}/{MIN_WORDS_REQUIRED})
                      </span>
                    )}
                  </span>
                  <span className="text-[11px] text-neutral-400">
                    {hasEnoughWriting
                      ? 'Ready! Select an edit mode or click "Turn into Formal Letter"'
                      : `${Math.max(0, MIN_WORDS_REQUIRED - wordsWritten)} more word${
                          MIN_WORDS_REQUIRED - wordsWritten === 1 ? '' : 's'
                        } needed`}
                  </span>
                </div>
                <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      hasEnoughWriting ? 'bg-emerald-600' : 'bg-amber-600'
                    }`}
                    style={{
                      width: `${Math.min(100, Math.round((wordsWritten / MIN_WORDS_REQUIRED) * 100))}%`,
                    }}
                  />
                </div>
              </div>

              {/* Scratchpad Textarea */}
              <textarea
                id="freeform-draft-textarea"
                rows={16}
                value={rawDraftText}
                onChange={(e) => setRawDraftText(e.target.value)}
                placeholder={`Draft your rough thoughts, key bullet points, or basic sentences here...

Helpful guidance:
• State who you are writing to (e.g. Dear Dr. Adams,)
• State your objective in 1-2 rough sentences
• Note 2 or 3 facts, accomplishments, or background reasons
• Request a clear next action or deadline

Or click any sentence starter from the Suggestions & Starters above to insert directly!`}
                className="w-full flex-1 p-4 rounded-lg border border-neutral-300 font-serif-formal text-base leading-relaxed focus:outline-none focus:ring-1 focus:ring-amber-700 resize-none min-h-[320px]"
              />

              <div className="mt-3 flex items-center justify-between text-xs text-neutral-500 pt-2 border-t border-neutral-100">
                <div className="flex items-center gap-4">
                  <span>
                    Word count: <strong className="text-neutral-800">{wordsWritten}</strong>
                  </span>
                  <span>
                    Characters:{' '}
                    <strong className="text-neutral-800">{rawDraftText.length}</strong>
                  </span>
                </div>
                {rawDraftText.trim() && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Clear the draft scratchpad?')) {
                        setRawDraftText('');
                      }
                    }}
                    className="text-neutral-400 hover:text-red-600 transition-colors"
                  >
                    Clear pad
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Realistic 8.5" x 11" Paper Document Canvas */
          <div className="flex-1 overflow-y-auto flex flex-col items-center p-4 sm:p-6 bg-neutral-200/50 space-y-4">
            {showStructureGuide && (
              <div className="w-full max-w-4xl animate-in fade-in slide-in-from-top-2 duration-200">
                <StructureGuide
                  onInsertSnippet={handleInsertSnippet}
                  wordsWritten={wordsWritten}
                  minWordsRequired={MIN_WORDS_REQUIRED}
                />
              </div>
            )}
            <LetterCanvas
              letter={showingDiffView === 'original' && originalDraft ? originalDraft : currentLetter}
              formatting={formatting}
              sender={sender}
              recipient={recipient}
              onUpdateLetter={onUpdateLetter}
              onTriggerSectionEdit={handleTriggerSectionEdit}
              isAssistantEditing={isAssistantEditing}
            />
          </div>
        )}
      </div>
    </div>
  );
}
