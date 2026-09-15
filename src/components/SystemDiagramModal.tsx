import { useState } from 'react';
import {
  X,
  Layers,
  Cpu,
  Server,
  FileText,
  ShieldCheck,
  ArrowRight,
  Database,
  Sliders,
  Sparkles,
  Download,
  Info,
} from 'lucide-react';

interface SystemDiagramModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SystemDiagramModal({ isOpen, onClose }: SystemDiagramModalProps) {
  const [activeTab, setActiveTab] = useState<'diagram' | 'flow' | 'security'>('diagram');
  const [selectedNode, setSelectedNode] = useState<string | null>('gemini-core');

  if (!isOpen) return null;

  const nodeDetails: Record<
    string,
    { title: string; category: string; description: string; tech: string; io: string }
  > = {
    'client-ui': {
      title: 'Frontend Presentation & Dynamic Drafting Engine',
      category: 'Client Layer (Browser)',
      description:
        'Single-page application built on React 19 and Tailwind CSS. Features dynamic drafting forms, multi-dimensional tailoring sliders (Tone, Length, Complexity), and a live 8.5"x11" paper document canvas.',
      tech: 'React 19, Motion, Lucide Icons, HTML5 ContentEditable Canvas',
      io: 'Input: Recipient details, purpose, tone/length knobs. Output: JSON state & real-time document preview.',
    },
    'state-store': {
      title: 'Local Persistence & Contacts / Template Library',
      category: 'Data & Storage Tier',
      description:
        'Stores frequently used contacts, customized templates, and user sender profile locally via browser LocalStorage. Completely client-authoritative with zero external data telemetry.',
      tech: 'Browser LocalStorage API, JSON schema serialization',
      io: 'Reads/writes Contact items, User Profiles, Custom Templates, and Draft state.',
    },
    'express-server': {
      title: 'Full-Stack API Gateway & Schema Validator',
      category: 'Server Layer (Node.js)',
      description:
        'Express server running on container Port 3000. Proxies requests to Gemini, securely holds GEMINI_API_KEY environment variable in server memory, enforces structured JSON schemas, and serves production static assets.',
      tech: 'Express v4, TypeScript, tsx / esbuild CJS bundle, Vite middleware',
      io: 'Endpoints: POST /api/generate-letter, POST /api/refine-letter, GET /api/health.',
    },
    'gemini-core': {
      title: 'Gemini 3.8 Flash AI Intelligence Core',
      category: 'AI Model & Reasoning Tier',
      description:
        'Executes tailored letter drafting through Google GenAI SDK. Adheres to strict system instructions calibrating executive, deferential, diplomatic, or persuasive registers, adjusting syntactic complexity and length parameters.',
      tech: '@google/genai TypeScript SDK, model: gemini-3.8-flash, responseSchema: Type.OBJECT',
      io: 'Structured JSON response: subject, salutation, opening, bodyParagraphs[], callToAction, signOff, senderBlock.',
    },
    'export-engine': {
      title: 'Document Vector & Print Export Engine',
      category: 'Document Synthesis Tier',
      description:
        'Directly generates clean letterhead PDFs on the client using jsPDF vector primitives, as well as native browser @media print layouts, plain text (.txt) downloads, and one-click mailto dispatch.',
      tech: 'jsPDF vector engine, CSS Paged Media (@page), Blob API',
      io: 'Outputs: Vector PDF files, Plain text .txt files, Clipboard formatting, Mailto links.',
    },
  };

  return (
    <div
      id="system-diagram-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="system-diagram-dialog"
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-800 text-white flex items-center justify-center shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                System Architecture & Data Flow
                <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                  Full-Stack Architecture
                </span>
              </h2>
              <p className="text-xs text-neutral-500">
                End-to-end design blueprint of LetterCraft Formal Letter Assistant
              </p>
            </div>
          </div>
          <button
            id="close-system-diagram-btn"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-neutral-200 px-6 bg-white gap-6">
          <button
            onClick={() => setActiveTab('diagram')}
            className={`py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'diagram'
                ? 'border-amber-700 text-amber-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            Architectural Diagram
          </button>
          <button
            onClick={() => setActiveTab('flow')}
            className={`py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'flow'
                ? 'border-amber-700 text-amber-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <ArrowRight className="w-4 h-4" />
            Drafting & Refinement Flow
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'security'
                ? 'border-amber-700 text-amber-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Security & Boundaries
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 max-h-[72vh] overflow-y-auto">
          {activeTab === 'diagram' && (
            <div className="space-y-6">
              {/* Visual Interactive Architecture Diagram */}
              <div className="bg-neutral-900 text-white rounded-xl p-6 border border-neutral-800 shadow-inner">
                <div className="text-xs uppercase tracking-wider text-neutral-400 font-semibold mb-4 flex items-center justify-between">
                  <span>Interactive Topology (Click a module to inspect runtime specs)</span>
                  <span className="text-[11px] text-amber-400">Port 3000 / Sandboxed Container</span>
                </div>

                {/* Tier Rows */}
                <div className="space-y-4">
                  {/* Tier 1: Client Application */}
                  <div className="border border-neutral-700 rounded-lg p-3 bg-neutral-800/60">
                    <div className="text-[11px] text-neutral-400 font-medium mb-2 flex items-center gap-2">
                      <Sliders className="w-3.5 h-3.5 text-amber-400" />
                      Tier 1: Browser Client (React 19 SPA)
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <button
                        onClick={() => setSelectedNode('client-ui')}
                        className={`text-left p-3 rounded-md transition-all border ${
                          selectedNode === 'client-ui'
                            ? 'bg-amber-900/40 border-amber-500 text-white ring-1 ring-amber-500'
                            : 'bg-neutral-900/80 border-neutral-750 text-neutral-200 hover:border-neutral-500'
                        }`}
                      >
                        <div className="text-xs font-semibold text-amber-300">Drafting Workspace</div>
                        <div className="text-[11px] text-neutral-400 mt-1">
                          Tone/Length/Complexity Tailoring & Live Letter Canvas
                        </div>
                      </button>

                      <button
                        onClick={() => setSelectedNode('state-store')}
                        className={`text-left p-3 rounded-md transition-all border ${
                          selectedNode === 'state-store'
                            ? 'bg-amber-900/40 border-amber-500 text-white ring-1 ring-amber-500'
                            : 'bg-neutral-900/80 border-neutral-750 text-neutral-200 hover:border-neutral-500'
                        }`}
                      >
                        <div className="text-xs font-semibold text-emerald-300">Library & Persistence</div>
                        <div className="text-[11px] text-neutral-400 mt-1">
                          Contacts Book & Reusable Template Cache (LocalStorage)
                        </div>
                      </button>

                      <button
                        onClick={() => setSelectedNode('export-engine')}
                        className={`text-left p-3 rounded-md transition-all border ${
                          selectedNode === 'export-engine'
                            ? 'bg-amber-900/40 border-amber-500 text-white ring-1 ring-amber-500'
                            : 'bg-neutral-900/80 border-neutral-750 text-neutral-200 hover:border-neutral-500'
                        }`}
                      >
                        <div className="text-xs font-semibold text-cyan-300">Document Exporters</div>
                        <div className="text-[11px] text-neutral-400 mt-1">
                          jsPDF Vector Generator, Native Print, .TXT Serializer
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Flow Arrow */}
                  <div className="flex justify-center items-center gap-2 text-neutral-500 text-xs py-1">
                    <span className="w-16 h-px bg-neutral-700"></span>
                    <span>HTTPS JSON REST Requests (`/api/*`)</span>
                    <span className="w-16 h-px bg-neutral-700"></span>
                  </div>

                  {/* Tier 2: Backend Server */}
                  <div className="border border-neutral-700 rounded-lg p-3 bg-neutral-800/60">
                    <div className="text-[11px] text-neutral-400 font-medium mb-2 flex items-center gap-2">
                      <Server className="w-3.5 h-3.5 text-blue-400" />
                      Tier 2: Node.js Express Gateway (Internal Container)
                    </div>
                    <button
                      onClick={() => setSelectedNode('express-server')}
                      className={`w-full text-left p-3 rounded-md transition-all border ${
                        selectedNode === 'express-server'
                          ? 'bg-blue-950/40 border-blue-500 text-white ring-1 ring-blue-500'
                          : 'bg-neutral-900/80 border-neutral-750 text-neutral-200 hover:border-neutral-500'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-blue-300">
                          Express Server (server.ts / dist/server.cjs)
                        </span>
                        <span className="text-[10px] px-2 py-0.5 bg-blue-900/60 text-blue-300 rounded">
                          Secret Guarded: GEMINI_API_KEY
                        </span>
                      </div>
                      <div className="text-[11px] text-neutral-400 mt-1">
                        Endpoint routes (/api/generate-letter, /api/refine-letter), Prompt Engineering, and JSON Schema Enforcement
                      </div>
                    </button>
                  </div>

                  {/* Flow Arrow */}
                  <div className="flex justify-center items-center gap-2 text-neutral-500 text-xs py-1">
                    <span className="w-16 h-px bg-neutral-700"></span>
                    <span>Server-Side Google GenAI SDK with Telemetry Header</span>
                    <span className="w-16 h-px bg-neutral-700"></span>
                  </div>

                  {/* Tier 3: AI Model Core */}
                  <div className="border border-neutral-700 rounded-lg p-3 bg-neutral-800/60">
                    <div className="text-[11px] text-neutral-400 font-medium mb-2 flex items-center gap-2">
                      <Cpu className="w-3.5 h-3.5 text-purple-400" />
                      Tier 3: Google DeepMind AI Reasoning Core
                    </div>
                    <button
                      onClick={() => setSelectedNode('gemini-core')}
                      className={`w-full text-left p-3 rounded-md transition-all border ${
                        selectedNode === 'gemini-core'
                          ? 'bg-purple-950/40 border-purple-500 text-white ring-1 ring-purple-500'
                          : 'bg-neutral-900/80 border-neutral-750 text-neutral-200 hover:border-neutral-500'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-purple-300">
                          Gemini 3.8 Flash (Server-Side Inference)
                        </span>
                        <span className="text-[10px] px-2 py-0.5 bg-purple-900/60 text-purple-300 rounded">
                          Structured JSON Schema Output
                        </span>
                      </div>
                      <div className="text-[11px] text-neutral-400 mt-1">
                        Recipient honorific validation, executive register formulation, argument structuring, and context-aware refinement
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Selected Node Details Box */}
              {selectedNode && nodeDetails[selectedNode] && (
                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-semibold text-amber-950">
                      {nodeDetails[selectedNode].title}
                    </h3>
                    <span className="text-xs font-medium text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                      {nodeDetails[selectedNode].category}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-700 leading-relaxed mb-3">
                    {nodeDetails[selectedNode].description}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-white/80 rounded border border-amber-200/60">
                      <span className="font-semibold text-neutral-800">Technology:</span>{' '}
                      <span className="text-neutral-600">{nodeDetails[selectedNode].tech}</span>
                    </div>
                    <div className="p-2 bg-white/80 rounded border border-amber-200/60">
                      <span className="font-semibold text-neutral-800">I/O Payload:</span>{' '}
                      <span className="text-neutral-600">{nodeDetails[selectedNode].io}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'flow' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-neutral-900 mb-2">
                End-to-End User Drafting & Refinement Sequence
              </h3>
              <ol className="relative border-l border-neutral-200 ml-3 space-y-6">
                <li className="ml-6">
                  <span className="absolute -left-3 flex items-center justify-center w-6 h-6 bg-amber-100 text-amber-800 rounded-full ring-4 ring-white text-xs font-bold">
                    1
                  </span>
                  <h4 className="text-sm font-semibold text-neutral-800">User Onboarding & Profile Setup</h4>
                  <p className="text-xs text-neutral-600 mt-1">
                    User inputs standard sender credentials (title, affiliation, preferred formal sign-off) and selects common letter domains. Saved in local storage.
                  </p>
                </li>
                <li className="ml-6">
                  <span className="absolute -left-3 flex items-center justify-center w-6 h-6 bg-amber-100 text-amber-800 rounded-full ring-4 ring-white text-xs font-bold">
                    2
                  </span>
                  <h4 className="text-sm font-semibold text-neutral-800">Recipient & Context Calibration</h4>
                  <p className="text-xs text-neutral-600 mt-1">
                    User selects letter type (Cover Letter, Formal Email, Recommendation Request, Inquiry) or selects a contact from the Address Book. Tone, length, and complexity knobs are dialed.
                  </p>
                </li>
                <li className="ml-6">
                  <span className="absolute -left-3 flex items-center justify-center w-6 h-6 bg-amber-100 text-amber-800 rounded-full ring-4 ring-white text-xs font-bold">
                    3
                  </span>
                  <h4 className="text-sm font-semibold text-neutral-800">Server-Side Gemini 3.8 Flash Generation</h4>
                  <p className="text-xs text-neutral-600 mt-1">
                    Express server formats prompt with strict executive system instructions and sends to Gemini 3.8 Flash via @google/genai SDK with JSON schema constraints.
                  </p>
                </li>
                <li className="ml-6">
                  <span className="absolute -left-3 flex items-center justify-center w-6 h-6 bg-amber-100 text-amber-800 rounded-full ring-4 ring-white text-xs font-bold">
                    4
                  </span>
                  <h4 className="text-sm font-semibold text-neutral-800">Interactive Document Canvas & Inline Refinements</h4>
                  <p className="text-xs text-neutral-600 mt-1">
                    Document renders on an 8.5"x11" live paper canvas with selected letterhead. User can directly edit any paragraph or execute targeted AI rewrites ("Make more assertive", "Shorten 20%", "Elevate formality").
                  </p>
                </li>
                <li className="ml-6">
                  <span className="absolute -left-3 flex items-center justify-center w-6 h-6 bg-amber-100 text-amber-800 rounded-full ring-4 ring-white text-xs font-bold">
                    5
                  </span>
                  <h4 className="text-sm font-semibold text-neutral-800">Document Vector Export & Template Archival</h4>
                  <p className="text-xs text-neutral-600 mt-1">
                    User exports formatted PDF via jsPDF vector drawing, uses high-resolution browser print, downloads .txt, or saves custom draft as a reusable template in their library.
                  </p>
                </li>
              </ol>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="flex items-center gap-2 text-emerald-900 font-semibold text-sm mb-1">
                  <ShieldCheck className="w-5 h-5 text-emerald-700" />
                  Security & Secret Containment Standards
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  LetterCraft complies with full-stack security requirements: all generative AI API keys are isolated on the Express server environment and are strictly inaccessible from browser bundles.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                  <h4 className="font-semibold text-neutral-900 mb-1 flex items-center gap-2">
                    <Server className="w-4 h-4 text-neutral-600" />
                    Server-Side API Proxying
                  </h4>
                  <p className="text-neutral-600 leading-relaxed">
                    Browser clients submit correspondence parameters to internal endpoints (`/api/generate-letter`). The server validates parameters and executes AI inference using `process.env.GEMINI_API_KEY`.
                  </p>
                </div>

                <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                  <h4 className="font-semibold text-neutral-900 mb-1 flex items-center gap-2">
                    <Database className="w-4 h-4 text-neutral-600" />
                    Zero Third-Party Storage Leakage
                  </h4>
                  <p className="text-neutral-600 leading-relaxed">
                    Contacts, saved custom templates, and user sender profiles are preserved solely in client-side LocalStorage. No confidential recipient addresses or proprietary drafts are persisted to external third parties.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between text-xs text-neutral-500">
          <span>Accessible via header info button and Settings menu</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-900 text-white hover:bg-neutral-800 rounded-lg text-xs font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
