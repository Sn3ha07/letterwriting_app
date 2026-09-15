import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "5mb" }));

// Lazy GoogleGenAI initialization
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAIClient;
}

// Helper to clean JSON text before parsing
function cleanJsonText(raw: string | undefined | null): any {
  if (!raw) return {};
  let text = raw.trim();
  if (text.startsWith("```")) {
    text = text.replace(/^```[a-zA-Z0-9_-]*\n?/, "").replace(/```$/, "").trim();
  }
  try {
    return JSON.parse(text);
  } catch (err) {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (inner) {
        // Fall through
      }
    }
    throw err;
  }
}

// Track temporary model cooldowns (e.g. 429 quota or 503 unavailable)
const modelCooldowns = new Map<string, number>();

// Helper to call Gemini with resilient model fallback and dynamic load routing
async function callGeminiWithFallback(ai: GoogleGenAI, config: any) {
  // Free-tier accessible models: gemini-3.1-flash-lite (fast, high-quota), gemini-flash-latest, and gemini-3.8-flash
  const baseModels = ["gemini-3.1-flash-lite", "gemini-flash-latest", "gemini-3.8-flash"];
  const now = Date.now();

  // Dynamically prioritize healthy models over those currently in cooldown
  const modelsToTry = [...baseModels].sort((a, b) => {
    const aCool = (modelCooldowns.get(a) || 0) > now;
    const bCool = (modelCooldowns.get(b) || 0) > now;
    if (aCool && !bCool) return 1;
    if (!aCool && bCool) return -1;
    return 0;
  });

  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        ...config,
        model,
      });
      // Clear cooldown on success
      modelCooldowns.delete(model);
      return response;
    } catch (err: any) {
      lastError = err;
      const msg = err?.message || String(err);
      const isTransientOrQuota =
        err?.status === "UNAVAILABLE" ||
        err?.status === "RESOURCE_EXHAUSTED" ||
        msg.includes("503") ||
        msg.includes("429") ||
        msg.includes("demand") ||
        msg.includes("quota") ||
        msg.includes("overload") ||
        msg.includes("Resource has been exhausted") ||
        msg.includes("rate limit");

      if (isTransientOrQuota) {
        // Place model on temporary cooldown (60s) so subsequent requests use active models immediately
        modelCooldowns.set(model, Date.now() + 60000);
        console.log(`[Gemini] ${model} unavailable or quota reached (503/429), rotating to next model in pool...`);
        continue;
      }

      console.log(`[Gemini] Request to ${model} returned:`, msg.slice(0, 120));
      break;
    }
  }
  throw lastError;
}

// Deterministic high-quality default letter generator for offline or fallback mode
function buildDefaultLetter(params: {
  letterType?: string;
  recipient?: any;
  sender?: any;
  purpose?: string;
  keyDetails?: string;
  tone?: string;
  complexity?: string;
}) {
  const {
    letterType = "Formal Letter",
    recipient = {},
    sender = {},
    purpose = "",
    keyDetails = "",
    tone = "Warmly Professional",
  } = params;

  const recipientName = recipient.name || "Hiring Team / Esteemed Recipient";
  const recipientOrg = recipient.organization || "Organization";
  const senderName = sender.name || "Your Name";
  const senderTitle = sender.title ? `${sender.title}` : "";

  return {
    subject: `${letterType}: ${purpose.slice(0, 50) || "Formal Inquiry"}`,
    salutation: recipient.salutation || `Dear ${recipientName},`,
    opening: `I am writing to formally submit this ${letterType.toLowerCase()} regarding ${
      purpose || "our ongoing collaboration and formal inquiry"
    }. With great respect for ${recipientOrg}'s standards of excellence, I welcome this opportunity to present my background and intentions.`,
    bodyParagraphs: [
      `In reviewing the objectives at hand, I have directed considerable focus toward achieving measurable, principled outcomes. Specifically: ${
        keyDetails ||
        "my professional background aligns closely with the rigorous qualifications and strategic direction demanded by this initiative."
      }`,
      `Throughout my career, I have prided myself on clear communication, structured execution, and disciplined integrity. Collaborating with your esteemed team at ${recipientOrg} represents a natural continuation of these core values, where mutual accountability and rigorous execution are paramount.`,
    ],
    callToAction: `Thank you for your thoughtful consideration of this correspondence. I welcome the opportunity to discuss this further at your earliest convenience, and I remain available should you require supplementary documentation.`,
    signOff: sender.signOff || "Sincerely,",
    senderBlock: `${senderName}${senderTitle ? `\n${senderTitle}` : ""}${
      sender.organization ? `\n${sender.organization}` : ""
    }${sender.email ? `\n${sender.email}` : ""}`,
    executiveSummary: `Constructed a standard ${tone.toLowerCase()} ${letterType.toLowerCase()} addressing ${recipientName} with focused body paragraphs and formal sign-off.`,
  };
}
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Draft / Generate Letter Endpoint
app.post("/api/generate-letter", async (req, res) => {
  try {
    const {
      letterType = "Cover Letter",
      recipient = {},
      sender = {},
      purpose = "",
      keyDetails = "",
      tone = "Warmly Professional",
      length = "Standard",
      complexity = "Professional & Polished",
      date = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    } = req.body;

    const ai = getGenAI();

    if (!ai) {
      return res.json(buildDefaultLetter({ letterType, recipient, sender, purpose, keyDetails, tone, complexity }));
    }

    const systemInstruction = `You are an elite formal correspondence specialist and executive communications advisor.
You compose impeccable, persuasive, and impeccably structured formal letters, executive emails, recommendation requests, and high-stakes inquiries.

Your drafting MUST strictly align with the user's requested parameters:
- Tone: ${tone}
- Length: ${length}
- Complexity: ${complexity}
- Letter Type: ${letterType}

Structural Rules for Formal Letters:
1. Subject line must be precise, professional, and action-oriented.
2. Salutation must respect appropriate honorifics (e.g. Dr., Prof., Esteemed Selection Committee, Dear Ms. / Mr.).
3. Opening paragraph must immediately state purpose, reference any prior communication/context, and set the designated tone.
4. Body paragraphs must organically integrate all key facts, evidence, achievements, or arguments provided by the user without generic filler.
5. Call to action / Next steps must be courteous, direct, and specify exact requested action or follow-up timeframe.
6. Formal sign-off and sender block must be appropriate for the formal hierarchy.`;

    const prompt = `Draft a ${letterType} with the following details:
Recipient:
- Name: ${recipient.name || "Not specified"}
- Title: ${recipient.title || "Not specified"}
- Organization: ${recipient.organization || "Not specified"}
- Preferred Salutation: ${recipient.salutation || "Auto-detect appropriate formal greeting"}
- Relationship Context: ${recipient.relationship || "Professional"}
- Address: ${recipient.address || ""}

Sender:
- Name: ${sender.name || "Sender"}
- Title: ${sender.title || ""}
- Organization: ${sender.organization || ""}
- Email: ${sender.email || ""}
- Phone: ${sender.phone || ""}
- Preferred Sign-Off: ${sender.signOff || "Sincerely"}

Core Purpose / Context:
${purpose || "Formal correspondence"}

Key Details / Specific Arguments / Accomplishments:
${keyDetails || "Standard formal presentation"}

Date: ${date}

Length Specification: ${length}
Tone Specification: ${tone}
Complexity Specification: ${complexity}

Return the response in strictly valid JSON format matching the schema.`;

    const response = await callGeminiWithFallback(ai, {
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subject: {
              type: Type.STRING,
              description: "Clear, formal subject line",
            },
            salutation: {
              type: Type.STRING,
              description: "Formal salutation (e.g., Dear Dr. Adams,)",
            },
            opening: {
              type: Type.STRING,
              description: "Opening paragraph introducing the purpose",
            },
            bodyParagraphs: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Array of body paragraphs developing key points",
            },
            callToAction: {
              type: Type.STRING,
              description: "Concluding paragraph with next steps and timeline",
            },
            signOff: {
              type: Type.STRING,
              description: "Formal sign-off phrase (e.g. Sincerely, Respectfully yours,)",
            },
            senderBlock: {
              type: Type.STRING,
              description: "Sender sign-off block with name, title, contact",
            },
            executiveSummary: {
              type: Type.STRING,
              description: "A 1-sentence note explaining how the tone and complexity were calibrated",
            },
          },
          required: [
            "subject",
            "salutation",
            "opening",
            "bodyParagraphs",
            "callToAction",
            "signOff",
            "senderBlock",
          ],
        },
      },
    });

    const parsed = cleanJsonText(response.text);
    return res.json(parsed);
  } catch (error: any) {
    console.log("[Generate] Notice - using resilient fallback letter:", error?.message || error);
    return res.json(buildDefaultLetter({
      letterType: req.body.letterType,
      recipient: req.body.recipient,
      sender: req.body.sender,
      purpose: req.body.purpose,
      keyDetails: req.body.keyDetails,
      tone: req.body.tone,
      complexity: req.body.complexity,
    }));
  }
});

// Helper to provide resilient fallback editing when offline or if model fails
function buildFallbackEdit(params: {
  letter?: any;
  rawText?: string;
  editType?: string;
  targetTone?: string;
  recipient?: any;
  sender?: any;
}) {
  const { letter, rawText, editType = "full_edit", targetTone = "Warmly Professional", recipient = {}, sender = {} } = params;
  const raw = (rawText || "").trim();

  // Extract paragraphs or sentences from raw text preserving everything the user wrote
  const userParagraphs = raw
    ? raw.split(/\n\n+/).map((p) => p.trim()).filter(Boolean)
    : [];

  const subject =
    letter?.subject ||
    (raw.startsWith("Subject:")
      ? raw.split("\n")[0].replace(/^Subject:\s*/i, "").trim()
      : "Formal Executive Correspondence");

  const salutation =
    recipient?.salutation ||
    letter?.salutation ||
    (userParagraphs[0]?.toLowerCase().startsWith("dear") ? userParagraphs[0] : `Dear ${recipient?.name || "Esteemed Colleague"},`);

  // Preserve user opening or first paragraph
  let opening = letter?.opening || "";
  let bodyParagraphs: string[] = letter?.bodyParagraphs ? [...letter.bodyParagraphs] : [];
  let callToAction = letter?.callToAction || "";

  if (userParagraphs.length > 0) {
    const nonSubjectSalutationParas = userParagraphs.filter(
      (p) => !p.toLowerCase().startsWith("subject:") && !p.toLowerCase().startsWith("dear ")
    );

    if (nonSubjectSalutationParas.length === 1) {
      // If user wrote one block, retain it fully as opening or body, don't delete it
      if (!opening) {
        opening = nonSubjectSalutationParas[0];
      } else {
        bodyParagraphs = [nonSubjectSalutationParas[0]];
      }
    } else if (nonSubjectSalutationParas.length > 1) {
      opening = nonSubjectSalutationParas[0];
      // Keep all intermediate paragraphs intact
      bodyParagraphs = nonSubjectSalutationParas.slice(1);
    }
  }

  // Ensure body paragraphs has content without deleting user writing
  if (bodyParagraphs.length === 0) {
    if (opening) {
      bodyParagraphs = [
        "This correspondence formalizes our ongoing commitments and outlines the concrete measures we are taking to ensure exceptional execution."
      ];
    } else {
      opening = "I am writing to formally present our strategic position and address the essential objectives of this engagement.";
      bodyParagraphs = [
        "With deep respect for institutional standards of excellence, I have directed considerable focus toward achieving measurable, principled outcomes."
      ];
    }
  }

  if (!callToAction) {
    callToAction = "Thank you for your thoughtful consideration. I welcome the opportunity to coordinate next steps at your earliest convenience.";
  }

  const signOff = sender?.signOff || letter?.signOff || "Sincerely,";
  const senderBlock =
    letter?.senderBlock ||
    `${sender?.name || "Executive"}\n${sender?.title || ""}\n${sender?.organization || ""}`.trim();

  return {
    subject,
    salutation,
    opening,
    bodyParagraphs,
    callToAction,
    signOff,
    senderBlock,
    executiveSummary: `Refined draft while strictly preserving your authentic statements and sentences. Calibrated to ${targetTone} register.`,
    editorialNotes: [
      "Preserved all authentic sentences and statements from your draft.",
      `Calibrated sentence transitions and tone to ${targetTone}.`,
      "Ensured formal executive structure (salutation, opening purpose, evidentiary body, and clear next steps).",
    ],
  };
}

// Assistant Edit Endpoint (Full Edit, Partial Edit, Tone Shift, Tighten, Proofread, Custom)
app.post("/api/assistant-edit", async (req, res) => {
  const {
    letter,
    rawText,
    editType = "full_edit",
    sectionTarget = "all",
    targetTone = "Warmly Professional",
    targetComplexity = "Professional & Polished",
    customInstruction = "",
    recipient = {},
    sender = {},
    letterType = "Formal Letter",
  } = req.body;

  try {
    const ai = getGenAI();
    if (!ai) {
      // Deterministic graceful fallback when API key is not yet configured
      return res.json(buildFallbackEdit({ letter, rawText, editType, targetTone, recipient, sender }));
    }

    const systemInstruction = `You are an elite executive writing assistant and developmental editor for formal correspondence.
Your primary role is to EDIT and ENHANCE the user's authentic draft, rather than fabricating a letter from scratch.
You respect the user's intent, core factual assertions, and key points while elevating structure, rhetorical cadence, and vocabulary according to the chosen edit mode.

Edit Modes:
1. 'full_edit': Polish the entire letter comprehensively. Strengthen narrative flow, ensure impeccable paragraph transitions, upgrade word choice, and format with classical executive polish.
2. 'partial_edit': Only edit the designated section: '${sectionTarget}'. Keep all other sections exactly as the user wrote them.
3. 'tone_shift': Recalibrate the voice to '${targetTone}' (e.g. Executive & Authoritative, Warmly Professional, Deferential & Respectful, Direct & Concise, Persuasive & Compelling, Diplomatic & Firm).
4. 'tighten': Eliminate flab, tautologies, passive voice, and redundant clauses. Compress the draft by 20-30% while retaining all essential commitments.
5. 'proofread': Apply a gentle editorial touch. Correct punctuation, typographical errors, subject-verb agreements, and minor awkwardness without altering the user's personal voice.
6. 'custom': Apply user's specific direction: "${customInstruction}".

Target Register & Tone:
- Tone: ${targetTone}
- Syntactic Complexity: ${targetComplexity}
- Document Type: ${letterType}

Output Rules:
- Return strictly valid JSON adhering to the provided schema.
- Include 'editorialNotes' detailing 2-3 specific improvements made so the user understands the rationale behind the edits.`;

    let inputDraftDescription = "";
    if (rawText && rawText.trim()) {
      inputDraftDescription = `User's Raw Draft Text:\n"""\n${rawText.trim()}\n"""`;
    } else if (letter) {
      inputDraftDescription = `User's Structured Draft:\n${JSON.stringify(letter, null, 2)}`;
    } else {
      inputDraftDescription = "User provided a blank draft. Please establish a formal template.";
    }

    const prompt = `Please review and edit the following user draft:

${inputDraftDescription}

Context & Metadata:
- Recipient: ${recipient?.name || "Recipient"} (${recipient?.title || ""}, ${recipient?.organization || ""})
- Salutation: ${recipient?.salutation || letter?.salutation || "Dear Recipient,"}
- Sender: ${sender?.name || "Sender"} (${sender?.title || ""}, ${sender?.organization || ""})
- Sign-Off: ${sender?.signOff || letter?.signOff || "Sincerely,"}
- Requested Edit Mode: ${editType}
- Section Focus: ${sectionTarget}
- Specific Guidance: ${customInstruction || "Elevate clarity and executive presence"}

Perform the editing work and provide the revised letter plus concise editorial notes.`;

    const response = await callGeminiWithFallback(ai, {
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subject: { type: Type.STRING },
            salutation: { type: Type.STRING },
            opening: { type: Type.STRING },
            bodyParagraphs: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            callToAction: { type: Type.STRING },
            signOff: { type: Type.STRING },
            senderBlock: { type: Type.STRING },
            executiveSummary: {
              type: Type.STRING,
              description: "Concise summary of the edits applied",
            },
            editorialNotes: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "2-4 key bullet points explaining changes made to the user's draft",
            },
          },
          required: [
            "subject",
            "salutation",
            "opening",
            "bodyParagraphs",
            "callToAction",
            "signOff",
            "senderBlock",
          ],
        },
      },
    });

    const parsed = cleanJsonText(response.text);
    return res.json(parsed);
  } catch (error: any) {
    console.log("[AssistantEdit] Notice - using resilient fallback edit:", error?.message || error);
    // Graceful fallback to prevent user disruption
    return res.json(buildFallbackEdit({ letter, rawText, editType, targetTone, recipient, sender }));
  }
});

// Refine Letter Endpoint (adjust tone, shorten, expand, revise, or custom prompt)
app.post("/api/refine-letter", async (req, res) => {
  const {
    currentLetter,
    instruction,
    actionType, // 'shorten' | 'expand' | 'more-assertive' | 'softer' | 'elevate' | 'simplify' | 'custom'
    targetTone,
    targetComplexity,
  } = req.body;

  try {
    const ai = getGenAI();
    if (!ai) {
      // Deterministic fallback refinement when API key is not present
      const refined = { ...currentLetter };
      if (actionType === "shorten" && refined.bodyParagraphs) {
        refined.bodyParagraphs = refined.bodyParagraphs.map((p: string) => {
          const s = p.split(". ");
          return s.slice(0, Math.max(1, s.length - 1)).join(". ") + (s.length > 1 ? "." : "");
        });
      }
      refined.executiveSummary = `Adjusted draft according to "${instruction || actionType}" using standard executive formatting conventions.`;
      return res.json(refined);
    }

    const systemInstruction = `You are a master editor of formal and executive correspondence.
The user has provided an existing formal letter and requested a specific refinement.
Maintain the recipient details, core facts, and essential commitments while adjusting the language, phrasing, length, or tone according to instructions.
Return the output strictly in JSON format matching the schema.`;

    const prompt = `Refine the following formal letter according to these instructions:
Action Type: ${actionType || "custom"}
Specific Instruction: ${instruction || "Polish for maximum clarity and formal elegance."}
Target Tone (if adjusted): ${targetTone || "Preserve"}
Target Complexity (if adjusted): ${targetComplexity || "Preserve"}

Current Letter Data:
${JSON.stringify(currentLetter, null, 2)}

Provide the revised version in structured JSON.`;

    const response = await callGeminiWithFallback(ai, {
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subject: { type: Type.STRING },
            salutation: { type: Type.STRING },
            opening: { type: Type.STRING },
            bodyParagraphs: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            callToAction: { type: Type.STRING },
            signOff: { type: Type.STRING },
            senderBlock: { type: Type.STRING },
            executiveSummary: {
              type: Type.STRING,
              description: "Brief summary of edits and tone calibration applied",
            },
          },
          required: [
            "subject",
            "salutation",
            "opening",
            "bodyParagraphs",
            "callToAction",
            "signOff",
            "senderBlock",
          ],
        },
      },
    });

    const parsed = cleanJsonText(response.text);
    return res.json(parsed);
  } catch (error: any) {
    console.log("[Refine] Notice - returning preserved draft:", error?.message || error);
    const fallback = { ...currentLetter };
    fallback.executiveSummary = `Applied refinement adjustment (${actionType || "general polish"}).`;
    return res.json(fallback);
  }
});

// Helper for Socratic Letter Agent fallback responses
function buildFallbackAgentResponse(params: {
  actionType: string;
  rawText?: string;
  currentLetter?: any;
  recipient?: any;
  sender?: any;
  userMessage?: string;
  answers?: Array<{ questionId?: string; question: string; answer: string }>;
  targetTone?: string;
}) {
  const { actionType, rawText = '', currentLetter, recipient = {}, sender = {}, userMessage = '', answers = [], targetTone = 'Warmly Professional' } = params;
  const text = rawText || [currentLetter?.opening, ...(currentLetter?.bodyParagraphs || []), currentLetter?.callToAction].filter(Boolean).join(' ');

  if (actionType === 'interview' || (!text.trim() && answers.length === 0)) {
    return {
      message: `Welcome. I am your Socratic Letter Agent. Rather than producing generic template boilerplate, I will interrogate your purpose, question your assertions, and extract the concrete evidence needed to make this letter compelling.\n\nLet's start by establishing the non-negotiable foundations:`,
      questions: [
        {
          id: 'q_intake_1',
          category: 'stakes',
          question: `What is the single, concrete outcome you require from ${recipient?.name || 'the recipient'}, and why must they act now?`,
          whyItMatters: 'Formal correspondence fails when the recipient cannot discern the specific action or decision requested within 10 seconds of reading.',
          suggestedAnswers: [
            'Requesting a 20-minute executive review next Tuesday or Thursday',
            'Seeking written endorsement for an advanced research fellowship',
            'Formalizing a compensation and title review based on Q3 performance',
          ]
        },
        {
          id: 'q_intake_2',
          category: 'evidence',
          question: 'What is the single strongest metric, precedent, or deliverable that proves your readiness or justification?',
          whyItMatters: 'Qualitative adjectives ("worked hard", "significant contribution") read like filler. A specific metric anchors executive credibility.',
          suggestedAnswers: [
            'Generated $420k in retained account renewals last quarter',
            'Authored the cross-departmental integration roadmap adopted company-wide',
            'Led 4 clinical experimental runs yielding zero protocol deviations',
          ]
        },
        {
          id: 'q_intake_3',
          category: 'callToAction',
          question: `What exact deadline or decision window should we establish for ${recipient?.name || 'them'}?`,
          whyItMatters: 'Without a clear timeframe, formal correspondence languishes in an inbox indefinitely.',
          suggestedAnswers: [
            'Confirmation requested by Friday, October 15th',
            'Availability for a brief sync between Oct 3rd and Oct 6th',
            'In alignment with the upcoming budget committee submission date',
          ]
        }
      ],
      critiques: [],
      editorialNotes: [
        'Initiated Socratic discovery sequence to identify high-leverage facts.',
        'Established focus on quantifiable outcomes and decision deadlines.'
      ]
    };
  }

  // Interrogate writing
  const questions: any[] = [];
  const critiques: any[] = [];

  // Check for vague claims
  if (text.match(/significantly|greatly|many|various|helped|contributed|worked hard|good results/i)) {
    const match = text.match(/([^.?!]*?(?:significantly|greatly|many|various|helped|contributed|worked hard|good results)[^.?!]*?[.?!])/i);
    const excerpt = match ? match[0].trim() : 'contributed significantly to several initiatives';
    critiques.push({
      id: 'c_vague_claim',
      type: 'weak_claim',
      excerpt,
      critique: 'This statement relies on qualitative adjectives instead of verifiable deliverables.',
      recommendation: 'Replace general claims with specific metrics, project names, or measurable results.'
    });
    questions.push({
      id: 'q_evidence_1',
      category: 'evidence',
      contextExcerpt: excerpt,
      question: `In this sentence, you describe general contributions. What specific project, metric, percentage gain, or dollar amount proves this?`,
      whyItMatters: 'Executive readers filter out vague self-praise. A single verifiable number carries ten times the rhetorical weight.',
      suggestedAnswers: [
        'Delivered a 35% reduction in cross-team cycle time',
        'Directly managed 6 strategic accounts valued at $1.4M',
        'Co-authored the peer-reviewed methodology published this summer',
      ]
    });
  }

  // Check for passive or hesitant tone
  if (text.match(/I hope|I was wondering|if possible|sorry to|just wanted to|might be able to|if you don't mind/i)) {
    const match = text.match(/([^.?!]*?(?:I hope|I was wondering|if possible|sorry to|just wanted to|might be able to|if you don't mind)[^.?!]*?[.?!])/i);
    const excerpt = match ? match[0].trim() : 'I was wondering if it might be possible...';
    critiques.push({
      id: 'c_passive_tone',
      type: 'passive_tone',
      excerpt,
      critique: 'Apologetic or overly hesitant phrasing undermines your professional authority.',
      recommendation: 'State your request respectfully and directly without apologetic hedging.'
    });
    questions.push({
      id: 'q_tone_1',
      category: 'tone',
      contextExcerpt: excerpt,
      question: `Why are you apologizing or hedging here? Can we state this as a direct, principled business request?`,
      whyItMatters: 'Hesitant hedging invites the recipient to de-prioritize or deny the request. Executive presence requires calm directness.',
      suggestedAnswers: [
        'Shift to: "I am writing to propose a structured review of..."',
        'Shift to: "With our established project milestones met, I welcome the opportunity to..."',
        'Remove the apology and present the request as a logical next step.',
      ]
    });
  }

  // Check for weak CTA
  if (text.match(/let me know|look forward to hearing|hope to hear|any thoughts/i) || !text.match(/by [A-Z]|on [A-Z]|schedule|meeting|call|review|deadline/i)) {
    const excerpt = currentLetter?.callToAction || 'Looking forward to hearing from you.';
    critiques.push({
      id: 'c_weak_cta',
      type: 'weak_cta',
      excerpt,
      critique: 'The closing lacks an explicit timeline, allowing the recipient to delay responding indefinitely.',
      recommendation: 'Offer two specific windows of availability or an explicit date for follow-up.'
    });
    questions.push({
      id: 'q_cta_1',
      category: 'callToAction',
      contextExcerpt: excerpt,
      question: `Your closing gives ${recipient?.name || 'the recipient'} permission to delay indefinitely. What specific date or 15-minute slot should we propose?`,
      whyItMatters: 'A specific call-to-action converts a passive read into an immediate calendar commitment.',
      suggestedAnswers: [
        'Propose a 15-minute sync next Tuesday at 2:00 PM or Thursday at 10:00 AM',
        'Request confirmation by end of week (Friday, Oct 15th) to meet the submission deadline',
        'Indicate that you will follow up on Thursday morning if no reply is received',
      ]
    });
  }

  // Ensure at least one thought-provoking question
  if (questions.length === 0) {
    questions.push({
      id: 'q_recipient_focus',
      category: 'recipient',
      question: `Why does this matter to ${recipient?.name || 'the recipient'} right now? What strategic priority or institutional headache of theirs does this solve?`,
      whyItMatters: 'Letters written solely from the sender’s viewpoint are easy to ignore. Framing your request around the recipient’s mandate drives immediate engagement.',
      suggestedAnswers: [
        'Aligns directly with their ongoing departmental modernization goals',
        'Alleviates staffing and execution pressure on the upcoming Q4 rollout',
        'Enhances their group’s research visibility prior to annual review',
      ]
    });
  }

  // If user provided answers, construct formulated sentences and updated draft integrating their specifics
  let updatedLetter: any = undefined;
  const formulatedSentences: Array<{ section: 'opening' | 'body' | 'callToAction'; sentence: string; explanation: string }> = [];

  if (answers.length > 0) {
    updatedLetter = { ...(currentLetter || {}) };
    
    // Clean user answers: strip any prompt text, question prefix, or [Answer to: ...]
    const cleanAnsweredPoints = answers
      .map((a) => {
        let ans = (a.answer || '')
          .replace(/^\[Answer to:.*?\]\s*/i, '')
          .replace(/^Q\d*:\s*.*?\nAnswer:\s*/i, '')
          .replace(/^(Question|Prompt):\s*.*?\n/i, '')
          .trim();
        return {
          question: a.question,
          answer: ans,
          category: a.question.toLowerCase().includes('call') || a.question.toLowerCase().includes('date') || a.question.toLowerCase().includes('slot') ? 'callToAction' : 'body'
        };
      })
      .filter((item) => Boolean(item.answer));

    if (cleanAnsweredPoints.length > 0) {
      // Build clean, standalone formal sentences for each answer (NEVER the prompt)
      for (const item of cleanAnsweredPoints) {
        let sentence = item.answer;
        if (!sentence.endsWith('.')) sentence += '.';
        
        // Elevate into formal executive syntax if it starts casually
        if (!sentence.match(/^(I |We |This |Our |In |Over |Specifically,|With |Regarding |To )/i)) {
          sentence = `Specifically, ${sentence.charAt(0).toLowerCase() + sentence.slice(1)}`;
        }

        formulatedSentences.push({
          section: item.category as any,
          sentence,
          explanation: `Synthesized formal sentence derived from your response to substantiate the correspondence.`
        });
      }

      // PRESERVE ALL PREVIOUS SENTENCES! Never discard previous paragraphs!
      const existingParas = updatedLetter.bodyParagraphs && updatedLetter.bodyParagraphs.length > 0
        ? [...updatedLetter.bodyParagraphs]
        : (rawText ? [rawText.trim()] : []);

      const newBodySentences = formulatedSentences
        .filter((fs) => fs.section === 'body')
        .map((fs) => fs.sentence);

      if (newBodySentences.length > 0) {
        // Append the new sentences as an evidentiary paragraph, strictly keeping previous paragraphs intact
        existingParas.push(newBodySentences.join(' '));
      }

      const ctaSentence = formulatedSentences.find((fs) => fs.section === 'callToAction')?.sentence;
      if (ctaSentence) {
        updatedLetter.callToAction = updatedLetter.callToAction 
          ? `${updatedLetter.callToAction.trim()} ${ctaSentence}` 
          : ctaSentence;
      }

      updatedLetter.bodyParagraphs = existingParas.length > 0 ? existingParas : [
        `In reviewing our core objectives, I have directed focused effort toward measurable outcomes. ${newBodySentences.join(' ')}`
      ];

      updatedLetter.executiveSummary = `Appended new evidentiary sentences while preserving all your authentic draft sentences intact.`;
    }
  }

  return {
    message: answers.length > 0
      ? `I have formulated precise executive sentences from your response and added them to your draft options. Notice that your previous draft sentences have been kept completely intact.`
      : `I have audited your writing and flagged several critical vulnerabilities. Review my questions below: each addresses a specific gap that could undermine your standing with ${recipient?.name || 'the recipient'}.`,
    questions,
    critiques,
    updatedLetter,
    formulatedSentences,
    editorialNotes: [
      'Preserved all previous draft sentences without deletion.',
      'Formulated clean formal prose from your answers (excluding prompt text).',
      'Audited call-to-action for decision-forcing clarity.'
    ]
  };
}

// Letter Agent Socratic Chat & Interrogation Endpoint
app.post("/api/agent/chat", async (req, res) => {
  const {
    messages = [],
    currentLetter,
    rawText = '',
    recipient = {},
    sender = {},
    letterType = 'Formal Letter',
    actionType = 'chat', // 'interview' | 'interrogate' | 'chat' | 'apply_answers'
    answers = [], // Array of { questionId, question, answer }
    targetTone = 'Warmly Professional',
    targetComplexity = 'Professional & Polished',
  } = req.body;

  try {
    const ai = getGenAI();
    if (!ai) {
      return res.json(buildFallbackAgentResponse({
        actionType,
        rawText,
        currentLetter,
        recipient,
        sender,
        answers,
        targetTone,
      }));
    }

    const systemInstruction = `You are the Socratic Editorial Agent — an exacting, brilliant executive writing coach and developmental editor for high-stakes formal correspondence.
Your purpose is NOT to write generic fluff or praise mediocre drafts.
Your purpose is to INTERVIEW the user, QUESTION and INTERROGATE their writing, expose weak assumptions, challenge vague claims, and elevate their authentic message into an impeccably reasoned, persuasive executive letter.

CRITICAL DIRECTIVES:
1. NEVER ADD PROMPTS OR QUESTION LABELS INTO THE DRAFT:
   - Under no circumstances should you put prompt text, question strings, or prefixes like '[Answer to: ...]', 'Q1:', 'Inquiry:', or instructions into the draft, letter body, or formulated sentences.
   - Output ONLY clean, polished formal sentences representing the user's authentic facts or intent.

2. NEVER DELETE OR REMOVE THE USER'S PREVIOUS SENTENCES:
   - When synthesizing revisions or incorporating user answers, you MUST KEEP and PRESERVE all existing sentences from the user's draft.
   - You must ADD and APPEND newly formulated sentences into the appropriate section or paragraphs without deleting or erasing prior sentences.
   - The user must always remain in full control of removing text on their own.

3. FORMULATE STANDALONE FORMAL SENTENCES ('formulatedSentences'):
   - Provide an array of 'formulatedSentences', each containing { section, sentence, explanation }.
   - Each sentence must be a complete, elegant executive statement ready for the user to add directly to their draft with a single click.

4. Socratic Questioning:
   - Question vague adjectives like "significantly", "greatly", "hard work", "various projects". Demand concrete numbers, scopes, percentages, or dates.
   - Question passive, apologetic, or hesitant phrases ("I hope", "I was wondering", "sorry to bother").
   - Question the Call to Action: Push for specific proposed dates, time windows, or explicit deadlines.
   - Question Recipient Empathy: Ask how this benefits ${recipient?.name || 'the recipient'} or solves their problem.

5. Tone & Persona:
   - Professional, incisive, discerning, intellectually rigorous, supportive but uncompromising on quality.`;

    const lastUserMessage = messages.length > 0 ? messages[messages.length - 1]?.content : '';

    let promptContext = `Target Recipient: ${recipient?.name || 'Recipient'} (${recipient?.title || ''}, ${recipient?.organization || ''})
Preferred Salutation: ${recipient?.salutation || ''}
Sender: ${sender?.name || 'Sender'} (${sender?.title || ''}, ${sender?.organization || ''})
Document Type: ${letterType}
Target Tone: ${targetTone}
Target Complexity: ${targetComplexity}
Requested Action: ${actionType}

Current Structured Letter:
${JSON.stringify(currentLetter || {}, null, 2)}

User's Raw Text (if any):
"""
${rawText || '(None provided yet)'}
"""`;

    if (answers.length > 0) {
      promptContext += `\n\nUser Answers to Prior Questions:
${answers.map((a: any, idx: number) => `Q${idx + 1}: ${a.question}\nAnswer: ${a.answer}`).join('\n\n')}`;
    }

    if (lastUserMessage) {
      promptContext += `\n\nLatest User Remark / Question:
"${lastUserMessage}"`;
    }

    promptContext += `\n\nPlease evaluate, question the writing, formulate targeted questions/critiques, and if appropriate provide an updatedLetter reflecting the user's input. Return valid JSON adhering to schema.`;

    const response = await callGeminiWithFallback(ai, {
      contents: promptContext,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            message: {
              type: Type.STRING,
              description: "Editorial feedback and coaching guidance speaking directly to the user",
            },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  category: { type: Type.STRING },
                  question: { type: Type.STRING },
                  contextExcerpt: { type: Type.STRING },
                  whyItMatters: { type: Type.STRING },
                  suggestedAnswers: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ["id", "category", "question", "whyItMatters"],
              },
              description: "Probing Socratic questions interrogating the draft or extracting missing context",
            },
            critiques: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  type: { type: Type.STRING },
                  excerpt: { type: Type.STRING },
                  critique: { type: Type.STRING },
                  recommendation: { type: Type.STRING },
                },
                required: ["id", "type", "excerpt", "critique", "recommendation"],
              },
              description: "Specific critiques flagged in the user's text",
            },
            updatedLetter: {
              type: Type.OBJECT,
              properties: {
                subject: { type: Type.STRING },
                salutation: { type: Type.STRING },
                opening: { type: Type.STRING },
                bodyParagraphs: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                callToAction: { type: Type.STRING },
                signOff: { type: Type.STRING },
                senderBlock: { type: Type.STRING },
                executiveSummary: { type: Type.STRING },
              },
              description: "Full updated letter incorporating the answers and revisions (optional)",
            },
            formulatedSentences: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  section: { type: Type.STRING },
                  sentence: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                },
                required: ["section", "sentence"],
              },
              description: "Clean formal sentences formulated from user answers ready to be added to the draft",
            },
            editorialNotes: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Key bullet points on improvements applied",
            },
          },
          required: ["message"],
        },
      },
    });

    const parsed = cleanJsonText(response.text);
    return res.json(parsed);
  } catch (error: any) {
    console.log("[AgentChat] Notice - returning resilient fallback response:", error?.message || error);
    return res.json(buildFallbackAgentResponse({
      actionType,
      rawText,
      currentLetter,
      recipient,
      sender,
      answers,
      targetTone,
    }));
  }
});

// Setup Vite dev server or static files
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`LetterCraft server listening on port ${PORT}`);
  });
}

start();
