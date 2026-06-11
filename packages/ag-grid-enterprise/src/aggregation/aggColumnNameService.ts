import { _exists } from 'ag-stack';

import type { AgColumn, ColAggFunc, IAggColumnNameService, NamedBean } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';

export class AggColumnNameService extends BeanStub implements NamedBean, IAggColumnNameService {
    beanName = 'aggColNameSvc' as const;

    public getHeaderName(column: AgColumn, headerName: string | null): string | null {
        if (this.gos.get('suppressAggFuncInHeader')) {
            return headerName;
        }

        const { valueColsSvc, colModel, rowGroupColsSvc } = this.beans;

        // only columns with aggregation active can have aggregations
        const pivotValueColumn = column.pivotValueColumn;
        const pivotActiveOnThisColumn = _exists(pivotValueColumn);
        let aggFunc: ColAggFunc = null;
        let aggFuncFound: boolean;

        // otherwise we have a measure that is active, and we are doing aggregation on it
        if (pivotActiveOnThisColumn) {
            const valueColumns = valueColsSvc?.columns ?? [];
            const isCollapsedHeaderEnabled =
                this.gos.get('removePivotHeaderRowWhenSingleValueColumn') && valueColumns.length === 1;
            const isTotalColumn = column.colDef.pivotTotalColumnIds !== undefined;
            if (isCollapsedHeaderEnabled && !isTotalColumn) {
                return headerName; // Skip decorating the header - in this case the label is the pivot key, not the value col
            }
            aggFunc = pivotValueColumn ? pivotValueColumn.getAggFunc() : null;
            aggFuncFound = true;
        } else {
            const measureActive = column.isValueActive();
            const isGrouping = rowGroupColsSvc?.columns.length !== 0;
            const aggregationPresent = colModel.pivotMode || isGrouping || this.gos.get('treeData');

            if (measureActive && aggregationPresent) {
                aggFunc = column.aggFunc;
                aggFuncFound = true;
            } else {
                aggFuncFound = false;
            }
        }

        if (aggFuncFound) {
            const aggFuncString = typeof aggFunc === 'string' ? aggFunc : 'func';
            const localeTextFunc = this.getLocaleTextFunc();
            const aggFuncStringTranslated = localeTextFunc(aggFuncString, aggFuncString);
            return `${aggFuncStringTranslated}(${headerName})`;
        }

        return headerName;
    }
}
