import { addTextEllipsis, clipText, estimateTextWidth, fmt, truncateText, wrapText } from './text';

describe('PDF text utilities', () => {
    it('measures proportional Base-14 glyph widths', () => {
        expect(estimateTextWidth('WWW', 10, 'Helvetica')).toBeCloseTo(28.32, 2);
        expect(estimateTextWidth('iii', 10, 'Helvetica')).toBeCloseTo(6.66, 2);
        expect(estimateTextWidth('WWW', 10, 'Times-Roman')).toBeCloseTo(28.32, 2);
        expect(estimateTextWidth('iii', 10, 'Times-Roman')).toBeCloseTo(8.34, 2);
        expect(estimateTextWidth('ø', 10, 'Helvetica')).toBeCloseTo(estimateTextWidth('o', 10, 'Helvetica'), 2);
    });

    it('truncates text using measured glyph widths', () => {
        const wide = truncateText('WWWWWWWWWW', 30, 10, 'Helvetica');
        const narrow = truncateText('iiiiiiiiii', 30, 10, 'Helvetica');

        expect(wide).toBe('WW...');
        expect(narrow).toBe('iiiiiiiiii');
    });

    it('clips text without a marker and forces an ellipsis when requested', () => {
        expect(clipText('WWWW', 20, 10, 'Helvetica')).toBe('WW');
        expect(addTextEllipsis('alpha', 100, 10, 'Helvetica')).toBe('alpha...');
        expect(addTextEllipsis('WWWW', 20, 10, 'Helvetica')).toBe('W...');
    });

    it('wraps words and preserves explicit line breaks', () => {
        expect(wrapText('alpha beta', 30, 10, 'Helvetica')).toEqual(['alpha', 'beta']);
        expect(wrapText('alpha\nbeta', 100, 10, 'Helvetica')).toEqual(['alpha', 'beta']);
    });

    it('splits words that are wider than a line', () => {
        expect(wrapText('WWWW', 20, 10, 'Helvetica')).toEqual(['WW', 'WW']);
    });

    it('never formats non-finite PDF numeric tokens', () => {
        expect(fmt(Number.NaN)).toBe('0');
        expect(fmt(Number.POSITIVE_INFINITY)).toBe('0');
        expect(fmt(Number.NEGATIVE_INFINITY)).toBe('0');
    });
});
