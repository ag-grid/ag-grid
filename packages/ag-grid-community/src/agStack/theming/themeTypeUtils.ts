import type { ThemeLogger } from './themeLogger';
import type {
    BorderValue,
    ColorValue,
    DurationValue,
    FontFamilyValue,
    ImageValue,
    LengthValue,
    ShadowValue,
} from './themeTypes';
import { clamp, memoize, paramToVariableExpression } from './themeUtils';

export const paramTypes = [
    'colorScheme',
    'color',
    'length',
    'scale',
    'borderStyle',
    'border',
    'shadow',
    'image',
    'fontFamily',
    'fontWeight',
    'duration',
] as const;

export type ParamType = (typeof paramTypes)[number];

/**
 * Return the ParamType for a given param name,
 */
export const getParamType = memoize((param: string): ParamType => {
    param = param.toLowerCase();
    return paramTypes.find((type) => param.endsWith(type.toLowerCase())) ?? 'length';
});

const literalToCSS = (value: string | number | { ref: string }): string | false => {
    if (typeof value === 'object' && value?.ref) {
        return paramToVariableExpression(value.ref);
    }
    if (typeof value === 'string') {
        return value;
    }
    if (typeof value === 'number') {
        return String(value);
    }
    return false;
};

export const colorValueToCss = (value: ColorValue): string | false => {
    if (typeof value === 'string') {
        return value;
    }
    if (value && 'ref' in value) {
        const colorExpr: string = paramToVariableExpression(value.ref);
        if (value.mix == null) {
            return colorExpr;
        }
        const backgroundExpr = value.onto ? paramToVariableExpression(value.onto) : 'transparent';
        return `color-mix(in srgb, ${backgroundExpr}, ${colorExpr} ${clamp(value.mix * 100, 0, 100)}%)`;
    }
    return false;
};

export const colorSchemeValueToCss = literalToCSS;

export const lengthValueToCss = (value: LengthValue): string | false => {
    if (typeof value === 'string') {
        return value;
    }
    if (typeof value === 'number') {
        return `${value}px`;
    }
    if (value && 'calc' in value) {
        // ensure a space around operators other than `-` (which can be part of an identifier)
        const valueWithSpaces = value.calc.replace(/ ?[*/+] ?/g, ' $& ');
        // convert param names to variable expressions, e.g. "fooBar" -> "var(--ag-foo-bar)",
        // ignoring words that are part of function names "fooBar()" or variables "--fooBar"
        return `calc(${valueWithSpaces.replace(/-?\b[a-z][a-z0-9]*\b(?![-(])/gi, (p) => (p[0] === '-' ? p : ' ' + paramToVariableExpression(p) + ' '))})`;
    }
    if (value && 'ref' in value) {
        return paramToVariableExpression(value.ref);
    }
    return false;
};

export const scaleValueToCss = literalToCSS;

export const borderValueToCss = (value: BorderValue, param: string): string => {
    if (typeof value === 'string') {
        return value;
    }
    if (value === true) {
        return borderValueToCss({}, param);
    }
    if (value === false) {
        return param === 'columnBorder' ? borderValueToCss({ color: 'transparent' }, param) : 'none';
    }
    if (value && 'ref' in value) {
        return paramToVariableExpression(value.ref);
    }
    return (
        borderStyleValueToCss(value.style ?? 'solid') +
        ' ' +
        lengthValueToCss(value.width ?? { ref: 'borderWidth' }) +
        ' ' +
        colorValueToCss(value.color ?? { ref: 'borderColor' })
    );
};

export const shadowValueToCss = (value: ShadowValue): string | false => {
    if (typeof value === 'string') {
        return value;
    }
    if (value === false) {
        return 'none';
    }
    if (value && 'ref' in value) {
        return paramToVariableExpression(value.ref);
    }
    return [
        lengthValueToCss(value.offsetX ?? 0),
        lengthValueToCss(value.offsetY ?? 0),
        lengthValueToCss(value.radius ?? 0),
        lengthValueToCss(value.spread ?? 0),
        colorValueToCss(value.color ?? { ref: 'foregroundColor' }),
    ].join(' ');
};

export const borderStyleValueToCss = literalToCSS;

export const fontFamilyValueToCss = (value: FontFamilyValue): string | false => {
    // normally string values are passed through as CSS without modification,
    // but for fonts this means you need to add internal quotes around font
    // names like `fontFamily: '"Times New Roman"'` which is a bit awkward. So
    // we add the quotes, unless a comma is present in which case we assume that
    // it's a list of correctly quoted font names
    if (typeof value === 'string') {
        return value.includes(',') ? value : quoteUnsafeChars(value);
    }

    if (value && 'googleFont' in value) {
        return fontFamilyValueToCss(value.googleFont);
    }
    if (value && 'ref' in value) {
        return paramToVariableExpression(value.ref);
    }
    if (Array.isArray(value)) {
        return value
            .map((font) => {
                if (typeof font === 'object' && 'googleFont' in font) {
                    font = font.googleFont;
                }
                return quoteUnsafeChars(font);
            })
            .join(', ');
    }
    return false;
};

const quoteUnsafeChars = (font: string) =>
    // don't quote var() expressions or quote safe identifier names, so that
    // people can specify fonts like sans-serif which are keywords not strings,
    // or var(--my-var)
    /^[\w-]+$|\w\(/.test(font) ? font : JSON.stringify(font);

export const fontWeightValueToCss = literalToCSS;

export const imageValueToCss = (value: ImageValue): string | false => {
    if (typeof value === 'string') {
        return value;
    }
    if (value && 'url' in value) {
        return `url(${JSON.stringify(value.url)})`;
    }
    if (value && 'svg' in value) {
        return imageValueToCss({ url: `data:image/svg+xml,${encodeURIComponent(value.svg)}` });
    }
    if (value && 'ref' in value) {
        return paramToVariableExpression(value.ref);
    }
    return false;
};

export const durationValueToCss = (value: DurationValue, param: string, themeLogger: ThemeLogger): string | false => {
    if (typeof value === 'string') {
        return value;
    }
    if (typeof value === 'number') {
        if (value >= 10) {
            themeLogger.warn(104, { value, param });
        }
        return `${value}s`;
    }
    if (value && 'ref' in value) {
        return paramToVariableExpression(value.ref);
    }
    return false;
};

const paramValidators: Record<ParamType, (value: unknown, param: string, themeLogger: ThemeLogger) => string | false> =
    {
        color: colorValueToCss,
        colorScheme: colorSchemeValueToCss,
        length: lengthValueToCss,
        scale: scaleValueToCss,
        border: borderValueToCss,
        borderStyle: borderStyleValueToCss,
        shadow: shadowValueToCss,
        image: imageValueToCss,
        fontFamily: fontFamilyValueToCss,
        fontWeight: fontWeightValueToCss,
        duration: durationValueToCss,
    };

export const paramValueToCss = (param: string, value: unknown, themeLogger: ThemeLogger): string | false => {
    const type = getParamType(param);
    return paramValidators[type](value, param, themeLogger);
};
