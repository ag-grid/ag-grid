/**
 * Automated Row Grouping demo
 */

// NOTE: Only typescript types should be imported from the AG Grid packages
// to prevent AG Grid from loading the code twice

import { Easing, Group } from '@tweenjs/tween.js';
import { ColDef, GridOptions, MenuItemDef } from 'ag-grid-community';
import { createPeopleData } from '../../data/createPeopleData';
import { INTEGRATED_CHARTS_ID } from '../../lib/constants';
import { createMouse } from '../../lib/createMouse';
import { isInViewport } from '../../lib/dom';
import { getAdditionalContextMenuItems } from '../../lib/getAdditionalContextMenuItems';
import { ScriptDebugger, ScriptDebuggerManager } from '../../lib/scriptDebugger';
import { RunScriptState, ScriptRunner } from '../../lib/scriptRunner';
import { AutomatedExample } from '../../types';
import { createScriptRunner } from './createScriptRunner';

let scriptRunner: ScriptRunner;
let restartScriptTimeout;

interface CreateAutomatedIntegratedChartsParams {
    gridClassname: string;
    mouseMaskClassname: string;
    getOverlay: () => HTMLElement;
    getContainerScale?: () => number;
    additionalContextMenuItems?: (string | MenuItemDef)[];
    onStateChange?: (state: RunScriptState) => void;
    onGridReady?: () => void;
    suppressUpdates?: boolean;
    useStaticData?: boolean;
    runOnce: boolean;
    scriptDebuggerManager: ScriptDebuggerManager;
    visibilityThreshold: number;
}

function numberCellFormatter(params) {
    return Math.floor(params.value)
        .toString()
        .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}

const columnDefs: ColDef[] = [
    {
        field: 'name',
        chartDataType: 'category',
        minWidth: 280,
        enableRowGroup: true,
    },
    {
        headerName: 'Country',
        field: 'country',
        chartDataType: 'category',
        enableRowGroup: true,
        minWidth: 200,
        cellRenderer: (params) => {
            if (params.node.group) {
                return params.value;
            }

            // put the value in bold
            return `<div class='country'><span class='flag'>${params.data.flag}</span><span>${params.value}</span></div>`;
        },
    },
    { field: 'jan', type: ['measure', 'numericColumn'], enableRowGroup: true },
    { field: 'feb', type: ['measure', 'numericColumn'], enableRowGroup: true },
    { field: 'mar', type: ['measure', 'numericColumn'], enableRowGroup: true },
    { field: 'apr', type: ['measure', 'numericColumn'], enableRowGroup: true },
    { field: 'may', type: ['measure', 'numericColumn'], enableRowGroup: true },
    { field: 'jun', type: ['measure', 'numericColumn'], enableRowGroup: true },
    { field: 'jul', type: ['measure', 'numericColumn'], enableRowGroup: true },
    { field: 'aug', type: ['measure', 'numericColumn'], enableRowGroup: true },
    { field: 'sep', type: ['measure', 'numericColumn'], enableRowGroup: true },
    { field: 'oct', type: ['measure', 'numericColumn'], enableRowGroup: true },
    { field: 'nov', type: ['measure', 'numericColumn'], enableRowGroup: true },
    { field: 'dec', type: ['measure', 'numericColumn'], enableRowGroup: true },
    { field: 'totalWinnings', type: ['measure', 'numericColumn'], enableRowGroup: true },
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
    getContainerScale,
    getOverlay,
    additionalContextMenuItems,
    onStateChange,
    onGridReady,
    suppressUpdates,
    scriptDebuggerManager,
    runOnce,
    visibilityThreshold,
}: CreateAutomatedIntegratedChartsParams): AutomatedExample {
    const gridSelector = `.${gridClassname}`;
    let gridDiv: HTMLElement;
    let scriptDebugger: ScriptDebugger | undefined;

    const init = () => {
        gridDiv = document.querySelector(gridSelector) as HTMLElement;
        if (!gridDiv) {
            return;
        }

        gridOptions.rowData = createPeopleData({ randomize: !suppressUpdates });

        if (additionalContextMenuItems) {
            gridOptions.getContextMenuItems = () => getAdditionalContextMenuItems(additionalContextMenuItems);
        }

        gridOptions.onGridReady = () => {
            onGridReady && onGridReady();
        };
        gridOptions.onFirstDataRendered = () => {
            if (suppressUpdates) {
                return;
            }

            scriptDebugger = scriptDebuggerManager.add({
                id: INTEGRATED_CHARTS_ID,
                containerEl: gridDiv,
            });

            const mouse = createMouse({ containerEl: document.body, mouseMaskClassname });
            const tweenGroup = new Group();

            if (scriptRunner) {
                scriptRunner.stop();
            }

            scriptRunner = createScriptRunner({
                id: INTEGRATED_CHARTS_ID,
                containerEl: gridDiv,
                getContainerScale,
                getOverlay,
                mouse,
                onStateChange,
                tweenGroup,
                gridOptions,
                loop: !runOnce,
                scriptDebugger,
                defaultEasing: Easing.Quadratic.InOut,
            });
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
        isInViewport: () => {
            return isInViewport({ element: gridDiv, threshold: visibilityThreshold });
        },
        getDebugger: () => scriptDebugger,
    };
}

export function cleanUp() {
    clearTimeout(restartScriptTimeout);
    if (scriptRunner) {
        scriptRunner.stop();
    }

    gridOptions.api?.destroy();
}

/**
 * Clean up between hot module replacement on dev server
 */
// @ts-ignore
if (import.meta.webpackHot) {
    // @ts-ignore
    import.meta.webpackHot.dispose(() => {
        cleanUp();
    });
}
