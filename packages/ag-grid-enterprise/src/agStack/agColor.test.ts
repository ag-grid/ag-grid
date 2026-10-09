import { AgColor } from './agColor';

// Expected values are pinned from the AG Charts `Color` class this utility replaces.
describe('AgColor', () => {
    it.each([
        ['#5090dc', '#5090dc', 'rgb(80, 144, 220)'],
        ['#abcd', '#aabbccdd', 'rgba(170, 187, 204, 0.867)'],
        ['rgba(10,20,30,0.12345)', '#0a141e1f', 'rgba(10, 20, 30, 0.123)'],
        ['rgb(255 0 0 / 50%)', '#ff000080', 'rgba(255, 0, 0, 0.5)'],
        ['hsl(210, 60%, 50%)', '#337fcc', 'rgb(51, 127, 204)'],
        ['hsla(0.5turn 50 50 / 0.5)', '#40bfbf80', 'rgba(64, 191, 191, 0.5)'],
        ['oklch(0.7 0.1 200)', '#40b1b7', 'rgb(64, 177, 183)'],
        ['transparent', '#00000000', 'rgba(0, 0, 0, 0)'],
        ['Red', '#ff0000', 'rgb(255, 0, 0)'],
        ['rgb(300, -5, 50%)', '#ff0080', 'rgb(255, 0, 128)'],
    ])('parses %s', (input, hex, rgba) => {
        const color = AgColor.fromString(input);
        expect(color.toHexString()).toBe(hex);
        expect(color.toRgbaString()).toBe(rgba);
    });

    it.each(['#12345g', '# f f f', 'xrgb(1,2,3)', 'rebeccapurple', 'oklch(70% 50% 20deg / 30%)'])(
        'accepts %s as a valid colour',
        (input) => {
            expect(AgColor.validColorString(input)).toBe(true);
        }
    );

    it.each(['#ggg', ' red', '', 'rgb(1,2)', 'hsl(1,2)', 'lab(1 2 3)'])(
        'rejects %s and throws on parsing it',
        (input) => {
            expect(AgColor.validColorString(input)).toBe(false);
            expect(() => AgColor.fromString(input)).toThrow();
        }
    );

    it('throws when parsing undefined', () => {
        expect(() => AgColor.fromString(undefined as unknown as string)).toThrow();
    });

    it('converts to and from HSB', () => {
        expect(AgColor.fromString('#5090dc').toHSB()).toEqual([
            212.57142857142858, 0.6363636363636364, 0.8627450980392157,
        ]);
        expect(AgColor.fromHSB(120, 0.5, 0.5, 0.5).toRgbaString()).toBe('rgba(64, 128, 64, 0.5)');
        expect(AgColor.fromHSB(300, 0, 0.4, 1).toRgbaString()).toBe('rgb(102, 102, 102)');
        expect(AgColor.fromHSB(-60, 1, 1).toHexString()).toBe('#ff00ff');
    });

    it('clamps components to 0..1 and turns NaN into 0', () => {
        const color = new AgColor(Number.NaN, 2, -1, 0.5);
        expect([color.r, color.g, color.b, color.a]).toEqual([0, 1, 0, 0.5]);
    });
});
