import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { CellPosition } from '../interfaces/iCellPosition';
import type { Column } from '../interfaces/iColumn';
import type { IRowNode } from '../interfaces/iRowNode';
import { _valuesDiffer } from './utils/editors';

export type CellIdPositions = {
    rowNode: IRowNode;
    column: Column;
    oldValue?: any;
    newValue?: any;
};

type EditedCellState = 'editing' | 'changed';

export type EditedCell = {
    newValue: any;
    oldValue: any;
    state: EditedCellState;
};

export type PendingUpdates = Map<IRowNode, Map<Column, EditedCell>>;

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

    public getPendingUpdate(rowNode: IRowNode, column: Column): EditedCell | undefined {
        return this.pendingUpdates.get(rowNode)?.get(column);
    }

    public getPendingUpdates(): PendingUpdates {
        const copy = new Map<IRowNode, Map<Column, EditedCell>>();
        this.pendingUpdates.forEach((rowUpdateMap, rowNode) => {
            copy.set(rowNode, new Map<Column, EditedCell>(rowUpdateMap));
        });
        return copy;
    }

    public setPendingUpdates(pendingPositions: PendingUpdates): void {
        this.pendingUpdates.clear();
        pendingPositions.forEach((rowUpdateMap, rowNode) => {
            const newRowUpdateMap = new Map<Column, EditedCell>();
            rowUpdateMap.forEach((cellData, column) => {
                newRowUpdateMap.set(column, { ...cellData });
            });
            this.pendingUpdates.set(rowNode, newRowUpdateMap);
        });
    }

    public setPendingValue(
        rowNode: IRowNode,
        column: Column,
        newValue: any,
        oldValue: any,
        state: EditedCellState
    ): void {
        if (!this.pendingUpdates.has(rowNode)) {
            this.pendingUpdates.set(rowNode, new Map());
        }
        this.pendingUpdates.get(rowNode)!.set(column, { newValue, oldValue, state });
    }

    public setState(rowNode: IRowNode, column: Column, state: EditedCellState): void {
        const rowUpdateMap = this.pendingUpdates.get(rowNode) ?? new Map();

        if (!this.pendingUpdates.has(rowNode)) {
            this.pendingUpdates.set(rowNode, rowUpdateMap);
        }

        const cellData = rowUpdateMap.get(column);
        if (cellData) {
            cellData.state = state;
        } else {
            rowUpdateMap.set(column, { newValue: undefined, oldValue: undefined, state });
        }
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
            if (!newValue || !_valuesDiffer({ newValue, oldValue })) {
                return;
            }
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

    public startEditing(rowNode: IRowNode, column?: Column): boolean {
        const map = this.pendingUpdates.get(rowNode) ?? new Map<Column, EditedCell>();
        let updated = false;
        if (column && !map.has(column)) {
            map.set(column, { newValue: undefined, oldValue: rowNode.data[column.getColId()], state: 'editing' });
            updated = true;
        }
        this.pendingUpdates.set(rowNode, map);
        return updated;
    }

    public stopEditing(rowNode?: IRowNode | null, column?: Column | null): boolean {
        if (!this.hasPending(rowNode, column)) {
            return false;
        }

        if (rowNode) {
            this.removePendingEdit(rowNode, column);
        } else {
            this.clear();
        }
        return true;
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

export function _createUpdates({ editModelSvc }: BeanCollection): CellIdPositions[] {
    if (!editModelSvc) {
        return [];
    }

    const rowUpdates = editModelSvc.getPendingUpdates();

    if (rowUpdates.size === 0) {
        return [];
    }

    const updates: CellIdPositions[] = [];
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
