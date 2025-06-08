import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { AgColumn } from '../entities/agColumn';
import type { EditingCellPosition } from '../interfaces/iCellEditor';
import type { Column } from '../interfaces/iColumn';
import type { IRowNode } from '../interfaces/iRowNode';
import { _getSiblingRows } from './utils/controllers';
import { UNEDITED } from './utils/editors';

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

export type PendingUpdateRow = Map<Column, EditedCell>;
export type PendingUpdates = Map<IRowNode, PendingUpdateRow>;

export class EditModelService extends BeanStub implements NamedBean {
    beanName = 'editModelSvc' as const;

    private pendingUpdates: PendingUpdates = new Map();

    public removePendingEdit(rowNode: IRowNode, column?: Column | null): void {
        if (!this.hasPending(rowNode)) {
            return;
        }

        const rowUpdateMap = this.getPendingUpdateRow(rowNode)!;

        if (column) {
            rowUpdateMap.delete(column);
        } else {
            rowUpdateMap.clear();
        }

        if (rowUpdateMap.size === 0) {
            this.pendingUpdates.delete(rowNode);
        }
    }

    public getPendingUpdateRow(rowNode: IRowNode): PendingUpdateRow | undefined {
        return this.pendingUpdates.get(rowNode);
    }

    public getPendingUpdate(rowNode: IRowNode, column: Column): EditedCell | undefined {
        return this.getPendingUpdateRow(rowNode)?.get(column);
    }

    getPendingSiblingRow(rowNode: IRowNode): IRowNode | undefined {
        return _getSiblingRows(this.beans, rowNode).find((node) => this.pendingUpdates.has(node));
    }

    public getPendingUpdates(copy = true): PendingUpdates {
        if (!copy) {
            return this.pendingUpdates;
        }

        const map = new Map<IRowNode, Map<Column, EditedCell>>();
        this.pendingUpdates.forEach((rowUpdateMap, rowNode) => {
            map.set(rowNode, new Map<Column, EditedCell>(rowUpdateMap));
        });
        return map;
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
        this.getPendingUpdateRow(rowNode)!.set(column, { newValue, oldValue, state });
    }

    public clearPendingValue(rowNode?: IRowNode, column?: Column): void {
        if (rowNode) {
            if (column) {
                const existing = this.getPendingUpdate(rowNode, column);
                if (existing) {
                    existing.newValue = existing.oldValue;
                    existing.state = 'changed';
                }
            } else {
                const rowUpdateMap = this.getPendingUpdateRow(rowNode);
                if (rowUpdateMap) {
                    rowUpdateMap.forEach((cellData) => {
                        cellData.newValue = cellData.oldValue;
                        cellData.state = 'changed';
                    });
                }
            }
        }
    }

    public setState(rowNode: IRowNode, column: Column, state: EditedCellState): void {
        const rowUpdateMap = this.getPendingUpdateRow(rowNode) ?? new Map();

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

    public getState(rowNode: IRowNode, column: Column): EditedCellState | undefined {
        return this.getPendingUpdate(rowNode, column)?.state;
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

    public getPendingCellPositions(): EditingCellPosition[] {
        const result: EditingCellPosition[] = [];
        const cellIds = this.getPendingCellIds();
        cellIds.forEach(({ column, colKey, rowNode: { rowIndex, rowPinned }, state }: any) => {
            if (state === 'editing') {
                result.push({
                    column,
                    colKey,
                    rowIndex: rowIndex!,
                    rowPinned,
                });
            }
        });

        return result;
    }

    public hasPending(
        rowNode?: IRowNode | null,
        column?: Column | null,
        checkSiblings: boolean = false,
        includeParents: boolean = false,
        withOpenEditors: boolean = false
    ): boolean {
        if (rowNode) {
            const rowEdits = this.getPendingUpdateRow(rowNode);
            if (!rowEdits) {
                return false;
            } else if (column) {
                if (withOpenEditors) {
                    const cellData = this.getPendingUpdate(rowNode, column);
                    return cellData ? cellData.state === 'editing' : false;
                }
                return rowEdits.has(column) ?? false;
            } else if (rowEdits.size !== 0) {
                if (withOpenEditors) {
                    return Array.from(rowEdits.values()).some(({ state }) => state === 'editing');
                }
                return true;
            }

            return (
                checkSiblings &&
                !!_getSiblingRows(this.beans, rowNode, false, includeParents).find((sibling) =>
                    this.hasPending(sibling, column, false, includeParents)
                )
            );
        }
        if (withOpenEditors) {
            return this.getPendingCellIds().some(({ state }: any) => state === 'editing');
        }
        return this.pendingUpdates.size > 0;
    }

    public startEditing(rowNode: IRowNode, column?: Column): boolean {
        const map = this.getPendingUpdateRow(rowNode) ?? new Map<Column, EditedCell>();
        let updated = false;
        if (column && !map.has(column)) {
            const oldValue = this.beans.valueSvc.getValue(column as AgColumn, rowNode, true, 'api');
            map.set(column, { newValue: UNEDITED, oldValue, state: 'editing' });
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
