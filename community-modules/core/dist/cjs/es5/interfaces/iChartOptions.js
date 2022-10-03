/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
