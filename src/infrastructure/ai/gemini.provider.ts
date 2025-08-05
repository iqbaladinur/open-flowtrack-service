import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AiProvider } from "./ai.provider";

@Injectable()
export class GeminiAiProvider extends AiProvider {
  private generativeAi: GoogleGenerativeAI;

  constructor(private configService: ConfigService) {
    super();
    this.generativeAi = new GoogleGenerativeAI(
      this.configService.get<string>("gemini.apiKey"),
    );
  }

  async generateText(prompt: string): Promise<string> {
    const model = this.generativeAi.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }
}
