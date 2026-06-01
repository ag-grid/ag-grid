/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface ILocaleService<TKey extends string = string> {
    readonly beanName: 'localeSvc';

    getLocaleTextFunc(): LocaleTextFunc<TKey>;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export type LocaleTextFunc<TKey extends string = string> = (
    key: TKey,
    defaultValue: string,
    variableValues?: string[]
) => string;
