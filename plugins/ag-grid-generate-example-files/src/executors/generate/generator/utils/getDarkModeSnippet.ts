export const DARK_MODE_START = '/** DARK MODE START **/';
export const DARK_MODE_END = '/** DARK MODE END **/';

export const getDarkModeSnippet = ({ chartAPI }: { chartAPI?: string } = {}) =>
    `${DARK_MODE_START}
${
    chartAPI == null
        ? `import { AgCharts as __chartAPI } from 'ag-charts-community';`
        : `const __chartAPI = ${chartAPI};`
}

let darkmode =
    (localStorage['documentation:darkmode'] || String(matchMedia('(prefers-color-scheme: dark)').matches)) === 'true';

const isAgThemeOrUndefined = (theme) => {
    return theme == null || (typeof theme === 'string' && theme.startsWith('ag-'));
};

const getDarkmodeTheme = (theme = 'ag-default') => {
    const baseTheme = theme.replace(/-dark$/, '');
    return darkmode ? baseTheme + '-dark' : baseTheme;
};

const defaultUpdate = __chartAPI.update;
__chartAPI.update = function update(chart, options) {
    const nextOptions = { ...options };
    const theme = options.theme;
    if (isAgThemeOrUndefined(theme)) {
        nextOptions.theme = getDarkmodeTheme(theme);
    } else if (typeof theme === 'object' && isAgThemeOrUndefined(theme.baseTheme)) {
        nextOptions.theme = {
            ...options.theme,
            baseTheme: getDarkmodeTheme(theme.baseTheme),
        };
    }
    defaultUpdate(chart, nextOptions);
};

const defaultUpdateDelta = __chartAPI.updateDelta;
__chartAPI.updateDelta = function updateDelta(chart, options) {
    const nextOptions = { ...options };
    // Allow setting theme overrides updateDelta (see api-create-update)
    if (typeof options.theme === 'object') {
        const theme = options.theme.baseTheme || 'ag-default';
        nextOptions.theme = {
            ...options.theme,
            baseTheme: getDarkmodeTheme(theme),
        };
    }
    defaultUpdateDelta(chart, nextOptions);
};

const applyDarkmode = () => {
    document.documentElement.setAttribute('data-dark-mode', darkmode);
    const charts = document.querySelectorAll('[data-ag-charts]');
    charts.forEach((element) => {
        const chart = __chartAPI.getInstance(element);
        if (chart == null) return;
        // .update is monkey-patched to apply theme to options
        // This is just needed to trigger the theme update
        __chartAPI.update(chart, chart.getOptions());
    });
    return charts.length !== 0;
};

if (!applyDarkmode()) {
    /* React defers updates. Rather than try and hook into the API, just wait until the darkmode is applied. */
    const observer = new MutationObserver(() => {
        if (applyDarkmode()) {
            observer.disconnect();
        }
    });
    observer.observe(document.body, {
        attributes: true,
        childList: true,
        subtree: true,
    });
}
window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'color-scheme-change') {
        darkmode = event.data.darkmode;
        applyDarkmode();
    }
});
${DARK_MODE_END}`;
