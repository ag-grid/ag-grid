/**
 * Automated Row Grouping demo
 */

// NOTE: Only typescript types should be imported from the AG Grid packages
// to prevent AG Grid from loading the code twice

import { Easing, Group } from '@tweenjs/tween.js';
import { ColDef, GridOptions } from 'ag-grid-community';
import { createFinancialDataWorker } from '../data/createFinancialDataWorker';
import { createMouse } from '../lib/createMouse';
import { getBottomMidPos } from '../lib/dom';
import { Point } from '../lib/geometry';
import { ScriptDebuggerManager } from '../lib/scriptDebugger';
import { ScriptRunner } from '../lib/scriptRunner';
import { createRowGroupingScriptRunner } from './createRowGroupingScriptRunner';
import { fixtureData } from './rowDataFixture';

const WAIT_TILL_MOUSE_ANIMATION_STARTS = 2000;

let dataWorker;
let scriptRunner: ScriptRunner;
let restartScriptTimeout;

interface CreateAutomatedRowGroupingParams {
    gridClassname: string;
    mouseMaskClassname: string;
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

const columnDefs: ColDef[] = [
    {
        field: 'product',
        chartDataType: 'category',
        minWidth: 280,
        enableRowGroup: true,
    },
    {
        field: 'book',
        chartDataType: 'category',
        enableRowGroup: true,
    },
    { field: 'current', type: 'measure', enableRowGroup: true },
    { field: 'previous', type: 'measure', enableRowGroup: true },
    { headerName: 'PL 1', field: 'pl1', type: 'measure', enableRowGroup: true },
    { headerName: 'PL 2', field: 'pl2', type: 'measure', enableRowGroup: true },
    { headerName: 'Gain-DX', field: 'gainDx', type: 'measure', enableRowGroup: true },
    { headerName: 'SX / PX', field: 'sxPx', type: 'measure', enableRowGroup: true },

    { field: 'trade', type: 'measure', enableRowGroup: true },
    { field: 'submitterID', type: 'measure', enableRowGroup: true },
    { field: 'submitterDealID', type: 'measure', minWidth: 170, enableRowGroup: true },

    { field: 'portfolio', enableRowGroup: true },
    { field: 'dealType', enableRowGroup: true },
    { headerName: 'Bid', field: 'bidFlag', enableRowGroup: true },
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
    getRowId: (params) => {
        return params.data.trade;
    },
    rowGroupPanelShow: 'always',
};

function initWorker() {
    dataWorker = new Worker(
        URL.createObjectURL(new Blob(['(' + createFinancialDataWorker.toString() + ')()'], { type: 'text/javascript' }))
    );
    dataWorker.onmessage = function (e) {
        if (!gridOptions || !gridOptions.api) {
            return;
        }

        if (e.data.type === 'setRowData') {
            gridOptions.api.setRowData(e.data.records);
        } else if (e.data.type === 'updateData') {
            gridOptions.api.applyTransactionAsync({ update: e.data.records });
        }
    };
}

function startWorkerMessages() {
    dataWorker?.postMessage('start');
}

function stopWorkerMessages() {
    dataWorker?.postMessage('stop');
}

export function createAutomatedRowGrouping({
    gridClassname,
    mouseMaskClassname,
    onInactive,
    onGridReady,
    suppressUpdates,
    useStaticData,
    scriptDebuggerManager,
    runOnce,
    pauseOnMouseMove,
}: CreateAutomatedRowGroupingParams) {
    const gridSelector = `.${gridClassname}`;

    const init = () => {
        const gridDiv = document.querySelector(gridSelector) as HTMLElement;
        if (!gridDiv) {
            return;
        }

        const offScreenPos: Point = getBottomMidPos(gridDiv);
        if (useStaticData) {
            gridOptions.rowData = fixtureData;
        }

        gridOptions.onGridReady = () => {
            if (suppressUpdates) {
                return;
            }

            onGridReady && onGridReady();
            initWorker();
            startWorkerMessages();

            const scriptDebugger = scriptDebuggerManager.add({
                id: 'Row Grouping',
                containerEl: gridDiv,
            });

            const mouse = createMouse({ containerEl: gridDiv, mouseMaskClassname });
            const tweenGroup = new Group();

            if (scriptRunner) {
                scriptRunner.stop();
            }

            scriptRunner = createRowGroupingScriptRunner({
                containerEl: gridDiv,
                mouse,
                offScreenPos,
                onPlaying() {
                    startWorkerMessages();
                },
                onInactive() {
                    onInactive && onInactive();

                    stopWorkerMessages();
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
        };
        new globalThis.agGrid.Grid(gridDiv, gridOptions);
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
        start: () => scriptRunner?.play(),
        stop: () => scriptRunner?.stop(),
        inactive: () => scriptRunner?.inactive(),
        currentState: () => scriptRunner?.currentState(),
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

        stopWorkerMessages();
        dataWorker?.terminate();
        gridOptions.api?.destroy();
    });
}
