// @ts-check
/** @typedef {import('ag-charts-enterprise').AgChartOptions} AgChartOptions */
/** @typedef {import('ag-studio').AgWidgetsConfig} AgWidgetsConfig */
/** @typedef {import('ag-studio').AgWidgetToolbarItem} AgWidgetToolbarItem */

const html = String;

const indexHtml = html`<!doctype html>
    <html lang="en">
        <head>
            <title>JavaScript Example - Quick Start - Basic Example</title>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <meta name="robots" content="noindex" />
            <link rel="stylesheet" href="ag-example-styles.css" />
            <style>
                *,
                *::before,
                *::after {
                    box-sizing: border-box;
                }

                html,
                body {
                    height: 100%;
                }

                body {
                    display: grid;
                    padding: 1rem;
                }
            </style>
        </head>
        <body>
            <div id="myChart"></div>
            <script src="https://charts-staging.ag-grid.com/dev/ag-charts-enterprise/dist/umd/ag-charts-enterprise.js"></script>
            <script src="data.js"></script>
            <script src="main.js"></script>
        </body>
    </html>`;

/**
 * @param {string} key
 * @returns {string}
 */
function jsonKey(key) {
    return `%%${key}%%`;
}

/**
 * @param {AgChartOptions} options
 * @returns {string}
 */
function getMainJs(options) {
    const replacements = new Map([
        ['data', 'getData()'],
        ['container', `document.getElementById("myChart")`],
        ['context', 'null'],
    ]);

    for (const key of replacements.keys()) {
        options = { ...options, [key]: jsonKey(key) };
    }
    let optionsJs = JSON.stringify(options, null, 4);
    for (const [key, value] of replacements) {
        optionsJs = optionsJs.replace(JSON.stringify(jsonKey(key)), value);
    }

    // Remove quotes from keys that are valid identifiers
    optionsJs = optionsJs.replace(/^(\s+)"(\w+)":/gm, '$1$2:');

    return [`const { AgCharts } = agCharts;`, `const options = ${optionsJs};`, `AgCharts.create(options);`].join(
        '\n\n'
    );
}

/**
 * @param {AgChartOptions} options
 * @returns {string}
 */
function getDataJs(options) {
    const dataJs = JSON.stringify(options.data, null, 4).replace(/^/gm, '    ').trim();

    return [`function getData() {`, `    return ${dataJs};`, `}`].join('\n');
}

/**
 * @param {any} chartWidget
 */
function exportToPlunker({ widget }) {
    /** @type {AgChartOptions} */
    const options = widget.getOptions();

    const form = document.createElement('form');
    form.method = 'post';
    form.style.display = 'none';
    form.action = `https://plnkr.co/edit/?preview&open=main.js`;
    form.target = '_blank';

    /**
     * @param {string} name
     * @param {any} value
     */
    const addHiddenInput = (name, value) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        input.value = value;
        form.appendChild(input);
    };

    addHiddenInput('private', true);
    addHiddenInput('files[index.html]', indexHtml.replace(/^\s{4}/gm, ''));
    addHiddenInput('files[main.js]', getMainJs(options));
    addHiddenInput('files[data.js]', getDataJs(options));

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
}

/** @type {AgWidgetToolbarItem} */
const exportToPlunkerToolbarButton = {
    id: 'exportToPlunker',
    type: 'button',
    label: 'Export to Plunker',
    icon: 'linked',
    action: exportToPlunker,
};

/** @type {AgWidgetToolbarItem} */
const logStateButton = {
    id: 'logState',
    type: 'button',
    label: 'Log State',
    icon: 'eye',
    action: ({ api }) => console.log(api.getState()),
};

/**
 * @param {any} api
 * @returns {any}
 */
const internalApi = (api) => {
    const internalsKey = Object.getOwnPropertySymbols(api)[0];
    return api[internalsKey];
};

/** @type {AgWidgetToolbarItem} */
const requeryWithExplainButton = {
    id: 'requeryWithExplain',
    type: 'button',
    label: 'Requery with Explain',
    icon: 'aiExecuteQuery',
    action: (params) => {
        const { api } = params;
        const widgetId = /** @type {any} */ (params).widgetId;
        const refresh = internalApi(api)?.refresh;
        if (typeof refresh !== 'function') {
            return;
        }
        const win = /** @type {{agStudioOpts?: Record<string, unknown>}} */ (window);
        const savedOpts = win.agStudioOpts;
        win.agStudioOpts = { ...(savedOpts ?? {}), explain: { mode: 'analyze', samples: true, widgetId } };

        // The widget re-queries asynchronously, and the query engine reads
        // window.agStudioOpts.explain only when that re-query actually runs — at a point
        // that differs between the dev and production builds. A fixed requestAnimationFrame
        // reset races that read, so the explain plan prints on dev but not on a
        // production/staging build. Instead, hold the explain option until the next user
        // interaction (which always lands after the re-query has consumed it), with a
        // timeout backstop so an untouched page does not keep explaining later queries.
        let restored = false;
        /** @type {ReturnType<typeof setTimeout>} */
        let timer;
        const restore = () => {
            if (restored) {
                return;
            }
            restored = true;
            win.agStudioOpts = savedOpts;
            window.removeEventListener('pointerdown', restore, true);
            window.removeEventListener('keydown', restore, true);
            clearTimeout(timer);
        };
        window.addEventListener('pointerdown', restore, true);
        window.addEventListener('keydown', restore, true);
        timer = setTimeout(restore, 10000);

        refresh(widgetId);
    },
};

/** @type {any} */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const debugOverrides = {
    /**
     * @param {AgWidgetsConfig} widgetConfig
     * @return {AgWidgetsConfig} widgetConfig
     */
    widgets: (widgetConfig) => {
        return {
            ...widgetConfig,
            widgets: widgetConfig.widgets.map((widget) => {
                let { toolbar } = widget;

                /**
                 * @param {AgWidgetToolbarItem} button
                 */
                const addButton = (button) => {
                    toolbar ??= ['duplicate', 'delete'];
                    const dupIndex = toolbar.findIndex((item) => item === 'duplicate');
                    if (dupIndex === -1) {
                        toolbar.push(button);
                    } else {
                        toolbar.splice(dupIndex, 0, button);
                    }
                };

                if (widget.id.includes('chart') && !toolbar?.includes(exportToPlunkerToolbarButton)) {
                    addButton(exportToPlunkerToolbarButton);
                }

                if (!toolbar?.includes(logStateButton)) {
                    addButton(logStateButton);
                }

                if (!toolbar?.includes(requeryWithExplainButton)) {
                    addButton(requeryWithExplainButton);
                }

                return { ...widget, toolbar };
            }),
        };
    },
};

// Propagate URL query params into window globals consumed by ag-studio.
// Runs before the example's main.js to ensure flags are visible at startup.
// Values are *appended* to any existing window.agStudioDebug / agStudioOpts.
//   ?explain=<options>       → adds 'query:explain' to window.agStudioDebug, 'options' can include 'rows' and 'plain' to add 'query:explain:rows' and set window.agStudioOpts.explainFormat = 'plain', respectively
//   ?batchLog=true      → adds 'query:batch' to window.agStudioDebug
//   ?sf=<number>        → sets window.agStudioOpts.scaleFactor (consumed by demoDataGenerator), 1.0 = ~4.5mil rows
//   ?batching=false     → sets window.agStudioOpts.queryBatching = false
(function () {
    const urlParams = new URLSearchParams(window.location.search);

    const agStudioOpts = { ...(window.agStudioOpts ?? {}) };
    const agStudioDebug = Array.isArray(window.agStudioDebug) ? window.agStudioDebug.slice() : [];

    const explainParam = urlParams.get('explain');
    if (explainParam && !agStudioDebug.includes('query:explain')) {
        agStudioDebug.push('query:explain');
        if (explainParam.includes('rows')) {
            agStudioDebug.push('query:explain:rows');
        }
        if (explainParam.includes('plain')) {
            agStudioOpts.explainFormat = 'plain';
        }
    }
    if (urlParams.get('batchLog') === 'true' && !agStudioDebug.includes('query:batch')) {
        agStudioDebug.push('query:batch');
    }
    if (urlParams.get('tracing') === 'true') {
        agStudioDebug.push('traceMarkers');
    }

    if (agStudioDebug.length > 0) {
        window.agStudioDebug = agStudioDebug;
    }

    const sfParam = urlParams.get('sf');
    if (sfParam != null) {
        const sf = parseFloat(sfParam);
        if (Number.isFinite(sf) && sf > 0) {
            agStudioOpts.scaleFactor = sf;
        }
    }
    const batchingParam = urlParams.get('batching');
    if (batchingParam != null) {
        agStudioOpts.queryBatching = batchingParam !== 'false';
    }
    window.agStudioOpts = agStudioOpts;
})();
