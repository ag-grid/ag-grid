import type { LocaleService } from './localeService';

export type LocaleTextFunc = (key: string, defaultValue: string, variableValues?: string[]) => string;

function defaultLocaleTextFunc(_key: string, defaultValue: string): string {
    return defaultValue;
}

export function _getLocaleTextFunc(localeService?: LocaleService): LocaleTextFunc {
    return localeService?.getLocaleTextFunc() ?? defaultLocaleTextFunc;
}
