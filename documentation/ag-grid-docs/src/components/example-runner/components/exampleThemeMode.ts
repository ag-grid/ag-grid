/**
 * The example iframe carries the parent page's resolved colour scheme as a query parameter, so the
 * example page can apply `data-ag-theme-mode` synchronously in `setUpPage()` — before its deferred
 * entry module runs. Without it the only writer of that attribute is the parent's `load` handler,
 * which fires *after* the example has already created its grid and chart, so integrated charts are
 * created light and then re-themed (a visible flicker) or left light altogether.
 */
export const AG_THEME_MODE_PARAM = 'agThemeMode';

export const DARK_THEME_MODE = 'dark-blue';
export const LIGHT_THEME_MODE = 'light';

/**
 * Appends the resolved colour scheme to an example url.
 *
 * Returns `url` unchanged when the example opts out of dark mode, or when the mode is not yet
 * resolved — absence of the parameter means "the example owns its own theming", which is the
 * pre-existing behaviour.
 *
 * The parameter is deliberately a query parameter and not a hash fragment: reassigning an iframe
 * `src` that differs only by fragment navigates within the document without a reload, so the
 * example page would never re-run and the parent's reloading message would leave it hidden.
 */
export const withThemeMode = (url: string, darkMode?: boolean, suppressDarkMode?: boolean): string => {
    if (suppressDarkMode || darkMode === undefined) {
        return url;
    }

    // A base is required because `url` is a bare path; only the relative part is kept.
    const resolved = new URL(url, 'https://ag-grid.invalid');
    resolved.searchParams.set(AG_THEME_MODE_PARAM, darkMode ? DARK_THEME_MODE : LIGHT_THEME_MODE);

    return `${resolved.pathname}${resolved.search}${resolved.hash}`;
};

/**
 * Whether the example iframe should be (re-)navigated to `nextSrc`.
 *
 * A different example - or nothing loaded yet - always navigates. For the example already there,
 * a colour-scheme change is pushed into the live document instead, so re-navigating for it would
 * needlessly reload the example. The exception is a navigation still in flight (`pendingSrc` is
 * set): that one would land carrying the superseded theme mode, which is the very flicker the
 * query parameter exists to avoid, so it is re-pointed at the current one.
 */
export const shouldNavigateExample = ({
    currentPathname,
    url,
    nextSrc,
    pendingSrc,
}: {
    currentPathname?: string;
    url: string;
    nextSrc: string;
    pendingSrc?: string;
}): boolean => {
    if (currentPathname !== url) {
        return true;
    }

    return pendingSrc !== undefined && pendingSrc !== nextSrc;
};
