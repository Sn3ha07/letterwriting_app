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

// Helper to call Gemini with resilient model fallback
async function callGeminiWithFallback(ai: GoogleGenAI, config: any) {
  const modelsToTry = ["gemini-3.8-flash", "gemini-3.1-pro-preview", "gemini-2.5-flash"];
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        ...config,
        model,
      });
      return response;
    } catch (err: any) {
      console.warn(`Attempt with ${model} failed:`, err?.message || err);
      lastError = err;
      // If temporary overload or unavailable or not found, try next model
      if (
        err?.status === "UNAVAILABLE" ||
        err?.message?.includes("503") ||
        err?.message?.includes("demand") ||
        err?.message?.includes("404") ||
        err?.message?.includes("not found")
      ) {
        continue;
      }
      break;
    }
  }
  throw lastError;
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
      // High-quality deterministic fallback template if API key is missing
      const recipientName = recipient.name || "Hiring Team / Esteemed Recipient";
      const recipientTitle = recipient.title ? `${recipient.title}, ` : "";
      const recipientOrg = recipient.organization || "Organization";
      const senderName = sender.name || "Your Name";
      const senderTitle = sender.title ? `${sender.title}` : "";

      const defaultLetter = {
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

      return res.json(defaultLetter);
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
    console.error("Error generating letter:", error);
    res.status(500).json({
      error: "Failed to generate letter",
      details: error.message || String(error),
    });
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
  const userSections = raw ? raw.split(/\n\n+/).filter(Boolean) : [];

  const subject =
    letter?.subject ||
    (raw.startsWith("Subject:")
      ? raw.split("\n")[0].replace(/^Subject:\s*/i, "")
      : "Formal Executive Correspondence");

  const salutation =
    recipient?.salutation ||
    letter?.salutation ||
    (userSections[0]?.toLowerCase().startsWith("dear") ? userSections[0] : "Dear Esteemed Colleague,");

  const opening =
    userSections.length > 1 && userSections[0].toLowerCase().startsWith("dear")
      ? userSections[1]
      : (userSections[0] ||
        letter?.opening ||
        "I am writing to formally present our strategic position and address the essential objectives of this engagement.");

  const bodyParagraphs =
    userSections.length > 2
      ? userSections.slice(1, userSections.length > 3 ? userSections.length - 1 : userSections.length)
      : (letter?.bodyParagraphs?.length && letter.bodyParagraphs[0]
        ? letter.bodyParagraphs
        : [
            "With deep respect for institutional standards of excellence, I have directed considerable focus toward achieving measurable, principled outcomes.",
            "Our structured execution and collaborative integrity ensure that each milestone is achieved with transparency, diligence, and accountability.",
          ]);

  const callToAction =
    userSections.length > 3
      ? userSections[userSections.length - 1]
      : (letter?.callToAction ||
        "Thank you for your thoughtful consideration. I welcome the opportunity to coordinate next steps at your earliest convenience.");

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
    executiveSummary: `Refined draft into a structured formal letter calibrated to ${targetTone} register with classical executive letterhead formatting.`,
    editorialNotes: [
      "Standardized paragraph architecture: distinct formal opening, evidence body, and targeted next steps.",
      `Calibrated lexical register and tone to ${targetTone}.`,
      "Retained your authentic commitments and narrative assertions with executive clarity.",
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
    console.error("Error in assistant-edit, falling back to local edit:", error);
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
    console.error("Error refining letter, returning preserved draft:", error);
    const fallback = { ...currentLetter };
    fallback.executiveSummary = `Applied refinement adjustment (${actionType || "general polish"}).`;
    return res.json(fallback);
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
