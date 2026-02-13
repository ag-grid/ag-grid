import type { ColumnState, IAggFunc } from 'ag-grid-community';

export interface DeferredValueColumnState {
    colId: string;
    aggFunc: string | IAggFunc | null;
}

export interface ColumnToolPanelDeferredState {
    pivotMode: boolean;
    rowGroupColIds: string[];
    pivotColIds: string[];
    valueCols: DeferredValueColumnState[];
    visibleColIds: string[];
}

const EMPTY_STATE: ColumnToolPanelDeferredState = {
    pivotMode: false,
    rowGroupColIds: [],
    pivotColIds: [],
    valueCols: [],
    visibleColIds: [],
};

function cloneState(state: ColumnToolPanelDeferredState): ColumnToolPanelDeferredState {
    return {
        pivotMode: state.pivotMode,
        rowGroupColIds: [...state.rowGroupColIds],
        pivotColIds: [...state.pivotColIds],
        valueCols: state.valueCols.map((valueCol) => ({
            colId: valueCol.colId,
            aggFunc: valueCol.aggFunc,
        })),
        visibleColIds: [...state.visibleColIds],
    };
}

export class ColumnToolPanelDeferredService {
    private appliedState: ColumnToolPanelDeferredState = cloneState(EMPTY_STATE);
    private pendingState: ColumnToolPanelDeferredState = cloneState(EMPTY_STATE);

    public initialiseFromApplied(state: ColumnToolPanelDeferredState): void {
        this.appliedState = cloneState(state);
        this.pendingState = cloneState(state);
    }

    public setPendingState(state: ColumnToolPanelDeferredState): void {
        this.pendingState = cloneState(state);
    }

    public applyPivotColumnStateToPending(stateItems: ColumnState[]): void {
        const pendingState = this.getPendingState();
        for (const state of stateItems) {
            const { colId, pivot, rowGroup, aggFunc } = state;
            if (!colId) {
                continue;
            }
            if (pivot !== undefined) {
                pendingState.pivotColIds = pivot
                    ? addUnique(pendingState.pivotColIds, colId)
                    : pendingState.pivotColIds.filter((id) => id !== colId);
            }
            if (rowGroup !== undefined) {
                pendingState.rowGroupColIds = rowGroup
                    ? addUnique(pendingState.rowGroupColIds, colId)
                    : pendingState.rowGroupColIds.filter((id) => id !== colId);
            }
            if (aggFunc !== undefined) {
                const index = pendingState.valueCols.findIndex((valueCol) => valueCol.colId === colId);
                if (aggFunc === null) {
                    if (index >= 0) {
                        pendingState.valueCols.splice(index, 1);
                    }
                } else if (index >= 0) {
                    pendingState.valueCols[index].aggFunc = aggFunc;
                } else {
                    pendingState.valueCols.push({ colId, aggFunc });
                }
            }
        }
        this.setPendingState(pendingState);
    }

    public applyVisibilityColumnStateToPending(stateItems: ColumnState[]): void {
        const pendingState = this.getPendingState();
        for (const state of stateItems) {
            const { colId, hide } = state;
            if (!colId || hide === undefined) {
                continue;
            }
            pendingState.visibleColIds = hide
                ? pendingState.visibleColIds.filter((id) => id !== colId)
                : addUnique(pendingState.visibleColIds, colId);
        }
        this.setPendingState(pendingState);
    }

    public setPendingRowGroupColumns(colIds: string[]): void {
        const pendingState = this.getPendingState();
        pendingState.rowGroupColIds = [...colIds];
        this.setPendingState(pendingState);
    }

    public setPendingPivotColumns(colIds: string[]): void {
        const pendingState = this.getPendingState();
        pendingState.pivotColIds = [...colIds];
        this.setPendingState(pendingState);
    }

    public setPendingValueColumns(valueCols: DeferredValueColumnState[]): void {
        const pendingState = this.getPendingState();
        pendingState.valueCols = valueCols.map((valueCol) => ({
            colId: valueCol.colId,
            aggFunc: valueCol.aggFunc,
        }));
        this.setPendingState(pendingState);
    }

    public reconcileFromApplied(state: ColumnToolPanelDeferredState): void {
        this.appliedState = cloneState(state);
        this.pendingState = cloneState(state);
    }

    public commitPending(): ColumnToolPanelDeferredState {
        this.appliedState = cloneState(this.pendingState);
        return this.getAppliedState();
    }

    public cancelPending(): ColumnToolPanelDeferredState {
        this.pendingState = cloneState(this.appliedState);
        return this.getPendingState();
    }

    public hasPendingChanges(): boolean {
        return JSON.stringify(this.appliedState) !== JSON.stringify(this.pendingState);
    }

    public getAppliedState(): ColumnToolPanelDeferredState {
        return cloneState(this.appliedState);
    }

    public getPendingState(): ColumnToolPanelDeferredState {
        return cloneState(this.pendingState);
    }
}

function addUnique(ids: string[], colId: string): string[] {
    return ids.includes(colId) ? ids : [...ids, colId];
}
