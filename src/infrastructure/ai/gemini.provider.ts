import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { GoogleGenAI } from "@google/genai";
import { AiProvider } from "./ai.provider";

@Injectable()
export class GeminiAiProvider extends AiProvider {
  private globalApiKey: string;

  constructor(private configService: ConfigService) {
    super();
    this.globalApiKey = this.configService.get<string>("gemini.apiKey");
  }

  async generateText(prompt: string, apiKey?: string): Promise<string> {
    const key = apiKey || this.globalApiKey;
    if (!key) {
      throw new Error("Gemini API key not provided.");
    }

    const generativeAi = new GoogleGenAI({ apiKey: key });
    const result = await generativeAi.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });
    return result.text;
  }
}
