// src/application/ai/GenerateEventContentUseCase.ts
import { OpenAIService } from '../../infrastructure/ai/OpenAIService.js';

export interface GenerateContentDTO {
  prompt: string;
}

export interface GeneratedContent {
  title: string;
  description: string;
}

export class GenerateEventContentUseCase {
  constructor(private openAIService: OpenAIService) {}

  async execute(dto: GenerateContentDTO): Promise<GeneratedContent> {
    if (!dto.prompt || dto.prompt.trim().length < 5) {
      throw new Error('Please provide a bit more detail for the AI to work with.');
    }

    return await this.openAIService.generateEventContent(dto.prompt);
  }
}