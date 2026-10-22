import type { Theme } from 'ag-stack';
import { type Atom, atom } from 'jotai';

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

let renderedBaseThemeAtom: Atom<Theme> = atom(() => getBaseTheme());

/**
 * Hosts whose base theme follows the user's choices, such as a light or dark
 * preset, supply it as an atom for the preview and the fields' defaults to follow.
 */
export const setRenderedBaseThemeAtom = (themeAtom: Atom<Theme>) => {
    renderedBaseThemeAtom = themeAtom;
};

export const getRenderedBaseThemeAtom = (): Atom<Theme> => renderedBaseThemeAtom;
