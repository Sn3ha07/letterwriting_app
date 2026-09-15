import {
  Menu,
  Plus,
  Layers,
  Info,
  Sliders,
  BookmarkCheck,
  PenTool,
} from 'lucide-react';

interface HeaderProps {
  onOpenDrawer: () => void;
  onNewLetter: () => void;
  onOpenLibrary: () => void;
  onOpenSystemDiagram: () => void;
  onOpenSettings: () => void;
  wordCount: number;
  hasEdits: boolean;
  activeView: 'editor' | 'library';
  onSwitchView: (view: 'editor' | 'library') => void;
}

export function Header({
  onOpenDrawer,
  onNewLetter,
  onOpenLibrary,
  onOpenSystemDiagram,
  onOpenSettings,
  wordCount,
  hasEdits,
  activeView,
  onSwitchView,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-neutral-200/80 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Left: Hamburger & Brand */}
        <div className="flex items-center gap-3">
          <button
            id="header-hamburger-btn"
            type="button"
            onClick={onOpenDrawer}
            className="p-2 rounded-lg text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 transition-colors flex items-center gap-1.5"
            title="Open Assistant Options & Address Book"
          >
            <Menu className="w-5 h-5 text-neutral-800" />
            <span className="text-xs font-medium hidden sm:inline text-neutral-600">Options</span>
          </button>

          <div className="h-5 w-px bg-neutral-200 hidden sm:block" />

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-900 text-white flex items-center justify-center font-serif-formal font-bold text-sm shadow-xs">
              LC
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-semibold text-neutral-900 tracking-tight text-sm font-serif-formal">
                LetterCraft
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200/70 font-medium hidden md:inline">
                Writing Assistant
              </span>
            </div>
          </div>
        </div>

        {/* Center: Writing Mode & Document Telemetry */}
        <div className="hidden sm:flex items-center gap-3 text-xs">
          <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg border border-neutral-200">
            <button
              type="button"
              onClick={() => onSwitchView('editor')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeView === 'editor'
                  ? 'bg-white text-neutral-900 shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <PenTool className="w-3 h-3" />
              <span>Letter Workspace</span>
            </button>
            <button
              type="button"
              onClick={() => onSwitchView('library')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeView === 'library'
                  ? 'bg-white text-neutral-900 shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <BookmarkCheck className="w-3 h-3" />
              <span>Library</span>
            </button>
          </div>

          <div className="text-[11px] text-neutral-500 font-mono">
            {wordCount} words
            {hasEdits && (
              <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                Assistant Edited
              </span>
            )}
          </div>
        </div>

        {/* Right: Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            id="header-new-draft-btn"
            type="button"
            onClick={onNewLetter}
            className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-2xs"
            title="Start a fresh blank draft"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Draft</span>
          </button>

          {/* System Diagram Button */}
          <button
            id="header-system-diagram-btn"
            type="button"
            onClick={onOpenSystemDiagram}
            className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-900 transition-colors"
            title="System Architecture Diagram"
          >
            <Layers className="w-3.5 h-3.5 text-amber-800" />
            <span className="hidden md:inline">System Diagram</span>
          </button>

          <button
            id="header-settings-btn"
            type="button"
            onClick={onOpenSettings}
            className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 transition-colors"
            title="Settings"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
