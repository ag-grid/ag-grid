import {
    type BorderStyleValue,
    type BorderValue,
    type ColorValue,
    type LengthValue,
    paramValueToCss,
} from '../../theming/api';
import { followRefs } from './renderColorValue';

export type BorderParts = {
    style?: BorderStyleValue;
    width?: LengthValue;
    color?: ColorValue;
};

export type BorderPart = keyof BorderParts;

/**
 * Whether a border draws a visible line, following references to other borders through `params`. One whose
 * colour is plain `transparent` counts as off.
 */
export const borderIsOn = (param: string, value: unknown, params: any = {}): boolean => {
    const resolved = followRefs(value, params);
    if (!resolved) {
        return false;
    }
    const css = paramValueToCss(param, resolved, null);
    return !!css && css !== 'none' && !/(^|\s)transparent$/.test(css);
};

/** The parts a value sets, following references to other borders through `params`. */
export const borderParts = (value: BorderValue | undefined, params: any = {}): BorderParts => {
    const resolved = followRefs(value, params);
    if (typeof resolved === 'string') {
        return parseBorderCss(resolved);
    }
    if (typeof resolved !== 'object' || resolved == null || 'ref' in resolved) {
        return {};
    }
    const { style, width, color } = resolved;
    return {
        ...(style != null && { style }),
        ...(width != null && { width }),
        ...(color != null && { color }),
    };
};

const CSS_BORDER_STYLES = new Set([
    'none',
    'hidden',
    'solid',
    'dotted',
    'dashed',
    'double',
    'groove',
    'ridge',
    'inset',
    'outset',
]);
const CSS_LENGTH = /^(\d*\.?\d+[a-z%]*|thin|medium|thick|calc\(.*\))$/i;

/** Splits a `border` shorthand such as `2px dashed red`; one it cannot place every token of sets no parts. */
const parseBorderCss = (css: string): BorderParts => {
    const parts: BorderParts = {};
    for (const token of css.trim().match(/[^\s(]+(\([^)]*\))?/g) ?? []) {
        const part: BorderPart | null = token.startsWith('var(')
            ? null
            : CSS_BORDER_STYLES.has(token.toLowerCase())
              ? 'style'
              : CSS_LENGTH.test(token)
                ? 'width'
                : 'color';
        if (part == null || parts[part] != null) {
            return {};
        }
        parts[part] = token;
    }
    return parts;
};

/** Sets one part, or clears it back to its default when `partValue` is null. */
export const withBorderPart = <K extends BorderPart>(
    value: BorderValue | undefined,
    part: K,
    partValue: BorderParts[K] | null,
    params?: any
): BorderValue => {
    const parts = borderParts(value, params);
    if (partValue == null) {
        delete parts[part];
    } else {
        parts[part] = partValue;
    }
    return Object.keys(parts).length ? parts : true;
};
