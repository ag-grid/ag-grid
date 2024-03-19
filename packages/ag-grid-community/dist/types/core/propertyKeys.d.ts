import { GridOptions } from "./entities/gridOptions";
import { AgGridCommon } from "./interfaces/iCommon";
type GridOptionKey = keyof GridOptions;
type GetKeys<T, U> = {
    [K in keyof T]: U extends T[K] ? K : (T[K] extends U | null | undefined ? K : never);
}[keyof T];
/**
 *  Get the GridProperties that are of type `any`.
 *  Works by finding the properties that can extend a non existing string.
 *  This will only be the properties of type `any`.
 */
export type AnyGridOptions = {
    [K in keyof GridOptions]: GridOptions[K] extends 'NO_MATCH' ? K : never;
}[keyof GridOptions];
/**
 * Get all the GridOptions properties of the provided type.
 * Will also include `any` properties.
 */
type KeysLike<U> = Exclude<GetKeys<GridOptions, U>, undefined>;
/**
 * Get all the GridOption properties that strictly contain the provided type.
 * Does not include `any` properties.
 */
type KeysOfType<U> = Exclude<GetKeys<GridOptions, U>, AnyGridOptions>;
type CallbackKeys = KeysOfType<(any: AgGridCommon<any, any>) => any>;
/** All function properties excluding those explicity match the common callback interface. */
type FunctionKeys = Exclude<KeysLike<Function>, CallbackKeys>;
export declare const INITIAL_GRID_OPTION_KEYS: {
    enableBrowserTooltips: boolean;
    tooltipTrigger: boolean;
    tooltipMouseTrack: boolean;
    tooltipShowMode: boolean;
    tooltipInteraction: boolean;
    defaultColGroupDef: boolean;
    suppressAutoSize: boolean;
    skipHeaderOnAutoSize: boolean;
    autoSizeStrategy: boolean;
    components: boolean;
    stopEditingWhenCellsLoseFocus: boolean;
    undoRedoCellEditing: boolean;
    undoRedoCellEditingLimit: boolean;
    excelStyles: boolean;
    cacheQuickFilter: boolean;
    excludeHiddenColumnsFromQuickFilter: boolean;
    advancedFilterModel: boolean;
    customChartThemes: boolean;
    chartThemeOverrides: boolean;
    enableChartToolPanelsButton: boolean;
    suppressChartToolPanelsButton: boolean;
    chartToolPanelsDef: boolean;
    loadingCellRendererSelector: boolean;
    localeText: boolean;
    keepDetailRows: boolean;
    keepDetailRowsCount: boolean;
    detailRowHeight: boolean;
    detailRowAutoHeight: boolean;
    tabIndex: boolean;
    valueCache: boolean;
    valueCacheNeverExpires: boolean;
    enableCellExpressions: boolean;
    suppressParentsInRowNodes: boolean;
    suppressTouch: boolean;
    suppressAsyncEvents: boolean;
    suppressBrowserResizeObserver: boolean;
    suppressPropertyNamesCheck: boolean;
    debug: boolean;
    loadingOverlayComponent: boolean;
    suppressLoadingOverlay: boolean;
    noRowsOverlayComponent: boolean;
    paginationPageSizeSelector: boolean;
    paginateChildRows: boolean;
    pivotPanelShow: boolean;
    pivotSuppressAutoColumn: boolean;
    suppressExpandablePivotGroups: boolean;
    aggFuncs: boolean;
    suppressAggFuncInHeader: boolean;
    suppressAggAtRootLevel: boolean;
    removePivotHeaderRowWhenSingleValueColumn: boolean;
    allowShowChangeAfterFilter: boolean;
    ensureDomOrder: boolean;
    enableRtl: boolean;
    suppressColumnVirtualisation: boolean;
    suppressMaxRenderedRowRestriction: boolean;
    suppressRowVirtualisation: boolean;
    rowDragText: boolean;
    suppressGroupMaintainValueType: boolean;
    groupLockGroupColumns: boolean;
    rowGroupPanelSuppressSort: boolean;
    suppressGroupRowsSticky: boolean;
    rowModelType: boolean;
    cacheOverflowSize: boolean;
    infiniteInitialRowCount: boolean;
    serverSideInitialRowCount: boolean;
    suppressServerSideInfiniteScroll: boolean;
    maxBlocksInCache: boolean;
    maxConcurrentDatasourceRequests: boolean;
    blockLoadDebounceMillis: boolean;
    serverSideOnlyRefreshFilteredGroups: boolean;
    serverSidePivotResultFieldSeparator: boolean;
    viewportRowModelPageSize: boolean;
    viewportRowModelBufferSize: boolean;
    debounceVerticalScrollbar: boolean;
    suppressAnimationFrame: boolean;
    suppressPreventDefaultOnMouseWheel: boolean;
    scrollbarWidth: boolean;
    icons: boolean;
    suppressRowTransform: boolean;
    gridId: boolean;
    functionsPassive: boolean;
    enableGroupEdit: boolean;
    initialState: boolean;
    processUnpinnedColumns: boolean;
    createChartContainer: boolean;
    getLocaleText: boolean;
    getRowId: boolean;
    reactiveCustomComponents: boolean;
    columnMenu: boolean;
};
type InitialGridOptionKey = keyof typeof INITIAL_GRID_OPTION_KEYS;
export type ManagedGridOptionKey = Exclude<GridOptionKey, InitialGridOptionKey>;
export type ManagedGridOptions<TData = any> = {
    [K in (ManagedGridOptionKey)]?: GridOptions<TData>[K];
};
/**
 * These keys are used for validating properties supplied on a gridOptions object, and for code generation.
 * If you change the properties on the gridOptions interface, you *must* update this file as well to be consistent.
 */
export declare class PropertyKeys {
    static STRING_PROPERTIES: KeysOfType<string>[];
    static OBJECT_PROPERTIES: KeysLike<object | HTMLElement>[];
    static ARRAY_PROPERTIES: KeysOfType<any[]>[];
    static NUMBER_PROPERTIES: KeysOfType<number>[];
    static BOOLEAN_PROPERTIES: KeysOfType<boolean>[];
    /** You do not need to include event callbacks in this list, as they are generated automatically. */
    static FUNCTIONAL_PROPERTIES: FunctionKeys[];
    /** These callbacks extend AgGridCommon interface */
    static CALLBACK_PROPERTIES: CallbackKeys[];
    static FUNCTION_PROPERTIES: GridOptionKey[];
    static ALL_PROPERTIES: GridOptionKey[];
}
export {};
