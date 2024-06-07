import type { ApiFunction, ApiFunctionName } from '../api/iApiFunction';
import type { BeanCollection } from '../context/context';
import type { RowModelType } from '../interfaces/iRowModel';
import { ModuleNames } from '../modules/moduleNames';
import { ModuleRegistry } from '../modules/moduleRegistry';
import { _warnOnce } from '../utils/function';

// enable minification
const clientSideRowModelModule = ModuleNames.ClientSideRowModelModule;
const csvExportModule = ModuleNames.CsvExportModule;
const infiniteRowModelModule = ModuleNames.InfiniteRowModelModule;
const advancedFilterModule = ModuleNames.AdvancedFilterModule;
const gridChartsModule = ModuleNames.GridChartsModule;
const clipboardModule = ModuleNames.ClipboardModule;
const excelExportModule = ModuleNames.ExcelExportModule;
const masterDetailModule = ModuleNames.MasterDetailModule;
const menuModule = ModuleNames.MenuModule;
const rangeSelectionModule = ModuleNames.RangeSelectionModule;
const rowGroupingModule = ModuleNames.RowGroupingModule;
const serverSideRowModelModule = ModuleNames.ServerSideRowModelModule;
const sideBarModule = ModuleNames.SideBarModule;
const statusBarModule = ModuleNames.StatusBarModule;

const functionModules: { [name in ApiFunctionName]?: ModuleNames } = {
    onGroupExpandedOrCollapsed: clientSideRowModelModule,
    refreshClientSideRowModel: clientSideRowModelModule,
    forEachLeafNode: clientSideRowModelModule,
    forEachNodeAfterFilter: clientSideRowModelModule,
    forEachNodeAfterFilterAndSort: clientSideRowModelModule,
    resetRowHeights: clientSideRowModelModule,
    applyTransaction: clientSideRowModelModule,
    applyTransactionAsync: clientSideRowModelModule,
    flushAsyncTransactions: clientSideRowModelModule,
    getBestCostNodeSelection: clientSideRowModelModule,
    getDataAsCsv: csvExportModule,
    exportDataAsCsv: csvExportModule,
    refreshInfiniteCache: infiniteRowModelModule,
    purgeInfiniteCache: infiniteRowModelModule,
    getInfiniteRowCount: infiniteRowModelModule,
    isLastRowIndexKnown: infiniteRowModelModule,
    getAdvancedFilterModel: advancedFilterModule,
    setAdvancedFilterModel: advancedFilterModule,
    showAdvancedFilterBuilder: advancedFilterModule,
    getChartModels: gridChartsModule,
    getChartRef: gridChartsModule,
    getChartImageDataURL: gridChartsModule,
    downloadChart: gridChartsModule,
    openChartToolPanel: gridChartsModule,
    closeChartToolPanel: gridChartsModule,
    createRangeChart: gridChartsModule,
    createPivotChart: gridChartsModule,
    createCrossFilterChart: gridChartsModule,
    updateChart: gridChartsModule,
    restoreChart: gridChartsModule,
    copyToClipboard: clipboardModule,
    cutToClipboard: clipboardModule,
    copySelectedRowsToClipboard: clipboardModule,
    copySelectedRangeToClipboard: clipboardModule,
    copySelectedRangeDown: clipboardModule,
    pasteFromClipboard: clipboardModule,
    getDataAsExcel: excelExportModule,
    exportDataAsExcel: excelExportModule,
    getSheetDataForExcel: excelExportModule,
    getMultipleSheetsAsExcel: excelExportModule,
    exportMultipleSheetsAsExcel: excelExportModule,
    addDetailGridInfo: masterDetailModule,
    removeDetailGridInfo: masterDetailModule,
    getDetailGridInfo: masterDetailModule,
    forEachDetailGridInfo: masterDetailModule,
    showContextMenu: menuModule,
    showColumnChooser: menuModule,
    hideColumnChooser: menuModule,
    getCellRanges: rangeSelectionModule,
    addCellRange: rangeSelectionModule,
    clearRangeSelection: rangeSelectionModule,
    addAggFunc: rowGroupingModule,
    addAggFuncs: rowGroupingModule,
    clearAggFuncs: rowGroupingModule,
    setColumnAggFunc: rowGroupingModule,
    isPivotMode: rowGroupingModule,
    getPivotResultColumn: rowGroupingModule,
    setValueColumns: rowGroupingModule,
    getValueColumns: rowGroupingModule,
    removeValueColumn: rowGroupingModule,
    removeValueColumns: rowGroupingModule,
    addValueColumn: rowGroupingModule,
    addValueColumns: rowGroupingModule,
    setRowGroupColumns: rowGroupingModule,
    removeRowGroupColumn: rowGroupingModule,
    removeRowGroupColumns: rowGroupingModule,
    addRowGroupColumn: rowGroupingModule,
    addRowGroupColumns: rowGroupingModule,
    getRowGroupColumns: rowGroupingModule,
    moveRowGroupColumn: rowGroupingModule,
    setPivotColumns: rowGroupingModule,
    removePivotColumn: rowGroupingModule,
    removePivotColumns: rowGroupingModule,
    addPivotColumn: rowGroupingModule,
    addPivotColumns: rowGroupingModule,
    getPivotColumns: rowGroupingModule,
    setPivotResultColumns: rowGroupingModule,
    getPivotResultColumns: rowGroupingModule,
    getServerSideSelectionState: serverSideRowModelModule,
    setServerSideSelectionState: serverSideRowModelModule,
    applyServerSideTransaction: serverSideRowModelModule,
    applyServerSideTransactionAsync: serverSideRowModelModule,
    applyServerSideRowData: serverSideRowModelModule,
    retryServerSideLoads: serverSideRowModelModule,
    flushServerSideAsyncTransactions: serverSideRowModelModule,
    refreshServerSide: serverSideRowModelModule,
    getServerSideGroupLevelState: serverSideRowModelModule,
    isSideBarVisible: sideBarModule,
    setSideBarVisible: sideBarModule,
    setSideBarPosition: sideBarModule,
    openToolPanel: sideBarModule,
    closeToolPanel: sideBarModule,
    getOpenedToolPanel: sideBarModule,
    refreshToolPanel: sideBarModule,
    isToolPanelShowing: sideBarModule,
    getToolPanelInstance: sideBarModule,
    getSideBar: sideBarModule,
    getStatusPanel: statusBarModule,
};

const clientSide = 'clientSide';
const serverSide = 'serverSide';
const infinite = 'infinite';

const functionRowModels: { [name in ApiFunctionName]?: RowModelType[] } = {
    onGroupExpandedOrCollapsed: [clientSide],
    refreshClientSideRowModel: [clientSide],
    forEachLeafNode: [clientSide],
    forEachNodeAfterFilter: [clientSide],
    forEachNodeAfterFilterAndSort: [clientSide],
    resetRowHeights: [clientSide],
    applyTransaction: [clientSide],
    applyTransactionAsync: [clientSide],
    flushAsyncTransactions: [clientSide],
    getBestCostNodeSelection: [clientSide],
    getServerSideSelectionState: [serverSide],
    setServerSideSelectionState: [serverSide],
    applyServerSideTransaction: [serverSide],
    applyServerSideTransactionAsync: [serverSide],
    applyServerSideRowData: [serverSide],
    retryServerSideLoads: [serverSide],
    flushServerSideAsyncTransactions: [serverSide],
    refreshServerSide: [serverSide],
    getServerSideGroupLevelState: [serverSide],
    refreshInfiniteCache: [infinite],
    purgeInfiniteCache: [infinite],
    getInfiniteRowCount: [infinite],
    isLastRowIndexKnown: [infinite],
    expandAll: [clientSide, serverSide],
    collapseAll: [clientSide, serverSide],
    onRowHeightChanged: [clientSide, serverSide],
    setRowCount: [infinite, serverSide],
    getCacheBlockState: [infinite, serverSide],
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
