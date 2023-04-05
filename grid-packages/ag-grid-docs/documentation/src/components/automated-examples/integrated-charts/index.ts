/**
 * Automated Row Grouping demo
 */

// NOTE: Only typescript types should be imported from the AG Grid packages
// to prevent AG Grid from loading the code twice

import { Easing, Group } from '@tweenjs/tween.js';
import { ColDef, GridOptions } from 'ag-grid-community';
import { COUNTRY_CODES } from '../data/constants';
import { createPeopleData } from '../data/createPeopleData';
import { createMouse } from '../lib/createMouse';
import { getBottomMidPos } from '../lib/dom';
import { Point } from '../lib/geometry';
import { ScriptDebuggerManager } from '../lib/scriptDebugger';
import { ScriptRunner } from '../lib/scriptRunner';
import { createIntegratedChartsScriptRunner } from './createIntegratedChartsScriptRunner';

const WAIT_TILL_MOUSE_ANIMATION_STARTS = 2000;
const VISIBLE_GRID_THRESHOLD_BEFORE_PLAYING_SCRIPT = 0.2;

let scriptRunner: ScriptRunner;
let restartScriptTimeout;

interface CreateAutomatedIntegratedChartsParams {
    gridClassname: string;
    mouseMaskClassname: string;
    scriptIsEnabled?: () => boolean;
    onInactive?: () => void;
    onGridReady?: () => void;
    suppressUpdates?: boolean;
    useStaticData?: boolean;
    runOnce: boolean;
    scriptDebuggerManager: ScriptDebuggerManager;
    pauseOnMouseMove?: boolean;
}

function numberCellFormatter(params) {
    return Math.floor(params.value)
        .toString()
        .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}

function getCountryFlagImageUrl(country: string) {
    const countryCode = COUNTRY_CODES[country];
    return `https://flags.fmcdn.net/data/flags/mini/${countryCode}.png`;
}

const columnDefs: ColDef[] = [
    {
        field: 'name',
        chartDataType: 'category',
        minWidth: 280,
        enableRowGroup: true,
    },
    {
        field: 'country',
        chartDataType: 'category',
        enableRowGroup: true,
        cellRenderer: (params) => {
            // put the value in bold
            return `<img border="0" width="20" height="10" src='${getCountryFlagImageUrl(params.data.country)}' /> ${
                params.value
            }`;
        },
    },
    { field: 'jan', type: 'measure', enableRowGroup: true },
    { field: 'feb', type: 'measure', enableRowGroup: true },
    { field: 'mar', type: 'measure', enableRowGroup: true },
    { field: 'apr', type: 'measure', enableRowGroup: true },
    { field: 'may', type: 'measure', enableRowGroup: true },
    { field: 'jun', type: 'measure', enableRowGroup: true },
    { field: 'jul', type: 'measure', enableRowGroup: true },
    { field: 'aug', type: 'measure', enableRowGroup: true },
    { field: 'sep', type: 'measure', enableRowGroup: true },
    { field: 'oct', type: 'measure', enableRowGroup: true },
    { field: 'nov', type: 'measure', enableRowGroup: true },
    { field: 'dec', type: 'measure', enableRowGroup: true },
    { field: 'totalWinnings', type: 'measure', enableRowGroup: true },
];

const gridOptions: GridOptions = {
    columnDefs,
    defaultColDef: {
        sortable: true,
        flex: 1,
        minWidth: 150,
        filter: true,
        resizable: true,
    },
    autoGroupColumnDef: {
        minWidth: 280,
    },
    columnTypes: {
        measure: {
            aggFunc: 'sum',
            chartDataType: 'series',
            cellClass: 'number',
            valueFormatter: numberCellFormatter,
            cellRenderer: 'agAnimateShowChangeCellRenderer',
        },
    },
    animateRows: true,
    enableCharts: true,
    enableRangeSelection: true,
    suppressAggFuncInHeader: true,
    rowGroupPanelShow: 'always',
};

export function createAutomatedIntegratedCharts({
    gridClassname,
    mouseMaskClassname,
    scriptIsEnabled = () => true,
    onInactive,
    onGridReady,
    suppressUpdates,
    scriptDebuggerManager,
    runOnce,
    pauseOnMouseMove,
}: CreateAutomatedIntegratedChartsParams) {
    const gridSelector = `.${gridClassname}`;

    const init = () => {
        const gridDiv = document.querySelector(gridSelector) as HTMLElement;
        if (!gridDiv) {
            return;
        }

        const offScreenPos: Point = getBottomMidPos(gridDiv);

        gridOptions.rowData = createPeopleData({ randomize: !suppressUpdates });
        gridOptions.onGridReady = () => {
            if (suppressUpdates) {
                return;
            }

            onGridReady && onGridReady();

            const scriptDebugger = scriptDebuggerManager.add({
                id: 'Integrated Charts',
                containerEl: gridDiv,
            });

            const mouse = createMouse({ containerEl: gridDiv, mouseMaskClassname });
            const tweenGroup = new Group();

            if (scriptRunner) {
                scriptRunner.stop();
            }

            scriptRunner = createIntegratedChartsScriptRunner({
                containerEl: gridDiv,
                mouse,
                offScreenPos,
                onInactive() {
                    onInactive && onInactive();
                },
                tweenGroup,
                gridOptions,
                loop: !runOnce,
                scriptDebugger,
                defaultEasing: Easing.Quadratic.InOut,
            });

            const pauseScriptRunner = () => {
                if (scriptRunner.currentState() === 'playing') {
                    scriptRunner.pause();
                }

                clearTimeout(restartScriptTimeout);
                restartScriptTimeout = setTimeout(() => {
                    if (scriptRunner.currentState() !== 'playing') {
                        scriptRunner.play();
                    }
                }, WAIT_TILL_MOUSE_ANIMATION_STARTS);
            };

            if (pauseOnMouseMove) {
                gridDiv.addEventListener('mousemove', (event: MouseEvent) => {
                    const isUserEvent = event.isTrusted;

                    if (!isUserEvent) {
                        return;
                    }

                    pauseScriptRunner();
                });
            }

            // Only play script if the grid is visible
            const gridObserver = new window.IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) {
                        if (scriptRunner.currentState() !== 'playing' && scriptIsEnabled()) {
                            scriptRunner.play();
                        }
                        return;
                    }
                    clearTimeout(restartScriptTimeout);
                    scriptRunner.inactive();
                },
                {
                    root: null,
                    threshold: VISIBLE_GRID_THRESHOLD_BEFORE_PLAYING_SCRIPT,
                }
            );
            gridObserver.observe(gridDiv);
        };
        new globalThis.agGrid.Grid(gridDiv, gridOptions);
    };

    const start = () => {
        scriptRunner?.play();
    };

    const stop = () => {
        scriptRunner?.stop();
    };

    const loadGrid = function () {
        if (document.querySelector(gridSelector) && globalThis.agGrid) {
            init();
        } else {
            requestAnimationFrame(() => loadGrid());
        }
    };

    loadGrid();

    return {
        start,
        stop,
    };
}

/**
 * Clean up between hot module replacement on dev server
 */
// @ts-ignore
if (import.meta.webpackHot) {
    // @ts-ignore
    import.meta.webpackHot.dispose(() => {
        clearTimeout(restartScriptTimeout);
        if (scriptRunner) {
            scriptRunner.stop();
        }

        gridOptions.api?.destroy();
    });
}
