import type { GridOptions } from './entities/gridOptions';

// Leave untyped. so it can be inferred. Might be possible to type in the future with NoInfer<T>
export const GRID_OPTION_DEFAULTS = {
    suppressMenuHide: true,
    tooltipTrigger: 'hover',
    tooltipShowDelay: 2000,
    tooltipHideDelay: 10000,
    tooltipShowMode: 'standard',
    clipboardDelimiter: '\t',
    autoSizePadding: 20,
    undoRedoCellEditingLimit: 10,
    keepDetailRowsCount: 10,
    tabIndex: 0,
    rowBuffer: 10,
    paginationPageSize: 100,
    paginationPageSizeSelector: true,
    pivotPanelShow: 'never',
    pivotDefaultExpanded: 0,
    animateRows: true,
    cellFlashDuration: 500,
    cellFadeDuration: 1000,
    domLayout: 'normal',
    groupDisplayType: 'singleColumn',
    groupDefaultExpanded: 0,
    rowGroupPanelShow: 'never',
    rowModelType: 'clientSide',
    asyncTransactionWaitMillis: 50,
    cacheOverflowSize: 1,
    infiniteInitialRowCount: 1,
    serverSideInitialRowCount: 1,
    cacheBlockSize: 100,
    maxBlocksInCache: -1,
    maxConcurrentDatasourceRequests: 2,
    blockLoadDebounceMillis: 0,
    serverSidePivotResultFieldSeparator: '_',
    viewportRowModelPageSize: 5,
    viewportRowModelBufferSize: 5,
    fillHandleDirection: 'xy',
    groupLockGroupColumns: 0,
    pivotMaxGeneratedColumns: -1,
    columnMenu: 'new',
    reactiveCustomComponents: true,
} as const;
/**
 * Used simply to type check the default grid options.
 * Done here to allow inference of the above type, for gridOptionsService.get to infer where defaults exist.
 */
type AllValidGridOptionsKeys =
    Exclude<keyof typeof GRID_OPTION_DEFAULTS, keyof GridOptions> extends never ? true : false;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const allValidKeys: AllValidGridOptionsKeys = true;

// validate each default value is the right type
type AllTypesValid = {
    [K in keyof typeof GRID_OPTION_DEFAULTS]: (typeof GRID_OPTION_DEFAULTS)[K] extends NonNullable<GridOptions[K]>
        ? 'V'
        : 'X';
}[keyof typeof GRID_OPTION_DEFAULTS];
type AllTypeValid = Exclude<AllTypesValid, 'V'> extends never ? 'V' : false;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const allValidValues: AllTypeValid = 'V';

export type GridOptionOrDefault<K extends keyof GridOptions> = K extends keyof typeof GRID_OPTION_DEFAULTS
    ? NonNullable<GridOptions[K]>
    : GridOptions[K];
