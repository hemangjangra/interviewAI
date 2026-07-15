/**
 * AI Provider Factory
 * Instantiates the correct provider based on environment configuration.
 * Server-side only — never import in client components.
 */
import type { AIProvider } from './provider.interface';

let _provider: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (_provider) return _provider;

  const providerName = process.env.AI_PROVIDER ?? 'mock';

  if (providerName === 'gemini') {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('[AI] GEMINI_API_KEY not set, falling back to mock provider');
      const { MockAIProvider } = require('./mock.provider');
      _provider = new MockAIProvider();
      return _provider!;
    }
    const { GeminiAIProvider } = require('./gemini.provider');
    _provider = new GeminiAIProvider(apiKey);
    console.info('[AI] Using Google Gemini provider');
    return _provider!;
  }

  if (providerName === 'openai') {
    // Future: OpenAI provider
    console.warn('[AI] OpenAI provider not yet implemented, falling back to mock');
    const { MockAIProvider } = require('./mock.provider');
    _provider = new MockAIProvider();
    return _provider!;
  }

  if (providerName === 'anthropic') {
    // Future: Anthropic provider
    console.warn('[AI] Anthropic provider not yet implemented, falling back to mock');
    const { MockAIProvider } = require('./mock.provider');
    _provider = new MockAIProvider();
    return _provider!;
  }

  // Default: mock
  const { MockAIProvider } = require('./mock.provider');
  _provider = new MockAIProvider();
  console.info('[AI] Using Mock provider (demo mode). Set AI_PROVIDER=gemini and GEMINI_API_KEY to use real AI.');
  return _provider!;
}

export type { AIProvider };
export { AIProviderError, AIParseError } from './provider.interface';
