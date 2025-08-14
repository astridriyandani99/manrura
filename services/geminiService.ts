
import { GoogleGenAI } from "@google/genai";
import { manruraData } from "../data/manruraData";
import { GEMINI_MODEL } from '../constants';

// Ensure the API key is available. In a real app, this would be handled by the build/deployment environment.
// For this context, we assume process.env.API_KEY is populated.
if (!process.env.API_KEY) {
  console.warn(
    "API_KEY environment variable not set. Chatbot functionality will be disabled. Please set the API_KEY in your environment."
  );
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const systemInstruction = `You are a helpful assistant for MANRURA (Manajemen Ruang Rawat), a set of standards for hospital ward management at RSUP Dr. Kariadi Semarang. Your purpose is to help hospital staff understand and apply these standards.

You must answer questions based *only* on the provided MANRURA document. Do not use any external knowledge. If the answer is not in the document, say that you cannot find the information in the MANRURA guide.
Your answers should be clear, concise, and professional. You should answer in the same language as the user's question (Indonesian or English).
The full MANRURA document is provided below in JSON format. Use it as your single source of truth.

MANRURA Document (JSON):
${JSON.stringify(manruraData)}
`;

export const askManruraAssistant = async (prompt: string): Promise<string> => {
  if (!process.env.API_KEY) {
    return "Chatbot is currently disabled because the API key is not configured.";
  }

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ role: 'user', parts: [{text: prompt}] }],
      config: {
        systemInstruction: systemInstruction,
      }
    });
    
    return response.text;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    // Provide a more user-friendly error message
    if (error instanceof Error && error.message.includes('API key not valid')) {
       return "I'm sorry, but the API key is not valid. Please check the configuration.";
    }
    return "I'm having trouble connecting to my knowledge base right now. Please try again in a moment.";
  }
};
