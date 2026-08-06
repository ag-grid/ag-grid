import { resolveVisualText } from './textDirection';

describe('PDF text direction', () => {
    it('detects and reverses Hebrew text for PDF visual order', () => {
        expect(resolveVisualText('שלום', 'auto')).toEqual({
            direction: 'rtl',
            text: 'םולש',
        });
    });

    it('keeps numeric runs in reading order inside right-to-left text', () => {
        const resolved = resolveVisualText('שורות 1,250', 'rtl');

        expect(resolved.direction).toBe('rtl');
        expect(resolved.text).toContain('1,250');
    });

    it('mirrors paired punctuation in right-to-left text', () => {
        const resolved = resolveVisualText('שלום (PDF)', 'rtl');

        expect(resolved.text).toContain('(PDF)');
    });

    it('keeps Arabic Unicode values unchanged for OpenType shaping', () => {
        const resolved = resolveVisualText('سلام', 'rtl');

        expect(resolved.direction).toBe('rtl');
        expect(Array.from(resolved.text).reverse().join('')).toBe('سلام');
    });

    it('keeps combining marks attached to their base character', () => {
        const resolved = resolveVisualText('שָׁלוֹם', 'rtl');

        expect(resolved.text).toContain('שָׁ');
    });

    it('does not reverse Greek, Cyrillic, Japanese, or Chinese text', () => {
        expect(resolveVisualText('Ελληνικά', 'auto')).toEqual({ direction: 'ltr', text: 'Ελληνικά' });
        expect(resolveVisualText('Български', 'auto')).toEqual({ direction: 'ltr', text: 'Български' });
        expect(resolveVisualText('東京', 'auto')).toEqual({ direction: 'ltr', text: '東京' });
        expect(resolveVisualText('北京', 'auto')).toEqual({ direction: 'ltr', text: '北京' });
    });
});
