import { BeanStub } from 'ag-grid-community';
import type { AgColumn, IShowRowGroupColsService, NamedBean } from 'ag-grid-community';

export class ShowRowGroupColsService extends BeanStub implements NamedBean, IShowRowGroupColsService {
    beanName = 'showRowGroupCols' as const;

    public readonly columns: AgColumn[] = [];
    private readonly colsSet = new Set<AgColumn>();
    private readonly colsMap = new Map<string, AgColumn>();

    public override destroy(): void {
        super.destroy();
        this.columns.length = 0;
        this.colsSet.clear();
        this.colsMap.clear();
    }

    public refresh(): void {
        const { colModel, rowGroupColsSvc } = this.beans;

        const showRowGroupCols = this.columns;

        const showRowGroupColsSet = this.colsSet;
        const showRowGroupColsMap = this.colsMap;
        showRowGroupColsMap.clear();

        const oldShowRowGroupColsLLen = showRowGroupCols.length;
        let showRowGroupColsCount = 0;
        let showRowGroupColsSetChanged = false;

        const cols = colModel.getCols();
        for (let colIdx = 0, colsLen = cols.length; colIdx < colsLen; ++colIdx) {
            const col = cols[colIdx];
            const colDef = col.getColDef();
            const showRowGroup = colDef.showRowGroup;

            if (typeof showRowGroup === 'string') {
                showRowGroupColsMap.set(showRowGroup, col);
            } else if (showRowGroup === true) {
                const groupColumns = rowGroupColsSvc?.columns;
                if (groupColumns) {
                    for (let grpColIdx = 0, grpColsLen = groupColumns.length; grpColIdx < grpColsLen; ++grpColIdx) {
                        showRowGroupColsMap.set(groupColumns[grpColIdx].getId(), col);
                    }
                }
            } else {
                continue; // skipping this column
            }

            showRowGroupColsSetChanged ||=
                showRowGroupColsCount >= oldShowRowGroupColsLLen || !showRowGroupColsSet.has(col);
            showRowGroupCols[showRowGroupColsCount++] = col;
        }

        showRowGroupColsSetChanged ||= showRowGroupColsCount !== oldShowRowGroupColsLLen;
        if (showRowGroupColsSetChanged) {
            showRowGroupCols.length = showRowGroupColsCount; // trim array size
            showRowGroupColsSet.clear();
            for (let j = 0; j < showRowGroupColsCount; ++j) {
                showRowGroupColsSet.add(showRowGroupCols[j]);
            }
            this.eventSvc.dispatchEvent({ type: 'showRowGroupColsSetChanged' });
        }
    }

    public getShowRowGroupCol(id: string): AgColumn | undefined {
        return this.colsMap.get(id);
    }

    public getSourceColumnsForGroupColumn(groupCol: AgColumn): AgColumn[] | null {
        const sourceColumnId = groupCol.getColDef().showRowGroup;
        if (!sourceColumnId) {
            return null;
        }

        const { rowGroupColsSvc, colModel } = this.beans;
        if (sourceColumnId === true && rowGroupColsSvc) {
            return rowGroupColsSvc.columns;
        }

        const column = colModel.getColDefCol(sourceColumnId as string);
        return column ? [column] : null;
    }

    public isRowGroupDisplayed(column: AgColumn, colId: string | null): boolean {
        const showRowGroup = column.getColDef()?.showRowGroup;
        return showRowGroup === true || (showRowGroup != null && showRowGroup === colId);
    }
}
