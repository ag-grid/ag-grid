import { resolveFontWeight, resolvePdfFontFamily } from './fonts';
import { mapCssStylesToPdfStyle } from './styleMapping';

describe('PDF font resolution', () => {
    it('applies weight after inheriting the base font family', () => {
        expect(resolvePdfFontFamily(undefined, 'bold', 'Times-Roman')).toBe('Times-Bold');
        expect(resolvePdfFontFamily(undefined, 'bold', 'Courier')).toBe('Courier-Bold');
        expect(resolvePdfFontFamily(undefined, 'normal', 'Helvetica-Bold')).toBe('Helvetica');
    });

    it('keeps CSS family and weight as separate style properties', () => {
        expect(mapCssStylesToPdfStyle([{ fontWeight: 'bold' }])).toEqual({ fontWeight: 'bold' });
        expect(mapCssStylesToPdfStyle([{ fontFamily: 'Times New Roman', fontWeight: 700 }])).toEqual({
            fontFamily: 'Times-Roman',
            fontWeight: 'bold',
        });
    });

    it('ignores malformed CSS font weights', () => {
        expect(resolveFontWeight('700px')).toBeUndefined();
        expect(resolveFontWeight(Number.NaN)).toBeUndefined();
    });
});
