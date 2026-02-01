import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText } from 'ai';

const DEFAULT_MODEL = 'anthropic/claude-sonnet-4';

interface GenerateOptions {
  prompt: string;
  system?: string;
  model?: string;
  maxTokens?: number;
}

export async function generate(options: GenerateOptions): Promise<string> {
  const { prompt, system, model = DEFAULT_MODEL, maxTokens = 1024 } = options;

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not set');
  }

  const openrouter = createOpenRouter({ apiKey });

  const { text } = await generateText({
    model: openrouter(model),
    system,
    prompt,
    maxOutputTokens: maxTokens,
  });

  return text.trim();
}
