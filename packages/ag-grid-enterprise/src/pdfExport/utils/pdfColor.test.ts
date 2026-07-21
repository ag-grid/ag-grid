import { formatColor, resolveOptionalColor, resolvePdfStyleColors } from './pdfColor';

describe('PDF colours', () => {
    it('falls back for malformed hexadecimal colours', () => {
        const fallback = { r: 12, g: 34, b: 56 };

        expect(resolveOptionalColor('#ggg', fallback)).toEqual(fallback);
        expect(resolveOptionalColor('#12345g', fallback)).toEqual(fallback);
    });

    it('never formats non-finite colour channels', () => {
        expect(formatColor({ r: Number.NaN, g: Number.POSITIVE_INFINITY, b: Number.NEGATIVE_INFINITY })).toBe(
            '0.000 0.000 0.000'
        );
    });

    it('blends transparent theme header colours over the page background', () => {
        const colors = resolvePdfStyleColors({
            backgroundColor: '#ffffff',
            headerBackgroundColor: '#60300005',
        });

        expect(colors.headerBackground).toEqual({ r: 252, g: 251, b: 250 });
    });
});
