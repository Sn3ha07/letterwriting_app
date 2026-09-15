import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  X,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  ShieldAlert,
  Target,
  Clock,
  FileCheck,
  Plus,
  PlusCircle,
} from 'lucide-react';
import {
  GeneratedLetter,
  Recipient,
  SenderProfile,
  LetterType,
  ToneOption,
  ComplexityOption,
  AgentMessage,
  AgentQuestion,
} from '../types';

// Helper to convert an idea or question suggestion into an authoritative formal executive sentence
function formatSuggestedSentence(sugg: string, category?: string): string {
  let clean = sugg.trim();
  clean = clean.replace(/^(Propose a |Propose |Request confirmation by |Request confirmation |Request |Indicate that you will |Indicate that |Highlight that |Highlight |State that |Alleviates |Enhances |Aligns directly with )/i, (match) => {
    const lower = match.toLowerCase();
    if (lower.startsWith('alleviates')) return 'This initiative alleviates ';
    if (lower.startsWith('enhances')) return 'This proposal enhances ';
    if (lower.startsWith('aligns')) return 'This approach aligns directly with ';
    if (lower.startsWith('request confirmation')) return 'I request confirmation ';
    if (lower.startsWith('propose a') || lower.startsWith('propose')) return 'I propose ';
    return '';
  });

  if (!clean.endsWith('.')) clean += '.';

  if (category === 'callToAction') {
    if (!clean.match(/^(I |We |Please |Could |Would )/i)) {
      clean = `I welcome the opportunity to ${clean.charAt(0).toLowerCase() + clean.slice(1)}`;
    }
  } else {
    if (!clean.match(/^(I |We |This |Our |In |Over |Specifically,|With |Regarding )/i)) {
      clean = `Specifically, ${clean.charAt(0).toLowerCase() + clean.slice(1)}`;
    }
  }
  return clean;
}

interface LetterAgentPanelProps {
  currentLetter: GeneratedLetter;
  rawDraftText: string;
  recipient: Recipient;
  sender: SenderProfile;
  letterType: LetterType;
  targetTone: ToneOption;
  targetComplexity: ComplexityOption;
  onApplyUpdatedLetter: (updated: GeneratedLetter, editorialNotes?: string[], mode?: 'append' | 'replace') => void;
  onAddSentenceToDraft?: (sentence: string, section?: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

export function LetterAgentPanel({
  currentLetter,
  rawDraftText,
  recipient,
  sender,
  letterType,
  targetTone,
  targetComplexity,
  onApplyUpdatedLetter,
  onAddSentenceToDraft,
  onClose,
  isOpen,
}: LetterAgentPanelProps) {
  const [messages, setMessages] = useState<AgentMessage[]>(() => {
    return [
      {
        id: 'msg_welcome',
        role: 'agent',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: `I am your Socratic Letter Agent, powered by Google Gemini AI. I don't just generate generic boilerplate — I question your reasoning, interrogate your claims, and formulate precise evidentiary sentences for your letter.\n\nWhenever we formulate a sentence or answer an inquiry, you can add it directly into your draft with a single click. Your existing writing is always preserved.`,
        actionType: 'chat',
      },
    ];
  });

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [answeredQuestionIds, setAnsweredQuestionIds] = useState<Set<string>>(new Set());
  const [addedSentenceIds, setAddedSentenceIds] = useState<Set<string>>(new Set());
  const [confirmReplaceMsgId, setConfirmReplaceMsgId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'feed' | 'critiques'>('feed');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Call Agent backend
  const callAgent = async (params: {
    actionType: 'interview' | 'interrogate' | 'chat' | 'apply_answers';
    userMsg?: string;
    answersList?: Array<{ questionId?: string; question: string; answer: string }>;
  }) => {
    setIsLoading(true);
    const { actionType, userMsg, answersList = [] } = params;

    const newHistory = userMsg
      ? [
          ...messages,
          {
            id: `usr_${Date.now()}`,
            role: 'user' as const,
            content: userMsg,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]
      : messages;

    if (userMsg) {
      setMessages(newHistory);
      setInputMessage('');
    }

    try {
      const response = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({ role: m.role, content: m.content })),
          currentLetter,
          rawText: rawDraftText,
          recipient,
          sender,
          letterType,
          actionType,
          answers: answersList,
          targetTone,
          targetComplexity,
        }),
      });

      if (!response.ok) {
        throw new Error(`Agent request failed (${response.status})`);
      }

      const data = await response.json();

      const agentMsg: AgentMessage = {
        id: `agent_${Date.now()}`,
        role: 'agent',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: data.message,
        questions: data.questions,
        critiques: data.critiques,
        proposedLetter: data.updatedLetter,
        formulatedSentences: data.formulatedSentences,
        editorialNotes: data.editorialNotes,
        actionType,
      };

      setMessages((prev) => [...prev, agentMsg]);
    } catch (err: any) {
      console.error('Agent chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: 'agent',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          content:
            'I encountered a brief connection delay, but my Socratic engine is active. Try asking directly or select one of the questioning prompts above.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Submit answer to a specific Socratic question (NEVER prepend prompt text into userMsg)
  const handleAnswerQuestion = (q: AgentQuestion, customAns?: string) => {
    const answerText = customAns || userAnswers[q.id];
    if (!answerText || !answerText.trim()) return;

    setAnsweredQuestionIds((prev) => new Set(prev).add(q.id));

    callAgent({
      actionType: 'apply_answers',
      userMsg: answerText.trim(),
      answersList: [{ questionId: q.id, question: q.question, answer: answerText.trim() }],
    });
  };

  // Submit free text user message
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;
    callAgent({
      actionType: 'chat',
      userMsg: inputMessage.trim(),
    });
  };

  if (!isOpen) return null;

  // Flatten all critiques across messages for the critique audit tab
  const allCritiques = messages
    .flatMap((m) => m.critiques || [])
    .filter((c, idx, arr) => arr.findIndex((x) => x.id === c.id) === idx);

  return (
    <aside
      id="socratic-letter-agent-panel"
      className="w-full sm:w-96 lg:w-[420px] flex-shrink-0 h-full bg-white border-l border-neutral-300 shadow-xl flex flex-col z-30 animate-in slide-in-from-right duration-200"
    >
      {/* 1. Header with Persona & Status */}
      <div className="px-4 py-3.5 bg-neutral-900 text-white flex items-center justify-between border-b border-neutral-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-amber-400 font-sans">
                Socratic Letter Agent
              </h2>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-amber-300 font-semibold border border-amber-500/30 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                Gemini AI
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Gemini Live" />
            </div>
            <p className="text-[11px] text-neutral-400 leading-tight">
              Questions your writing & extracts evidence
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-md hover:bg-neutral-800 transition-colors"
            title="Close Agent Panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Quick Socratic Interrogation Action Bar */}
      <div className="p-3 bg-neutral-50 border-b border-neutral-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500">
            Agent Inquiries
          </span>
          <div className="flex gap-1 text-[11px]">
            <button
              type="button"
              onClick={() => setActiveTab('feed')}
              className={`px-2 py-0.5 rounded font-medium transition-colors ${
                activeTab === 'feed'
                  ? 'bg-amber-100 text-amber-900 font-semibold'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              Dialogue
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('critiques')}
              className={`px-2 py-0.5 rounded font-medium transition-colors flex items-center gap-1 ${
                activeTab === 'critiques'
                  ? 'bg-amber-100 text-amber-900 font-semibold'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <span>Vulnerabilities</span>
              {allCritiques.length > 0 && (
                <span className="text-[9px] px-1.5 py-0.2 bg-red-100 text-red-700 font-bold rounded-full">
                  {allCritiques.length}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => callAgent({ actionType: 'interrogate' })}
            disabled={isLoading}
            className="px-2.5 py-1.5 bg-white hover:bg-amber-50 hover:border-amber-300 border border-neutral-300 rounded-md text-xs font-semibold text-neutral-800 flex items-center gap-1.5 transition-all shadow-2xs group text-left disabled:opacity-50"
            title="Agent finds weak claims and passive hedging in your current writing"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-700 group-hover:scale-110 transition-transform shrink-0" />
            <span className="truncate">Interrogate Draft</span>
          </button>

          <button
            type="button"
            onClick={() => callAgent({ actionType: 'interview' })}
            disabled={isLoading}
            className="px-2.5 py-1.5 bg-white hover:bg-amber-50 hover:border-amber-300 border border-neutral-300 rounded-md text-xs font-semibold text-neutral-800 flex items-center gap-1.5 transition-all shadow-2xs group text-left disabled:opacity-50"
            title="Agent interviews you to discover the core purpose, proof, and timeline"
          >
            <Target className="w-3.5 h-3.5 text-blue-700 group-hover:scale-110 transition-transform shrink-0" />
            <span className="truncate">Interview Me</span>
          </button>
        </div>
      </div>

      {/* 3. Main Body: Feed or Critiques Audit */}
      {activeTab === 'critiques' ? (
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-neutral-100/50">
          <div className="text-xs text-neutral-600 mb-2">
            The Agent continuously analyzes your writing for qualitative puffery, apologetic hedging,
            and indecisive calls to action.
          </div>
          {allCritiques.length === 0 ? (
            <div className="p-6 text-center text-neutral-500 bg-white rounded-lg border border-neutral-200">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2 opacity-80" />
              <p className="text-xs font-medium text-neutral-800">No Critical Flaws Detected</p>
              <p className="text-[11px] text-neutral-500 mt-1">
                Click <strong>"Interrogate Draft"</strong> to have the agent run a deep Socratic audit on your draft.
              </p>
            </div>
          ) : (
            allCritiques.map((critique) => (
              <div
                key={critique.id}
                className="bg-white rounded-lg border border-neutral-200 p-3.5 shadow-2xs space-y-2"
              >
                <div className="flex items-center gap-1.5 text-amber-800 text-[11px] font-bold uppercase tracking-wider">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>
                    {critique.type === 'weak_claim'
                      ? 'Vague Claim'
                      : critique.type === 'passive_tone'
                      ? 'Apologetic Hedging'
                      : critique.type === 'weak_cta'
                      ? 'Indecisive Closing'
                      : 'Missing Context'}
                  </span>
                </div>
                <blockquote className="text-xs text-neutral-700 bg-neutral-50 p-2 rounded border-l-2 border-amber-600 font-serif-formal italic">
                  "{critique.excerpt}"
                </blockquote>
                <p className="text-xs text-neutral-700">
                  <strong className="text-neutral-900">Issue:</strong> {critique.critique}
                </p>
                <div className="text-xs text-emerald-800 bg-emerald-50/70 p-2 rounded border border-emerald-200">
                  <strong>Agent Fix:</strong> {critique.recommendation}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Conversation Feed */
        <div className="flex-1 overflow-y-auto p-3.5 space-y-4 bg-neutral-100/40">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[95%] rounded-xl p-3 text-xs leading-relaxed shadow-2xs ${
                  msg.role === 'user'
                    ? 'bg-amber-800 text-white rounded-br-xs'
                    : 'bg-white text-neutral-800 border border-neutral-200 rounded-bl-xs'
                }`}
              >
                {/* Agent Header Tag */}
                {msg.role === 'agent' && (
                  <div className="flex items-center gap-1.5 mb-1.5 pb-1 border-b border-neutral-100 text-[10px] font-bold uppercase tracking-wider text-amber-800">
                    <Bot className="w-3 h-3 text-amber-700" />
                    <span>Gemini Editorial Agent</span>
                    <span className="text-neutral-400 font-normal ml-auto text-[9px]">
                      {msg.timestamp}
                    </span>
                  </div>
                )}

                {/* Message Content */}
                <div className="whitespace-pre-line font-sans">{msg.content}</div>

                {/* Socratic Questions Interactive Cards */}
                {msg.questions && msg.questions.length > 0 && (
                  <div className="mt-3 space-y-3 pt-2 border-t border-neutral-100">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 flex items-center gap-1">
                      <HelpCircle className="w-3 h-3 text-amber-700" />
                      <span>Inquiries to Answer ({msg.questions.length})</span>
                    </div>

                    {msg.questions.map((q) => {
                      const isAnswered = answeredQuestionIds.has(q.id);
                      return (
                        <div
                          key={q.id}
                          className={`p-3 rounded-lg border text-xs transition-all ${
                            isAnswered
                              ? 'bg-emerald-50/50 border-emerald-200'
                              : 'bg-amber-50/40 border-amber-200/80 shadow-2xs'
                          }`}
                        >
                          {/* Question Category & Excerpt */}
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                              {q.category}
                            </span>
                            {isAnswered && (
                              <span className="text-[10px] font-medium text-emerald-700 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Answered
                              </span>
                            )}
                          </div>

                          {q.contextExcerpt && (
                            <div className="text-[11px] text-neutral-600 italic bg-white/80 p-1.5 rounded mb-1.5 border-l-2 border-amber-600">
                              Questioning: "{q.contextExcerpt}"
                            </div>
                          )}

                          <div className="font-semibold text-neutral-900 mb-1">
                            {q.question}
                          </div>

                          <div className="text-[11px] text-neutral-600 mb-2">
                            <strong className="text-neutral-700">Why it matters:</strong> {q.whyItMatters}
                          </div>

                          {/* Quick Suggested Answer Chips with direct Add Sentence and Answer Agent actions */}
                          {!isAnswered && q.suggestedAnswers && q.suggestedAnswers.length > 0 && (
                            <div className="mb-2 space-y-1.5">
                              <span className="text-[10px] font-semibold text-neutral-600 block">
                                Quick reply options:
                              </span>
                              <div className="flex flex-col gap-1.5">
                                {q.suggestedAnswers.map((sugg, sIdx) => {
                                  const itemKey = `sugg_${q.id}_${sIdx}`;
                                  const isAdded = addedSentenceIds.has(itemKey);
                                  const formattedSentence = formatSuggestedSentence(sugg, q.category);

                                  return (
                                    <div
                                      key={sIdx}
                                      className="p-2 bg-white hover:bg-amber-50/50 border border-neutral-200 rounded text-neutral-800 transition-colors flex flex-col gap-1.5"
                                    >
                                      <span className="text-[11px] leading-snug font-normal text-neutral-800">
                                        "{formattedSentence}"
                                      </span>
                                      <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-neutral-100">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            if (onAddSentenceToDraft) {
                                              onAddSentenceToDraft(
                                                formattedSentence,
                                                q.category === 'callToAction' ? 'callToAction' : 'body'
                                              );
                                              setAddedSentenceIds((prev) => new Set(prev).add(itemKey));
                                            }
                                          }}
                                          disabled={isAdded}
                                          className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 transition-colors ${
                                            isAdded
                                              ? 'bg-emerald-100 text-emerald-800 cursor-default'
                                              : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 shadow-2xs'
                                          }`}
                                          title="Add this sentence to your draft without removing any existing sentences"
                                        >
                                          {isAdded ? (
                                            <>
                                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                              <span>Added to Draft</span>
                                            </>
                                          ) : (
                                            <>
                                              <Plus className="w-3 h-3" />
                                              <span>+ Add Sentence</span>
                                            </>
                                          )}
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() => handleAnswerQuestion(q, sugg)}
                                          className="px-2 py-0.5 rounded text-[10px] font-medium text-neutral-600 hover:text-amber-900 hover:bg-neutral-100 flex items-center gap-1 transition-colors"
                                          title="Send this response to agent to question further"
                                        >
                                          <span>Answer Agent</span>
                                          <ArrowRight className="w-2.5 h-2.5" />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Custom Answer Input Field with option to add directly or send to agent */}
                          {!isAnswered && (
                            <div className="mt-2 space-y-1.5">
                              <div className="flex gap-1.5">
                                <input
                                  type="text"
                                  value={userAnswers[q.id] || ''}
                                  onChange={(e) =>
                                    setUserAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleAnswerQuestion(q);
                                    }
                                  }}
                                  placeholder="Type your specific answer..."
                                  className="flex-1 px-2.5 py-1 text-xs bg-white border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-700"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleAnswerQuestion(q)}
                                  disabled={!userAnswers[q.id]?.trim()}
                                  className="px-2.5 py-1 bg-amber-800 hover:bg-amber-900 disabled:opacity-40 text-white rounded text-xs font-medium transition-colors shrink-0"
                                >
                                  Send
                                </button>
                              </div>
                              {userAnswers[q.id]?.trim() && (
                                <div className="flex justify-end">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const sentence = formatSuggestedSentence(userAnswers[q.id] || '', q.category);
                                      if (onAddSentenceToDraft) {
                                        onAddSentenceToDraft(
                                          sentence,
                                          q.category === 'callToAction' ? 'callToAction' : 'body'
                                        );
                                        setUserAnswers((prev) => ({ ...prev, [q.id]: '' }));
                                        setAnsweredQuestionIds((prev) => new Set(prev).add(q.id));
                                      }
                                    }}
                                    className="text-[10px] text-amber-800 hover:text-amber-950 font-semibold flex items-center gap-1 hover:underline"
                                  >
                                    <Plus className="w-3 h-3" />
                                    <span>+ Add this answer directly as a sentence to draft</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Formulated Sentences Ready to Add to Draft */}
                {msg.formulatedSentences && msg.formulatedSentences.length > 0 && (
                  <div className="mt-3 p-3 bg-amber-50/90 rounded-lg border border-amber-200 text-neutral-900 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-amber-900 pb-1 border-b border-amber-200/80">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                        <span>Formulated Sentences</span>
                      </div>
                      <span className="text-[10px] text-amber-700 font-normal">Add without deleting text</span>
                    </div>

                    <div className="space-y-2">
                      {msg.formulatedSentences.map((fs, fIdx) => {
                        const fsKey = `fs_${msg.id}_${fIdx}`;
                        const isAdded = addedSentenceIds.has(fsKey);
                        return (
                          <div
                            key={fIdx}
                            className="p-2.5 bg-white rounded border border-amber-200/80 shadow-2xs space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                                {fs.section === 'callToAction'
                                  ? 'Closing / CTA'
                                  : fs.section === 'opening'
                                  ? 'Opening Statement'
                                  : 'Evidentiary Body'}
                              </span>
                              {fs.explanation && (
                                <span
                                  className="text-[10px] text-neutral-500 italic max-w-[180px] truncate"
                                  title={fs.explanation}
                                >
                                  {fs.explanation}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-neutral-900 font-serif leading-relaxed italic">
                              "{fs.sentence}"
                            </p>
                            <div className="flex justify-end pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  if (onAddSentenceToDraft) {
                                    onAddSentenceToDraft(fs.sentence, fs.section);
                                    setAddedSentenceIds((prev) => new Set(prev).add(fsKey));
                                  }
                                }}
                                disabled={isAdded}
                                className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                                  isAdded
                                    ? 'bg-emerald-100 text-emerald-800 cursor-default'
                                    : 'bg-amber-800 hover:bg-amber-900 text-white shadow-2xs'
                                }`}
                              >
                                {isAdded ? (
                                  <>
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Added to Draft!</span>
                                  </>
                                ) : (
                                  <>
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>+ Add Sentence to Draft</span>
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

                {/* Proposed Full Revision with Append (Default) or Explicit Replace */}
                {msg.proposedLetter && (
                  <div className="mt-3 p-3 bg-neutral-50 rounded-lg border border-neutral-300 text-neutral-900 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-neutral-900">
                        <FileCheck className="w-3.5 h-3.5 text-amber-700" />
                        <span>Synthesized Draft Update</span>
                      </div>
                      <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100 px-1.5 py-0.5 rounded">
                        Zero Deletions by Default
                      </span>
                    </div>

                    <p className="text-[11px] text-neutral-600 leading-relaxed">
                      The agent formulated formal executive sentences from your answers. You can add them directly to your draft while keeping all your previous sentences intact.
                    </p>

                    {/* Primary Safe Action: Add New Sentences (Keeping previous sentences) */}
                    <button
                      type="button"
                      onClick={() =>
                        onApplyUpdatedLetter(
                          msg.proposedLetter as GeneratedLetter,
                          msg.editorialNotes,
                          'append'
                        )
                      }
                      className="w-full py-2 bg-amber-800 hover:bg-amber-900 text-white rounded text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add New Sentences (Keep All Previous Writing)</span>
                    </button>

                    {/* Secondary Action: Replace Draft with explicit prompt */}
                    {confirmReplaceMsgId !== msg.id ? (
                      <div className="flex justify-center pt-0.5">
                        <button
                          type="button"
                          onClick={() => setConfirmReplaceMsgId(msg.id)}
                          className="text-[10px] text-neutral-500 hover:text-neutral-800 underline transition-colors"
                        >
                          Prompt to replace entire draft instead...
                        </button>
                      </div>
                    ) : (
                      <div className="p-2.5 bg-amber-50 rounded border border-amber-300 text-neutral-800 space-y-2 mt-2">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                          <p className="text-[11px] leading-snug">
                            <strong>Confirm replacement:</strong> This will replace your current draft with the agent's synthesized version. The agent will never remove your sentences unless you choose to replace them.
                          </p>
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setConfirmReplaceMsgId(null)}
                            className="px-2 py-1 text-[11px] text-neutral-600 hover:bg-neutral-200 rounded"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              onApplyUpdatedLetter(
                                msg.proposedLetter as GeneratedLetter,
                                msg.editorialNotes,
                                'replace'
                              );
                              setConfirmReplaceMsgId(null);
                            }}
                            className="px-2.5 py-1 text-[11px] bg-red-700 hover:bg-red-800 text-white rounded font-medium shadow-2xs"
                          >
                            Confirm Replace Draft
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-neutral-500 p-2 bg-white rounded-lg border border-neutral-200 animate-pulse">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-700" />
              <span>Letter Agent is analyzing your writing and probing claims...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}

      {/* 4. Bottom Input Bar to converse with the agent */}
      <form onSubmit={handleSendMessage} className="p-2.5 bg-white border-t border-neutral-200">
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask or answer the agent..."
            className="flex-1 px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700 bg-neutral-50"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="p-2 bg-amber-800 hover:bg-amber-900 disabled:opacity-40 text-white rounded-lg transition-colors shrink-0 shadow-2xs"
            title="Send to Letter Agent"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-[10px] text-neutral-400 mt-1 px-1">
          Example: <em>"Why do you think my opening is weak?"</em> or <em>"Interview me to write this from scratch"</em>
        </p>
      </form>
    </aside>
  );
}
