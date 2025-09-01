import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { GoogleGenerativeAI } from "@google/generative-ai";
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

    const generativeAi = new GoogleGenerativeAI(key);
    const model = generativeAi.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
    });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }
}
