import type { ColorValue } from './themeTypes';

const kebabCase = (str: string) => str.replace(/[A-Z]|\d+/g, (m) => `-${m}`).toLowerCase();

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export const paramToVariableName = (paramName: string) => `--ag-${kebabCase(paramName)}`;

export const paramToVariableExpression = (paramName: string) => `var(${paramToVariableName(paramName)})`;

export const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export const memoize = <R, A = void>(fn: (arg: A) => R): ((arg: A) => R) => {
    const values = new Map<A, R>();
    return (a) => {
        const key = a;
        if (!values.has(key)) {
            values.set(key, fn(a));
        }
        return values.get(key)!;
    };
};

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export const accentMix = (mix: number): ColorValue => ({ ref: 'accentColor', mix });
/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export const foregroundMix = (mix: number): ColorValue => ({ ref: 'foregroundColor', mix });
/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export const foregroundBackgroundMix = (mix: number): ColorValue => ({
    ref: 'foregroundColor',
    mix,
    onto: 'backgroundColor',
});
/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export const foregroundHeaderBackgroundMix = (mix: number): ColorValue => ({
    ref: 'foregroundColor',
    mix,
    onto: 'headerBackgroundColor',
});
/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export const backgroundColor: ColorValue = { ref: 'backgroundColor' };
/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export const foregroundColor: ColorValue = { ref: 'foregroundColor' };

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export const accentColor: ColorValue = { ref: 'accentColor' };
