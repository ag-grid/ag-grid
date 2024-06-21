import type { Param, ParamTypes } from './GENERATED-param-types';

export type PartId = 'core' | 'colorScheme' | 'iconSet' | 'design' | 'tabStyle' | 'inputStyle';

export type Part<T extends string = string> = {
    partId: PartId;
    variantId: string;
    dependencies: () => Part[];
    // TODO make this Partial<ParamTypes>
    defaults: { [K in T]: K extends Param ? ParamTypes[K] : any };
    additionalParamNames?: string[];
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

// TODO use valueToCss(param, value) that both validates and converts values in one step
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
    | 'display'
    | 'duration';

export const getParamType = (param: string): ParamType => {
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
    if (/Display$/.test(param)) return 'display';
    if (/ColorScheme$|^colorScheme$/.test(param)) return 'colorScheme';
    throw new Error(`Param "${param}" does not have a recognised suffix.`);
};

const stringDirectToCss = (value: unknown): string | Error => {
    if (typeof value === 'string') return value;
    return Error(`Expected a string`);
};

const stringOrNumberDirectToCss = (value: unknown): string | Error => {
    if (typeof value === 'string' || (typeof value === 'number' && !isNaN(value))) return String(value);
    return Error(`Expected a string or number`);
};

export type ColorValue = string;

export type ColorSchemeValue = 'inherit' | 'light' | 'dark' | (string & {});

export type LengthValue = string | number;

const lengthValueToCss = (value: unknown): string | Error => {
    if (typeof value === 'string') return value;
    if (typeof value === 'number' && !isNaN(value)) return `${value}px`;
    return Error(`Expected a string or number`);
};

export type ScaleValue = string; // TODO allow number and treat as px

export type BorderValue = string | boolean;

const borderValueToCss = (value: BorderValue, param: string) => {
    if (value === true) return 'solid 1px var(--ag-border-color)';
    if (value === false) return param === 'columnBorder' ? 'solid 1px transparent' : 'none';
    if (typeof value === 'string') return value;
    return Error(`Expected a string or boolean`);
};

export type ShadowValue = string; // TODO object shorthand for common shadows? Or maybe just allow var(accentColor) in value

export type BorderStyleValue = 'none' | 'solid' | 'dotted' | 'dashed' | (string & {});

export type DisplayValue = string | boolean;

const displayValueToCss = (value: DisplayValue) => {
    if (value === true) return 'block';
    if (value === false) return 'none';
    if (typeof value === 'string') return value;
    return Error(`Expected a string or boolean`);
};

export type FontFamilyValue = string | string[];

const fontFamilyValueToCss = (value: FontFamilyValue): string => {
    if (Array.isArray(value)) return value.map(fontFamilyValueToCss).join(', ');
    // quote values with spaces that are not already quoted and do not include function expressions
    value = value.replace(/^google:/i, '');
    if (/\s/.test(value) && !/[()'"]/.test(value)) return `'${value}'`;
    return value;
};

export type FontWeightValue = string | number;

export type ImageValue = string;

export type DurationValue = string;

const paramValidators: Record<ParamType, (value: unknown, param: string) => string | Error> = {
    color: stringDirectToCss,
    colorScheme: stringDirectToCss,
    length: lengthValueToCss,
    scale: stringOrNumberDirectToCss,
    border: borderValueToCss,
    borderStyle: stringDirectToCss,
    shadow: stringDirectToCss,
    image: stringDirectToCss,
    fontFamily: fontFamilyValueToCss,
    fontWeight: stringOrNumberDirectToCss,
    display: displayValueToCss,
    duration: stringDirectToCss,
};

export const paramValueToCss = (param: string, value: unknown): string | Error => {
    const type = getParamType(param);
    return paramValidators[type](value, param);
};
