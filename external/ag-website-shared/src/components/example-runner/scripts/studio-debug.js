// @ts-check
/** @typedef {import('ag-charts-enterprise').AgChartOptions} AgChartOptions */

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

const exportToPlunkerToolbarButton = {
    type: 'button',
    text: 'Export to Plunker',
    icon: 'linked',
    action: exportToPlunker,
};

const logStateButton = {
    type: 'button',
    text: 'Log State',
    icon: 'eye',
    action: ({ api }) => console.log(api.getState()),
};

/** @type {any} */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const debugOverrides = {
    /**
     * @param {any} widgetConfigs
     * @return {any} widgetConfigs
     */
    widgets: (widgetConfigs) => {
        for (const [widgetId, widgetConfig] of Object.entries(widgetConfigs)) {
            if (widgetId.includes('chart') && !widgetConfig.toolbar.includes(exportToPlunkerToolbarButton)) {
                widgetConfig.toolbar.push(exportToPlunkerToolbarButton);
            }
            if (!widgetConfig.toolbar?.includes(logStateButton)) {
                if (widgetConfig.toolbar == null) {
                    widgetConfig.toolbar = [];
                }
                widgetConfig.toolbar.push(logStateButton);
            }
        }
        return widgetConfigs;
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
