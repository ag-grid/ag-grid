import type { ColumnState, IAggFunc } from 'ag-grid-community';

interface DeferredValueColumnState {
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

interface PendingPatch {
    pivotMode?: boolean;

    rowGroupColIds?: string[];
    rowGroupTouchedColIds?: string[];

    pivotColIds?: string[];
    pivotTouchedColIds?: string[];

    valueColOrder?: string[];
    valueTouchedColIds?: string[];
    valueAggOverrides?: { [colId: string]: string | IAggFunc | null };

    visibilityOverrides?: { [colId: string]: boolean };
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
    private patch: PendingPatch = {};

    public initialiseFromApplied(state: ColumnToolPanelDeferredState): void {
        this.appliedState = cloneState(state);
        this.patch = {};
    }

    public setPendingState(state: ColumnToolPanelDeferredState): void {
        this.patch = buildPatch(this.appliedState, state);
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
        this.patch = {};
    }

    public reconcileFromAppliedPreservingPending(state: ColumnToolPanelDeferredState): void {
        if (!this.hasPendingChanges()) {
            this.appliedState = cloneState(state);
            this.patch = {};
            return;
        }

        const existingPatch = this.patch;
        this.appliedState = cloneState(state);
        const rebasedPendingState = applyPatchToState(this.appliedState, existingPatch, true);
        const nextPatch = buildPatch(this.appliedState, rebasedPendingState);

        // Preserve original touched metadata across rebases so untouched IDs don't become touched
        // just because external updates changed relative ordering.
        if (nextPatch.rowGroupColIds && existingPatch.rowGroupTouchedColIds) {
            nextPatch.rowGroupTouchedColIds = [...existingPatch.rowGroupTouchedColIds];
        }
        if (nextPatch.pivotColIds && existingPatch.pivotTouchedColIds) {
            nextPatch.pivotTouchedColIds = [...existingPatch.pivotTouchedColIds];
        }
        if (nextPatch.valueColOrder && existingPatch.valueTouchedColIds) {
            nextPatch.valueTouchedColIds = [...existingPatch.valueTouchedColIds];
        }

        this.patch = nextPatch;
    }

    public commitPending(): ColumnToolPanelDeferredState {
        const pendingState = this.getPendingState();
        this.appliedState = cloneState(pendingState);
        this.patch = {};
        return this.getAppliedState();
    }

    public cancelPending(): ColumnToolPanelDeferredState {
        this.patch = {};
        return this.getPendingState();
    }

    public hasPendingChanges(): boolean {
        return hasPatchChanges(this.patch);
    }

    public getAppliedState(): ColumnToolPanelDeferredState {
        return cloneState(this.appliedState);
    }

    public getPendingState(): ColumnToolPanelDeferredState {
        return applyPatchToState(this.appliedState, this.patch, false);
    }
}

function addUnique(ids: string[], colId: string): string[] {
    return ids.includes(colId) ? ids : [...ids, colId];
}

function hasPatchChanges(patch: PendingPatch): boolean {
    return (
        patch.pivotMode !== undefined ||
        patch.rowGroupColIds !== undefined ||
        patch.pivotColIds !== undefined ||
        patch.valueColOrder !== undefined ||
        hasRecordEntries(patch.valueAggOverrides) ||
        hasRecordEntries(patch.visibilityOverrides)
    );
}

function hasRecordEntries(record: { [key: string]: unknown } | undefined): boolean {
    return !!record && Object.keys(record).length > 0;
}

function buildPatch(applied: ColumnToolPanelDeferredState, pending: ColumnToolPanelDeferredState): PendingPatch {
    const patch: PendingPatch = {};

    if (pending.pivotMode !== applied.pivotMode) {
        patch.pivotMode = pending.pivotMode;
    }

    if (!areStringArraysEqual(pending.rowGroupColIds, applied.rowGroupColIds)) {
        patch.rowGroupColIds = [...pending.rowGroupColIds];
        patch.rowGroupTouchedColIds = [
            ...getTouchedOrderedAndMembershipIds(applied.rowGroupColIds, pending.rowGroupColIds),
        ];
    }

    if (!areStringArraysEqual(pending.pivotColIds, applied.pivotColIds)) {
        patch.pivotColIds = [...pending.pivotColIds];
        patch.pivotTouchedColIds = [...getTouchedOrderedAndMembershipIds(applied.pivotColIds, pending.pivotColIds)];
    }

    const appliedValueIds = applied.valueCols.map((valueCol) => valueCol.colId);
    const pendingValueIds = pending.valueCols.map((valueCol) => valueCol.colId);
    if (!areStringArraysEqual(appliedValueIds, pendingValueIds)) {
        patch.valueColOrder = [...pendingValueIds];
        patch.valueTouchedColIds = [...getTouchedOrderedAndMembershipIds(appliedValueIds, pendingValueIds)];
    }

    const valueAggOverrides = buildValueAggOverrides(applied.valueCols, pending.valueCols);
    if (hasRecordEntries(valueAggOverrides)) {
        patch.valueAggOverrides = valueAggOverrides;
    }

    const visibilityOverrides = buildVisibilityOverrides(applied.visibleColIds, pending.visibleColIds);
    if (hasRecordEntries(visibilityOverrides)) {
        patch.visibilityOverrides = visibilityOverrides;
    }

    return patch;
}

function buildVisibilityOverrides(
    appliedVisibleColIds: string[],
    pendingVisibleColIds: string[]
): {
    [colId: string]: boolean;
} {
    const overrides: { [colId: string]: boolean } = {};
    const appliedVisibleSet = new Set(appliedVisibleColIds);
    const pendingVisibleSet = new Set(pendingVisibleColIds);
    const allIds = new Set([...appliedVisibleSet, ...pendingVisibleSet]);

    for (const colId of allIds) {
        const appliedVisible = appliedVisibleSet.has(colId);
        const pendingVisible = pendingVisibleSet.has(colId);
        if (appliedVisible !== pendingVisible) {
            overrides[colId] = pendingVisible;
        }
    }

    return overrides;
}

function buildValueAggOverrides(
    appliedValueCols: DeferredValueColumnState[],
    pendingValueCols: DeferredValueColumnState[]
): { [colId: string]: string | IAggFunc | null } {
    const overrides: { [colId: string]: string | IAggFunc | null } = {};
    const appliedAggs = getValueAggMap(appliedValueCols);
    const pendingAggs = getValueAggMap(pendingValueCols);
    const allIds = new Set([...appliedAggs.keys(), ...pendingAggs.keys()]);

    for (const colId of allIds) {
        const appliedAgg = appliedAggs.get(colId) ?? null;
        const pendingAgg = pendingAggs.get(colId) ?? null;
        if (appliedAgg !== pendingAgg) {
            overrides[colId] = pendingAgg;
        }
    }

    return overrides;
}

function applyPatchToState(
    appliedState: ColumnToolPanelDeferredState,
    patch: PendingPatch,
    preserveUntouchedOrderOnRebase: boolean
): ColumnToolPanelDeferredState {
    const pendingState = cloneState(appliedState);

    if (patch.pivotMode !== undefined) {
        pendingState.pivotMode = patch.pivotMode;
    }

    if (patch.rowGroupColIds) {
        pendingState.rowGroupColIds = preserveUntouchedOrderOnRebase
            ? mergeOrderedIdsWithTouched(
                  appliedState.rowGroupColIds,
                  patch.rowGroupColIds,
                  new Set(patch.rowGroupTouchedColIds ?? patch.rowGroupColIds)
              )
            : [...patch.rowGroupColIds];
    }

    if (patch.pivotColIds) {
        pendingState.pivotColIds = preserveUntouchedOrderOnRebase
            ? mergeOrderedIdsWithTouched(
                  appliedState.pivotColIds,
                  patch.pivotColIds,
                  new Set(patch.pivotTouchedColIds ?? patch.pivotColIds)
              )
            : [...patch.pivotColIds];
    }

    if (patch.valueColOrder || patch.valueAggOverrides) {
        pendingState.valueCols = buildPatchedValueCols(appliedState.valueCols, patch, preserveUntouchedOrderOnRebase);
    }

    if (patch.visibilityOverrides) {
        const visibleSet = new Set(appliedState.visibleColIds);
        for (const [colId, visible] of Object.entries(patch.visibilityOverrides)) {
            if (visible) {
                visibleSet.add(colId);
            } else {
                visibleSet.delete(colId);
            }
        }
        pendingState.visibleColIds = [...visibleSet];
    }

    return pendingState;
}

function buildPatchedValueCols(
    appliedValueCols: DeferredValueColumnState[],
    patch: PendingPatch,
    preserveUntouchedOrderOnRebase: boolean
): DeferredValueColumnState[] {
    const appliedAggMap = getValueAggMap(appliedValueCols);
    const aggOverrides = patch.valueAggOverrides ?? {};
    const hasOverride = (colId: string) => Object.prototype.hasOwnProperty.call(aggOverrides, colId);

    const appliedOrder = appliedValueCols.map((valueCol) => valueCol.colId);
    let order = patch.valueColOrder ? [...patch.valueColOrder] : [...appliedOrder];

    if (patch.valueColOrder && preserveUntouchedOrderOnRebase) {
        order = mergeOrderedIdsWithTouched(
            appliedOrder,
            patch.valueColOrder,
            new Set(patch.valueTouchedColIds ?? patch.valueColOrder)
        );
    }

    // A staged agg func for a non-value column should stage adding it as a value column.
    for (const [colId, aggFunc] of Object.entries(aggOverrides)) {
        if (aggFunc !== null && !order.includes(colId)) {
            order.push(colId);
        }
    }

    const result: DeferredValueColumnState[] = [];
    for (const colId of order) {
        const aggFunc = hasOverride(colId) ? aggOverrides[colId] : appliedAggMap.get(colId) ?? null;
        if (aggFunc === null) {
            continue;
        }
        result.push({ colId, aggFunc });
    }

    return result;
}

function getValueAggMap(valueCols: DeferredValueColumnState[]): Map<string, string | IAggFunc | null> {
    return new Map(valueCols.map((valueCol) => [valueCol.colId, valueCol.aggFunc] as const));
}

function getTouchedOrderedAndMembershipIds(applied: string[], pending: string[]): string[] {
    const touched = new Set<string>();

    const appliedSet = new Set(applied);
    const pendingSet = new Set(pending);
    const allIds = new Set([...appliedSet, ...pendingSet]);

    for (const colId of allIds) {
        if (appliedSet.has(colId) !== pendingSet.has(colId)) {
            touched.add(colId);
        }
    }

    const movedCommonIds = getMovedCommonIds(applied, pending);
    for (const colId of movedCommonIds) {
        touched.add(colId);
    }

    return [...touched];
}

function getMovedCommonIds(applied: string[], pending: string[]): string[] {
    const appliedIndex = new Map(applied.map((id, index) => [id, index] as const));
    const commonPendingIds = pending.filter((id) => appliedIndex.has(id));

    if (commonPendingIds.length <= 1) {
        return [];
    }

    const indexSequence = commonPendingIds.map((id) => appliedIndex.get(id)!);
    const lisIndices = getLisIndices(indexSequence);
    const untouchedCommonIds = new Set(lisIndices.map((i) => commonPendingIds[i]));

    return commonPendingIds.filter((id) => !untouchedCommonIds.has(id));
}

function getLisIndices(values: number[]): number[] {
    const n = values.length;
    if (n === 0) {
        return [];
    }

    const lengths = new Array<number>(n).fill(1);
    const previous = new Array<number>(n).fill(-1);

    let bestLen = 1;
    let bestEnd = 0;

    for (let i = 1; i < n; i++) {
        for (let j = 0; j < i; j++) {
            if (values[j] < values[i] && lengths[j] + 1 > lengths[i]) {
                lengths[i] = lengths[j] + 1;
                previous[i] = j;
            }
        }
        if (lengths[i] > bestLen) {
            bestLen = lengths[i];
            bestEnd = i;
        }
    }

    const lisIndices: number[] = [];
    let cursor = bestEnd;
    while (cursor !== -1) {
        lisIndices.push(cursor);
        cursor = previous[cursor];
    }
    lisIndices.reverse();

    return lisIndices;
}

function mergeOrderedIdsWithTouched(base: string[], pending: string[], touched: Set<string>): string[] {
    if (!touched.size) {
        return [...base];
    }

    const result = base.filter((id) => !touched.has(id));
    const pendingTouchedIds = pending.filter((id) => touched.has(id));

    for (const touchedId of pendingTouchedIds) {
        const existingIdx = result.indexOf(touchedId);
        if (existingIdx >= 0) {
            result.splice(existingIdx, 1);
        }

        const pendingIndex = pending.indexOf(touchedId);
        let lowerBound = 0;
        for (let i = pendingIndex - 1; i >= 0; i--) {
            const candidate = pending[i];
            const candidateIndex = result.indexOf(candidate);
            if (candidateIndex >= 0) {
                lowerBound = Math.max(lowerBound, candidateIndex + 1);
            }
        }

        let upperBound = result.length;
        for (let i = pendingIndex + 1; i < pending.length; i++) {
            const candidate = pending[i];
            const candidateIndex = result.indexOf(candidate);
            if (candidateIndex >= 0) {
                upperBound = Math.min(upperBound, candidateIndex);
            }
        }

        const insertAt = lowerBound <= upperBound ? upperBound : lowerBound;
        if (insertAt >= result.length) {
            result.push(touchedId);
        } else {
            result.splice(insertAt, 0, touchedId);
        }
    }

    return result;
}

function areStringArraysEqual(a: string[], b: string[]): boolean {
    if (a.length !== b.length) {
        return false;
    }
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
            return false;
        }
    }
    return true;
}
