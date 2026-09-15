import { useState } from 'react';
import {
  X,
  User,
  Sliders,
  Layers,
  RotateCcw,
  Check,
  Building,
  Mail,
  Phone,
  MapPin,
  FileCode,
  ShieldCheck,
} from 'lucide-react';
import { SenderProfile, LetterFormatting, LetterheadStyle } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sender: SenderProfile;
  onUpdateSender: (sender: SenderProfile) => void;
  formatting: LetterFormatting;
  onUpdateFormatting: (formatting: LetterFormatting) => void;
  onOpenSystemDiagram: () => void;
  onRerunOnboarding: () => void;
  onResetDefaults: () => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  sender,
  onUpdateSender,
  formatting,
  onUpdateFormatting,
  onOpenSystemDiagram,
  onRerunOnboarding,
  onResetDefaults,
}: SettingsModalProps) {
  const [profile, setProfile] = useState<SenderProfile>(sender);
  const [fmt, setFmt] = useState<LetterFormatting>(formatting);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onUpdateSender(profile);
    onUpdateFormatting(fmt);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 400);
  };

  return (
    <div
      id="settings-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="settings-dialog"
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center shadow-xs">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-900">Application Settings</h2>
              <p className="text-xs text-neutral-500">
                Sender profile credentials, document presets, and system telemetry
              </p>
            </div>
          </div>
          <button
            id="close-settings-btn"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
          {/* Section 1: System Diagram Access */}
          <div className="p-4 rounded-xl bg-linear-to-r from-amber-50 to-orange-50 border border-amber-200/80 flex items-center justify-between">
            <div className="pr-4">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-800" />
                <h3 className="text-xs font-semibold text-neutral-900">
                  System Architecture & Diagram
                </h3>
              </div>
              <p className="text-[11px] text-neutral-600 mt-1">
                Inspect the complete multi-tier system topology, Express server proxy routes, and Gemini inference workflow.
              </p>
            </div>
            <button
              id="settings-open-system-diagram-btn"
              type="button"
              onClick={() => {
                onClose();
                onOpenSystemDiagram();
              }}
              className="px-3.5 py-1.5 bg-amber-800 hover:bg-amber-900 text-white text-xs font-medium rounded-lg shadow-xs transition-colors shrink-0 flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5" />
              View Diagram
            </button>
          </div>

          {/* Section 2: Sender Profile Defaults */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-neutral-500" />
                Sender Profile (Autofill Header)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-neutral-700 font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-400"
                />
              </div>

              <div>
                <label className="block text-neutral-700 font-medium mb-1">Title / Rank</label>
                <input
                  type="text"
                  value={profile.title}
                  onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-400"
                />
              </div>

              <div>
                <label className="block text-neutral-700 font-medium mb-1">Organization</label>
                <input
                  type="text"
                  value={profile.organization}
                  onChange={(e) => setProfile({ ...profile, organization: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-400"
                />
              </div>

              <div>
                <label className="block text-neutral-700 font-medium mb-1">Official Email</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-400"
                />
              </div>

              <div>
                <label className="block text-neutral-700 font-medium mb-1">Phone Number</label>
                <input
                  type="text"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-400"
                />
              </div>

              <div>
                <label className="block text-neutral-700 font-medium mb-1">Default Sign-Off</label>
                <input
                  type="text"
                  value={profile.signOff}
                  onChange={(e) => setProfile({ ...profile, signOff: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-400"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-neutral-700 font-medium mb-1">Postal / Office Address</label>
                <textarea
                  rows={2}
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-400"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Document Layout & Typography Presets */}
          <div className="border-t border-neutral-200 pt-5">
            <h3 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <FileCode className="w-3.5 h-3.5 text-neutral-500" />
              Document Layout Presets
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-neutral-700 font-medium mb-1">Typography Family</label>
                <select
                  value={fmt.fontFamily}
                  onChange={(e) =>
                    setFmt({ ...fmt, fontFamily: e.target.value as 'serif' | 'sans' | 'mono' })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 bg-white"
                >
                  <option value="serif">EB Garamond (Executive Serif)</option>
                  <option value="sans">Plus Jakarta Sans (Modern Clean)</option>
                  <option value="mono">Monospace (Technical / Regulatory)</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-700 font-medium mb-1">Letterhead Presentation</label>
                <select
                  value={fmt.letterheadStyle}
                  onChange={(e) =>
                    setFmt({ ...fmt, letterheadStyle: e.target.value as LetterheadStyle })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 bg-white"
                >
                  <option value="classic">Classic Executive (Left Header)</option>
                  <option value="modern">Modern Minimalist (Single Line)</option>
                  <option value="academic">Academic Traditional (Centered Bar)</option>
                  <option value="corporate">Clean Corporate (Accent Strip)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Maintenance Actions */}
          <div className="border-t border-neutral-200 pt-5 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => {
                onClose();
                onRerunOnboarding();
              }}
              className="text-amber-800 hover:text-amber-950 font-medium hover:underline flex items-center gap-1.5"
            >
              Re-open Onboarding Walkthrough
            </button>

            <button
              type="button"
              onClick={onResetDefaults}
              className="text-neutral-500 hover:text-neutral-700 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Reset All to Defaults
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between">
          <div className="text-[11px] text-neutral-500 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Keys stored securely in server environment
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-neutral-300 text-xs font-medium text-neutral-700 hover:bg-neutral-100"
            >
              Cancel
            </button>
            <button
              id="save-settings-btn"
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  Saved!
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
