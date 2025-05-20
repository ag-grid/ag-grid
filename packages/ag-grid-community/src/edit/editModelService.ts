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

type CData = {
    newValue: any;
    oldValue: any;
};

export type PendingUpdates = Map<IRowNode, Map<Column, CData | undefined>>;

export class EditModelService extends BeanStub implements NamedBean {
    beanName = 'editModelSvc' as const;

    private pendingUpdates: PendingUpdates = new Map();

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

    public getPendingUpdate(rowNode: IRowNode, column: Column): CData | undefined {
        return this.pendingUpdates.get(rowNode)?.get(column);
    }

    public getPendingUpdates(): PendingUpdates {
        const copy = new Map<IRowNode, Map<Column, CData | undefined>>();
        this.pendingUpdates.forEach((rowUpdateMap, rowNode) => {
            copy.set(rowNode, new Map<Column, CData | undefined>(rowUpdateMap));
        });
        return copy;
    }

    public setPendingValue(rowNode: IRowNode, column: Column, newValue: any, oldValue: any): void {
        if (!this.pendingUpdates.has(rowNode)) {
            this.pendingUpdates.set(rowNode, new Map());
        }
        this.pendingUpdates.get(rowNode)!.set(column, { newValue, oldValue });
    }

    public getPendingCellIds(): CellIdPositions[] {
        const ids: CellIdPositions[] = [];
        this.pendingUpdates.forEach((rowUpdateMap, rowNode) => {
            for (const column of rowUpdateMap.keys()) {
                ids.push({
                    rowNode,
                    column,
                    ...rowUpdateMap.get(column),
                });
            }
        });

        return ids;
    }

    public getPendingCellPositions(): CellPosition[] {
        const result: CellPosition[] = [];
        const cellIds = this.getPendingCellIds();
        cellIds.forEach(({ column, rowNode: { rowIndex, rowPinned }, newValue, oldValue }) => {
            result.push({
                column,
                rowIndex,
                rowPinned,
                // TODO: update API docs and types
                newValue,
                oldValue,
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
        const map = this.pendingUpdates.get(rowNode) ?? new Map<Column, CData | undefined>();
        columns.forEach((col) => col && !map.has(col) && map!.set(col, undefined));
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
        return [];
    }

    const rowUpdates = editModelSvc.getPendingUpdates();

    if (rowUpdates.size === 0) {
        return [];
    }

    const updates: CellUpdate[] = [];
    rowUpdates.forEach((rowUpdateMap, rowNode) => {
        rowUpdateMap.forEach((entry, column) => {
            const { newValue, oldValue } = entry || {};
            updates.push({
                rowNode,
                column,
                newValue,
                oldValue,
            });
        });
    });

    return updates;
}
