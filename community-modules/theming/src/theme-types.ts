import type { Param, ParamTypes } from './GENERATED-param-types';

export type PartId = 'core' | 'colorScheme' | 'iconSet' | 'design' | 'tabStyle' | 'inputStyle';

export type Part<T extends string = string> = {
    partId: PartId;
    variantId: string;
    dependencies: () => Part[];
    defaults: { [K in T]: K extends Param ? ParamTypes[K] : any };
    css: Array<string | (() => string)>;
};

export type InferParams<T extends Part | Part[]> = T extends Part[]
    ? InferParams<T[number]>
    : T extends Part<infer P>
      ? P
      : never;

export const getPartParams = <T extends string>(part: Part<T>): T[] => Object.keys(part.defaults) as T[];

export type ParamDefaults<T extends string> = {
    [K in T]: K extends Param ? ParamTypes[K] : any;
};

// TODO introduce references, and use branded types to filter the keys on
// ParamTypes so that you can only reference values of the correct type export
// type Ref = { ref: Param }; type BrandedType<B extends string, T = any> = {__type?: B } & T;

export type ColorValue = string;

export const colorValueToCss = (value: ColorValue) => String(value);

export const isColorValue = (value: unknown): value is ColorValue => typeof value === 'string';

export type LengthValue = string; // TODO allow number and treat as px

export const lengthValueToCss = (value: LengthValue) => String(value);

export const isLengthValue = (value: unknown): value is LengthValue => typeof value === 'string';

export type BorderValue = string | boolean; // TODO allow boolean and treat as treat as "1px solid var(--ag-border-color)" / "none"

export const borderValueToCss = (value: BorderValue) => {
    if (value === true) return 'solid 1px var(--ag-border-color)';
    if (value === false) return 'none';
    return String(value);
};

export const isBorderValue = (value: unknown): value is BorderValue => typeof value === 'string';

export type ShadowValue = string; // TODO object shorthand for common shadows? Or maybe just allow var(accentColor) in value

export const shadowValueToCss = (value: ShadowValue) => String(value);

export const isShadowValue = (value: unknown): value is ShadowValue => typeof value === 'string';

export type BorderStyleValue = string;

export const borderStyleValueToCss = (value: BorderStyleValue) => String(value);

export const isBorderStyleValue = (value: unknown): value is BorderStyleValue => typeof value === 'string';

export type DisplayValue = string; // TODO allow boolean and treat as block/none

export const displayValueToCss = (value: DisplayValue) => String(value);

export const isDisplayValue = (value: unknown): value is DisplayValue => typeof value === 'string';

export type FontFamilyValue = string;

export const fontFamilyValueToCss = (value: FontFamilyValue) => String(value);

export const isFontFamilyValue = (value: unknown): value is FontFamilyValue => typeof value === 'string';

export type FontWeightValue = string; // TODO allow number and treat as unitless

export const fontWeightValueToCss = (value: FontWeightValue) => String(value);

export const isFontWeightValue = (value: unknown): value is FontWeightValue => typeof value === 'string';

export type ImageValue = string;

export const imageValueToCss = (value: ImageValue) => String(value);

export const isImageValue = (value: unknown): value is ImageValue => typeof value === 'string';

export type DurationValue = string;

export const durationValueToCss = (value: DurationValue) => String(value);

export const isDurationValue = (value: unknown): value is DurationValue => typeof value === 'string';
