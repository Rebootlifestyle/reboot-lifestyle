import Anthropic from '@anthropic-ai/sdk';
import { SEMAFORO_SYSTEM_PROMPT } from './prompt.js';

const MODEL = 'claude-sonnet-4-6';
// 4096 covers ~20 dishes with full explanations and fits within the
// 60s Vercel Hobby timeout. When we move to Pro we can raise it back
// to 8192 for full-menu analysis.
const MAX_TOKENS = 4096;

const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const PDF_TYPE = 'application/pdf';

/**
 * Analyze a menu (image or PDF) via Claude multimodal.
 * Images use the `image` content block; PDFs use the `document` block.
 * @param {{fileBase64: string, mediaType: string, apiKey: string}} params
 * @returns {Promise<object>} parsed JSON matching the schema defined in the system prompt
 */
export async function analyzeMenu({ fileBase64, mediaType, apiKey, imageBase64 }) {
  // Backward compat: old callers pass imageBase64 instead of fileBase64.
  const data = fileBase64 ?? imageBase64;
  const client = new Anthropic({ apiKey });

  let primaryBlock;
  if (IMAGE_TYPES.has(mediaType)) {
    primaryBlock = {
      type: 'image',
      source: { type: 'base64', media_type: mediaType, data },
    };
  } else if (mediaType === PDF_TYPE) {
    primaryBlock = {
      type: 'document',
      source: { type: 'base64', media_type: mediaType, data },
    };
  } else {
    const err = new Error(`UNSUPPORTED_MEDIA_TYPE: ${mediaType}`);
    err.code = 'UNSUPPORTED_MEDIA_TYPE';
    throw err;
  }

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
          primaryBlock,
          { type: 'text', text: 'Analiza este menú.' },
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
