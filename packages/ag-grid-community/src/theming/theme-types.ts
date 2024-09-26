import { _errorOnce } from '../utils/function';
import type { CoreParams } from './core/core-css';
import { clamp, memoize, paramToVariableExpression } from './theme-utils';

export type CssFragment = string | (() => string);

export type Feature = 'colorScheme' | 'iconSet' | 'checkboxStyle' | 'inputStyle' | 'tabStyle';

export type ParamType =
    | 'color'
    | 'colorScheme'
    | 'length'
    | 'scale'
    | 'border'
    | 'borderStyle'
    | 'shadow'
    | 'image'
    | 'fontFamily'
    | 'fontWeight'
    | 'duration';

/**
 * Return the ParamType for a given param name,
 */
export const getParamType = memoize((param: string): ParamType => {
    //
    // IMPORTANT! If adding new supported suffixes, add them to the union types (e.g. ColorParam) below
    //
    if (/Color$/.test(param)) return 'color';
    if (/Scale?$/.test(param)) return 'scale';
    if (
        param === 'spacing' ||
        /(Padding|Spacing|Size|Width|Height|Radius|Indent|Start|End|Top|Bottom|Horizontal|Vertical)$/.test(param)
    ) {
        return 'length';
    }
    if (/Border$/.test(param)) return 'border';
    if (/BorderStyle$/.test(param)) return 'borderStyle';
    if (/Shadow$/.test(param)) return 'shadow';
    if (/Image$/.test(param)) return 'image';
    if (/Family$/.test(param)) return 'fontFamily';
    if (/Weight$/.test(param)) return 'fontWeight';
    if (/Duration$/.test(param)) return 'duration';
    if (/ColorScheme$/.test(param)) return 'colorScheme';
    throw new Error(`"${param}" is not a valid theme parameter.`);
});

type ColorParam = CoreParamWithSuffix<'Color'>;
type LengthParam =
    | 'spacing'
    | CoreParamWithSuffix<
          | 'Padding'
          | 'Spacing'
          | 'Size'
          | 'Width'
          | 'Height'
          | 'Radius'
          | 'Indent'
          | 'Start'
          | 'End'
          | 'Top'
          | 'Bottom'
          | 'Horizontal'
          | 'Vertical'
      >;
type BorderParam = CoreParamWithSuffix<'Border'>;
type ShadowParam = CoreParamWithSuffix<'Shadow'>;
type ImageParam = CoreParamWithSuffix<'Image'>;
type FontFamilyParam = CoreParamWithSuffix<'Family'>;
type DurationParam = CoreParamWithSuffix<'Duration'>;

const literalToCSS = (value: string | number): string | false => {
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);
    return false;
};

type CoreParamWithSuffix<Suffix extends string> = {
    [K in keyof CoreParams]: K extends `${infer _}${Suffix}` ? K : never;
}[keyof CoreParams];

// string & {} used to preserve auto-complete from string union but allow any string
// eslint-disable-next-line @typescript-eslint/ban-types
type AnyString = string & {};

/**
 * The 'brand color' for the grid, used wherever a non-neutral color is
 * required. Selections, focus outlines and checkboxes use the accent color by
 * default.
 */
export type ColorValue =
    | string
    | {
          /**
           * The name of the color parameter to reference
           */
          ref: ColorParam | AnyString;
          /**
           * Enable color mixing. Provide a value between 0 and 1 determining the amount of the referenced color used in the mix.
           *
           * By default, the referenced color will be mixed with `transparent` so 0 = fully transparent and 1 = fully opaque.
           */
          mix?: number;
          /**
           * Provide a second color reference to mix with instead of `transparent` This has no effect if `mix` is unspecified.
           */
          onto?: ColorParam | AnyString;
      };

const colorValueToCss = (value: ColorValue): string | false => {
    if (typeof value === 'string') return value;
    if ('ref' in value) {
        const colorExpr: string = paramToVariableExpression(value.ref);
        if (value.mix == null) {
            return colorExpr;
        }
        const backgroundExpr = value.onto ? 'var(--ag-background-color)' : 'transparent';
        return `color-mix(in srgb, ${backgroundExpr}, ${colorExpr} ${clamp(value.mix * 100, 0, 100)}%)`;
    }
    return false;
};

/**
 * A CSS color-scheme value, e.g. "light", "dark", or "inherit" to use the
 * same setting as the parent application
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/color-scheme
 */
export type ColorSchemeValue = 'light' | 'dark' | 'inherit' | 'normal';

const colorSchemeValueToCss = literalToCSS;

/**
 * A CSS dimension value with length units, e.g. "1px" or "2em". Alternatively:
 *
 * - `4` -> "4px" (a plain JavaScript number will be given pixel units)
 * - `{ref: "foo"}` -> use the same value as the `foo` param (`ref` must be a valid param name)
 * - `{calc: "foo + bar * 2"}` -> Use a dynamically calculated expression. You can use param names like spacing and fontSize in the expression, as well as built-in CSS math functions like `min(spacing, fontSize)`
 */
export type LengthValue =
    | number
    | string
    | {
          /**
           * An expression that can include param names and maths, e.g.
           * "spacing * 2". NOTE: In CSS the `-` character is valid in variable
           * names, so leave a space around it.
           */
          calc: string;
      }
    | {
          ref: LengthParam | AnyString;
      };

const lengthValueToCss = (value: LengthValue): string | false => {
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return `${value}px`;
    if ('calc' in value) {
        // ensure a space around operators other than `-` (which can be part of an identifier)
        const valueWithSpaces = value.calc.replace(/ ?[*/+] ?/g, ' $& ');
        // convert param names to variable expressions, e.g. "fooBar" -> "var(--ag-foo-bar)",
        // ignoring words that are part of function names "fooBar()" or variables "--fooBar"
        return `calc(${valueWithSpaces.replace(/-?[a-z][a-z0-9]*\b(?![-(])/gi, (p) => (p[0] === '-' ? p : ` ${paramToVariableExpression(p)} `))})`;
    }
    if ('ref' in value) return paramToVariableExpression(value.ref);
    return false;
};

/**
 * A number without units.
 */
export type ScaleValue = number;

const scaleValueToCss = literalToCSS;

/**
 * A CSS border value e.g. "solid 1px red". Alternatively an object containing optional properties:
 *
 * - `style` -> a CSS border-style, default `"solid"`
 * - `width` -> a width in pixels, default `1`
 * - `color` -> a ColorValue as you would pass to any color param, default `{ref: "borderColor"}`
 *
 * Or a reference:
 * - `{ref: "foo"}` -> use the same value as the `foo` param (`ref` must be a valid param name)
 *
 * Or boolean value
 * - `true` -> `{}` (the default border style, equivalent to `{style: "solid", width: 1, color: {ref: "borderColor"}`)
 * - `false` -> `"none"` (no border).
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/border
 */
export type BorderValue =
    | string
    | boolean
    | {
          style?: BorderStyleValue;
          width?: LengthValue;
          color?: ColorValue;
      }
    | { ref: BorderParam | AnyString };

const borderValueToCss = (value: BorderValue, param: string) => {
    if (typeof value === 'string') return value;
    if (value === true) return 'solid 1px var(--ag-border-color)';
    if (value === false) return param === 'columnBorder' ? 'solid 1px transparent' : 'none';
    if ('ref' in value) return paramToVariableExpression(value.ref);
    return (
        borderStyleValueToCss(value.style ?? 'solid') +
        ' ' +
        lengthValueToCss(value.width ?? 1) +
        ' ' +
        colorValueToCss(value.color ?? { ref: 'borderColor' })
    );
};

/**
 * A CSS box shadow value e.g. "10px 5px 5px red;". Alternatively an object containing optional properties:
 *
 * - `offsetX` -> number of pixels to move the shadow to the right, or a negative value to move left, default 0
 * - `offsetY` -> number of pixels to move the shadow downwards, or a negative value to move up, default 0
 * - `radius` -> softness of the shadow. 0 = hard edge, 10 = 10px wide blur
 * - `spread` -> size of the shadow. 0 = same size as the shadow-casting element. 10 = 10px wider in all directions.
 * - `color` -> color of the shadow e.g. `"red"`. Default `{ref: "foregroundColor"}`
 *
 * Or a reference:
 * - `{ref: "foo"}` -> use the same value as the `foo` param (`ref` must be a valid param name)
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/box-shadow
 */
export type ShadowValue =
    | string
    | false
    | {
          /**
           * Positive values move the shadow to the right, negative values move left
           *
           * @default 0
           * @see https://developer.mozilla.org/en-US/docs/Web/CSS/box-shadow
           */
          offsetX?: LengthValue;
          /**
           * Positive values move the shadow downwards, negative values move up
           *
           * @default 0
           * @see https://developer.mozilla.org/en-US/docs/Web/CSS/box-shadow
           */
          offsetY?: LengthValue;
          /**
           * Softness of the shadow. 0 = hard edge, 10 = 10px wide blur.
           *
           * @default 0
           * @see https://developer.mozilla.org/en-US/docs/Web/CSS/box-shadow
           */
          radius?: LengthValue;
          /**
           * Size of the shadow. 0 = same size as the shadow-casting element. 10 = 10px wider in all directions.
           *
           * @default 0
           * @see https://developer.mozilla.org/en-US/docs/Web/CSS/box-shadow
           */
          spread?: LengthValue;
          /**
           * Shadow color. Can accept any value that is valid for a color parameter, e.g. 'red' or {ref: 'accentColor'}
           *
           * @default {ref: 'foregroundColor'}
           */
          color?: ColorValue;
      }
    | { ref: ShadowParam | AnyString };

const shadowValueToCss = (value: ShadowValue): string | false => {
    if (typeof value === 'string') return value;
    if (value === false) return 'none';
    if ('ref' in value) return paramToVariableExpression(value.ref);
    return [
        lengthValueToCss(value.offsetX ?? 0),
        lengthValueToCss(value.offsetY ?? 0),
        lengthValueToCss(value.radius ?? 0),
        lengthValueToCss(value.spread ?? 0),
        colorValueToCss(value.color ?? { ref: 'foregroundColor' }),
    ].join(' ');
};

/**
 * A CSS line-style value e.g. "solid" or "dashed".
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/line-style
 */
export type BorderStyleValue = 'none' | 'solid' | 'dotted' | 'dashed';

const borderStyleValueToCss = literalToCSS;

/**
 * A CSS font-family value consisting of a font name or comma-separated list of fonts in order of preference e.g. `"Roboto, -apple-system, 'Segoe UI', sans-serif"`. Alternatively:
 *
 * - `["Roboto", "-apple-system", "Segoe UI", "sans-serif"]` -> an array of font names in order of preference
 * - `["Dave's Font"]` -> when passing an array, special characters in font names will automatically be escaped
 * - `{ref: "foo"}` -> use the same value as `foo` which must be a valid font family param name
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/font-family
 */
export type FontFamilyValue =
    | string
    | { googleFont: string }
    | Array<string | { googleFont: string }>
    | { ref: FontFamilyParam | AnyString };

const fontFamilyValueToCss = (value: FontFamilyValue): string | false => {
    if (typeof value === 'string') return value;
    if ('googleFont' in value) return fontFamilyValueToCss(value.googleFont);
    if ('ref' in value) return paramToVariableExpression(value.ref);
    if (Array.isArray(value)) {
        return value
            .map((font) => {
                if (typeof font === 'object' && 'googleFont' in font) {
                    font = font.googleFont;
                }
                // don't quote safe identifier names, so that people can specify fonts
                // like sans-serif which are keywords not strings
                return /^[\w-]+$/.test(font) ? font : JSON.stringify(font);
            })
            .join(', ');
    }
    return false;
};

/**
 * A CSS font-weight value e.g. `500` or `"bold"`
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/font-weight
 */
export type FontWeightValue = 'normal' | 'bold' | number;

const fontWeightValueToCss = literalToCSS;

/**
 * A CSS image value e.g. `"url(...image-url...)"`. Alternatively:
 *
 * - `{svg: "...XML source of SVG image..."}` -> embed an SVG as a data: uri
 * - `{url: "https://..."}` -> a URL to load an image asset from. Can be a HTTPS URL, or image assets such as PNGs can be converted to data: URLs
 * - `{ref: "foo"}` -> use the same value as the `foo` param (`ref` must be a valid param name)
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/image
 */
export type ImageValue =
    | string
    | {
          /**
           * The URL of an image. data: URLs can be used embed assets.
           */
          url: string;
      }
    | {
          /**
           * The XML text of an SVG file
           */
          svg: string;
      }
    | { ref: ImageParam | AnyString };

const imageValueToCss = (value: ImageValue): string | false => {
    if (typeof value === 'string') return value;
    if ('url' in value) return `url(${JSON.stringify(value.url)})`;
    if ('svg' in value) return imageValueToCss({ url: `data:image/svg+xml,${encodeURIComponent(value.svg)}` });
    if ('ref' in value) return paramToVariableExpression(value.ref);
    return false;
};

/**
 * A CSS time value with second or millisecond units e.g. `"0.3s"` or `"300ms"`. Alternatively:
 *
 * - `0.4` -> "0.4s" (a plain JavaScript number is assumed to be a number of seconds.
 * - `{ref: "foo"}` -> use the same value as the `foo` param (`ref` must be a valid param name)
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/animation-duration
 */
export type DurationValue = number | string | { ref: DurationParam | AnyString };

const durationValueToCss = (value: DurationValue, param: string): string | false => {
    if (typeof value === 'string') return value;
    if (typeof value === 'number') {
        if (value > 50) {
            _errorOnce(
                `Numeric value ${value} passed to ${param} param will be interpreted as ${value} seconds. If this is intentional use "${value}s" to silence this warning.`
            );
        }
        return `${value}s`;
    }
    if ('ref' in value) return paramToVariableExpression(value.ref);
    return false;
};

const paramValidators: Record<ParamType, (value: unknown, param: string) => string | false> = {
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

export const paramValueToCss = (param: string, value: unknown): string | false => {
    const type = getParamType(param);
    return paramValidators[type](value, param);
};
