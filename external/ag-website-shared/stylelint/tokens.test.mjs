import { describe, expect, test } from 'vitest';

import { findVarReferences, isMalformedToken, isPaletteToken, isTokenShaped } from './tokens.mjs';

describe('findVarReferences', () => {
    test.each`
        value                                               | expected
        ${'var(--color-fg-primary)'}                        | ${[{ name: '--color-fg-primary', interpolated: false }]}
        ${'var( --text-fs-base )'}                          | ${[{ name: '--text-fs-base', interpolated: false }]}
        ${'var(--color-code-#{$name})'}                     | ${[{ name: '--color-code-', interpolated: true }]}
        ${'var(--spacing-size-2) var(--spacing-size-4)'}    | ${[{ name: '--spacing-size-2', interpolated: false }, { name: '--spacing-size-4', interpolated: false }]}
        ${'var(--color-bg-primary, var(--color-gray-100))'} | ${[{ name: '--color-bg-primary', interpolated: false }, { name: '--color-gray-100', interpolated: false }]}
        ${'1px solid red'}                                  | ${[]}
    `('$value', ({ value, expected }) => {
        expect(findVarReferences(value)).toEqual(expected);
    });
});

describe('isMalformedToken', () => {
    test.each`
        name                        | expected
        ${'--color-fg-primary'}     | ${false}
        ${'---color-util-gray-200'} | ${true}
        ${'--text--fs-xl'}          | ${true}
    `('$name -> $expected', ({ name, expected }) => {
        expect(isMalformedToken(name)).toBe(expected);
    });
});

describe('isTokenShaped', () => {
    // Only the design system namespaces are checked against declarations; component-local variables
    // are left alone, but a doubled hyphen is always flagged whatever the namespace.
    test.each`
        name                    | expected
        ${'--color-fg-primary'} | ${true}
        ${'--text-fs-base'}     | ${true}
        ${'--layout-gap'}       | ${true}
        ${'--radius-md'}        | ${true}
        ${'--shadow-lg'}        | ${true}
        ${'--spacing-size-4'}   | ${true}
        ${'--btn-roll-i'}       | ${false}
        ${'--textual'}          | ${false}
        ${'--btn--roll'}        | ${true}
    `('$name -> $expected', ({ name, expected }) => {
        expect(isTokenShaped(name)).toBe(expected);
    });
});

describe('isPaletteToken', () => {
    test.each`
        name                       | expected
        ${'--color-gray-500'}      | ${true}
        ${'--color-brand-50'}      | ${true}
        ${'--color-util-gray-500'} | ${false}
        ${'--color-fg-primary'}    | ${false}
        ${'--text-fs-500'}         | ${false}
    `('$name -> $expected', ({ name, expected }) => {
        expect(isPaletteToken(name)).toBe(expected);
    });
});
