/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import {
  GeneratedLetter,
  LetterFormatting,
  Recipient,
  SenderProfile,
  Contact,
  LetterTemplate,
  OnboardingData,
  LetterType,
  ToneOption,
  ComplexityOption,
} from './types';
import {
  DEFAULT_SENDER,
  SAMPLE_CONTACTS,
  PRESET_TEMPLATES,
  INITIAL_SAMPLE_LETTER,
} from './data/defaultData';
import { Header } from './components/Header';
import { DraftingWorkspace } from './components/DraftingWorkspace';
import { LibraryView } from './components/LibraryView';
import { NavigationDrawer } from './components/NavigationDrawer';
import { SystemDiagramModal } from './components/SystemDiagramModal';
import { SettingsModal } from './components/SettingsModal';
import { OnboardingModal } from './components/OnboardingModal';

const STORAGE_KEYS = {
  SENDER: 'lc_sender_profile_v2',
  CONTACTS: 'lc_contacts_v2',
  TEMPLATES: 'lc_templates_v2',
  FORMATTING: 'lc_formatting_v2',
  CURRENT_LETTER: 'lc_current_letter_v2',
  ORIGINAL_DRAFT: 'lc_original_draft_v2',
  RECIPIENT: 'lc_recipient_v2',
  ONBOARDING: 'lc_onboarding_v2',
  TONE: 'lc_target_tone_v2',
  COMPLEXITY: 'lc_target_complexity_v2',
};

export default function App() {
  // Navigation & Drawer
  const [activeView, setActiveView] = useState<'editor' | 'library'>('editor');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Modals
  const [isSystemDiagramOpen, setIsSystemDiagramOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // Toast Banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // State: Sender Profile
  const [sender, setSender] = useState<SenderProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SENDER);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(e);
    }
    return DEFAULT_SENDER;
  });

  // State: Contacts Address Book
  const [contacts, setContacts] = useState<Contact[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CONTACTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(e);
    }
    return SAMPLE_CONTACTS;
  });

  // State: Templates
  const [templates, setTemplates] = useState<LetterTemplate[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
      if (saved) {
        const userTpls: LetterTemplate[] = JSON.parse(saved);
        return [...PRESET_TEMPLATES, ...userTpls.filter((t) => t.isCustom)];
      }
    } catch (e) {
      console.warn(e);
    }
    return PRESET_TEMPLATES;
  });

  // State: Formatting
  const [formatting, setFormatting] = useState<LetterFormatting>(() => {
    const today = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FORMATTING);
      if (saved) return { ...JSON.parse(saved), date: today };
    } catch (e) {
      console.warn(e);
    }
    return {
      fontFamily: 'serif',
      fontSize: 'standard',
      letterheadStyle: 'classic',
      showDate: true,
      showSenderHeader: true,
      showRecipientHeader: true,
      date: today,
    };
  });

  // State: Recipient
  const [recipient, setRecipient] = useState<Recipient>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RECIPIENT);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(e);
    }
    return {
      name: 'Marcus Sterling',
      title: 'Executive Vice President of Technology',
      organization: 'Apex Global Enterprises',
      email: 'm.sterling@apexglobal.com',
      address: 'One World Trade Center, 64th Floor\nNew York, NY 10007',
      salutation: 'Dear Mr. Sterling,',
      relationship: 'Prospective Executive Leadership',
    };
  });

  // State: Current Draft Letter
  const [currentLetter, setCurrentLetter] = useState<GeneratedLetter>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_LETTER);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Reset legacy sample letter if present from prior runs
        if (parsed?.subject === 'Application for Vice President of Strategic Partnerships') {
          return INITIAL_SAMPLE_LETTER;
        }
        return parsed;
      }
    } catch (e) {
      console.warn(e);
    }
    return INITIAL_SAMPLE_LETTER;
  });

  // State: Original draft snapshot before assistant edit (for compare/undo)
  const [originalDraft, setOriginalDraft] = useState<GeneratedLetter | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORIGINAL_DRAFT);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(e);
    }
    return null;
  });

  // Target Tone & Complexity preferences
  const [targetTone, setTargetTone] = useState<ToneOption>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TONE);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(e);
    }
    return 'Executive & Authoritative';
  });

  const [targetComplexity, setTargetComplexity] = useState<ComplexityOption>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COMPLEXITY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(e);
    }
    return 'Professional & Polished';
  });

  // State: Onboarding Status
  const [onboardingData, setOnboardingData] = useState<OnboardingData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ONBOARDING);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(e);
    }
    return {
      completed: false,
      sender: DEFAULT_SENDER,
      primaryInterests: [
        'Cover Letters & Career Appointments',
        'Formal Recommendation Requests',
      ],
      defaultTone: 'Warmly Professional',
      defaultLetterhead: 'classic',
    };
  });

  // Show onboarding if not completed
  useEffect(() => {
    if (!onboardingData.completed) {
      setIsOnboardingOpen(true);
    }
  }, [onboardingData.completed]);

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SENDER, JSON.stringify(sender));
    } catch (e) {}
  }, [sender]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts));
    } catch (e) {}
  }, [contacts]);

  useEffect(() => {
    try {
      const userTpls = templates.filter((t) => t.isCustom);
      localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(userTpls));
    } catch (e) {}
  }, [templates]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.FORMATTING, JSON.stringify(formatting));
    } catch (e) {}
  }, [formatting]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_LETTER, JSON.stringify(currentLetter));
    } catch (e) {}
  }, [currentLetter]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ORIGINAL_DRAFT, JSON.stringify(originalDraft));
    } catch (e) {}
  }, [originalDraft]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.RECIPIENT, JSON.stringify(recipient));
    } catch (e) {}
  }, [recipient]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TONE, JSON.stringify(targetTone));
    } catch (e) {}
  }, [targetTone]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.COMPLEXITY, JSON.stringify(targetComplexity));
    } catch (e) {}
  }, [targetComplexity]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ONBOARDING, JSON.stringify(onboardingData));
    } catch (e) {}
  }, [onboardingData]);

  // Word count metric
  const wordCount = useMemo(() => {
    const text = [
      currentLetter.subject,
      currentLetter.salutation,
      currentLetter.opening,
      ...(currentLetter.bodyParagraphs || []),
      currentLetter.callToAction,
      currentLetter.signOff,
      currentLetter.senderBlock,
    ]
      .filter(Boolean)
      .join(' ');
    return text.trim().split(/\s+/).filter(Boolean).length;
  }, [currentLetter]);

  // Actions
  const handleOnboardingComplete = (data: OnboardingData) => {
    setOnboardingData(data);
    setSender(data.sender);
    setFormatting((prev) => ({
      ...prev,
      letterheadStyle: data.defaultLetterhead,
    }));
    setTargetTone(data.defaultTone);
    setIsOnboardingOpen(false);

    // After onboarding, strictly start with an empty draft pad
    const cleanDraft: GeneratedLetter = {
      subject: '',
      salutation: recipient.salutation || 'Dear Colleague,',
      opening: '',
      bodyParagraphs: [''],
      callToAction: '',
      signOff: data.sender?.signOff || sender.signOff || 'Sincerely,',
      senderBlock: `${data.sender?.name || sender.name || ''}\n${data.sender?.title || sender.title || ''}\n${data.sender?.organization || sender.organization || ''}\n${data.sender?.email || sender.email || ''}`.trim(),
      executiveSummary: 'Empty draft pad. Start typing your authentic thoughts or pick a sentence starter below.',
    };
    setCurrentLetter(cleanDraft);
    setOriginalDraft(null);
    setActiveView('editor');
    showToast('Profile configured! Starting with your clean draft pad.');
  };

  const handleNewLetter = () => {
    const freshDraft: GeneratedLetter = {
      subject: '',
      salutation: recipient.salutation || 'Dear Colleague,',
      opening: '',
      bodyParagraphs: [''],
      callToAction: '',
      signOff: sender.signOff || 'Sincerely,',
      senderBlock: `${sender.name}\n${sender.title}\n${sender.organization}\n${sender.email}`,
    };
    setCurrentLetter(freshDraft);
    setOriginalDraft(null);
    setActiveView('editor');
    showToast('Created new blank letter draft');
  };

  const handleSelectTemplate = (tpl: LetterTemplate) => {
    const draftedLetter: GeneratedLetter = {
      subject: `${tpl.letterType}: ${tpl.samplePurpose || tpl.title}`,
      salutation: recipient.salutation || 'Dear Colleague,',
      opening: `I am writing to formally submit this ${tpl.letterType.toLowerCase()} regarding ${
        tpl.samplePurpose || 'our collaborative engagement'
      }. With deep respect for your leadership, I submit this correspondence for your consideration.`,
      bodyParagraphs: tpl.sampleKeyDetails
        ? tpl.sampleKeyDetails.split('\n').filter(Boolean)
        : [
            'Throughout my career, I have prided myself on structured execution, disciplined integrity, and quantifiable results.',
          ],
      callToAction:
        'Thank you for your thoughtful review. I welcome the opportunity to discuss this further at your convenience.',
      signOff: sender.signOff || 'Sincerely,',
      senderBlock: `${sender.name}\n${sender.title}\n${sender.organization}\n${sender.email}`,
      executiveSummary: `Loaded template "${tpl.title}". Ready for your authentic edits.`,
    };

    setCurrentLetter(draftedLetter);
    setOriginalDraft(null);
    setTargetTone(tpl.defaultTone);
    setActiveView('editor');
    showToast(`Loaded "${tpl.title}" template into Letter Workspace`);
  };

  const handleSelectContact = (contact: Contact) => {
    setRecipient({
      id: contact.id,
      name: contact.name,
      title: contact.title,
      organization: contact.organization,
      email: contact.email,
      address: contact.address,
      salutation: contact.salutation,
      relationship: contact.relationship,
    });
    setCurrentLetter((prev) => ({
      ...prev,
      salutation: contact.salutation || `Dear ${contact.name},`,
    }));
    setActiveView('editor');
    showToast(`Addressed letter to ${contact.name}`);
  };

  const handleSaveAsTemplate = (
    letter: GeneratedLetter,
    type: LetterType,
    currentTone: ToneOption
  ) => {
    const newTpl: LetterTemplate = {
      id: `tpl-user-${Date.now()}`,
      title: letter.subject ? `Custom: ${letter.subject.slice(0, 32)}` : 'Custom Saved Letter',
      category: 'custom',
      description: `Saved draft from ${new Date().toLocaleDateString()}`,
      letterType: type,
      defaultTone: currentTone,
      defaultLength: 'Standard',
      defaultComplexity: 'Professional & Polished',
      samplePurpose: letter.subject || 'Formal inquiry',
      sampleKeyDetails: (letter.bodyParagraphs || []).join('\n'),
      isCustom: true,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setTemplates((prev) => [newTpl, ...prev]);
    showToast('Saved current letter to your template library');
  };

  const handleAddContact = (contact: Contact) => {
    setContacts((prev) => [contact, ...prev]);
    showToast(`Added contact: ${contact.name}`);
  };

  const handleDeleteContact = (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
    showToast('Contact removed');
  };

  const handleAddCustomTemplate = (tpl: LetterTemplate) => {
    setTemplates((prev) => [tpl, ...prev]);
    showToast(`Saved template: ${tpl.title}`);
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    showToast('Template deleted');
  };

  const handleResetDefaults = () => {
    setSender(DEFAULT_SENDER);
    setContacts(SAMPLE_CONTACTS);
    setTemplates(PRESET_TEMPLATES);
    setCurrentLetter(INITIAL_SAMPLE_LETTER);
    setOriginalDraft(null);
    showToast('Reset data to defaults');
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          id="app-toast-banner"
          className="fixed top-16 right-6 z-50 bg-neutral-900 text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 no-print border border-neutral-700"
        >
          <div className="w-2 h-2 rounded-full bg-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Clutter-Free Header */}
      <Header
        onOpenDrawer={() => setIsDrawerOpen(true)}
        onNewLetter={handleNewLetter}
        onOpenLibrary={() => setActiveView('library')}
        onOpenSystemDiagram={() => setIsSystemDiagramOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        wordCount={wordCount}
        hasEdits={Boolean(originalDraft)}
        activeView={activeView}
        onSwitchView={setActiveView}
      />

      {/* Primary Workspace: Centered on Letter Writing */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {activeView === 'editor' ? (
          <DraftingWorkspace
            currentLetter={currentLetter}
            originalDraft={originalDraft}
            formatting={formatting}
            sender={sender}
            recipient={recipient}
            targetTone={targetTone}
            targetComplexity={targetComplexity}
            onUpdateLetter={setCurrentLetter}
            onUpdateFormatting={setFormatting}
            onSaveAsTemplate={handleSaveAsTemplate}
            onSetOriginalDraft={setOriginalDraft}
            onSelectTone={setTargetTone}
            onSelectComplexity={setTargetComplexity}
          />
        ) : (
          <LibraryView
            templates={templates}
            contacts={contacts}
            onSelectTemplate={handleSelectTemplate}
            onSelectContactToDraft={handleSelectContact}
            onAddContact={handleAddContact}
            onDeleteContact={handleDeleteContact}
            onAddCustomTemplate={handleAddCustomTemplate}
            onDeleteTemplate={handleDeleteTemplate}
          />
        )}
      </main>

      {/* Hamburger Navigation Slide-Over Drawer */}
      <NavigationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        recipient={recipient}
        onUpdateRecipient={setRecipient}
        sender={sender}
        contacts={contacts}
        onSelectContact={(c) => {
          handleSelectContact(c);
          setIsDrawerOpen(false);
        }}
        templates={templates}
        onSelectTemplate={(t) => {
          handleSelectTemplate(t);
          setIsDrawerOpen(false);
        }}
        formatting={formatting}
        onUpdateFormatting={setFormatting}
        targetTone={targetTone}
        onSelectTone={setTargetTone}
        targetComplexity={targetComplexity}
        onSelectComplexity={setTargetComplexity}
        onOpenLibrary={() => {
          setIsDrawerOpen(false);
          setActiveView('library');
        }}
        onOpenSystemDiagram={() => {
          setIsDrawerOpen(false);
          setIsSystemDiagramOpen(true);
        }}
        onOpenSettings={() => {
          setIsDrawerOpen(false);
          setIsSettingsOpen(true);
        }}
        onRerunOnboarding={() => {
          setIsDrawerOpen(false);
          setIsOnboardingOpen(true);
        }}
      />

      {/* Modals */}
      <SystemDiagramModal
        isOpen={isSystemDiagramOpen}
        onClose={() => setIsSystemDiagramOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        sender={sender}
        onUpdateSender={setSender}
        formatting={formatting}
        onUpdateFormatting={setFormatting}
        onOpenSystemDiagram={() => setIsSystemDiagramOpen(true)}
        onRerunOnboarding={() => setIsOnboardingOpen(true)}
        onResetDefaults={handleResetDefaults}
      />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        initialData={onboardingData}
        onComplete={handleOnboardingComplete}
        onDismiss={() => setIsOnboardingOpen(false)}
      />
    </div>
  );
}
