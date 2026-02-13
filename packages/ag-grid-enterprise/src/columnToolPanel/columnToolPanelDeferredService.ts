import type { IAggFunc } from 'ag-grid-community';

export interface DeferredValueColumnState {
    colId: string;
    aggFunc: string | IAggFunc | null;
}

export interface ColumnToolPanelDeferredState {
    pivotMode: boolean;
    rowGroupColIds: string[];
    pivotColIds: string[];
    valueCols: DeferredValueColumnState[];
}

const EMPTY_STATE: ColumnToolPanelDeferredState = {
    pivotMode: false,
    rowGroupColIds: [],
    pivotColIds: [],
    valueCols: [],
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
