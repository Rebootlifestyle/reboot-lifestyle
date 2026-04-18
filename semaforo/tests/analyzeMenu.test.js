import { describe, it, expect, vi, beforeEach } from 'vitest';

// Hoisted mock: single create fn shared across every `new Anthropic(...)` call.
const mocks = vi.hoisted(() => ({ mockCreate: vi.fn() }));

vi.mock('@anthropic-ai/sdk', () => {
  class Anthropic {
    constructor() {
      this.messages = { create: mocks.mockCreate };
    }
  }
  return { default: Anthropic };
});

import { analyzeMenu } from '../lib/analyzeMenu.js';

describe('analyzeMenu', () => {
  const mockCreate = mocks.mockCreate;

  beforeEach(() => {
    mockCreate.mockReset();
  });

  it('returns parsed JSON when Claude returns valid JSON text', async () => {
    mockCreate.mockResolvedValueOnce({
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            summary: { total: 2, green: 1, yellow: 1, red: 0 },
            items: [
              { name: 'Ensalada César', verdict: 'yellow', reason: 'El aderezo tradicional trae azúcar.', substitution: 'Pídela con aceite de oliva y limón.' },
              { name: 'Pollo a la plancha', verdict: 'green', reason: 'Proteína limpia sin grasas industriales.', substitution: null },
            ],
            notes: null,
          }),
        },
      ],
    });

    const result = await analyzeMenu({
      fileBase64: 'fake-base64',
      mediaType: 'image/jpeg',
      apiKey: 'sk-ant-test',
    });

    expect(result.summary.total).toBe(2);
    expect(result.items).toHaveLength(2);
    expect(result.items[0].verdict).toBe('yellow');
    expect(result.items[0].substitution).toContain('aceite de oliva');
  });

  it('accepts legacy imageBase64 parameter for backward compatibility', async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: 'text', text: JSON.stringify({ summary: { total: 0, green: 0, yellow: 0, red: 0 }, items: [], notes: null }) }],
    });
    const result = await analyzeMenu({
      imageBase64: 'legacy-data',
      mediaType: 'image/jpeg',
      apiKey: 'sk-ant-test',
    });
    expect(result).toBeDefined();
    expect(mockCreate.mock.calls[0][0].messages[0].content[0].source.data).toBe('legacy-data');
  });

  it('sends PDFs as a document content block (not image)', async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: 'text', text: JSON.stringify({ summary: { total: 0, green: 0, yellow: 0, red: 0 }, items: [], notes: null }) }],
    });
    await analyzeMenu({
      fileBase64: 'pdf-bytes',
      mediaType: 'application/pdf',
      apiKey: 'sk-ant-test',
    });
    const call = mockCreate.mock.calls[0][0];
    expect(call.messages[0].content[0]).toEqual({
      type: 'document',
      source: { type: 'base64', media_type: 'application/pdf', data: 'pdf-bytes' },
    });
  });

  it('throws UNSUPPORTED_MEDIA_TYPE for non image/pdf types', async () => {
    await expect(
      analyzeMenu({ fileBase64: 'x', mediaType: 'text/plain', apiKey: 'sk-ant-test' })
    ).rejects.toThrow('UNSUPPORTED_MEDIA_TYPE');
  });

  it('returns the error object when Claude reports no_menu_detected', async () => {
    mockCreate.mockResolvedValueOnce({
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            error: 'no_menu_detected',
            message: 'No pude identificar platos en esta foto.',
          }),
        },
      ],
    });

    const result = await analyzeMenu({
      fileBase64: 'fake',
      mediaType: 'image/jpeg',
      apiKey: 'sk-ant-test',
    });

    expect(result.error).toBe('no_menu_detected');
  });

  it('throws a typed error when Claude returns unparseable text', async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: 'text', text: 'not json at all' }],
    });

    await expect(
      analyzeMenu({ fileBase64: 'fake', mediaType: 'image/jpeg', apiKey: 'sk-ant-test' })
    ).rejects.toThrow('INVALID_RESPONSE');
  });

  it('passes the image as base64 block and requests cache_control on the system prompt', async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: 'text', text: JSON.stringify({ summary: { total: 0, green: 0, yellow: 0, red: 0 }, items: [], notes: null }) }],
    });

    await analyzeMenu({ fileBase64: 'abc123', mediaType: 'image/png', apiKey: 'sk-ant-test' });

    const call = mockCreate.mock.calls[0][0];
    expect(call.model).toBe('claude-sonnet-4-6');
    expect(call.messages[0].content[0]).toEqual({
      type: 'image',
      source: { type: 'base64', media_type: 'image/png', data: 'abc123' },
    });
    // System prompt should be passed as an array with cache_control
    expect(Array.isArray(call.system)).toBe(true);
    expect(call.system[0].cache_control).toEqual({ type: 'ephemeral' });
  });
});
