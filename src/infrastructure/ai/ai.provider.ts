export abstract class AiProvider {
  abstract generateText(prompt: string): Promise<string>;
}
