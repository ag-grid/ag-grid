import type { Theme } from 'ag-stack';

let baseTheme: Theme | undefined;

/**
 * Hosts supply the theme the builder edits. Its default params seed the param
 * list, its parts decide which variant each swappable feature starts on, and
 * the preview renders from it.
 */
export const setBaseTheme = (theme: Theme) => {
    baseTheme = theme;
};

export const getBaseTheme = (): Theme => {
    if (!baseTheme) {
        throw new Error('No base theme, call setBaseTheme() before rendering the theme builder');
    }
    return baseTheme;
};
