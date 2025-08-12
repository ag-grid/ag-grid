export interface ILocaleService {
    readonly beanName: 'localeSvc';

    getLocaleTextFunc(): LocaleTextFunc;
}

export type LocaleTextFunc = (key: string, defaultValue: string, variableValues?: string[]) => string;
