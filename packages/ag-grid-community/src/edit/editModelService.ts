import type { Maybe } from '../columns/columnModel';
import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { CellPosition } from '../interfaces/iCellPosition';
import type { Column } from '../interfaces/iColumn';
import type { IRowNode } from '../interfaces/iRowNode';

export type CellIdPositions = {
    rowNode: IRowNode;
    column: Column;
    oldValue?: any;
    newValue?: any;
};

type CData = any;

export class EditModelService extends BeanStub implements NamedBean {
    beanName = 'editModelSvc' as const;

    private pendingUpdates: Map<IRowNode, Map<Column, CData>> = new Map();

    public removePendingEdit(rowNode: IRowNode, column?: Column | null): void {
        if (!this.hasPending(rowNode)) {
            return;
        }

        const rowUpdateMap = this.pendingUpdates.get(rowNode)!;

        if (column) {
            rowUpdateMap.delete(column);
        } else {
            rowUpdateMap.clear();
        }

        if (rowUpdateMap.size === 0) {
            this.pendingUpdates.delete(rowNode);
        }
    }

    public getPendingUpdate(rowNode: IRowNode, column: Column): CData {
        return this.pendingUpdates.get(rowNode)?.get(column);
    }

    public getPendingUpdates(): Map<IRowNode, Map<Column, CData>> {
        return this.pendingUpdates;
    }

    public addPendingEdit(rowNode: IRowNode, column: Column, newValue: CData) {
        if (!this.pendingUpdates.has(rowNode)) {
            this.pendingUpdates.set(rowNode, new Map());
        }
        this.pendingUpdates.get(rowNode)!.set(column, newValue);
    }

    public getPendingCellIds(): CellIdPositions[] {
        const ids: CellIdPositions[] = [];
        this.pendingUpdates.forEach((rowUpdateMap, rowNode) => {
            const rowUpdateKeys = Array.from(rowUpdateMap.keys());
            for (const column of rowUpdateKeys) {
                ids.push({
                    rowNode,
                    column,
                });
            }
        });

        return ids;
    }

    public getPendingCellPositions(): CellPosition[] {
        const result: CellPosition[] = [];
        const cellIds = this.getPendingCellIds();
        cellIds.forEach(({ column, rowNode: { rowIndex, rowPinned } }) => {
            result.push({
                column,
                rowIndex,
                rowPinned,
            } as any);
        });

        return result;
    }

    public hasPending(rowNode?: IRowNode | null, column?: Column | null): boolean {
        if (rowNode) {
            const rowEdits = this.pendingUpdates.get(rowNode);
            if (column) {
                return rowEdits?.has(column) ?? false;
            }
            return (rowEdits?.size ?? 0) > 0;
        }
        return this.pendingUpdates.size > 0;
    }

    public startEditing(rowNode: IRowNode, ...columns: Maybe<Column>[]): void {
        const map = this.pendingUpdates.get(rowNode) ?? new Map<Column, CData>();
        columns.forEach((col) => col && map!.set(col, undefined));
        this.pendingUpdates.set(rowNode, map);
    }

    public stopEditing(rowNode?: IRowNode | null, column?: Column | null): void {
        if (!this.hasPending(rowNode, column)) {
            return;
        }

        if (rowNode) {
            this.removePendingEdit(rowNode, column);
        } else {
            this.clear();
        }
    }

    public clear(): void {
        for (const pendingRowEdits of this.pendingUpdates.values()) {
            pendingRowEdits.clear();
        }
        this.pendingUpdates.clear();
    }

    public override destroy(): void {
        super.destroy();
        this.clear();
    }
}

export type CellUpdate = {
    rowNode: IRowNode;
    column: Column;
    newValue: any;
    oldValue: any;
};

export function _createUpdates({ editModelSvc }: BeanCollection): CellUpdate[] {
    if (!editModelSvc) {
        return []; // Changed from {} to undefined
    }

    const rowUpdates = editModelSvc.getPendingUpdates();

    if (rowUpdates.size === 0) {
        return [];
    }

    const updates: CellUpdate[] = [];
    rowUpdates.forEach((rowUpdateMap, rowNode) => {
        rowUpdateMap.forEach((newValue, column) => {
            updates.push({
                rowNode,
                column,
                newValue,
                oldValue: rowNode.data[column.getColId()],
            });
        });
    });

    return updates;
}
