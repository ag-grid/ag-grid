import { _errorOnce } from '@ag-grid-community/core';

import type {
    BorderParam,
    ColorParam,
    DurationParam,
    FontFamilyParam,
    ImageParam,
    LengthParam,
    ShadowParam,
    ThemeParam,
    ThemeParams,
} from './GENERATED-param-types';
import { ThemeUnit } from './ThemeUnit';
import type { CoreParam } from './parts/core/core-part';
import { clamp, memoize, paramToVariableExpression } from './theme-utils';

export type CssFragment = string | (() => string);

export type Part<T extends ThemeParam = never> = {
    readonly group: string;
    readonly variant: string;
    readonly id: string;
    readonly dependencies: readonly Part[];
    readonly defaults: Partial<ThemeParams>;
    readonly css: ReadonlyArray<CssFragment>;
    readonly availableParams: ReadonlySet<T>;

    /**
     * Add one or more dependent part. The part will replace any existing part
     * of the same group
     */
    usePart<D extends ThemeParam>(part: Part<D>): Part<T | D>;

    /**
     * Provide new values for theme params. You may only provide values for
     * params provided by the part's dependencies.
     */
    overrideParams(defaults: Partial<Pick<ThemeParams, T | CoreParam>>): Part<T>;

    /**
     * Provide a new fragment of CSS source code.
     */
    addCss(css: CssFragment): Part<T>;

    /**
     * Create a new part variant copying data from this part
     */
    createVariant(variant: string): Part<T>;

    /**
     * Create a new theme part with additional params. Unlike `overrideParams`,
     * this can be used to declare that this param adds support for new params
     * not already in the parts dependencies
     */
    addParams<A extends ThemeParam>(defaults: Pick<ThemeParams, A>): Part<T | A>;
};

export const createPart = (group: string, variant: string): Part => new ThemeUnit(group, variant);

export type Theme<T extends ThemeParam = never> = {
    readonly id: string;
    readonly dependencies: readonly Part[];
    readonly defaults: Partial<ThemeParams>;
    readonly css: ReadonlyArray<CssFragment>;
    readonly availableParams: ReadonlySet<T>;

    /**
     * Add one or more dependent part. The part will replace any existing part
     * of the same group
     */
    usePart<D extends ThemeParam>(part: Part<D>): Theme<T | D>;

    /**
     * Provide new values for theme params. You may only provide values for
     * params provided by the part's dependencies.
     */
    overrideParams(defaults: Partial<Pick<ThemeParams, T | CoreParam>>): Theme<T>;

    /**
     * Provide a new fragment of CSS source code.
     */
    addCss(css: CssFragment): Theme<T>;

    /**
     * Inject CSS for this theme into the current page. A promise is returned
     * that resolves when all inserted stylesheets have loaded.
     *
     * Only one theme can be installed at a time. Calling this method will
     * replace any previously installed theme.
     */
    install(args?: ThemeInstallArgs): Promise<void>;

    /**
     * Return the complete rendered CSS for this theme. This can be used at
     * build time to generate CSS if your application requires that CSS be
     * served from a static file.
     */
    getCSS(args?: ThemeRenderArgs): string;

    /**
     * Return the params used to render the theme, taking into account default
     * values and any overrides provided
     */
    getParams(): Partial<ThemeParams>;
};

export type ThemeRenderArgs = {
    /**
     * Whether to load supported fonts from the Google Fonts server.
     *
     * - `true` -> load fonts automatically if your theme uses them
     * - `false` -> do not load fonts, you must either load them from Google Fonts
     *   yourself or download them and serve them from your app
     */
    loadGoogleFonts?: boolean;
};

export type ThemeInstallArgs = ThemeRenderArgs & {
    /**
     * The container that the grid is rendered within. If the grid is rendered
     * inside a shadow DOM root, you must pass the grid's parent element to
     * ensure that the styles are loaded into the shadow DOM rather than the
     * containing document.
     */
    container?: HTMLElement;
};

export const createTheme = (name: string): Theme<CoreParam> => new ThemeUnit('theme', name);

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
    if (/Color$/.test(param)) return 'color';
    if (/Scale?$/.test(param)) return 'scale';
    if (/(Padding|Spacing|Size|Width|Height|Radius|Indent)(Start|End|Top|Bottom|Horizontal|Vertical)?$/.test(param))
        return 'length';
    if (/Border$/.test(param)) return 'border';
    if (/BorderStyle$/.test(param)) return 'borderStyle';
    if (/Shadow$/.test(param)) return 'shadow';
    if (/Image$/.test(param)) return 'image';
    if (/[fF]ontFamily$/.test(param)) return 'fontFamily';
    if (/[fF]ontWeight$/.test(param)) return 'fontWeight';
    if (/Duration$/.test(param)) return 'duration';
    if (/ColorScheme$|^colorScheme$/.test(param)) return 'colorScheme';
    throw new Error(`ThemeParam "${param}" does not have a recognised suffix.`);
});

const literalToCSS = (value: string | number): string | false => {
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);
    return false;
};

export type ColorValue =
    | string
    | {
          /**
           * The name of the color parameter to reference
           */
          ref: ColorParam;
          /**
           * Enable color mixing. Provide a value between 0 and 1 determining the amount of the referenced color used in the mix.
           *
           * By default, the referenced color will be mixed with `transparent` so 0 = fully transparent and 1 = fully opaque.
           */
          mix?: number;
          /**
           * Provide a second color reference to mix with instead of `transparent` This has no effect if `mix` is unspecified.
           */
          onto?: ColorParam;
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

export type ColorSchemeValue = 'light' | 'dark' | 'inherit' | 'normal';

const colorSchemeValueToCss = literalToCSS;

export type LengthValue =
    | number
    | string
    | {
          /**
           * An expression that can include param names and maths, e.g.
           * "gridSize * 2". NOTE: this is converted into a CSS calc expression.
           * The rules of CSS calc require a space between operators and
           * variables, so "gridSize*2" is invalid.
           */
          calc: string;
      }
    | {
          ref: LengthParam;
      };

const lengthValueToCss = (value: LengthValue): string | false => {
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return `${value}px`;
    if ('calc' in value) {
        // convert param names to variable expressions, e.g. "fooBar" -> "var(--ag-foo-bar)",
        // ignoring words that are part of function names "fooBar()" or variables "--fooBar"
        return `calc(${value.calc.replace(/(?<!(\w|--[\w-]*))([a-z][a-z0-9]*\b)(?!\s*\()/gi, (p) => ` ${paramToVariableExpression(p)} `)})`;
    }
    if ('ref' in value) return paramToVariableExpression(value.ref);
    return false;
};

export type ScaleValue = number;

const scaleValueToCss = literalToCSS;

export type BorderValue =
    | string
    | boolean
    | {
          style?: BorderStyleValue;
          width?: LengthValue;
          color?: ColorValue;
      }
    | { ref: BorderParam };

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
    | { ref: ShadowParam };

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

export type BorderStyleValue = 'none' | 'solid' | 'dotted' | 'dashed';

const borderStyleValueToCss = literalToCSS;

export type FontFamilyValue =
    | string
    | { googleFont: string }
    | Array<string | { googleFont: string }>
    | { ref: FontFamilyParam };

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

export type FontWeightValue = 'normal' | 'bold' | number;

const fontWeightValueToCss = literalToCSS;

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
    | { ref: ImageParam };

const imageValueToCss = (value: ImageValue): string | false => {
    if (typeof value === 'string') return value;
    if ('url' in value) return `url(${JSON.stringify(value.url)})`;
    if ('svg' in value) return imageValueToCss({ url: `data:image/svg+xml,${encodeURIComponent(value.svg)}` });
    if ('ref' in value) return paramToVariableExpression(value.ref);
    return false;
};

export type DurationValue = number | string | { ref: DurationParam };

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
