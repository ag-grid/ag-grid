import type { ILocaleService, LocaleTextFunc } from '../interfaces/iLocaleService';

function defaultLocaleTextFunc(_key: string, defaultValue: string): string {
    return defaultValue;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _getLocaleTextFunc<TKey extends string = string>(
    localeSvc?: ILocaleService<TKey>
): LocaleTextFunc<TKey> {
    return localeSvc?.getLocaleTextFunc() ?? defaultLocaleTextFunc;
}

/**
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 * Values for the named `${token}` placeholders of a locale phrase, keyed by token name.
 */
export type LocaleTokenValues = Readonly<Record<string, string>>;

const LOCALE_TOKEN_REGEX = /\$\{(\w+)\}/g;

/**
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 * Replaces each named `${token}` with its value, leaving unknown tokens as they are. Names match case-insensitively,
 * so a `getLocaleText` callback that changes the case of the default keeps working.
 */
export function _fillLocaleTokens(template: string, values: LocaleTokenValues): string {
    const valuesByName = new Map<string, string>();
    const names = Object.keys(values);
    for (let i = 0, len = names.length; i < len; ++i) {
        valuesByName.set(names[i].toLowerCase(), values[names[i]]);
    }
    // One pass with a function replacer, so a value is never itself substituted or read as a replacement pattern.
    return template.replace(LOCALE_TOKEN_REGEX, (match, name: string) => valuesByName.get(name.toLowerCase()) ?? match);
}

/**
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 * Looks up a phrase whose translation can place its named `${token}` placeholders in any order, without filling them.
 * The values are also passed by position, in the order given, so a custom value written with `${variable}` still fills.
 */
export function _getLocaleTokenTemplate(
    localeTextFunc: LocaleTextFunc,
    key: string,
    defaultTemplate: string,
    values: LocaleTokenValues
): string {
    return localeTextFunc(key, defaultTemplate, Object.values(values));
}

/**
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 * As `_getLocaleTokenTemplate`, with the named tokens filled.
 */
export function _translateTokens(
    localeTextFunc: LocaleTextFunc,
    key: string,
    defaultTemplate: string,
    values: LocaleTokenValues
): string {
    return _fillLocaleTokens(_getLocaleTokenTemplate(localeTextFunc, key, defaultTemplate, values), values);
}

/**
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 * Translates `key` with the default from `localeValues`. An array fills `${variable}` placeholders by position;
 * `LocaleTokenValues` fill named `${token}` placeholders, which a translation can reorder.
 */
export function _translate<T extends Record<string, string | ((variableValues: string[]) => string)>>(
    bean: { getLocaleTextFunc(): LocaleTextFunc },
    localeValues: T,
    key: keyof T & string,
    variableValues?: string[] | LocaleTokenValues
): string {
    const defaultValue: string | ((variableValues: string[]) => string) = localeValues[key];
    const localeTextFunc = bean.getLocaleTextFunc();
    if (variableValues == null || Array.isArray(variableValues)) {
        return localeTextFunc(
            key,
            typeof defaultValue === 'function' ? defaultValue(variableValues!) : defaultValue,
            variableValues
        );
    }
    const defaultTemplate =
        typeof defaultValue === 'function' ? defaultValue(Object.values(variableValues)) : defaultValue;
    return _translateTokens(localeTextFunc, key, defaultTemplate, variableValues);
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
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

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
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
