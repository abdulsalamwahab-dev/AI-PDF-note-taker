import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

const ai = new GoogleGenAI({
  apiKey: apiKey,
});

// Naye SDK mein seedha models.get() ya direct name use hota hai
// Lekin hum variable export karenge taaki EditorExtensions mein use ho sake
export const aiModel = ai; 

export const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
};