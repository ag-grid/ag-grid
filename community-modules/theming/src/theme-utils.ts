import { CoreParam } from './main';
import { InferParams, ParamDefaults, Part, PartId } from './theme-types';

/**
 * Version of Object.entries typed to allow easy iteration over objects. Callers
 * must promise that objects passed do not have any additional keys over those
 * included in the type
 */
export const typedEntries = <K extends string | number | symbol, V>(record: Record<K, V>): [K, V][] =>
    Object.entries(record) as [K, V][];

export const colorParamToCss = (value: string | number) => {
    if (typeof value !== 'number') return value;
    const percent = Math.round(value * 1000) / 10;
    return `color-mix(in srgb, transparent, var(--ag-foreground-color) ${percent}%)`;
};

export const kebabCase = (str: string) => str.replace(/[A-Z]/g, (m) => `-${m}`).toLowerCase();

export const paramToVariableName = (paramName: string) => `--ag-${kebabCase(paramName)}`;

export const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export const logErrorMessage = (message: unknown, error?: unknown) => {
    if (error) {
        // eslint-disable-next-line no-console
        console.error(message, error);
    } else {
        // eslint-disable-next-line no-console
        console.error(message);
    }
};

export const proportionToPercent = (value: number) => Math.round(Math.max(0, Math.min(1, value)) * 1000) / 10;

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
export const definePart = <T extends string = never, D extends Part<string>[] = Part<never>[]>(
    args: DefinePartArgs<T, CoreParam, D>
): Part<T | InferParams<D>> => {
    return {
        ...args,
        defaults: { ...args.additionalParams, ...args.overrideParams } as any,
        css: args.css || [],
        dependencies: args.dependencies || (() => []),
    };
};

/**
 * Define a part based on an existing part. The content and inferred params type
 * of the base part will be merged with the new definitions.
 */
export const extendPart = <E extends string, T extends never, D extends Part<never>[] = Part<never>[]>(
    base: Part<E>,
    ext: Omit<DefinePartArgs<T, CoreParam | E, D>, 'partId'>
): Part<E | T | InferParams<D>> => {
    return {
        partId: base.partId,
        variantId: ext.variantId,
        dependencies: () => base.dependencies().concat(ext.dependencies?.() || []),
        defaults: { ...base.defaults, ...ext.additionalParams, ...ext.overrideParams } as any,
        css: base.css.concat(ext.css || []),
    };
};

export const camelCase = (str: string) => str.replace(/[\W_]+([a-z])/g, (_, letter) => letter.toUpperCase());
