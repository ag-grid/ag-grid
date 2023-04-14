import { Group } from '@tweenjs/tween.js';
import { ApplyColumnStateParams, GridOptions } from 'ag-grid-community';
import { AgElementFinder } from './agElements';
import { AgElementName } from './agElements/agElementsConfig';
import { AG_DND_GHOST_SELECTOR } from './constants';
import { Mouse } from './createMouse';
import { clickOnContextMenuItem, ClickOnContextMenuItemParams } from './scriptActions/clickOnContextMenuItem';
import { destoryAllCharts } from './scriptActions/destroyAllCharts';
import { dragColumnToRowGroupPanel } from './scriptActions/dragColumnToRowGroupPanel';
import { moveToElementAndClick } from './scriptActions/moveToElementAndClick';
import { clearAllSingleCellSelections, clearSingleCell, selectSingleCell } from './scriptActions/singleCell';
import { ScriptDebugger } from './scriptDebugger';
import { EasingFunction } from './tween';

interface ResetAction {
    actionType: 'reset';
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

interface ClickOnContextMenuItemAction {
    actionType: 'clickOnContextMenuItem';
    actionParams: ClickOnContextMenuItemParams;
}

interface MoveToElementAndClickAction {
    actionType: 'moveToElementAndClick';
    actionParams: {
        target: AgElementName;
        targetParams?: any;
        speed?: number;
        duration?: number;
        easing?: EasingFunction;
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
    | FocusCellAction
    | OpenToolPanelAction
    | CloseToolPanelAction
    | ApplyColumnStateAction
    | ClickOnContextMenuItemAction
    | MoveToElementAndClickAction;

export function createAGActionCreator({
    containerEl,
    gridOptions,
    agElementFinder,
    mouse,
    tweenGroup,
    defaultEasing,
    scriptDebugger,
}: {
    containerEl?: HTMLElement;
    gridOptions: GridOptions;
    agElementFinder: AgElementFinder;
    mouse: Mouse;
    tweenGroup: Group;
    defaultEasing?: EasingFunction;
    scriptDebugger?: ScriptDebugger;
}) {
    return (agAction: AGCreatorAction) => {
        const { actionType } = agAction;

        if (actionType === 'reset') {
            gridOptions?.columnApi?.resetColumnState();
            gridOptions?.columnApi?.resetColumnGroupState();
            gridOptions?.columnApi?.setColumnsPinned([], null);
            if (gridOptions?.api) {
                gridOptions.api.setFilterModel(null);
                gridOptions.api.closeToolPanel();
                gridOptions.api.clearRangeSelection();
                destoryAllCharts(gridOptions.api);
            }
            document.querySelector(AG_DND_GHOST_SELECTOR)?.remove();
            clearAllSingleCellSelections();
        } else if (actionType === 'resetColumnState') {
            gridOptions?.columnApi?.resetColumnState();
        } else if (actionType === 'dragColumnToRowGroupPanel') {
            const action = agAction as DragColumnToRowGroupPanelAction;

            // NOTE: Need to return promise, so that it gets resolved downstream
            return dragColumnToRowGroupPanel({ containerEl, ...action.actionParams });
        } else if (actionType === 'toggleGroupCell') {
            const action = agAction as ToggleGroupCellAction;
            const expandParents = !action.actionParams.skipParents;

            gridOptions?.api?.forEachNode((node) => {
                if (node.key === action.actionParams.key) {
                    gridOptions?.api?.setRowNodeExpanded(node, action.actionParams.expand, expandParents);
                }
            });
        } else if (actionType === 'focusCell') {
            const action = agAction as FocusCellAction;
            const firstCol = gridOptions?.columnApi?.getAllDisplayedColumns()[action.actionParams.colIndex];
            if (!firstCol) {
                return;
            }
            gridOptions?.api?.ensureColumnVisible(firstCol);
            gridOptions?.api?.setFocusedCell(action.actionParams.rowIndex, firstCol);
        } else if (actionType === 'selectSingleCell') {
            const action = agAction as SelectSingleCellAction;
            selectSingleCell({ containerEl, ...action.actionParams });
        } else if (actionType === 'clearSelectSingleCell') {
            const action = agAction as ClearSelectSingleCellAction;
            clearSingleCell({ containerEl, ...action.actionParams });
        } else if (actionType === 'clearAllSingleCellSelections') {
            clearAllSingleCellSelections();
        } else if (actionType === 'clearRangeSelection') {
            gridOptions.api!.clearRangeSelection();
        } else if (actionType === 'openToolPanel') {
            const action = agAction as OpenToolPanelAction;
            gridOptions?.api?.openToolPanel(action.actionParams.toolPanelKey);
        } else if (actionType === 'closeToolPanel') {
            gridOptions?.api?.closeToolPanel();
        } else if (actionType === 'applyColumnState') {
            const action = agAction as ApplyColumnStateAction;
            gridOptions?.columnApi?.applyColumnState(action.actionParams);
        } else if (actionType === 'clickOnContextMenuItem') {
            const action = agAction as ClickOnContextMenuItemAction;
            // NOTE: Need to return promise, so that it gets resolved downstream
            return clickOnContextMenuItem({ containerEl, ...action.actionParams });
        } else if (actionType === 'moveToElementAndClick') {
            const action = agAction as MoveToElementAndClickAction;
            return moveToElementAndClick({
                mouse,
                tweenGroup,
                scriptDebugger,
                agElementFinder,
                target: action.actionParams.target,
                targetParams: action.actionParams.targetParams,
                easing: action.actionParams.easing || defaultEasing,
                speed: action.actionParams.speed,
                duration: action.actionParams.duration,
            });
        }
    };
}
