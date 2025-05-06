import type { Maybe } from '../columns/columnModel';
import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import { _getRowById } from '../entities/positionUtils';
import type { CellPosition } from '../interfaces/iCellPosition';
import type { CellCtrl } from '../rendering/cell/cellCtrl';
import type { RowCtrl } from '../rendering/row/rowCtrl';

export type CellIdPositions = {
    rowId: string;
    columnId: string;
    oldValue?: any;
    newValue?: any;
};

type RowId = string;
type ColId = string;
type CData = any;

export class EditingModelService extends BeanStub implements NamedBean {
    beanName = 'editingModelSvc' as const;

    private pendingUpdates: Map<RowId, Map<ColId, CData>> = new Map();

    public removePendingEdit(rowId: RowId, colId?: ColId | null): void {
        if (!this._hasPending(rowId)) {
            return;
        }

        const rowUpdateMap = this.pendingUpdates.get(rowId)!;

        if (colId) {
            rowUpdateMap.delete(colId);
        } else {
            rowUpdateMap.clear();
        }

        if (rowUpdateMap.size === 0) {
            this.pendingUpdates.delete(rowId);
        }
    }

    public getPendingUpdate(rowId: RowId, columnId: ColId): CData {
        return this.pendingUpdates.get(rowId)?.get(columnId);
    }

    public getPendingUpdates(): Map<RowId, Map<ColId, CData>> {
        return this.pendingUpdates;
    }

    public addPendingEdit(rowId: RowId, columnId: ColId, newValue: CData) {
        if (!this.pendingUpdates.has(rowId)) {
            this.pendingUpdates.set(rowId, new Map());
        }
        this.pendingUpdates.get(rowId)!.set(columnId, newValue);
    }

    public getPendingCellIds(): CellIdPositions[] {
        const ids: { rowId: RowId; columnId: ColId }[] = [];
        this.pendingUpdates.forEach((rowUpdateMap, rowId) => {
            const rowUpdateKeys = Array.from(rowUpdateMap.keys());
            for (const columnId of rowUpdateKeys) {
                ids.push({
                    rowId,
                    columnId,
                });
            }
        });

        return ids;
    }

    public getPendingCellPositions(): CellPosition[] {
        const result: CellPosition[] = [];
        const cellIds = this.getPendingCellIds();
        cellIds.forEach((cell) => {
            const rowNode = _getRowById(this.beans, cell.rowId);
            if (rowNode) {
                result.push({
                    column: this.beans.colModel.getCol(cell.columnId)!,
                    rowIndex: rowNode.rowIndex!,
                    rowPinned: rowNode.rowPinned,
                } as any);
            }
        });

        return result;
    }

    public hasPending(rowCtrl?: RowCtrl | null, cellCtrl?: CellCtrl | null): boolean {
        return this._hasPending(rowCtrl?.rowId, cellCtrl?.column.colId);
    }

    private _hasPending(rowId?: RowId | null, colId?: ColId | null): boolean {
        if (rowId) {
            const rowEdits = this.pendingUpdates.get(rowId);
            if (colId) {
                return rowEdits?.has(colId) ?? false;
            }
            return (rowEdits?.size ?? 0) > 0;
        }
        return this.pendingUpdates.size > 0;
    }

    public startEditing(rowId: RowId, ...colId: Maybe<ColId>[]): void {
        let map = this.pendingUpdates.get(rowId);
        if (!map) {
            map = new Map<ColId, CData>();
        }
        colId.forEach((col) => col && map!.set(col, undefined));
        this.pendingUpdates.set(rowId, map);
    }

    public stopEditing(rowId?: RowId | null, colId?: ColId | null): void {
        if (!this._hasPending(rowId, colId)) {
            return;
        }

        if (rowId) {
            this.removePendingEdit(rowId, colId);
        } else {
            for (const pendingRowEdits of this.pendingUpdates.values()) {
                pendingRowEdits.clear();
            }
            this.clear();
        }
    }

    public clear(): void {
        this.pendingUpdates.clear();
    }

    public override destroy(): void {
        super.destroy();
        this.clear();
    }
}

export type CellUpdate = {
    rowId: string;
    columnId: string;
    newValue: any;
    oldValue: any;
};

export function _createUpdates(beans: BeanCollection): CellUpdate[] {
    const { editingModelSvc } = beans;
    if (!editingModelSvc) {
        return []; // Changed from {} to undefined
    }

    const rowUpdates = editingModelSvc.getPendingUpdates();

    if (rowUpdates.size === 0) {
        return [];
    }

    const updates: CellUpdate[] = [];

    rowUpdates.forEach((rowUpdateMap, rowId) => {
        const rowNode = _getRowById(beans, rowId);
        if (!rowNode) {
            return;
        }
        const original = rowNode.data;
        rowUpdateMap.forEach((newValue, columnId) => {
            updates.push({
                rowId,
                columnId,
                newValue,
                oldValue: original[columnId],
            });
        });
    });

    return updates;
}
