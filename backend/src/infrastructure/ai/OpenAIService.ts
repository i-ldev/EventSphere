// src/infrastructure/ai/OpenAIService.ts
import OpenAI from 'openai';
import { env } from '../../config/env.js';

export class OpenAIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      baseURL: 'https://api.groq.com/openai/v1',
      apiKey: env.GROQ_API_KEY, 
    });
  }

  async generateEventContent(prompt: string): Promise<{ title: string; description: string }> {
    try {
      const response = await this.openai.chat.completions.create({
        model: env.GROQ_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are an expert event manager. The user will give you a brief idea for an event. You must respond with ONLY valid raw JSON. Do NOT use markdown code blocks. Do NOT add any conversational text. Use the keys "title" (string, max 10 words) and "description" (string, 2-3 sentences). Example: {"title": "Tech Conference", "description": "Join us for..."}',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 500, // Increased limit so it doesn't cut off mid-sentence
        temperature: 0.7,
      });

      const messageContent = response.choices[0]?.message?.content || '';
      
      // Clean up any markdown code blocks the AI might have added just in case
      const cleanJson = messageContent.replace(/```json/g, '').replace(/```/g, '').trim();

      // Parse the JSON response
      const parsed = JSON.parse(cleanJson);

      return {
        title: parsed.title || 'Untitled Event',
        description: parsed.description || 'No description available.',
      };
    } catch (error) {
      console.error('AI Parsing Error:', error);
      throw new Error('Failed to generate AI content.');
    }
  }
}