export abstract class AiProvider {
  abstract generateText(prompt: string, apiKey?: string): Promise<string>;
}
