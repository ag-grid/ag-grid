import type { ThemeLogger } from 'ag-stack';

/**
 * The theming engine reports invalid param values through a logger rather than
 * throwing, and the builder only ever feeds it values from the defaults or the
 * editors - so anything reaching here is a bug worth seeing in the console.
 */
const getMessage = (id: 104 | 107 | 259, params?: Record<string, any>): string => {
    switch (id) {
        case 104:
            return `Numeric value ${params?.value} passed to ${params?.param} will be interpreted as seconds.`;
        case 107:
            return `Invalid value for theme param ${params?.key} - ${JSON.stringify(params?.value)}`;
        case 259:
            return `theme.withPart expected a part object, received: ${params?.part}`;
    }
};

export const themeLogger: ThemeLogger = {
    warn: (...args) => console.warn(`[charts theme builder] ${getMessage(args[0], args[1])}`),
    error: (...args) => console.error(`[charts theme builder] ${getMessage(args[0], args[1])}`),
    preInitErr: (...args) => console.error(`[charts theme builder] ${getMessage(args[0], args[2])}`),
};
