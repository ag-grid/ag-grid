import { resolveFontWeight } from './fonts';
import { mapCssStylesToPdfStyle } from './styleMapping';

describe('PDF font resolution', () => {
    it('keeps CSS family and weight as separate style properties', () => {
        expect(mapCssStylesToPdfStyle([{ fontWeight: 'bold' }])).toEqual({ fontWeight: 'bold' });
        expect(mapCssStylesToPdfStyle([{ fontFamily: 'Times New Roman', fontWeight: 700 }])).toEqual({
            fontFamily: 'Times-Roman',
            fontWeight: 700,
        });
    });

    it('preserves custom CSS font family names for registered PDF fonts', () => {
        expect(mapCssStylesToPdfStyle([{ fontFamily: '"Noto Sans Arabic", sans-serif' }])).toEqual({
            fontFamily: 'noto sans arabic',
        });
    });

    it('maps CSS font style and text direction', () => {
        expect(mapCssStylesToPdfStyle([{ fontStyle: 'italic', direction: 'rtl' }])).toEqual({
            direction: 'rtl',
            fontStyle: 'italic',
        });
    });

    it('ignores malformed CSS font weights', () => {
        expect(resolveFontWeight('700px')).toBeUndefined();
        expect(resolveFontWeight(Number.NaN)).toBeUndefined();
    });
});
