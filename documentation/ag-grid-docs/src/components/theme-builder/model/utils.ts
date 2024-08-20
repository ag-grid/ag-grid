import type { ParamType, themeQuartz } from '@ag-grid-community/theming';

export type ThemeParams = (typeof themeQuartz)['defaults'];
export type ThemeParam = keyof ThemeParams;

export const mapObjectValues = <T, U>(input: Record<string, T>, mapper: (value: T) => U): Record<string, U> =>
    Object.fromEntries(Object.entries(input).map(([key, value]) => [key, mapper(value)]));

export const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export const titleCase = (variableName: string, prefix?: string) => {
    if (prefix && variableName.startsWith(prefix)) {
        variableName = variableName.substring(prefix.length);
    }
    return variableName
        .replaceAll('-', ' ')
        .replace(/(?:^|\W)+\w/g, (match) => match.toUpperCase())
        .replace(/(?<=[a-z])(?=[A-Z])/g, ' ');
};

export const logErrorMessage = (message: string, error?: unknown) => {
    if (error) {
        // eslint-disable-next-line no-console
        console.error(message, error);
    } else {
        // eslint-disable-next-line no-console
        console.error(message);
    }
};

const loggedMessages = new Set<string>();
export const logErrorMessageOnce = (message: string) => {
    if (loggedMessages.has(message)) return;
    loggedMessages.add(message);
    logErrorMessage(message);
};

export const indexBy = <T, K extends keyof T>(list: readonly T[], property: K): Record<string, T> =>
    Object.fromEntries(list.map((item) => [String(item[property]), item]));

export const memoize = <R, A = void>(fn: (arg: A) => R): ((arg: A) => R) => {
    const values = new Map<A, R>();
    return (a) => {
        const key = a;
        if (!values.has(key)) {
            values.set(key, fn(a));
        }
        return values.get(key)!;
    };
};

export const convertProductionUrlsForStaging = (url: string) => {
    const host = typeof window !== 'undefined' ? window.location.host : '';
    if (!host) return url;
    return url.replace(/:\/\/(www\.)?ag-grid.com/, `://${host}`);
};

export const stripFloatingPointErrors = (value: number) => value.toFixed(10).replace(/\.?0+$/, '');

export const paramToVariableName = (param: string) => `--ag-${kebabCase(param)}`;
const kebabCase = (str: string) => str.replace(/[A-Z]/g, (m) => `-${m}`).toLowerCase();

let reinterpretationElement: HTMLElement | null = null;

export const cssValueIsValid = (value: string, type: ParamType): boolean => reinterpretCSSValue(value, type) != null;

export const reinterpretCSSValue = (value: string, type: ParamType): string | null => {
    value = value.trim();
    if (value === '') return '';
    if (!reinterpretationElement) {
        reinterpretationElement = document.createElement('span');
        reinterpretationElement.className = 'ag-apply-theme-variables';
        document.body.appendChild(reinterpretationElement);
    }
    const cssProperty = cssPropertyForParamType[type];
    try {
        reinterpretationElement.style[cssProperty] = ''; // clear first otherwise setting an invalid value fails and keeps old value
        reinterpretationElement.style[cssProperty] = value;
        if (reinterpretationElement.style[cssProperty] === '') {
            return null; // invalid CSS
        }
        return getComputedStyle(reinterpretationElement)[cssProperty];
    } finally {
        reinterpretationElement.style[cssProperty as any] = '';
    }
};

const cssPropertyForParamType = {
    color: 'backgroundColor',
    colorScheme: 'colorScheme',
    length: 'paddingLeft',
    scale: 'lineHeight',
    border: 'borderLeft',
    borderStyle: 'borderTopStyle',
    shadow: 'boxShadow',
    image: 'backgroundImage',
    fontFamily: 'fontFamily',
    fontWeight: 'fontWeight',
    duration: 'transitionDuration',
} satisfies Record<ParamType, keyof CSSStyleDeclaration>;
