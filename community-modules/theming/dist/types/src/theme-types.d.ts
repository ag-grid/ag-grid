import type { Param, ParamTypes } from './GENERATED-param-types';
export type PartId = 'core' | 'colorScheme' | 'iconSet' | 'design' | 'tabStyle' | 'inputStyle';
export type Part<T extends string = string> = {
    partId: PartId;
    variantId: string;
    dependencies: () => Part[];
    defaults: {
        [K in T]: K extends Param ? ParamTypes[K] : any;
    };
    additionalParamNames?: string[];
    css: Array<string | (() => string)>;
};
export type InferParams<T extends Part | Part[]> = T extends Part[] ? InferParams<T[number]> : T extends Part<infer P> ? P : never;
export declare const getPartParams: <T extends string>(part: Part<T>) => T[];
export type ParamDefaults<T extends string> = {
    [K in T]: K extends Param ? ParamTypes[K] : any;
};
export type ParamType = 'color' | 'colorScheme' | 'length' | 'scale' | 'border' | 'borderStyle' | 'shadow' | 'image' | 'fontFamily' | 'fontWeight' | 'display' | 'duration';
export declare const getParamType: (param: string) => ParamType;
export type ColorValue = string;
export type ColorSchemeValue = 'inherit' | 'light' | 'dark' | (string & {});
export type LengthValue = string | number;
export type ScaleValue = string;
export type BorderValue = string | boolean;
export type ShadowValue = string;
export type BorderStyleValue = 'none' | 'solid' | 'dotted' | 'dashed' | (string & {});
export type DisplayValue = string | boolean;
export type FontFamilyValue = string | string[];
export type FontWeightValue = string | number;
export type ImageValue = string;
export type DurationValue = string;
export declare const paramValueToCss: (param: string, value: unknown) => string | Error;
