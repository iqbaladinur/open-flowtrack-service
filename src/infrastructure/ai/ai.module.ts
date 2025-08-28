import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AiProvider } from "./ai.provider";
import { GeminiAiProvider } from "./gemini.provider";

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: AiProvider,
      useClass: GeminiAiProvider,
    },
  ],
  exports: [AiProvider],
})
export class AiModule {}
