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

    it('blends translucent colours against white when no background colour is available', () => {
        expect(resolveOptionalColor('rgba(0, 0, 0, 0.5)', undefined)).toEqual({ r: 128, g: 128, b: 128 });
    });

    it('blends transparent theme header colours over the page background', () => {
        const colors = resolvePdfStyleColors({
            backgroundColor: '#ffffff',
            headerBackgroundColor: '#60300005',
        });

        expect(colors.headerBackground).toEqual({ r: 252, g: 251, b: 250 });
    });

    it('falls back to the data background for odd rows', () => {
        const colors = resolvePdfStyleColors({ dataBackgroundColor: '#1e1e1e' });

        expect(colors.dataBackground).toEqual({ r: 30, g: 30, b: 30 });
        expect(colors.oddRowBackground).toEqual({ r: 30, g: 30, b: 30 });
    });
});
