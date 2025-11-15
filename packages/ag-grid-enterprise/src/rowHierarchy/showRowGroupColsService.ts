import { BeanStub } from 'ag-grid-community';
import type { AgColumn, IShowRowGroupColsService, NamedBean } from 'ag-grid-community';

export class ShowRowGroupColsService extends BeanStub implements NamedBean, IShowRowGroupColsService {
    beanName = 'showRowGroupCols' as const;

    public readonly showRowGroupCols: AgColumn[] = [];
    private showRowGroupColsMap: Map<string, AgColumn> | null = null;

    public override destroy(): void {
        super.destroy();
        this.showRowGroupColsMap = null;
        this.showRowGroupCols.length = 0;
    }

    public refresh(): boolean {
        const { colModel, rowGroupColsSvc } = this.beans;

        const newMop = new Map<string, AgColumn>();
        const showRowGroupCols = this.showRowGroupCols;
        let showRowGroupColsCount = 0;

        const cols = colModel.getCols();
        for (let colIdx = 0, colsLen = cols.length; colIdx < colsLen; ++colIdx) {
            const col = cols[colIdx];
            const colDef = col.getColDef();
            const showRowGroup = colDef.showRowGroup;

            if (typeof showRowGroup === 'string') {
                newMop.set(showRowGroup, col);
            } else if (showRowGroup === true) {
                const groupColumns = rowGroupColsSvc?.columns;
                if (groupColumns) {
                    for (let grpColIdx = 0, grpColsLen = groupColumns.length; grpColIdx < grpColsLen; ++grpColIdx) {
                        newMop.set(groupColumns[grpColIdx].getId(), col);
                    }
                }
            } else {
                continue; // skipping this column
            }

            showRowGroupCols[showRowGroupColsCount++] = col; // add to the list
        }
        showRowGroupCols.length = showRowGroupColsCount; // trim array size

        if (!mapsEquals((this.showRowGroupColsMap ??= new Map()), newMop)) {
            this.showRowGroupColsMap = newMop;
            return true;
        }

        return false;
    }

    public getShowRowGroupCol(id: string): AgColumn | undefined {
        return this.showRowGroupColsMap?.get(id);
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

/** Checks if two maps are equal */
const mapsEquals = <K, V>(a: ReadonlyMap<K, V>, b: ReadonlyMap<K, V>): boolean => {
    if (a === b) {
        return true;
    }
    if (a.size !== b.size) {
        return false;
    }
    for (const key of a.keys()) {
        if (b.get(key) !== a.get(key)) {
            return false;
        }
    }
    return true;
};
