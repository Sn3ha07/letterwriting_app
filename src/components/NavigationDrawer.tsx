import { useState } from 'react';
import {
  X,
  User,
  Building,
  BookmarkCheck,
  Users,
  Layers,
  Sliders,
  Sparkles,
  HelpCircle,
  FileText,
  Check,
  ArrowRight,
  Plus,
} from 'lucide-react';
import {
  Recipient,
  SenderProfile,
  Contact,
  LetterTemplate,
  LetterFormatting,
  ToneOption,
  ComplexityOption,
  LetterheadStyle,
} from '../types';
import { TONE_GUIDES, COMPLEXITY_GUIDES } from '../data/defaultData';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  recipient: Recipient;
  onUpdateRecipient: (r: Recipient) => void;
  sender: SenderProfile;
  contacts: Contact[];
  onSelectContact: (c: Contact) => void;
  templates: LetterTemplate[];
  onSelectTemplate: (t: LetterTemplate) => void;
  formatting: LetterFormatting;
  onUpdateFormatting: (f: LetterFormatting) => void;
  targetTone: ToneOption;
  onSelectTone: (tone: ToneOption) => void;
  targetComplexity: ComplexityOption;
  onSelectComplexity: (complexity: ComplexityOption) => void;
  onOpenLibrary: () => void;
  onOpenSystemDiagram: () => void;
  onOpenSettings: () => void;
  onRerunOnboarding: () => void;
}

export function NavigationDrawer({
  isOpen,
  onClose,
  recipient,
  onUpdateRecipient,
  sender,
  contacts,
  onSelectContact,
  templates,
  onSelectTemplate,
  formatting,
  onUpdateFormatting,
  targetTone,
  onSelectTone,
  targetComplexity,
  onSelectComplexity,
  onOpenLibrary,
  onOpenSystemDiagram,
  onOpenSettings,
  onRerunOnboarding,
}: NavigationDrawerProps) {
  const [activeDrawerTab, setActiveDrawerTab] = useState<
    'recipient' | 'templates' | 'contacts' | 'tone'
  >('recipient');

  if (!isOpen) return null;

  return (
    <div
      id="navigation-drawer-backdrop"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end transition-opacity"
      onClick={onClose}
    >
      <div
        id="navigation-drawer-panel"
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-900 text-white flex items-center justify-center text-xs font-serif-formal font-bold">
              LC
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-900 font-serif-formal">
                Assistant Options & Library
              </h2>
              <p className="text-[11px] text-neutral-500">
                Recipient calibration, address book, and system tools
              </p>
            </div>
          </div>
          <button
            id="close-drawer-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Section Tabs */}
        <div className="flex border-b border-neutral-200 bg-neutral-100/70 p-1 gap-1 text-xs">
          <button
            id="drawer-tab-recipient"
            type="button"
            onClick={() => setActiveDrawerTab('recipient')}
            className={`flex-1 py-1.5 rounded-md font-medium text-center transition-all ${
              activeDrawerTab === 'recipient'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Recipient
          </button>
          <button
            id="drawer-tab-contacts"
            type="button"
            onClick={() => setActiveDrawerTab('contacts')}
            className={`flex-1 py-1.5 rounded-md font-medium text-center transition-all ${
              activeDrawerTab === 'contacts'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Contacts ({contacts.length})
          </button>
          <button
            id="drawer-tab-templates"
            type="button"
            onClick={() => setActiveDrawerTab('templates')}
            className={`flex-1 py-1.5 rounded-md font-medium text-center transition-all ${
              activeDrawerTab === 'templates'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Templates
          </button>
          <button
            id="drawer-tab-tone"
            type="button"
            onClick={() => setActiveDrawerTab('tone')}
            className={`flex-1 py-1.5 rounded-md font-medium text-center transition-all ${
              activeDrawerTab === 'tone'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Tone
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-5 text-xs space-y-4">
          {/* TAB 1: Recipient Configuration */}
          {activeDrawerTab === 'recipient' && (
            <div className="space-y-3">
              <div>
                <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1">
                  Recipient Identity & Salutation
                </span>
                <p className="text-[11px] text-neutral-500 mb-3">
                  The assistant uses this to formulate formal greetings and tailored address blocks.
                </p>
              </div>

              <div>
                <label className="block text-neutral-700 font-medium mb-1">Recipient Name</label>
                <input
                  id="drawer-recipient-name"
                  type="text"
                  value={recipient.name}
                  onChange={(e) => onUpdateRecipient({ ...recipient, name: e.target.value })}
                  placeholder="e.g. Marcus Sterling"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-amber-700"
                />
              </div>

              <div>
                <label className="block text-neutral-700 font-medium mb-1">Formal Salutation</label>
                <input
                  id="drawer-recipient-salutation"
                  type="text"
                  value={recipient.salutation}
                  onChange={(e) => onUpdateRecipient({ ...recipient, salutation: e.target.value })}
                  placeholder="e.g. Dear Mr. Sterling,"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-amber-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Title / Designation</label>
                  <input
                    type="text"
                    value={recipient.title}
                    onChange={(e) => onUpdateRecipient({ ...recipient, title: e.target.value })}
                    placeholder="e.g. Vice President"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-amber-700"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Organization</label>
                  <input
                    type="text"
                    value={recipient.organization}
                    onChange={(e) =>
                      onUpdateRecipient({ ...recipient, organization: e.target.value })
                    }
                    placeholder="e.g. Apex Global"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-amber-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-700 font-medium mb-1">Postal Address</label>
                <textarea
                  rows={2}
                  value={recipient.address}
                  onChange={(e) => onUpdateRecipient({ ...recipient, address: e.target.value })}
                  placeholder="e.g. One World Trade Center, New York, NY 10007"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-amber-700"
                />
              </div>

              {/* Quick Contact Autofill */}
              {contacts.length > 0 && (
                <div className="mt-4 pt-3 border-t border-neutral-200">
                  <span className="text-[11px] font-semibold text-neutral-700 block mb-2">
                    Or Autofill from Address Book:
                  </span>
                  <div className="space-y-1.5">
                    {contacts.slice(0, 4).map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => onSelectContact(c)}
                        className="w-full text-left p-2 rounded-lg border border-neutral-200 hover:border-amber-700/50 hover:bg-amber-50/50 transition-colors flex items-center justify-between group"
                      >
                        <div>
                          <div className="font-semibold text-neutral-900">{c.name}</div>
                          <div className="text-[10.5px] text-neutral-500">
                            {c.title} • {c.organization}
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-amber-800" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Contacts Book */}
          {activeDrawerTab === 'contacts' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                  Saved Address Book
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenLibrary();
                  }}
                  className="text-amber-800 hover:underline text-[11px] font-medium"
                >
                  Manage All
                </button>
              </div>

              <div className="space-y-2">
                {contacts.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-xl border border-neutral-200 bg-white hover:shadow-xs transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="font-semibold text-neutral-900">{c.name}</div>
                      <div className="text-neutral-600 text-[11px]">{c.title}</div>
                      <div className="text-neutral-500 text-[11px]">{c.organization}</div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-neutral-100 flex items-center justify-between">
                      <span className="text-[10px] text-neutral-400">{c.salutation}</span>
                      <button
                        type="button"
                        onClick={() => {
                          onSelectContact(c);
                          onClose();
                        }}
                        className="px-2.5 py-1 bg-amber-800 hover:bg-amber-900 text-white rounded-md text-[11px] font-medium transition-colors"
                      >
                        Address to Contact
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Templates */}
          {activeDrawerTab === 'templates' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                  Reference Templates
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenLibrary();
                  }}
                  className="text-amber-800 hover:underline text-[11px] font-medium"
                >
                  Full Library
                </button>
              </div>

              <div className="space-y-2">
                {templates.map((tpl) => (
                  <div
                    key={tpl.id}
                    className="p-3 rounded-xl border border-neutral-200 bg-white hover:border-amber-700/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <span className="font-semibold text-neutral-900">{tpl.title}</span>
                      <span className="text-[10px] bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-600 shrink-0">
                        {tpl.letterType}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-1 line-clamp-2">
                      {tpl.description}
                    </p>
                    <div className="mt-2 pt-2 border-t border-neutral-100 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          onSelectTemplate(tpl);
                          onClose();
                        }}
                        className="text-[11px] text-amber-800 hover:text-amber-950 font-medium flex items-center gap-1"
                      >
                        <span>Load Draft Starter</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Tone & Complexity Defaults */}
          {activeDrawerTab === 'tone' && (
            <div className="space-y-4">
              <div>
                <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1">
                  Editorial Tone of Voice
                </span>
                <div className="space-y-1.5 mt-2">
                  {(Object.keys(TONE_GUIDES) as ToneOption[]).map((t) => (
                    <label
                      key={t}
                      className={`block p-2.5 rounded-lg border cursor-pointer transition-all ${
                        targetTone === t
                          ? 'border-amber-700 bg-amber-50/70 text-neutral-900'
                          : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{t}</span>
                        {targetTone === t && <Check className="w-3.5 h-3.5 text-amber-800" />}
                      </div>
                      <p className="text-[10.5px] text-neutral-500 mt-0.5">
                        {TONE_GUIDES[t]?.description}
                      </p>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-200">
                <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1">
                  Syntactic Complexity
                </span>
                <div className="space-y-1.5 mt-2">
                  {(Object.keys(COMPLEXITY_GUIDES) as ComplexityOption[]).map((c) => (
                    <label
                      key={c}
                      className={`block p-2.5 rounded-lg border cursor-pointer transition-all ${
                        targetComplexity === c
                          ? 'border-amber-700 bg-amber-50/70 text-neutral-900'
                          : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{c}</span>
                        {targetComplexity === c && <Check className="w-3.5 h-3.5 text-amber-800" />}
                      </div>
                      <p className="text-[10.5px] text-neutral-500 mt-0.5">
                        {COMPLEXITY_GUIDES[c]?.style}
                      </p>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer: Quick Utility Links & System Diagram */}
        <div className="p-4 border-t border-neutral-200 bg-neutral-50/90 space-y-2">
          {/* Prominent System Architecture Diagram button */}
          <button
            id="drawer-open-system-diagram-btn"
            type="button"
            onClick={() => {
              onClose();
              onOpenSystemDiagram();
            }}
            className="w-full py-2 px-3 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-2xs"
          >
            <Layers className="w-4 h-4 text-amber-800" />
            <span>System Architecture Diagram</span>
          </button>

          <div className="flex items-center gap-2 pt-1">
            <button
              id="drawer-open-settings-btn"
              type="button"
              onClick={() => {
                onClose();
                onOpenSettings();
              }}
              className="flex-1 py-1.5 px-3 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-100 text-neutral-700 text-xs font-medium flex items-center justify-center gap-1.5"
            >
              <Sliders className="w-3.5 h-3.5 text-neutral-500" />
              <span>Settings</span>
            </button>

            <button
              id="drawer-rerun-onboarding-btn"
              type="button"
              onClick={() => {
                onClose();
                onRerunOnboarding();
              }}
              className="py-1.5 px-3 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-100 text-neutral-700 text-xs font-medium flex items-center justify-center gap-1.5"
            >
              <HelpCircle className="w-3.5 h-3.5 text-neutral-500" />
              <span>Walkthrough</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
