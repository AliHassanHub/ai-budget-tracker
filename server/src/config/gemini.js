import { GoogleGenAI } from '@google/genai';
import { env } from './env.js';

let client;

export function getGeminiClient() {
  if (!client) {
    client = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  }

  return client;
}

export function getGeminiModel() {
  return env.GEMINI_MODEL;
}
