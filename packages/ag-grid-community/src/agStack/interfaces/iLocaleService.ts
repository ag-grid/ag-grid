export interface ILocaleService {
    getLocaleTextFunc(): LocaleTextFunc;
}

export type LocaleTextFunc = (key: string, defaultValue: string, variableValues?: string[]) => string;
