import type { ApiFunction, ApiFunctionName } from '../api/iApiFunction';
import type { BeanCollection } from '../context/context';
import type { RowModelType } from '../interfaces/iRowModel';
import { ModuleNames } from '../modules/moduleNames';
import { ModuleRegistry } from '../modules/moduleRegistry';
import { _warnOnce } from '../utils/function';

const functionModules: { [name in ApiFunctionName]?: ModuleNames } = {
    onGroupExpandedOrCollapsed: ModuleNames.ClientSideRowModelModule,
    refreshClientSideRowModel: ModuleNames.ClientSideRowModelModule,
    forEachLeafNode: ModuleNames.ClientSideRowModelModule,
    forEachNodeAfterFilter: ModuleNames.ClientSideRowModelModule,
    forEachNodeAfterFilterAndSort: ModuleNames.ClientSideRowModelModule,
    resetRowHeights: ModuleNames.ClientSideRowModelModule,
    applyTransaction: ModuleNames.ClientSideRowModelModule,
    applyTransactionAsync: ModuleNames.ClientSideRowModelModule,
    flushAsyncTransactions: ModuleNames.ClientSideRowModelModule,
    getBestCostNodeSelection: ModuleNames.ClientSideRowModelModule,
    getDataAsCsv: ModuleNames.CsvExportModule,
    exportDataAsCsv: ModuleNames.CsvExportModule,
    refreshInfiniteCache: ModuleNames.InfiniteRowModelModule,
    purgeInfiniteCache: ModuleNames.InfiniteRowModelModule,
    getInfiniteRowCount: ModuleNames.InfiniteRowModelModule,
    isLastRowIndexKnown: ModuleNames.InfiniteRowModelModule,
    getAdvancedFilterModel: ModuleNames.AdvancedFilterModule,
    setAdvancedFilterModel: ModuleNames.AdvancedFilterModule,
    showAdvancedFilterBuilder: ModuleNames.AdvancedFilterModule,
    getChartModels: ModuleNames.GridChartsModule,
    getChartRef: ModuleNames.GridChartsModule,
    getChartImageDataURL: ModuleNames.GridChartsModule,
    downloadChart: ModuleNames.GridChartsModule,
    openChartToolPanel: ModuleNames.GridChartsModule,
    closeChartToolPanel: ModuleNames.GridChartsModule,
    createRangeChart: ModuleNames.GridChartsModule,
    createPivotChart: ModuleNames.GridChartsModule,
    createCrossFilterChart: ModuleNames.GridChartsModule,
    updateChart: ModuleNames.GridChartsModule,
    restoreChart: ModuleNames.GridChartsModule,
    copyToClipboard: ModuleNames.ClipboardModule,
    cutToClipboard: ModuleNames.ClipboardModule,
    copySelectedRowsToClipboard: ModuleNames.ClipboardModule,
    copySelectedRangeToClipboard: ModuleNames.ClipboardModule,
    copySelectedRangeDown: ModuleNames.ClipboardModule,
    pasteFromClipboard: ModuleNames.ClipboardModule,
    getDataAsExcel: ModuleNames.ExcelExportModule,
    exportDataAsExcel: ModuleNames.ExcelExportModule,
    getSheetDataForExcel: ModuleNames.ExcelExportModule,
    getMultipleSheetsAsExcel: ModuleNames.ExcelExportModule,
    exportMultipleSheetsAsExcel: ModuleNames.ExcelExportModule,
    addDetailGridInfo: ModuleNames.MasterDetailModule,
    removeDetailGridInfo: ModuleNames.MasterDetailModule,
    getDetailGridInfo: ModuleNames.MasterDetailModule,
    forEachDetailGridInfo: ModuleNames.MasterDetailModule,
    showContextMenu: ModuleNames.MenuModule,
    showColumnChooser: ModuleNames.MenuModule,
    hideColumnChooser: ModuleNames.MenuModule,
    getCellRanges: ModuleNames.RangeSelectionModule,
    addCellRange: ModuleNames.RangeSelectionModule,
    clearRangeSelection: ModuleNames.RangeSelectionModule,
    addAggFunc: ModuleNames.RowGroupingModule,
    addAggFuncs: ModuleNames.RowGroupingModule,
    clearAggFuncs: ModuleNames.RowGroupingModule,
    setColumnAggFunc: ModuleNames.RowGroupingModule,
    isPivotMode: ModuleNames.RowGroupingModule,
    getPivotResultColumn: ModuleNames.RowGroupingModule,
    setValueColumns: ModuleNames.RowGroupingModule,
    getValueColumns: ModuleNames.RowGroupingModule,
    removeValueColumn: ModuleNames.RowGroupingModule,
    removeValueColumns: ModuleNames.RowGroupingModule,
    addValueColumn: ModuleNames.RowGroupingModule,
    addValueColumns: ModuleNames.RowGroupingModule,
    setRowGroupColumns: ModuleNames.RowGroupingModule,
    removeRowGroupColumn: ModuleNames.RowGroupingModule,
    removeRowGroupColumns: ModuleNames.RowGroupingModule,
    addRowGroupColumn: ModuleNames.RowGroupingModule,
    addRowGroupColumns: ModuleNames.RowGroupingModule,
    getRowGroupColumns: ModuleNames.RowGroupingModule,
    moveRowGroupColumn: ModuleNames.RowGroupingModule,
    setPivotColumns: ModuleNames.RowGroupingModule,
    removePivotColumn: ModuleNames.RowGroupingModule,
    removePivotColumns: ModuleNames.RowGroupingModule,
    addPivotColumn: ModuleNames.RowGroupingModule,
    addPivotColumns: ModuleNames.RowGroupingModule,
    getPivotColumns: ModuleNames.RowGroupingModule,
    setPivotResultColumns: ModuleNames.RowGroupingModule,
    getPivotResultColumns: ModuleNames.RowGroupingModule,
    getServerSideSelectionState: ModuleNames.ServerSideRowModelModule,
    setServerSideSelectionState: ModuleNames.ServerSideRowModelModule,
    applyServerSideTransaction: ModuleNames.ServerSideRowModelModule,
    applyServerSideTransactionAsync: ModuleNames.ServerSideRowModelModule,
    applyServerSideRowData: ModuleNames.ServerSideRowModelModule,
    retryServerSideLoads: ModuleNames.ServerSideRowModelModule,
    flushServerSideAsyncTransactions: ModuleNames.ServerSideRowModelModule,
    refreshServerSide: ModuleNames.ServerSideRowModelModule,
    getServerSideGroupLevelState: ModuleNames.ServerSideRowModelModule,
    isSideBarVisible: ModuleNames.SideBarModule,
    setSideBarVisible: ModuleNames.SideBarModule,
    setSideBarPosition: ModuleNames.SideBarModule,
    openToolPanel: ModuleNames.SideBarModule,
    closeToolPanel: ModuleNames.SideBarModule,
    getOpenedToolPanel: ModuleNames.SideBarModule,
    refreshToolPanel: ModuleNames.SideBarModule,
    isToolPanelShowing: ModuleNames.SideBarModule,
    getToolPanelInstance: ModuleNames.SideBarModule,
    getSideBar: ModuleNames.SideBarModule,
    getStatusPanel: ModuleNames.StatusBarModule,
};

const functionRowModels: { [name in ApiFunctionName]?: RowModelType[] } = {
    onGroupExpandedOrCollapsed: ['clientSide'],
    refreshClientSideRowModel: ['clientSide'],
    forEachLeafNode: ['clientSide'],
    forEachNodeAfterFilter: ['clientSide'],
    forEachNodeAfterFilterAndSort: ['clientSide'],
    resetRowHeights: ['clientSide'],
    applyTransaction: ['clientSide'],
    applyTransactionAsync: ['clientSide'],
    flushAsyncTransactions: ['clientSide'],
    getBestCostNodeSelection: ['clientSide'],
    getServerSideSelectionState: ['serverSide'],
    setServerSideSelectionState: ['serverSide'],
    applyServerSideTransaction: ['serverSide'],
    applyServerSideTransactionAsync: ['serverSide'],
    applyServerSideRowData: ['serverSide'],
    retryServerSideLoads: ['serverSide'],
    flushServerSideAsyncTransactions: ['serverSide'],
    refreshServerSide: ['serverSide'],
    getServerSideGroupLevelState: ['serverSide'],
    refreshInfiniteCache: ['infinite'],
    purgeInfiniteCache: ['infinite'],
    getInfiniteRowCount: ['infinite'],
    isLastRowIndexKnown: ['infinite'],
    expandAll: ['clientSide', 'serverSide'],
    collapseAll: ['clientSide', 'serverSide'],
    onRowHeightChanged: ['clientSide', 'serverSide'],
    setRowCount: ['infinite', 'serverSide'],
    getCacheBlockState: ['infinite', 'serverSide'],
};

/** Utility type to support adding params to a grid api method. */
type StartsWithApiFunctionName = `${ApiFunctionName}${string}`;

const deprecatedFunctions: {
    [name in ApiFunctionName]?: {
        version: string;
        old?: StartsWithApiFunctionName;
        new?: StartsWithApiFunctionName;
        message?: string;
    };
} = {
    getValue: {
        version: 'v31.3',
        new: 'getCellValue',
    },
    getFirstDisplayedRow: {
        version: 'v31.1',
        new: 'getFirstDisplayedRowIndex',
    },
    getLastDisplayedRow: {
        version: 'v31.1',
        new: 'getLastDisplayedRowIndex',
    },
    getModel: {
        version: 'v31.1',
        message: 'Please use the appropriate grid API methods instead.',
    },
    setColumnVisible: {
        version: 'v31.1',
        old: 'setColumnVisible(key,visible)',
        new: 'setColumnsVisible([key],visible)',
    },
    setColumnPinned: {
        version: 'v31.1',
        old: 'setColumnPinned(key,pinned)',
        new: 'setColumnsPinned([key],pinned)',
    },
    moveColumn: {
        version: 'v31.1',
        old: 'moveColumn(key, toIndex)',
        new: 'moveColumns([key], toIndex)',
    },
    setColumnWidth: {
        version: 'v31.1',
        old: 'setColumnWidth(col, width)',
        new: 'setColumnWidths([{key: col, newWidth: width}])',
    },
    autoSizeColumn: {
        version: 'v31.1',
        old: 'autoSizeColumn(key, skipHeader)',
        new: 'autoSizeColumns([key], skipHeader)',
    },
    addAggFunc: {
        version: 'v31.1',
        old: 'addAggFunc(key, func)',
        new: 'addAggFuncs({ key: func })',
    },
    removeValueColumn: {
        version: 'v31.1',
        old: 'removeValueColumn(colKey)',
        new: 'removeValueColumns([colKey])',
    },
    addValueColumn: {
        version: 'v31.1',
        old: 'addValueColumn(colKey)',
        new: 'addValueColumns([colKey])',
    },
    removeRowGroupColumn: {
        version: 'v31.1',
        old: 'removeRowGroupColumn(colKey)',
        new: 'removeRowGroupColumns([colKey])',
    },
    addRowGroupColumn: {
        version: 'v31.1',
        old: 'addRowGroupColumn(colKey)',
        new: 'addRowGroupColumns([colKey])',
    },
    removePivotColumn: {
        version: 'v31.1',
        old: 'removePivotColumn(colKey)',
        new: 'removePivotColumns([colKey])',
    },
    addPivotColumn: {
        version: 'v31.1',
        old: 'addPivotColumn(colKey)',
        new: 'addPivotColumns([colKey])',
    },
    showColumnMenuAfterButtonClick: {
        version: 'v31.1',
        message: `Use 'IHeaderParams.showColumnMenu' within a header component, or 'api.showColumnMenu' elsewhere.`,
    },
    showColumnMenuAfterMouseClick: {
        version: 'v31.1',
        message: `Use 'IHeaderParams.showColumnMenuAfterMouseClick' within a header component, or 'api.showColumnMenu' elsewhere.`,
    },
    getFilterInstance: {
        version: 'v31.1',
        message: `'getFilterInstance' is deprecated. To get/set individual filter models, use 'getColumnFilterModel' or 'setColumnFilterModel' instead. To get hold of the filter instance, use 'getColumnFilterInstance' which returns the instance asynchronously.`,
    },
};

export function warnMissingApiFunction(functionName: ApiFunctionName, gridId: string): void {
    const module = functionModules[functionName];

    if (module) {
        ModuleRegistry.__assertRegistered(module, `api.${functionName}`, gridId);
    } else {
        // this shouldn't happen
        _warnOnce(`Unknown API function: '${functionName}'. Have you registered the relevant modules?`);
    }
}

export function validateApiFunction<TFunctionName extends ApiFunctionName>(
    functionName: TFunctionName,
    apiFunction: ApiFunction<TFunctionName>,
    beans: BeanCollection
): ApiFunction<TFunctionName> {
    const deprecation = deprecatedFunctions[functionName];
    if (deprecation) {
        const { version, new: replacement, old, message } = deprecation;
        const apiMethod = old ?? functionName;
        return (...args: any[]) => {
            const replacementMessage = replacement ? `Please use ${replacement} instead. ` : '';
            _warnOnce(`Since ${version} api.${apiMethod} is deprecated. ${replacementMessage}${message ?? ''}`);
            return apiFunction.apply(apiFunction, args);
        };
    }
    const rowModels = functionRowModels[functionName];
    if (rowModels) {
        return (...args: any[]) => {
            const rowModel = beans.rowModel.getType();
            if (!rowModels.includes(rowModel)) {
                console.error(
                    `AG Grid: api.${functionName} can only be called when gridOptions.rowModelType is ${rowModels.join(' or ')}`
                );
                return undefined;
            }
            return apiFunction.apply(apiFunction, args);
        };
    }
    return apiFunction;
}
