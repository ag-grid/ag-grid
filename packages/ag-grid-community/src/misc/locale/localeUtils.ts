import type { LocaleService } from './localeService';

function defaultLocaleTextFunc(_key: string, defaultValue: string): string {
    return defaultValue;
}

export function _getLocaleTextFunc(
    localeService?: LocaleService
): (key: string, defaultValue: string, variableValues?: string[]) => string {
    return localeService?.getLocaleTextFunc() ?? defaultLocaleTextFunc;
}
