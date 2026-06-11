import { _pushToMapArray } from 'ag-stack';

import type { AgColumn, IShowRowGroupColsService, NamedBean, SortDirection } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';

export class ShowRowGroupColsService extends BeanStub implements NamedBean, IShowRowGroupColsService {
    beanName = 'showRowGroupCols' as const;

    public readonly columns: AgColumn[] = [];
    private readonly sourceCols: AgColumn[] = [];
    private readonly colsSet = new Set<AgColumn>();

    public override destroy(): void {
        super.destroy();
        this.columns.length = 0;
        this.colsSet.clear();
        this.clearStamps();
    }

    /** Reset the per-column `showRowGroupCol` back-references set on the previous build. */
    private clearStamps(): void {
        const stamped = this.sourceCols;
        for (let i = 0, len = stamped.length; i < len; ++i) {
            stamped[i].showRowGroupCol = null;
        }
        stamped.length = 0;
    }

    public refresh(): void {
        const { colModel, rowGroupColsSvc } = this.beans;

        const showRowGroupCols = this.columns;
        const showRowGroupColsSet = this.colsSet;
        this.clearStamps(); // empties this.sourceCols before we re-fill it below
        const stamped = this.sourceCols;

        const oldShowRowGroupColsLLen = showRowGroupCols.length;
        let showRowGroupColsCount = 0;
        let showRowGroupColsSetChanged = false;

        const cols = colModel.colsList;
        for (let colIdx = 0, colsLen = cols.length; colIdx < colsLen; ++colIdx) {
            const col = cols[colIdx];
            const colDef = col.colDef;
            const showRowGroup = colDef.showRowGroup;

            if (typeof showRowGroup === 'string') {
                const sourceCol = colModel.getNonPivotColById(showRowGroup);
                if (sourceCol) {
                    sourceCol.showRowGroupCol = col;
                    stamped.push(sourceCol);
                }
            } else if (showRowGroup === true) {
                const groupColumns = rowGroupColsSvc?.columns;
                if (groupColumns) {
                    for (let grpColIdx = 0, grpColsLen = groupColumns.length; grpColIdx < grpColsLen; ++grpColIdx) {
                        const sourceCol = groupColumns[grpColIdx];
                        sourceCol.showRowGroupCol = col;
                        stamped.push(sourceCol);
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

    public getSourceColumnsForGroupColumn(groupCol: AgColumn): AgColumn[] | null {
        const sourceColumnId = groupCol.showRowGroup;
        if (!sourceColumnId) {
            return null;
        }

        const { rowGroupColsSvc, colModel } = this.beans;
        if (sourceColumnId === true) {
            return rowGroupColsSvc ? rowGroupColsSvc.columns : null;
        }

        const column = colModel.getNonPivotCol(sourceColumnId);
        return column ? [column] : null;
    }

    public isRowGroupDisplayed(column: AgColumn, colId: string | null): boolean {
        const showRowGroup = column.showRowGroup;
        return showRowGroup === true || (showRowGroup != null && showRowGroup === colId);
    }

    public interleaveSortedColumns(sorted: AgColumn[]): AgColumn[] {
        const rowGroupCols = this.beans.rowGroupColsSvc?.columns;
        if (!rowGroupCols) {
            return sorted;
        }
        const sourcesByGroup = new Map<AgColumn, AgColumn[]>();
        for (let i = 0, len = rowGroupCols.length; i < len; ++i) {
            const src = rowGroupCols[i];
            const groupCol = src.sortDef.direction ? src.showRowGroupCol : null;
            if (groupCol) {
                _pushToMapArray(sourcesByGroup, groupCol, src);
            }
        }
        if (sourcesByGroup.size === 0) {
            return sorted;
        }
        const seen = new Set<AgColumn>();
        const result: AgColumn[] = [];
        for (let i = 0, len = sorted.length; i < len; ++i) {
            const col = sorted[i];
            const groupCol = col.showRowGroupCol ?? col;
            if (seen.has(groupCol)) {
                continue;
            }
            seen.add(groupCol);
            result.push(groupCol);
            const sources = sourcesByGroup.get(groupCol);
            for (let j = 0, sLen = sources?.length ?? 0; j < sLen; ++j) {
                result.push(sources![j]);
            }
        }
        return result;
    }

    public fillCoupledSortIndexMap(sortedCols: AgColumn[], map: Map<AgColumn, number>): number {
        let idx = -1;
        for (let i = 0, len = sortedCols.length; i < len; ++i) {
            const col = sortedCols[i];
            const reflected = col.showRowGroupCol;
            map.set(col, reflected && reflected !== col ? idx : ++idx);
        }
        return idx;
    }

    public isGroupSortMixed(column: AgColumn, direction: SortDirection): boolean {
        const sourceColumns = this.getSourceColumnsForGroupColumn(column);
        if (!sourceColumns) {
            return true;
        }
        for (let i = 0, len = sourceColumns.length; i < len; ++i) {
            // Direct `sortDef.direction` read — `getSortDef()` only adds a null-wrap we don't need here.
            if (direction !== sourceColumns[i].sortDef.direction) {
                return true;
            }
        }
        return false;
    }
}
