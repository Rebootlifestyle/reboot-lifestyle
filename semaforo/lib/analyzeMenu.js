import Anthropic from '@anthropic-ai/sdk';
import { SEMAFORO_SYSTEM_PROMPT } from './prompt.js';

const MODEL = 'claude-sonnet-4-6';
const MAX_TOKENS = 2048;

/**
 * Analyze a menu image via Claude multimodal.
 * @param {{imageBase64: string, mediaType: 'image/jpeg'|'image/png'|'image/webp', apiKey: string}} params
 * @returns {Promise<object>} parsed JSON matching the schema defined in the system prompt
 */
export async function analyzeMenu({ imageBase64, mediaType, apiKey }) {
  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: [
      {
        type: 'text',
        text: SEMAFORO_SYSTEM_PROMPT,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mediaType, data: imageBase64 },
          },
          {
            type: 'text',
            text: 'Analiza este menú.',
          },
        ],
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === 'text');
  if (!textBlock) {
    const err = new Error('INVALID_RESPONSE: no text block returned');
    err.code = 'INVALID_RESPONSE';
    throw err;
  }

  try {
    return JSON.parse(textBlock.text);
  } catch {
    const err = new Error('INVALID_RESPONSE: text was not valid JSON');
    err.code = 'INVALID_RESPONSE';
    throw err;
  }
}
