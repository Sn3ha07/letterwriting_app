import { useState } from 'react';
import {
  GeneratedLetter,
  LetterFormatting,
  LetterheadStyle,
  Recipient,
  SenderProfile,
  SectionTarget,
} from '../types';
import {
  Edit3,
  Plus,
  Trash2,
  Sparkles,
  Check,
  Wand2,
} from 'lucide-react';

interface LetterCanvasProps {
  letter: GeneratedLetter;
  formatting: LetterFormatting;
  sender: SenderProfile;
  recipient: Recipient;
  onUpdateLetter: (updated: GeneratedLetter) => void;
  onTriggerSectionEdit?: (section: SectionTarget) => void;
  isAssistantEditing?: boolean;
}

export function LetterCanvas({
  letter,
  formatting,
  sender,
  recipient,
  onUpdateLetter,
  onTriggerSectionEdit,
  isAssistantEditing,
}: LetterCanvasProps) {
  const [activeEditingField, setActiveEditingField] = useState<string | null>(null);

  const handleUpdateParagraph = (index: number, text: string) => {
    const next = [...(letter.bodyParagraphs || [])];
    next[index] = text;
    onUpdateLetter({ ...letter, bodyParagraphs: next });
  };

  const handleAddParagraph = () => {
    const next = [
      ...(letter.bodyParagraphs || []),
      'Furthermore, I would welcome the opportunity to provide any supplementary background or details required.',
    ];
    onUpdateLetter({ ...letter, bodyParagraphs: next });
    setActiveEditingField(`body-${next.length - 1}`);
  };

  const handleDeleteParagraph = (index: number) => {
    const next = (letter.bodyParagraphs || []).filter((_, idx) => idx !== index);
    onUpdateLetter({
      ...letter,
      bodyParagraphs: next.length > 0 ? next : ['[Write your body paragraph here]'],
    });
  };

  // Font styling
  const fontClass =
    formatting.fontFamily === 'serif'
      ? 'font-serif-formal'
      : formatting.fontFamily === 'mono'
      ? 'font-mono'
      : 'font-sans-formal';

  const fontSizeClass =
    formatting.fontSize === 'compact'
      ? 'text-[13.5px] leading-relaxed'
      : formatting.fontSize === 'spacious'
      ? 'text-[16px] leading-loose'
      : 'text-[15px] leading-relaxed';

  return (
    <div className="w-full flex justify-center py-2 sm:py-4">
      {/* 8.5" x 11" Paper Sheet Container */}
      <div
        id="printable-letter-document"
        className={`printable-letter-container w-full max-w-3xl bg-white shadow-xl border border-neutral-300/80 rounded-sm p-8 sm:p-12 md:p-16 transition-all duration-150 text-neutral-900 ${fontClass} ${fontSizeClass} relative`}
        style={{ minHeight: '1050px' }}
      >
        {/* Subtle Assistant Busy Overlay */}
        {isAssistantEditing && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-2xs z-10 flex items-center justify-center rounded-sm">
            <div className="bg-neutral-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 text-xs font-medium">
              <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
              <span>Assistant is editing and polishing your draft...</span>
            </div>
          </div>
        )}

        {/* 1. Letterhead Area */}
        {formatting.showSenderHeader && sender.name && (
          <div className="mb-8 select-none">
            {formatting.letterheadStyle === 'classic' && (
              <div className="border-b border-neutral-300 pb-5">
                <div className="text-xl font-bold tracking-tight text-neutral-900">
                  {sender.name}
                </div>
                {sender.title && (
                  <div className="text-xs text-neutral-600 mt-0.5 font-sans-formal">
                    {sender.title}
                  </div>
                )}
                {sender.organization && (
                  <div className="text-xs text-neutral-600 font-sans-formal">
                    {sender.organization}
                  </div>
                )}
                <div className="text-[11px] text-neutral-500 mt-2 font-sans-formal flex flex-wrap gap-x-3">
                  {sender.email && <span>{sender.email}</span>}
                  {sender.phone && <span>• {sender.phone}</span>}
                  {sender.address && <span>• {sender.address.replace('\n', ', ')}</span>}
                </div>
              </div>
            )}

            {formatting.letterheadStyle === 'academic' && (
              <div className="text-center border-b-2 border-double border-neutral-400 pb-6 mb-8">
                <div className="text-sm font-semibold tracking-widest uppercase font-serif-formal text-neutral-900">
                  {sender.organization || 'OFFICE OF FACULTY & SCHOLARSHIP'}
                </div>
                <div className="text-xs text-neutral-600 mt-1 italic">
                  {sender.title || 'Fellow & Senior Associate'}
                </div>
                <div className="text-lg font-bold text-neutral-900 mt-1">{sender.name}</div>
                <div className="text-[11px] text-neutral-500 font-sans-formal mt-2 flex justify-center gap-3">
                  {sender.email && <span>{sender.email}</span>}
                  {sender.phone && <span>| {sender.phone}</span>}
                </div>
              </div>
            )}

            {formatting.letterheadStyle === 'corporate' && (
              <div className="border-l-4 border-neutral-900 pl-4 py-1 mb-8">
                <div className="text-lg font-bold tracking-tight text-neutral-900">
                  {sender.name}
                </div>
                <div className="text-xs font-medium text-neutral-600 font-sans-formal">
                  {[sender.title, sender.organization].filter(Boolean).join(' — ')}
                </div>
                <div className="text-[11px] text-neutral-500 font-sans-formal mt-1.5 flex gap-3">
                  {sender.email && <span>{sender.email}</span>}
                  {sender.phone && <span>• {sender.phone}</span>}
                </div>
              </div>
            )}

            {formatting.letterheadStyle === 'modern' && (
              <div className="mb-8">
                <div className="flex items-baseline justify-between border-b border-neutral-200 pb-3">
                  <span className="text-base font-bold text-neutral-900">{sender.name}</span>
                  <span className="text-xs text-neutral-500 font-sans-formal">
                    {[sender.title, sender.organization].filter(Boolean).join(' • ')}
                  </span>
                </div>
                <div className="text-[10.5px] text-neutral-400 font-sans-formal mt-1 text-right">
                  {[sender.email, sender.phone].filter(Boolean).join(' • ')}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. Date */}
        {formatting.showDate && formatting.date && (
          <div className="mb-6 text-neutral-700 select-none">{formatting.date}</div>
        )}

        {/* 3. Recipient Block */}
        {formatting.showRecipientHeader && (
          <div className="mb-6 space-y-0.5 text-neutral-800 group relative">
            <div className="font-semibold text-neutral-900">
              {recipient.name || '[Recipient Name]'}
            </div>
            {recipient.title && <div className="text-xs text-neutral-600">{recipient.title}</div>}
            {recipient.organization && (
              <div className="text-xs text-neutral-600">{recipient.organization}</div>
            )}
            {recipient.address && (
              <div className="text-xs text-neutral-600 whitespace-pre-line mt-1">
                {recipient.address}
              </div>
            )}
          </div>
        )}

        {/* 4. Subject Line */}
        <div className="mb-6 group relative">
          {activeEditingField === 'subject' ? (
            <div className="space-y-1">
              <div className="text-[10px] text-neutral-400 font-sans uppercase tracking-wider font-semibold">
                Subject Line
              </div>
              <input
                id="canvas-subject-input"
                type="text"
                value={letter.subject}
                autoFocus
                placeholder="Subject: (e.g. Application for Research Fellow)"
                onBlur={() => setActiveEditingField(null)}
                onChange={(e) => onUpdateLetter({ ...letter, subject: e.target.value })}
                className="w-full p-1.5 border border-amber-600/80 rounded bg-amber-50/20 font-bold text-inherit focus:outline-none"
              />
            </div>
          ) : (
            <div
              onClick={() => setActiveEditingField('subject')}
              className="cursor-pointer hover:bg-amber-50/70 p-1.5 -m-1.5 rounded transition-colors font-bold tracking-tight text-neutral-950 flex items-center justify-between"
              title="Click to edit subject line"
            >
              <span>{letter.subject ? `Subject: ${letter.subject}` : 'Subject: [Click to add subject]'}</span>
              <div className="hidden group-hover:flex items-center gap-1 text-[11px] text-neutral-400 no-print font-sans font-normal">
                <Edit3 className="w-3 h-3" />
                <span>Edit</span>
              </div>
            </div>
          )}
        </div>

        {/* 5. Salutation */}
        <div className="mb-5 group relative">
          {activeEditingField === 'salutation' ? (
            <input
              id="canvas-salutation-input"
              type="text"
              value={letter.salutation}
              autoFocus
              placeholder="e.g. Dear Dr. Adams,"
              onBlur={() => setActiveEditingField(null)}
              onChange={(e) => onUpdateLetter({ ...letter, salutation: e.target.value })}
              className="w-full p-1.5 border border-amber-600/80 rounded bg-amber-50/20 text-inherit focus:outline-none"
            />
          ) : (
            <div
              onClick={() => setActiveEditingField('salutation')}
              className="cursor-pointer hover:bg-amber-50/70 p-1.5 -m-1.5 rounded transition-colors text-neutral-900 inline-block font-medium"
              title="Click to edit greeting"
            >
              {letter.salutation || 'Dear Colleague,'}
            </div>
          )}
        </div>

        {/* 6. Opening Paragraph */}
        <div className="mb-6 group relative">
          {activeEditingField === 'opening' ? (
            <div className="space-y-1">
              <div className="text-[10px] text-amber-800 font-sans uppercase tracking-wider font-semibold flex items-center justify-between">
                <span>Opening Statement / Purpose</span>
                <span>Press outside to save</span>
              </div>
              <textarea
                id="canvas-opening-textarea"
                rows={4}
                value={letter.opening}
                autoFocus
                placeholder="Write your rough draft opening statement here..."
                onBlur={() => setActiveEditingField(null)}
                onChange={(e) => onUpdateLetter({ ...letter, opening: e.target.value })}
                className="w-full p-2.5 border border-amber-600/80 rounded bg-amber-50/20 text-inherit focus:outline-none leading-relaxed text-justify"
              />
            </div>
          ) : (
            <div
              onClick={() => setActiveEditingField('opening')}
              className="cursor-pointer hover:bg-amber-50/70 p-2 -m-2 rounded transition-colors text-justify leading-relaxed relative"
              title="Click to write or edit opening paragraph"
            >
              {letter.opening || (
                <span className="text-neutral-400 italic">
                  [Click here to write your draft opening paragraph. State your objective, reference prior discussions, or declare your intent.]
                </span>
              )}

              {/* Section-Level Assistant Action (Hover) */}
              {onTriggerSectionEdit && (
                <div className="absolute right-0 -top-3 hidden group-hover:flex items-center gap-1.5 bg-white border border-neutral-300 rounded shadow-xs px-2 py-0.5 text-[11px] no-print font-sans">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTriggerSectionEdit('opening');
                    }}
                    className="text-amber-800 hover:text-amber-950 font-medium flex items-center gap-1"
                  >
                    <Wand2 className="w-3 h-3" />
                    <span>Edit Opening</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 7. Body Paragraphs */}
        {letter.bodyParagraphs &&
          letter.bodyParagraphs.map((paragraph, idx) => (
            <div key={idx} className="mb-6 group relative">
              {activeEditingField === `body-${idx}` ? (
                <div className="space-y-1">
                  <div className="text-[10px] text-amber-800 font-sans uppercase tracking-wider font-semibold flex items-center justify-between">
                    <span>Body Paragraph {idx + 1}</span>
                    <span>Press outside to save</span>
                  </div>
                  <textarea
                    rows={5}
                    value={paragraph}
                    autoFocus
                    placeholder="Write your main arguments, key achievements, or context..."
                    onBlur={() => setActiveEditingField(null)}
                    onChange={(e) => handleUpdateParagraph(idx, e.target.value)}
                    className="w-full p-2.5 border border-amber-600/80 rounded bg-amber-50/20 text-inherit focus:outline-none leading-relaxed text-justify"
                  />
                </div>
              ) : (
                <div
                  onClick={() => setActiveEditingField(`body-${idx}`)}
                  className="cursor-pointer hover:bg-amber-50/70 p-2 -m-2 rounded transition-colors text-justify leading-relaxed relative"
                  title="Click to write or edit body paragraph"
                >
                  {paragraph || (
                    <span className="text-neutral-400 italic">
                      [Click here to write this body paragraph. Outline your key points, evidence, or milestones.]
                    </span>
                  )}

                  {/* Paragraph Hover Tools */}
                  <div className="absolute right-0 -top-3 hidden group-hover:flex items-center gap-1 bg-white border border-neutral-300 rounded shadow-xs p-0.5 text-xs no-print font-sans">
                    {onTriggerSectionEdit && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onTriggerSectionEdit('body');
                        }}
                        className="px-1.5 py-0.5 hover:bg-amber-50 text-amber-800 text-[11px] font-medium rounded flex items-center gap-1"
                        title="Edit body with assistant"
                      >
                        <Wand2 className="w-3 h-3" />
                        <span>Edit Body</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveEditingField(`body-${idx}`);
                      }}
                      className="p-1 hover:bg-neutral-100 text-neutral-600 rounded"
                      title="Edit text"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                    {letter.bodyParagraphs.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteParagraph(idx);
                        }}
                        className="p-1 hover:bg-red-50 text-red-600 rounded"
                        title="Delete paragraph"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

        {/* Add Body Paragraph Button (inline, subtle) */}
        <div className="mb-6 no-print">
          <button
            id="canvas-add-paragraph-btn"
            type="button"
            onClick={handleAddParagraph}
            className="text-xs text-neutral-400 hover:text-amber-800 flex items-center gap-1.5 transition-colors py-1.5 px-2.5 rounded-lg hover:bg-neutral-100 font-sans font-medium"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add supporting paragraph</span>
          </button>
        </div>

        {/* 8. Call to Action / Concluding Paragraph */}
        <div className="mb-8 group relative">
          {activeEditingField === 'callToAction' ? (
            <div className="space-y-1">
              <div className="text-[10px] text-amber-800 font-sans uppercase tracking-wider font-semibold flex items-center justify-between">
                <span>Closing Statement & Call to Action</span>
                <span>Press outside to save</span>
              </div>
              <textarea
                id="canvas-cta-textarea"
                rows={3}
                value={letter.callToAction}
                autoFocus
                placeholder="State next steps, scheduling an interview, or expected response..."
                onBlur={() => setActiveEditingField(null)}
                onChange={(e) => onUpdateLetter({ ...letter, callToAction: e.target.value })}
                className="w-full p-2.5 border border-amber-600/80 rounded bg-amber-50/20 text-inherit focus:outline-none leading-relaxed text-justify"
              />
            </div>
          ) : (
            <div
              onClick={() => setActiveEditingField('callToAction')}
              className="cursor-pointer hover:bg-amber-50/70 p-2 -m-2 rounded transition-colors text-justify leading-relaxed relative"
              title="Click to write or edit conclusion"
            >
              {letter.callToAction || (
                <span className="text-neutral-400 italic">
                  [Click here to write your concluding paragraph. Specify next steps, gratitude, or timelines.]
                </span>
              )}

              {onTriggerSectionEdit && (
                <div className="absolute right-0 -top-3 hidden group-hover:flex items-center gap-1 bg-white border border-neutral-300 rounded shadow-xs px-2 py-0.5 text-[11px] no-print font-sans">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTriggerSectionEdit('callToAction');
                    }}
                    className="text-amber-800 hover:text-amber-950 font-medium flex items-center gap-1"
                  >
                    <Wand2 className="w-3 h-3" />
                    <span>Edit Closing</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 9. Sign-off & Signature Area */}
        <div className="mt-8 space-y-7 select-none">
          <div>
            {activeEditingField === 'signOff' ? (
              <input
                type="text"
                value={letter.signOff}
                autoFocus
                onBlur={() => setActiveEditingField(null)}
                onChange={(e) => onUpdateLetter({ ...letter, signOff: e.target.value })}
                className="w-48 p-1 border border-amber-600/80 rounded bg-amber-50/20 text-inherit focus:outline-none"
              />
            ) : (
              <div
                onClick={() => setActiveEditingField('signOff')}
                className="cursor-pointer hover:bg-amber-50/70 p-1 -m-1 rounded transition-colors inline-block"
                title="Click to edit sign-off"
              >
                {letter.signOff || 'Sincerely,'}
              </div>
            )}
          </div>

          {/* Physical Signature Line */}
          <div className="h-10 border-b border-dashed border-neutral-300 w-48 relative">
            <span className="text-[10px] text-neutral-400 uppercase tracking-widest absolute bottom-1 font-sans-formal no-print">
              (Signature)
            </span>
          </div>

          {/* Sender Block */}
          <div className="space-y-0.5 text-neutral-900 whitespace-pre-line">
            {activeEditingField === 'senderBlock' ? (
              <textarea
                rows={3}
                value={letter.senderBlock}
                autoFocus
                onBlur={() => setActiveEditingField(null)}
                onChange={(e) => onUpdateLetter({ ...letter, senderBlock: e.target.value })}
                className="w-full p-2 border border-amber-600/80 rounded bg-amber-50/20 text-inherit focus:outline-none font-sans"
              />
            ) : (
              <div
                onClick={() => setActiveEditingField('senderBlock')}
                className="cursor-pointer hover:bg-amber-50/70 p-1 -m-1 rounded transition-colors inline-block"
                title="Click to edit sender sign-off block"
              >
                {letter.senderBlock || sender.name || 'Sender'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
