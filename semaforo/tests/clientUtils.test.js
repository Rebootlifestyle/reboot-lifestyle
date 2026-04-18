// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { renderResult, renderAttribution, verdictLabel, verdictColor, escapeHtml } from '../clientUtils.js';

describe('escapeHtml', () => {
  it('escapes angle brackets and quotes', () => {
    expect(escapeHtml('<script>"x"</script>')).toBe('&lt;script&gt;&quot;x&quot;&lt;/script&gt;');
  });
});

describe('verdictLabel', () => {
  it('returns Spanish labels for each verdict', () => {
    expect(verdictLabel('green')).toBe('SE PUEDE');
    expect(verdictLabel('yellow')).toBe('CON CAMBIO');
    expect(verdictLabel('red')).toBe('MEJOR NO');
  });
});

describe('verdictColor', () => {
  it('returns hex colors per verdict', () => {
    expect(verdictColor('green')).toBe('#22c55e');
    expect(verdictColor('yellow')).toBe('#facc15');
    expect(verdictColor('red')).toBe('#ef4444');
  });
});

describe('renderResult', () => {
  const sample = {
    summary: { total: 3, green: 1, yellow: 1, red: 1 },
    items: [
      { name: 'Pollo a la plancha', verdict: 'green', reason: 'Proteína limpia.', substitution: null },
      { name: 'Ensalada César', verdict: 'yellow', reason: 'El aderezo trae azúcar.', substitution: 'Aceite de oliva y limón.' },
      { name: 'Pizza margarita', verdict: 'red', reason: 'Harina refinada.', substitution: null },
    ],
    notes: 'Menú con variedad.',
  };

  it('renders summary numbers', () => {
    const html = renderResult(sample);
    expect(html).toContain('3');
    expect(html).toContain('Pollo a la plancha');
    expect(html).toContain('SE PUEDE');
    expect(html).toContain('CON CAMBIO');
    expect(html).toContain('MEJOR NO');
  });

  it('renders the substitution only for yellow verdicts', () => {
    const html = renderResult(sample);
    expect(html).toContain('Aceite de oliva y limón');
  });

  it('escapes HTML in dish names', () => {
    const withXss = {
      summary: { total: 1, green: 0, yellow: 0, red: 1 },
      items: [{ name: '<img src=x onerror=alert(1)>', verdict: 'red', reason: 'x', substitution: null }],
      notes: null,
    };
    const html = renderResult(withXss);
    expect(html).not.toContain('<img src=x');
    expect(html).toContain('&lt;img');
  });
});

describe('renderAttribution', () => {
  it('renders the attribution card with location + name buttons', () => {
    const html = renderAttribution();
    expect(html).toContain('attribution-card');
    expect(html).toContain('attr-location-btn');
    expect(html).toContain('attr-name-btn');
    expect(html).toContain('attr-name-form');
  });

  it('includes the transparent disclaimer about anonymous storage', () => {
    const html = renderAttribution();
    expect(html).toContain('anónima');
    expect(html).toContain('biblioteca');
  });

  it('renders a status element with aria-live for screen readers', () => {
    const html = renderAttribution();
    expect(html).toMatch(/id="attr-status"[^>]*aria-live="polite"/);
  });
});
