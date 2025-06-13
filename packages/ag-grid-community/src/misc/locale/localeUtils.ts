import type { LocaleService } from './localeService';

export type LocaleTextFunc = (key: string, defaultValue: string, variableValues?: string[]) => string;

function defaultLocaleTextFunc(_key: string, defaultValue: string): string {
    return defaultValue;
}

export function _getLocaleTextFunc(localeSvc?: LocaleService): LocaleTextFunc {
    return localeSvc?.getLocaleTextFunc() ?? defaultLocaleTextFunc;
}

export function _translate<T extends Record<string, string | ((variableValues: string[]) => string)>>(
    bean: { getLocaleTextFunc(): LocaleTextFunc },
    localeValues: T,
    key: keyof T & string,
    variableValues?: string[]
): string {
    const defaultValue = localeValues[key];
    return bean.getLocaleTextFunc()(
        key,
        typeof defaultValue === 'function' ? defaultValue(variableValues!) : defaultValue,
        variableValues
    );
}
