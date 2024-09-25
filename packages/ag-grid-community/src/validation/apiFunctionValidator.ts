import type { ApiFunction, ApiFunctionName } from '../api/iApiFunction';
import type { BeanCollection } from '../context/context';
import type { RowModelType } from '../interfaces/iRowModel';
import { _errorOnce, _warnOnce } from '../utils/function';

const clientSide = 'clientSide';
const serverSide = 'serverSide';
const infinite = 'infinite';

const functionRowModels: { [name in ApiFunctionName]?: RowModelType[] } = {
    onGroupExpandedOrCollapsed: [clientSide],
    refreshClientSideRowModel: [clientSide],
    isRowDataEmpty: [clientSide],
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
    isLastRowIndexKnown: [infinite, serverSide],
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
    showLoadingOverlay: {
        version: 'v32',
        message:
            '`showLoadingOverlay` is deprecated. Use the grid option "loading"=true instead or setGridOption("loading", true).',
    },
    clearRangeSelection: {
        version: 'v32.2',
        message: 'Use `clearCellSelection` instead.',
    },
    getInfiniteRowCount: {
        version: 'v32.2',
        old: 'getInfiniteRowCount()',
        new: 'getDisplayedRowCount()',
    },
};

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
                _errorOnce(
                    `api.${functionName} can only be called when gridOptions.rowModelType is ${rowModels.join(' or ')}`
                );
                return undefined as any;
            }
            return apiFunction.apply(apiFunction, args);
        };
    }
    return apiFunction;
}
