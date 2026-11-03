import { type ColorValue } from '../../theming/api';
import { type ThemeParam, clamp } from '../../theming/utils';

export function renderColorValue(property: ThemeParam, params: any, stack: Set<ThemeParam>): string {
    if (stack.has(property)) {
        throw new Error(`Circular reference detected resolving default value for ${property}`);
    }
    stack.add(property);
    try {
        return resolveColorValue(params[property], params, stack);
    } finally {
        stack.delete(property);
    }
}

/** A colour value as CSS, with its references to `params` written out. */
export function resolveColorValue(value: ColorValue, params: any, stack: Set<ThemeParam> = new Set()): string {
    if (!isRef(value)) {
        return value;
    }
    const colorExpr = renderColorValue(value.ref, params, stack);
    if (!value.mix) {
        return colorExpr;
    }
    const backgroundExpr = value.onto ? renderColorValue(value.onto, params, stack) : 'transparent';
    return `color-mix(in srgb, ${backgroundExpr}, ${colorExpr} ${clamp(value.mix * 100, 0, 100)}%)`;
}

/** Follows plain references to another param, such as `{ ref: 'borderWidth' }`, to the value they end at. */
export function followRefs<T>(value: T, params: any): T {
    const seen = new Set<string>();
    let resolved: unknown = value;
    while (isRef(resolved) && resolved.mix == null) {
        if (seen.has(resolved.ref)) {
            throw new Error(`Circular reference detected resolving ${resolved.ref}`);
        }
        seen.add(resolved.ref);
        resolved = params[resolved.ref];
    }
    return resolved as T;
}

const isRef = (value: unknown): value is { ref: string; mix?: number; onto?: string } =>
    typeof value === 'object' && value != null && 'ref' in value && typeof value.ref === 'string';
