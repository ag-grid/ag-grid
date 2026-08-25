export const AG_THEME_MODE_PARAM = 'agThemeMode';

export const DARK_THEME_MODE = 'dark-blue';
export const LIGHT_THEME_MODE = 'light';

export const withThemeMode = (url: string, darkMode?: boolean, suppressDarkMode?: boolean): string => {
    if (suppressDarkMode || darkMode === undefined) {
        return url;
    }

    const resolved = new URL(url, 'https://ag-grid.invalid');
    resolved.searchParams.set(AG_THEME_MODE_PARAM, darkMode ? DARK_THEME_MODE : LIGHT_THEME_MODE);

    return `${resolved.pathname}${resolved.search}${resolved.hash}`;
};

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
