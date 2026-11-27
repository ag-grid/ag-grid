import { describe, expect, it } from 'vitest';

import { getParamType, paramValueToCss } from './themeTypeUtils';

describe('backdrop filter params', () => {
    const toCss = (value: unknown) => paramValueToCss('widgetBackdropFilter', value, null);

    it('are typed by the BackdropFilter name suffix', () => {
        expect(getParamType('widgetBackdropFilter')).toBe('backdropFilter');
    });

    it('pass strings through unchanged', () => {
        expect(toCss('blur(4px) saturate(1.5)')).toBe('blur(4px) saturate(1.5)');
    });

    it('convert a reference to a variable', () => {
        expect(toCss({ ref: 'otherBackdropFilter' })).toBe('var(--ag-other-backdrop-filter)');
    });

    it('join filter functions in order', () => {
        expect(toCss([{ blur: 8 }, { saturate: '150%' }, { brightness: { ref: 'foo' } }])).toBe(
            'blur(8px) saturate(150%) brightness(var(--ag-foo))'
        );
    });

    it('give pixel units to blur numbers only', () => {
        expect(toCss([{ grayscale: 1 }, { opacity: 0.5 }, { blur: 2 }])).toBe('grayscale(1) opacity(0.5) blur(2px)');
    });

    it('convert calc arguments', () => {
        const calc = { calc: 'spacing * 2' };
        expect(toCss([{ blur: calc }])).toBe(`blur(${paramValueToCss('widgetPadding', calc, null)})`);
    });

    it('convert an empty list to none', () => {
        expect(toCss([])).toBe('none');
    });

    it.each([
        ['an invalid argument', [{ blur: true }]],
        ['an unknown function', [{ hueRotate: 90 }]],
        ['more than one function in an entry', [{ blur: 2, sepia: 1 }]],
        ['an empty entry', [{}]],
        ['a number', 8],
    ])('fail on %s', (_, value) => {
        expect(toCss(value)).toBe(false);
    });
});
