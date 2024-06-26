import type { CoreParam } from './main';
import type { InferParams, ParamDefaults, Part, PartId } from './theme-types';
/**
 * Version of Object.entries typed to allow easy iteration over objects. Callers
 * must promise that objects passed do not have any additional keys over those
 * included in the type
 */
export declare const typedEntries: <K extends string | number | symbol, V>(record: Record<K, V>) => [K, V][];
export declare const colorParamToCss: (value: string | number) => string;
export declare const kebabCase: (str: string) => string;
export declare const paramToVariableName: (paramName: string) => string;
export declare const clamp: (value: number, min: number, max: number) => number;
export declare const logErrorMessage: (message: unknown, error?: unknown) => void;
export declare const proportionToPercent: (value: number) => number;
export type DefinePartArgs<T extends string, O extends string, D extends Part<string>[]> = {
    partId: PartId;
    variantId: string;
    /**
     * Override params already defined by core or the extended part.
     */
    overrideParams?: Partial<ParamDefaults<O>>;
    /**
     * Additional params made available by this part. These are added to the
     * inferred params type of the part.
     */
    additionalParams?: ParamDefaults<T>;
    /**
     * Parts that this part depends on. The params of the dependent parts will be
     * added to this part's inferred params type.
     */
    dependencies?: () => D;
    /**
     * CSS to be included in the theme when this part is used, either as a string
     * or a functions that returns one.
     */
    css?: Array<string | (() => string)>;
};
/**
 * Define a theme part, inferring its params type.
 */
export declare const definePart: <T extends string = never, D extends Part<string>[] = Part<never>[]>(args: DefinePartArgs<T, CoreParam, D>) => Part<T | InferParams<D>>;
/**
 * Define a part based on an existing part. The content and inferred params type
 * of the base part will be merged with the new definitions.
 */
export declare const extendPart: <E extends string, T extends never, D extends Part<never>[] = Part<never>[]>(base: Part<E>, ext: Omit<DefinePartArgs<T, CoreParam | E, D>, 'partId'>) => Part<E | T | InferParams<D>>;
export declare const camelCase: (str: string) => string;
