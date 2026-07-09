import { _doOnce, _missing } from 'ag-stack';

import type { GridApi } from './api/gridApi';
import type { BeanCollection } from './context/context';
import type {
    CheckboxLocation,
    DomLayoutType,
    FillHandleOptions,
    GetRowIdFunc,
    GridOptions,
    GroupSelectionMode,
    IsRowSelectable,
    MasterSelectionMode,
    MultiRowSelectionOptions,
    RowSelectionMode,
    RowSelectionOptions,
    SelectAllMode,
    SingleRowSelectionOptions,
} from './entities/gridOptions';
import type { RowNode } from './entities/rowNode';
import type { ComponentStateChangedEvent, GridOptionsChangedEvent } from './events';
import { _getGlobalGridOption } from './globalGridOptions';
import type { GridOptionOrDefault } from './gridOptionsDefault';
import { GRID_OPTION_DEFAULTS } from './gridOptionsDefault';
import type {
    ExtractParamsFromCallback,
    ExtractReturnTypeFromCallback,
    GridOptionsService,
} from './gridOptionsService';
import type {
    GetGroupAggFilteringParams,
    GetGroupIncludeFooterParams,
    RowHeightParams,
} from './interfaces/iCallbackParams';
import type { IClientSideRowModel } from './interfaces/iClientSideRowModel';
import type { AgGridCommon, WithoutGridCommon } from './interfaces/iCommon';
import type { IRowModel, RowModelType } from './interfaces/iRowModel';
import type { IRowNode } from './interfaces/iRowNode';
import type { IServerSideRowModel } from './interfaces/iServerSideRowModel';
import { _isFiniteNumber } from './utils/number';

function isRowModelType(gos: GridOptionsService, rowModelType: RowModelType): boolean {
    return gos.get('rowModelType') === rowModelType;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _isClientSideRowModel(
    gos: GridOptionsService,
    _rowModel?: IRowModel
): _rowModel is IClientSideRowModel {
    return isRowModelType(gos, 'clientSide');
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _isServerSideRowModel(
    gos: GridOptionsService,
    _rowModel?: IRowModel
): _rowModel is IServerSideRowModel {
    return isRowModelType(gos, 'serverSide');
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _isDomLayout(gos: GridOptionsService, domLayout: DomLayoutType) {
    return gos.get('domLayout') === domLayout;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _isRowSelection(gos: GridOptionsService): boolean {
    return _getRowSelectionMode(gos) !== undefined;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _isGetRowHeightFunction(gos: GridOptionsService): boolean {
    return typeof gos.get('getRowHeight') === 'function';
}

export function _shouldMaintainColumnOrder(gos: GridOptionsService, isPivotColumns: boolean): boolean {
    if (isPivotColumns) {
        return !gos.get('enableStrictPivotColumnOrder');
    }
    return gos.get('maintainColumnOrder');
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _isRowNumbers({ gos, formula }: BeanCollection) {
    const rowNumbers = gos.get('rowNumbers');
    return rowNumbers || (!!formula?.active && rowNumbers !== false);
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _getRowHeightForNode(
    beans: BeanCollection,
    rowNode: IRowNode,
    allowEstimate = false,
    defaultRowHeight?: number
): { height: number; estimated: boolean } {
    const { gos, environment } = beans;
    if (defaultRowHeight == null) {
        defaultRowHeight = environment.getDefaultRowHeight();
    }

    // check the function first, in case use set both function and
    // number, when using virtual pagination then function can be
    // used for pinned rows and the number for the body rows.

    if (_isGetRowHeightFunction(gos)) {
        if (allowEstimate) {
            return { height: defaultRowHeight, estimated: true };
        }

        const params: WithoutGridCommon<RowHeightParams> = {
            node: rowNode,
            data: rowNode.data,
        };

        const height = gos.getCallback('getRowHeight')!(params);

        if (_isFiniteNumber(height)) {
            if (height === 0) {
                beans.log.warn(23);
            }
            return { height: Math.max(1, height), estimated: false };
        }
    }

    if (rowNode.detail && gos.get('masterDetail')) {
        return getMasterDetailRowHeight(gos);
    }

    const gridOptionsRowHeight = gos.get('rowHeight');

    const rowHeight =
        gridOptionsRowHeight && _isFiniteNumber(gridOptionsRowHeight) ? gridOptionsRowHeight : defaultRowHeight;

    return { height: rowHeight, estimated: false };
}

function getMasterDetailRowHeight(gos: GridOptionsService): { height: number; estimated: boolean } {
    // if autoHeight, we want the height to grow to the new height starting at 1, as otherwise a flicker would happen,
    // as the detail goes to the default (eg 200px) and then immediately shrink up/down to the new measured height
    // (due to auto height) which looks bad, especially if doing row animation.
    if (gos.get('detailRowAutoHeight')) {
        return { height: 1, estimated: false };
    }

    const defaultRowHeight = gos.get('detailRowHeight');

    if (_isFiniteNumber(defaultRowHeight)) {
        return { height: defaultRowHeight, estimated: false };
    }

    return { height: 300, estimated: false };
}

// we don't allow dynamic row height for virtual paging
/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _getRowHeightAsNumber(beans: BeanCollection): number {
    const { environment, gos } = beans;
    const gridOptionsRowHeight = gos.get('rowHeight');
    if (!gridOptionsRowHeight || _missing(gridOptionsRowHeight)) {
        return environment.getDefaultRowHeight();
    }

    const rowHeight = environment.refreshRowHeightVariable();

    if (rowHeight !== -1) {
        return rowHeight;
    }

    beans.log.warn(24);
    return environment.getDefaultRowHeight();
}

// returns the dom data, or undefined if not found
export function _getDomData(gos: GridOptionsService, element: Node | null, key: string): any {
    const domData = (element as any)[gos.getDomDataKey()];

    return domData ? domData[key] : undefined;
}

export function _setDomData(gos: GridOptionsService, element: Element, key: string, value: any): any {
    const domDataKey = gos.getDomDataKey();
    let domData = (element as any)[domDataKey];

    if (_missing(domData)) {
        domData = {};
        (element as any)[domDataKey] = domData;
    }
    domData[key] = value;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _isAnimateRows(gos: GridOptionsService) {
    // never allow animating if enforcing the row order
    if (gos.get('ensureDomOrder')) {
        return false;
    }

    return gos.get('animateRows');
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _isGroupRowsSticky(gos: GridOptionsService): boolean {
    return !(gos.get('paginateChildRows') || gos.get('groupHideOpenParents') || _isDomLayout(gos, 'print'));
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _isColumnsSortingCoupledToGroup(gos: GridOptionsService): boolean {
    const autoGroupColumnDef = gos.get('autoGroupColumnDef');
    return !autoGroupColumnDef?.comparator && !gos.get('treeData');
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _getGroupAggFiltering(
    gos: GridOptionsService
): ((params: WithoutGridCommon<GetGroupAggFilteringParams>) => boolean) | undefined {
    const userValue = gos.get('groupAggFiltering');

    if (typeof userValue === 'function') {
        return gos.getCallback('groupAggFiltering' as any) as any;
    }

    if (userValue === true) {
        return () => true;
    }

    return undefined;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _getGrandTotalRow(gos: GridOptionsService): GridOptions['grandTotalRow'] {
    return gos.get('grandTotalRow');
}

/**
 * Maps a `grandTotalRow` option to the floating side the grand total should be pinned to,
 * or `null` when it should render inline (or is disabled).
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export function _getGrandTotalPinnedFloat(grandTotalRow: GridOptions['grandTotalRow']): 'top' | 'bottom' | null {
    switch (grandTotalRow) {
        case 'pinnedTop':
            return 'top';
        case 'pinnedBottom':
            return 'bottom';
        default:
            return null;
    }
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _getGroupTotalRowCallback(
    gos: GridOptionsService
): (params: WithoutGridCommon<GetGroupIncludeFooterParams>) => 'top' | 'bottom' | undefined {
    const userValue = gos.get('groupTotalRow');

    if (typeof userValue === 'function') {
        return gos.getCallback('groupTotalRow' as any) as any;
    }

    return () => userValue ?? undefined;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _isGroupMultiAutoColumn(gos: GridOptionsService) {
    const isHideOpenParents = !!gos.get('groupHideOpenParents');
    if (isHideOpenParents) {
        return true;
    }
    return gos.get('groupDisplayType') === 'multipleColumns';
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _isGroupHideColumnsUntilExpanded(gos: GridOptionsService) {
    return _isGroupMultiAutoColumn(gos) && gos.get('groupHideColumnsUntilExpanded') && _isClientSideRowModel(gos);
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _isGroupUseEntireRow(gos: GridOptionsService, pivotMode: boolean): boolean {
    // we never allow groupDisplayType = 'groupRows' if in pivot mode, otherwise we won't see the pivot values.
    if (pivotMode) {
        return false;
    }

    return gos.get('groupDisplayType') === 'groupRows';
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _isFullWidthGroupRow(gos: GridOptionsService, node: RowNode, pivotMode: boolean): boolean {
    return !!node.group && !node.footer && _isGroupUseEntireRow(gos, pivotMode);
}

// AG-9259 Can't use `WrappedCallback<'getRowId', ...>` here because of a strange typescript bug
/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _getRowIdCallback<TData = any>(
    beans: BeanCollection
):
    | ((
          params: WithoutGridCommon<ExtractParamsFromCallback<GetRowIdFunc<TData>>>
      ) => ExtractReturnTypeFromCallback<GetRowIdFunc<TData>>)
    | undefined {
    const getRowId = beans.gos.getCallback('getRowId');

    if (getRowId === undefined) {
        return getRowId;
    }

    return (params) => {
        let id = getRowId(params);

        if (typeof id !== 'string') {
            // Throttle to once per grid: avoids logging for every row (could be thousands), while still
            // letting each grid surface its own occurrence so the diagnostic attributes per grid.
            _doOnce(() => beans.log.warn(25, { id }), `getRowIdString:${beans.context.getId()}`);
            id = String(id);
        }

        return id;
    };
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _canSkipShowingRowGroup(gos: GridOptionsService, node: RowNode): boolean {
    const isSkippingGroups = gos.get('groupHideParentOfSingleChild');
    if (isSkippingGroups === true) {
        return true;
    }
    if (isSkippingGroups === 'leafGroupsOnly' && node.leafGroup) {
        return true;
    }
    // deprecated
    if (gos.get('groupRemoveSingleChildren')) {
        return true;
    }
    if (gos.get('groupRemoveLowestSingleChildren') && node.leafGroup) {
        return true;
    }
    return false;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _getMaxConcurrentDatasourceRequests(gos: GridOptionsService): number | undefined {
    const res = gos.get('maxConcurrentDatasourceRequests');
    // negative number, eg -1, means no max restriction
    return res > 0 ? res : undefined;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _shouldUpdateColVisibilityAfterGroup(gos: GridOptionsService, isGrouped: boolean): boolean {
    const preventVisibilityChanges = gos.get('suppressGroupChangesColumnVisibility');
    if (preventVisibilityChanges === true) {
        return false;
    }
    if (isGrouped && preventVisibilityChanges === 'suppressHideOnGroup') {
        return false;
    }
    if (!isGrouped && preventVisibilityChanges === 'suppressShowOnUngroup') {
        return false;
    }

    const legacySuppressOnGroup = gos.get('suppressRowGroupHidesColumns');
    if (isGrouped && legacySuppressOnGroup === true) {
        return false;
    }

    const legacySuppressOnUngroup = gos.get('suppressMakeColumnVisibleAfterUnGroup');
    if (!isGrouped && legacySuppressOnUngroup === true) {
        return false;
    }

    return true;
}

/**
 * Get the selection checkbox configuration. Defaults to enabled.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export function _getCheckboxes(
    selection: RowSelectionOptions
): NonNullable<SingleRowSelectionOptions['checkboxes']> | NonNullable<MultiRowSelectionOptions['checkboxes']> {
    return selection?.checkboxes ?? true;
}

/**
 * Get the header checkbox configuration. Defaults to enabled in `multiRow`, otherwise disabled.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export function _getHeaderCheckbox(selection: RowSelectionOptions): boolean {
    return selection?.mode === 'multiRow' && (selection.headerCheckbox ?? true);
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _getCheckboxLocation(rowSelection: GridOptions['rowSelection']): CheckboxLocation | undefined {
    if (typeof rowSelection !== 'object') {
        return undefined;
    }
    return rowSelection.checkboxLocation ?? 'selectionColumn';
}

/** Get the display configuration for disabled checkboxes. Defaults to displaying disabled checkboxes. */
export function _getHideDisabledCheckboxes(selection: RowSelectionOptions): boolean {
    return selection?.hideDisabledCheckboxes ?? false;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _isUsingNewRowSelectionAPI(gos: GridOptionsService): boolean {
    const rowSelection = gos.get('rowSelection');
    return typeof rowSelection !== 'string';
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _isUsingNewCellSelectionAPI(gos: GridOptionsService): boolean {
    return gos.get('cellSelection') !== undefined;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _getSuppressMultiRanges(gos: GridOptionsService): boolean {
    const selection = gos.get('cellSelection');
    const useNewAPI = selection !== undefined;

    if (!useNewAPI) {
        return gos.get('suppressMultiRangeSelection');
    }

    return typeof selection !== 'boolean' ? (selection?.suppressMultiRanges ?? false) : false;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _isCellSelectionEnabled(gos: GridOptionsService): boolean {
    const selection = gos.get('cellSelection');
    const useNewAPI = selection !== undefined;

    return useNewAPI ? !!selection : gos.get('enableRangeSelection');
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _getFillHandle(gos: GridOptionsService): FillHandleOptions | undefined {
    const selection = gos.get('cellSelection');
    const useNewAPI = selection !== undefined;

    if (!useNewAPI) {
        return {
            mode: 'fill',
            setFillValue: gos.get('fillOperation'),
            direction: gos.get('fillHandleDirection'),
            suppressClearOnFillReduction: gos.get('suppressClearOnFillReduction'),
        };
    }

    return typeof selection !== 'boolean' && selection.handle?.mode === 'fill' ? selection.handle : undefined;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _getEnableColumnSelection(gos: GridOptionsService): boolean {
    const cellSelection = gos.get('cellSelection') ?? false;
    return (typeof cellSelection === 'object' && cellSelection.enableColumnSelection) ?? false;
}

function _getEnableClickSelection(gos: GridOptionsService): NonNullable<RowSelectionOptions['enableClickSelection']> {
    const selection = gos.get('rowSelection') ?? 'single';

    if (typeof selection === 'string') {
        const suppressRowClickSelection = gos.get('suppressRowClickSelection');
        const suppressRowDeselection = gos.get('suppressRowDeselection');

        if (suppressRowClickSelection && suppressRowDeselection) {
            return false;
        } else if (suppressRowClickSelection) {
            return 'enableDeselection';
        } else if (suppressRowDeselection) {
            return 'enableSelection';
        } else {
            return true;
        }
    }

    return selection.mode === 'singleRow' || selection.mode === 'multiRow'
        ? (selection.enableClickSelection ?? false)
        : false;
}

export function _getEnableSelection(gos: GridOptionsService): boolean {
    const enableClickSelection = _getEnableClickSelection(gos);
    return enableClickSelection === true || enableClickSelection === 'enableSelection';
}

export function _getEnableDeselection(gos: GridOptionsService): boolean {
    const enableClickSelection = _getEnableClickSelection(gos);
    return enableClickSelection === true || enableClickSelection === 'enableDeselection';
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _getIsRowSelectable(gos: GridOptionsService): IsRowSelectable | undefined {
    const selection = gos.get('rowSelection');

    if (typeof selection === 'string') {
        return gos.get('isRowSelectable');
    }

    return selection?.isRowSelectable;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _getRowSelectionMode(gridOptions: GridOptions): RowSelectionMode | undefined;
export function _getRowSelectionMode(gos: GridOptionsService): RowSelectionMode | undefined;
export function _getRowSelectionMode(arg: object): RowSelectionMode | undefined {
    const selection =
        'beanName' in arg && arg.beanName === 'gos'
            ? (arg as GridOptionsService).get('rowSelection')
            : (arg as GridOptions).rowSelection;

    if (typeof selection === 'string') {
        switch (selection) {
            case 'multiple':
                return 'multiRow';
            case 'single':
                return 'singleRow';
            default:
                return;
        }
    }

    // only permit expected values for selection mode
    switch (selection?.mode) {
        case 'multiRow':
        case 'singleRow':
            return selection.mode;
        default:
            return;
    }
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _isMultiRowSelection(gridOptions: GridOptions): boolean;
export function _isMultiRowSelection(gos: GridOptionsService): boolean;
export function _isMultiRowSelection(arg: object): boolean {
    const mode = _getRowSelectionMode(arg as GridOptionsService);
    return mode === 'multiRow';
}

export function _getEnableSelectionWithoutKeys(gos: GridOptionsService): boolean {
    const selection = gos.get('rowSelection');

    if (typeof selection === 'string') {
        return gos.get('rowMultiSelectWithClick');
    }

    return selection?.enableSelectionWithoutKeys ?? false;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _getGroupSelection(gos: GridOptionsService): GroupSelectionMode | undefined {
    const selection = gos.get('rowSelection');

    if (typeof selection === 'string') {
        const groupSelectsChildren = gos.get('groupSelectsChildren');
        const groupSelectsFiltered = gos.get('groupSelectsFiltered');

        if (groupSelectsChildren && groupSelectsFiltered) {
            return 'filteredDescendants';
        } else if (groupSelectsChildren) {
            return 'descendants';
        } else {
            return 'self';
        }
    }

    return selection?.mode === 'multiRow' ? selection.groupSelects : undefined;
}

export function _getSelectAll(gos: GridOptionsService, defaultValue: boolean): SelectAllMode | undefined;
export function _getSelectAll(gos: GridOptionsService): SelectAllMode;
export function _getSelectAll(gos: GridOptionsService, defaultValue = true): SelectAllMode | undefined {
    const rowSelection = gos.get('rowSelection');
    if (typeof rowSelection !== 'object') {
        return defaultValue ? 'all' : undefined;
    }
    return rowSelection.mode === 'multiRow' ? rowSelection.selectAll : 'all';
}

export function _getCtrlASelectsRows(gos: GridOptionsService): boolean {
    const rowSelection = gos.get('rowSelection');
    if (typeof rowSelection === 'string') {
        return false;
    }
    return rowSelection?.mode === 'multiRow' ? (rowSelection.ctrlASelectsRows ?? false) : false;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _getGroupSelectsDescendants(gos: GridOptionsService): boolean {
    const groupSelection = _getGroupSelection(gos);
    return groupSelection === 'descendants' || groupSelection === 'filteredDescendants';
}

export function _getMasterSelects(gos: GridOptionsService): MasterSelectionMode {
    const rowSelection = gos.get('rowSelection');
    return (typeof rowSelection === 'object' && rowSelection.masterSelects) || 'self';
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _isSetFilterByDefault(gos: GridOptionsService): boolean {
    return gos.isModuleRegistered('SetFilter') && !gos.get('suppressSetFilterByDefault');
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _isLegacyMenuEnabled(gos: GridOptionsService): boolean {
    return gos.get('columnMenu') === 'legacy';
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _isColumnMenuAnchoringEnabled(gos: GridOptionsService): boolean {
    return !_isLegacyMenuEnabled(gos);
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _getCallbackForEvent(eventName: string): string {
    if (!eventName || eventName.length < 2) {
        return eventName;
    }
    return 'on' + eventName[0].toUpperCase() + eventName.substring(1);
}

/**
 * Combines component props / attributes with the provided gridOptions returning a new combined gridOptions object
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export function _combineAttributesAndGridOptions(
    gridOptions: GridOptions | undefined,
    component: any,
    gridOptionsKeys: string[]
): GridOptions {
    // create empty grid options if none were passed
    if (typeof gridOptions !== 'object') {
        gridOptions = {} as GridOptions;
    }
    // shallow copy (so we don't change the provided object)
    const mergedOptions = { ...gridOptions } as any;
    // Loop through component props, if they are not undefined and a valid gridOption copy to gridOptions
    for (const key of gridOptionsKeys) {
        const value = component[key];
        if (typeof value !== 'undefined') {
            mergedOptions[key] = value;
        }
    }
    return mergedOptions;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _processOnChange(changes: any, api: GridApi): void {
    if (!changes) {
        return;
    }

    const gridChanges: Record<string, any> = {};
    let hasChanges = false;
    for (const key of Object.keys(changes)) {
        gridChanges[key] = changes[key];
        hasChanges = true;
    }

    if (!hasChanges) {
        return;
    }

    const internalUpdateEvent: WithoutGridCommon<GridOptionsChangedEvent> = {
        type: 'gridOptionsChanged',
        options: gridChanges,
    };
    api.dispatchEvent(internalUpdateEvent);

    // copy gridChanges into an event for dispatch
    const event: WithoutGridCommon<ComponentStateChangedEvent> = {
        type: 'componentStateChanged',
        ...gridChanges,
    };

    api.dispatchEvent(event);
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _addGridCommonParams<T extends AgGridCommon<TData, TContext>, TData = any, TContext = any>(
    gos: GridOptionsService,
    params: WithoutGridCommon<T>
): T {
    return gos.addCommon(params);
}

/**
 * Used for before GridOptionsService is initialised
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export function _getGridOption<K extends keyof GridOptions>(
    providedGridOptions: GridOptions,
    gridOption: K
): GridOptionOrDefault<K> {
    return (
        providedGridOptions[gridOption] ??
        (providedGridOptions as any)[`gridOptions`]?.[gridOption] ??
        _getGlobalGridOption(gridOption) ??
        (GRID_OPTION_DEFAULTS[gridOption as keyof typeof GRID_OPTION_DEFAULTS] as any)
    );
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _interpretAsRightClick({ gos }: BeanCollection, event: MouseEvent): boolean {
    return event.button === 2 || (event.ctrlKey && gos.get('allowContextMenuWithControlKey'));
}
