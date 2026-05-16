import { GoogleGenAI } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : (window as any).GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY not found in process.env or window");
      throw new Error("Missing API Key. Please check your configuration.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

export async function chatWithPDF(pdfBase64: string, prompt: string, history: { role: 'user' | 'model', text: string }[]) {
  const ai = getAI();
  
  const contents = [
    {
      role: "user" as const,
      parts: [
        {
          inlineData: {
            mimeType: "application/pdf",
            data: pdfBase64,
          },
        },
        {
          text: `You are a professional PDF document analyzer. Answer strictly based on the provided PDF content. Use [Page X] for citations. If the information isn't in the PDF, say so.
          
          User request: ${prompt}`,
        },
      ],
    },
  ];

  // For subsequent messages, we can use a more complex structure, 
  // but for a simple "DocuMind" experience, sending the PDF with every request 
  // ensuring the model always has the context is robust for short sessions.
  // If history exists, we should append it correctly.
  
  const fullContents = [
    {
      role: "user" as const,
      parts: [
        { inlineData: { mimeType: "application/pdf", data: pdfBase64 } },
        { text: "Context: This is the document I want you to analyze. Remember its content for our conversation." }
      ]
    },
    ...history.map(msg => ({
      role: msg.role === 'user' ? 'user' as const : 'model' as const,
      parts: [{ text: msg.text }]
    })),
    {
      role: 'user' as const,
      parts: [{ text: prompt }]
    }
  ];

  try {
    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: fullContents,
      config: {
        systemInstruction: "You are DocuMind AI, a specialized research assistant. You have full access to the uploaded PDF. Always provide detailed, cited answers. Use markdown formatting for readability.",
      }
    });

    return result.text || "I couldn't process that request.";
  } catch (error) {
    console.error("Gemini AI Error:", error);
    throw error;
  }
}
