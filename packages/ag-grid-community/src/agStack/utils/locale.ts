import type { ILocaleService, LocaleTextFunc } from '../interfaces/iLocaleService';

function defaultLocaleTextFunc(_key: string, defaultValue: string): string {
    return defaultValue;
}

export function _getLocaleTextFunc<TKey extends string = string>(
    localeSvc?: ILocaleService<TKey>
): LocaleTextFunc<TKey> {
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

export function _getLocaleTextFromFunc(
    getLocaleText: (params: { key: string; defaultValue: string; variableValues?: string[] }) => string
): LocaleTextFunc {
    return (key, defaultValue, variableValues) => {
        return getLocaleText({
            key,
            defaultValue,
            variableValues,
        });
    };
}

export function _getLocaleTextFromMap(localeText?: { [key: string]: string }): LocaleTextFunc {
    return (key: string, defaultValue: string, variableValues?: string[]) => {
        let localisedText = localeText?.[key];

        if (localisedText && variableValues?.length) {
            let found = 0;
            while (true) {
                if (found >= variableValues.length) {
                    break;
                }
                const idx = localisedText.indexOf('${variable}');
                if (idx === -1) {
                    break;
                }

                localisedText = localisedText.replace('${variable}', variableValues[found++]);
            }
        }

        return localisedText ?? defaultValue;
    };
}
