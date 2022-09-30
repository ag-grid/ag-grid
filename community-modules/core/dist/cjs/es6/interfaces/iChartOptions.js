/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CHART_TYPE_KEYS = {
    columnGroup: {
        column: 'column',
        stackedColumn: 'stackedColumn',
        normalizedColumn: 'normalizedColumn'
    },
    barGroup: {
        bar: 'bar',
        stackedBar: 'stackedBar',
        normalizedBar: 'normalizedBar'
    },
    pieGroup: {
        pie: 'pie',
        doughnut: 'doughnut'
    },
    lineGroup: {
        line: 'line'
    },
    scatterGroup: {
        scatter: 'scatter',
        bubble: 'bubble'
    },
    areaGroup: {
        area: 'area',
        stackedArea: 'stackedArea',
        normalizedArea: 'normalizedArea'
    },
    histogramGroup: {
        histogram: 'histogram'
    },
    combinationGroup: {
        columnLineCombo: 'columnLineCombo',
        areaColumnCombo: 'areaColumnCombo',
        customCombo: 'customCombo'
    }
};
/************************************************************************************************
 * If you update these, then also update the `integrated-charts-toolbar` docs. *
 ************************************************************************************************/
exports.DEFAULT_CHART_GROUPS = {
    columnGroup: [
        'column',
        'stackedColumn',
        'normalizedColumn'
    ],
    barGroup: [
        'bar',
        'stackedBar',
        'normalizedBar'
    ],
    pieGroup: [
        'pie',
        'doughnut'
    ],
    lineGroup: [
        'line'
    ],
    scatterGroup: [
        'scatter',
        'bubble'
    ],
    areaGroup: [
        'area',
        'stackedArea',
        'normalizedArea'
    ],
    histogramGroup: [
        'histogram'
    ],
    combinationGroup: [
        'columnLineCombo',
        'areaColumnCombo',
        'customCombo'
    ]
};
exports.CHART_TOOL_PANEL_ALLOW_LIST = [
    'chartSettings',
    'chartData',
    'chartFormat'
];
exports.CHART_TOOLBAR_ALLOW_LIST = [
    'chartUnlink',
    'chartLink',
    'chartDownload'
];
exports.CHART_TOOL_PANEL_MENU_OPTIONS = {
    settings: "chartSettings",
    data: "chartData",
    format: "chartFormat"
};
