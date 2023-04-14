/**
 * Automated Row Grouping demo
 */

// NOTE: Only typescript types should be imported from the AG Grid packages
// to prevent AG Grid from loading the code twice

import { Easing, Group } from '@tweenjs/tween.js';
import { ColDef, GridOptions } from 'ag-grid-community';
import { CATEGORIES, PORTFOLIOS } from '../../data/constants';
import { createDataWorker } from '../../data/createDataWorker';
import { createMouse } from '../../lib/createMouse';
import { getBottomMidPos, isInViewport } from '../../lib/dom';
import { Point } from '../../lib/geometry';
import { ScriptDebuggerManager } from '../../lib/scriptDebugger';
import { ScriptRunner } from '../../lib/scriptRunner';
import { AutomatedExample } from '../../types';
import { createScriptRunner } from './createScriptRunner';
import { fixtureData } from './rowDataFixture';

const WAIT_TILL_MOUSE_ANIMATION_STARTS = 2000;
const UPDATES_PER_MESSAGE_1X = 100;
const MESSAGE_FEQUENCY_1X = 200;

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
    visibilityThreshold: number;
}

export type RowGroupingAutomatedExample = AutomatedExample & {
    setUpdateFrequency: (value: number) => void;
};

function numberCellFormatter(params) {
    return Math.floor(params.value)
        .toString()
        .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}

const columnDefs: ColDef[] = [
    {
        field: 'category',
        chartDataType: 'category',
        minWidth: 280,
        enableRowGroup: true,
    },
    {
        field: 'product',
        chartDataType: 'category',
        enableRowGroup: true,
    },
    { field: 'previous', enableRowGroup: true },
    { field: 'current', type: 'measure', enableRowGroup: true },
    { headerName: 'Gain-DX', field: 'gainDx', type: 'measure', enableRowGroup: true },
    { field: 'dealType', enableRowGroup: true },
    { field: 'portfolio', enableRowGroup: true },
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
        return params.data.id;
    },
    rowGroupPanelShow: 'always',
};

function initWorker() {
    dataWorker = new Worker(
        URL.createObjectURL(new Blob(['(' + createDataWorker.toString() + ')()'], { type: 'text/javascript' }))
    );
    dataWorker.postMessage({
        type: 'init',
        data: {
            categories: CATEGORIES,
            portfolios: PORTFOLIOS,
            maxTradeCount: 5,
        },
    });
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
    dataWorker?.postMessage({
        type: 'start',
    });
}

function stopWorkerMessages() {
    dataWorker?.postMessage({
        type: 'stop',
    });
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
    visibilityThreshold,
}: CreateAutomatedRowGroupingParams): RowGroupingAutomatedExample {
    const gridSelector = `.${gridClassname}`;
    let gridDiv: HTMLElement;

    const init = () => {
        gridDiv = document.querySelector(gridSelector) as HTMLElement;
        if (!gridDiv) {
            return;
        }

        const offScreenPos: Point = getBottomMidPos(gridDiv);
        if (useStaticData) {
            gridOptions.rowData = fixtureData;
        }

        gridOptions.popupParent = document.querySelector('body');
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

            scriptRunner = createScriptRunner({
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

    const setUpdateFrequency = (value: number) => {
        dataWorker?.postMessage({
            type: 'updateConfig',
            data: {
                updatesPerMessage: UPDATES_PER_MESSAGE_1X * value,
                messageFrequency: MESSAGE_FEQUENCY_1X / value,
            },
        });
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
        isInViewport: () => {
            return isInViewport(gridDiv, visibilityThreshold);
        },
        setUpdateFrequency,
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
