import { addTextEllipsis, clipText, fmt, truncateText, wrapText } from './text';

describe('PDF text utilities', () => {
    it('measures proportional Base-14 glyph widths', () => {
        expect(clipText('WWW', 10, 10, 'Helvetica')).toBe('W');
        expect(clipText('iii', 10, 10, 'Helvetica')).toBe('iii');
        expect(clipText('WWW', 10, 10, 'Times-Roman')).toBe('W');
        expect(clipText('iii', 10, 10, 'Times-Roman')).toBe('iii');
        expect(clipText('øo', 6, 10, 'Helvetica')).toBe('ø');
    });

    it('measures WinAnsi typographic glyph widths per font family', () => {
        expect(clipText('“X', 4, 10, 'Helvetica')).toBe('“');
        expect(clipText('•X', 4, 10, 'Helvetica')).toBe('•');
        expect(clipText('…X', 10, 10, 'Helvetica')).toBe('…');
        expect(clipText('—X', 10, 10, 'Times-Roman')).toBe('—');
        expect(clipText('€X', 5, 10, 'Times-Roman')).toBe('€');
        expect(clipText('’X', 3, 10, 'Helvetica-Bold')).toBe('’');
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

    it('preserves repeated, leading and trailing spaces while wrapping preformatted text', () => {
        const value = '  alpha  beta  ';
        const lines = wrapText(value, 30, 10, 'Helvetica', true);

        expect(lines.length).toBeGreaterThan(1);
        expect(lines.join('')).toBe(value);
    });

    it('does not split supplementary Unicode characters while wrapping preformatted text', () => {
        const value = '𠀀𠀁';
        const calculateWidth = (text: string) => Array.from(text).length;

        expect(wrapText(value, 1, 10, 'Helvetica', true, calculateWidth)).toEqual(['𠀀', '𠀁']);
    });

    it('never formats non-finite PDF numeric tokens', () => {
        expect(fmt(Number.NaN)).toBe('0');
        expect(fmt(Number.POSITIVE_INFINITY)).toBe('0');
        expect(fmt(Number.NEGATIVE_INFINITY)).toBe('0');
    });
});
