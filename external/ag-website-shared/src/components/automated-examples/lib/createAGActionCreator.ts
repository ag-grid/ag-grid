import type { Group } from '@tweenjs/tween.js';

import type { ApplyColumnStateParams, ChartToolPanelName, CreateRangeChartParams, GridApi } from 'ag-grid-community';

import type { AgElementFinder } from './agElements';
import type { AgElementName } from './agElements/agElementsConfig';
import type { Mouse } from './createMouse';
import { addCellRange } from './scriptActions/addCellRange';
import { clickOnContextMenuItem } from './scriptActions/clickOnContextMenuItem';
import type { ClickOnContextMenuItemParams } from './scriptActions/clickOnContextMenuItem';
import { dragColumnToRowGroupPanel } from './scriptActions/dragColumnToRowGroupPanel';
import { moveToElementAndClick } from './scriptActions/moveToElementAndClick';
import { openChartToolPanel } from './scriptActions/openChartToolPanel';
import { resetGrid } from './scriptActions/resetGrid';
import { clearAllSingleCellSelections, clearSingleCell, selectSingleCell } from './scriptActions/singleCell';
import { typeInTextInput } from './scriptActions/typeInTextInput';
import type { ScriptDebugger } from './scriptDebugger';
import type { EasingFunction } from './tween';

interface ResetAction {
    actionType: 'reset';
    actionParams?: {
        scrollRow: number;
        scrollColumn: number;
    };
}

interface ResetColumnStateAction {
    actionType: 'resetColumnState';
}

interface DragColumnToRowGroupPanelAction {
    actionType: 'dragColumnToRowGroupPanel';
    actionParams: {
        mouse: Mouse;
        headerCellName: string;
        duration: number;
        easing?: EasingFunction;
        tweenGroup: Group;
    };
}

interface ToggleGroupCellAction {
    actionType: 'toggleGroupCell';
    actionParams: {
        key: string;
        expand: boolean;
        skipParents?: boolean;
    };
}

/**
 * Focus on the cell element
 *
 * Warning: This will make the viewport jump if you scroll away from the grid
 */
export interface FocusCellAction {
    actionType: 'focusCell';
    actionParams: {
        colIndex: number;
        rowIndex: number;
    };
}

/**
 * Add visual styles for selecting a single cell
 *
 * NOTE: Not a browser based focus
 */
export interface SelectSingleCellAction {
    actionType: 'selectSingleCell';
    actionParams: {
        colIndex: number;
        rowIndex: number;
    };
}

export interface ClearSelectSingleCellAction {
    actionType: 'clearSelectSingleCell';
    actionParams: {
        colIndex: number;
        rowIndex: number;
    };
}

export interface ClearAllSingleCellSelectionsAction {
    actionType: 'clearAllSingleCellSelections';
}

export interface ClearRangeSelectionAction {
    actionType: 'clearRangeSelection';
}

export interface SortAction {
    actionType: 'sort';
    actionParams: {
        colId: string;
        sort: 'asc' | 'desc';
    };
}

interface CloseToolPanelAction {
    actionType: 'closeToolPanel';
}

interface OpenToolPanelAction {
    actionType: 'openToolPanel';
    actionParams: {
        toolPanelKey: string;
    };
}

interface ApplyColumnStateAction {
    actionType: 'applyColumnState';
    actionParams: ApplyColumnStateParams;
}

interface AddCellRangeAction {
    actionType: 'addCellRange';
    actionParams: {
        rowStartIndex: number;
        rowEndIndex: number;
        columnStartIndex: number;
        columnEndIndex: number;
    };
}

interface CreateRangeChartAction {
    actionType: 'createRangeChart';
    actionParams: CreateRangeChartParams;
}

interface ClickOnContextMenuItemAction {
    actionType: 'clickOnContextMenuItem';
    actionParams: Omit<ClickOnContextMenuItemParams, 'agElementFinder' | 'getOverlay'>;
}

interface MoveToElementAndClickAction {
    actionType: 'moveToElementAndClick';
    actionParams: {
        target: AgElementName;
        targetParams?: any;
        /**
         * If the element needs to be scrolled to view, a y offset to apply to
         * the scrolled position
         */
        scrollOffsetY?: number;
        speed?: number;
        duration?: number;
        easing?: EasingFunction;
    };
}

interface TypeInInputAction {
    actionType: 'typeInTextInput';
    actionParams: {
        text: string;
        groupTitle: string;
        inputLabel: string;
        index?: number;
        speedPerCharacter?: number;
    };
}

interface OpenChartToolPanelAction {
    actionType: 'openChartToolPanel';
    actionParams?: {
        panel?: ChartToolPanelName;
    };
}

export type AGCreatorAction =
    | ResetAction
    | ResetColumnStateAction
    | DragColumnToRowGroupPanelAction
    | ToggleGroupCellAction
    | SelectSingleCellAction
    | ClearSelectSingleCellAction
    | ClearAllSingleCellSelectionsAction
    | ClearRangeSelectionAction
    | SortAction
    | FocusCellAction
    | OpenToolPanelAction
    | CloseToolPanelAction
    | ApplyColumnStateAction
    | AddCellRangeAction
    | CreateRangeChartAction
    | ClickOnContextMenuItemAction
    | MoveToElementAndClickAction
    | TypeInInputAction
    | OpenChartToolPanelAction;

export function createAGActionCreator({
    getOverlay,
    gridApi,
    agElementFinder,
    mouse,
    tweenGroup,
    defaultEasing,
    scriptDebugger,
}: {
    getOverlay: () => HTMLElement;
    gridApi: GridApi;
    agElementFinder: AgElementFinder;
    mouse: Mouse;
    tweenGroup: Group;
    defaultEasing?: EasingFunction;
    scriptDebugger?: ScriptDebugger;
}) {
    return (agAction: AGCreatorAction) => {
        const { actionType } = agAction;

        if (actionType === 'reset') {
            const action = agAction as ResetAction;
            return resetGrid({
                gridApi,
                scrollRow: action.actionParams?.scrollRow,
                scrollColumn: action.actionParams?.scrollColumn,
            });
        } else if (actionType === 'resetColumnState') {
            gridApi.resetColumnState();
        } else if (actionType === 'dragColumnToRowGroupPanel') {
            const action = agAction as DragColumnToRowGroupPanelAction;

            // NOTE: Need to return promise, so that it gets resolved downstream
            return dragColumnToRowGroupPanel({ agElementFinder, scriptDebugger, ...action.actionParams });
        } else if (actionType === 'toggleGroupCell') {
            const action = agAction as ToggleGroupCellAction;
            const expandParents = !action.actionParams.skipParents;

            gridApi.forEachNode((node) => {
                if (node.key === action.actionParams.key) {
                    gridApi.setRowNodeExpanded(node, action.actionParams.expand, expandParents);
                }
            });
        } else if (actionType === 'focusCell') {
            const action = agAction as FocusCellAction;
            const firstCol = gridApi.getAllDisplayedColumns()[action.actionParams.colIndex];
            if (!firstCol) {
                return;
            }
            gridApi.ensureColumnVisible(firstCol);
            gridApi.setFocusedCell(action.actionParams.rowIndex, firstCol);
        } else if (actionType === 'selectSingleCell') {
            const action = agAction as SelectSingleCellAction;
            selectSingleCell({ agElementFinder, ...action.actionParams });
        } else if (actionType === 'clearSelectSingleCell') {
            const action = agAction as ClearSelectSingleCellAction;
            clearSingleCell({ agElementFinder, ...action.actionParams });
        } else if (actionType === 'clearAllSingleCellSelections') {
            clearAllSingleCellSelections();
        } else if (actionType === 'clearRangeSelection') {
            gridApi.clearRangeSelection();
        } else if (actionType === 'sort') {
            const action = agAction as SortAction;
            const { colId, sort } = action.actionParams;
            gridApi.applyColumnState({
                state: [{ colId, sort }],
                defaultState: { sort: null },
            });
        } else if (actionType === 'openToolPanel') {
            const action = agAction as OpenToolPanelAction;
            gridApi.openToolPanel(action.actionParams.toolPanelKey);
        } else if (actionType === 'closeToolPanel') {
            gridApi.closeToolPanel();
        } else if (actionType === 'applyColumnState') {
            const action = agAction as ApplyColumnStateAction;
            gridApi.applyColumnState(action.actionParams);
        } else if (actionType === 'addCellRange') {
            const action = agAction as AddCellRangeAction;
            addCellRange({
                gridApi,
                rowStartIndex: action.actionParams.rowStartIndex,
                rowEndIndex: action.actionParams.rowEndIndex,
                columnStartIndex: action.actionParams.columnStartIndex,
                columnEndIndex: action.actionParams.columnEndIndex,
            });
        } else if (actionType === 'createRangeChart') {
            const action = agAction as CreateRangeChartAction;
            gridApi.createRangeChart(action.actionParams);
        } else if (actionType === 'clickOnContextMenuItem') {
            const action = agAction as ClickOnContextMenuItemAction;
            // NOTE: Need to return promise, so that it gets resolved downstream
            return clickOnContextMenuItem({ agElementFinder, scriptDebugger, getOverlay, ...action.actionParams });
        } else if (actionType === 'moveToElementAndClick') {
            const action = agAction as MoveToElementAndClickAction;
            return moveToElementAndClick({
                mouse,
                tweenGroup,
                scriptDebugger,
                agElementFinder,
                target: action.actionParams.target,
                targetParams: action.actionParams.targetParams,
                scrollOffsetY: action.actionParams.scrollOffsetY,
                easing: action.actionParams.easing || defaultEasing,
                speed: action.actionParams.speed,
                duration: action.actionParams.duration,
            });
        } else if (actionType === 'typeInTextInput') {
            const action = agAction as TypeInInputAction;
            return typeInTextInput({
                agElementFinder,
                text: action.actionParams?.text,
                groupTitle: action.actionParams?.groupTitle,
                inputLabel: action.actionParams?.inputLabel,
                index: action.actionParams?.index,
                speedPerCharacter: action.actionParams?.speedPerCharacter,
            });
        } else if (actionType === 'openChartToolPanel') {
            const action = agAction as OpenChartToolPanelAction;

            openChartToolPanel({
                gridApi,
                ...action.actionParams,
            });
        }
    };
}
