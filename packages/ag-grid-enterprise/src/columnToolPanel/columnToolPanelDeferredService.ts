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

/** Track applied state plus a patch so deferred mode can stage edits without immediate grid mutation. */
export class ColumnToolPanelDeferredService {
    private appliedState: ColumnToolPanelDeferredState = EMPTY_STATE;
    private patch: PendingPatch = {};
    private pendingStateCache: ColumnToolPanelDeferredState = EMPTY_STATE;
    private pendingStateCacheDirty = true;

    /** Replace staged state by rebuilding the patch against current applied state. */
    public setPendingState(state: ColumnToolPanelDeferredState): void {
        this.patch = buildPatch(this.appliedState, state);
        this.pendingStateCacheDirty = true;
    }

    /** Stage pivot/row-group/value mutations from column state updates in deferred mode. */
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

    /** Stage visibility updates from column state changes in deferred mode. */
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

    /** Stage row-group order updates from tool panel interactions. */
    public setPendingRowGroupColumns(colIds: string[]): void {
        const pendingState = this.getPendingState();
        pendingState.rowGroupColIds = [...colIds];
        this.setPendingState(pendingState);
    }

    /** Stage pivot order updates from tool panel interactions. */
    public setPendingPivotColumns(colIds: string[]): void {
        const pendingState = this.getPendingState();
        pendingState.pivotColIds = [...colIds];
        this.setPendingState(pendingState);
    }

    /** Stage value column order and aggregation function updates. */
    public setPendingValueColumns(valueCols: DeferredValueColumnState[]): void {
        const pendingState = this.getPendingState();
        pendingState.valueCols = valueCols.map((valueCol) => ({
            colId: valueCol.colId,
            aggFunc: valueCol.aggFunc,
        }));
        this.setPendingState(pendingState);
    }

    /** Reset deferred state to a new applied baseline after apply or panel refresh. */
    public reconcileFromApplied(state: ColumnToolPanelDeferredState): void {
        this.appliedState = state;
        this.patch = {};
        this.pendingStateCacheDirty = true;
    }

    /** Rebase staged edits onto new applied state so pending deferred edits survive external grid changes. */
    public reconcileFromAppliedPreservingPending(state: ColumnToolPanelDeferredState): void {
        if (!this.hasPendingChanges()) {
            this.appliedState = state;
            this.patch = {};
            this.pendingStateCacheDirty = true;
            return;
        }

        const existingPatch = this.patch;
        this.appliedState = state;
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
        this.pendingStateCacheDirty = true;
    }

    /** Drop all staged edits and return the applied-equivalent pending state. */
    public cancelPending(): ColumnToolPanelDeferredState {
        this.patch = {};
        this.pendingStateCacheDirty = true;
        return this.getPendingState();
    }

    /** Report whether deferred mode currently has staged edits to apply or cancel. */
    public hasPendingChanges(): boolean {
        return hasPatchChanges(this.patch);
    }

    /** Return the current applied state baseline. */
    public getAppliedState(): ColumnToolPanelDeferredState {
        return this.appliedState;
    }

    /** Return current pending state. */
    public getPendingState(): ColumnToolPanelDeferredState {
        return this.getPendingStateSnapshot();
    }

    /** Return cached pending state, recomputed when patch or applied state changes. */
    public getPendingStateSnapshot(): Readonly<ColumnToolPanelDeferredState> {
        if (this.pendingStateCacheDirty) {
            this.pendingStateCache = applyPatchToState(this.appliedState, this.patch, false);
            this.pendingStateCacheDirty = false;
        }
        return this.pendingStateCache;
    }
}

/** Add an id only when absent so staged ordered lists stay unique. */
function addUnique(ids: string[], colId: string): string[] {
    return ids.includes(colId) ? ids : [...ids, colId];
}

/** Check whether the staged patch contains any deferred changes. */
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

/** Check whether override records contain at least one staged key. */
function hasRecordEntries(record: { [key: string]: unknown } | undefined): boolean {
    return !!record && Object.keys(record).length > 0;
}

/** Build a minimal patch that captures pending state differences from applied state. */
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

/** Build visibility overrides so deferred mode stage hidden/visible deltas only. */
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

/** Build aggregation overrides so deferred mode stage value agg deltas only. */
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

/** Apply a staged patch to applied state to materialise current deferred pending state. */
function applyPatchToState(
    appliedState: ColumnToolPanelDeferredState,
    patch: PendingPatch,
    preserveUntouchedOrderOnRebase: boolean
): ColumnToolPanelDeferredState {
    const pendingState: ColumnToolPanelDeferredState = {
        pivotMode: appliedState.pivotMode,
        rowGroupColIds: appliedState.rowGroupColIds,
        pivotColIds: appliedState.pivotColIds,
        valueCols: appliedState.valueCols.map((valueCol) => ({ colId: valueCol.colId, aggFunc: valueCol.aggFunc })),
        visibleColIds: appliedState.visibleColIds,
    };

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
        for (const colId of Object.keys(patch.visibilityOverrides)) {
            const visible = patch.visibilityOverrides[colId];
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

/** Build staged value columns after applying order and aggregation overrides. */
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
    const orderSet = new Set(order);

    if (patch.valueColOrder && preserveUntouchedOrderOnRebase) {
        order = mergeOrderedIdsWithTouched(
            appliedOrder,
            patch.valueColOrder,
            new Set(patch.valueTouchedColIds ?? patch.valueColOrder)
        );
    }

    // A staged agg func for a non-value column should stage adding it as a value column.
    for (const colId of Object.keys(aggOverrides)) {
        const aggFunc = aggOverrides[colId];
        if (aggFunc !== null && !orderSet.has(colId)) {
            order.push(colId);
            orderSet.add(colId);
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

/** Map value column ids to aggregation functions for patch comparisons and materialisation. */
function getValueAggMap(valueCols: DeferredValueColumnState[]): Map<string, string | IAggFunc | null> {
    return new Map(valueCols.map((valueCol) => [valueCol.colId, valueCol.aggFunc] as const));
}

/** Track ids whose membership or ordering changed so rebasing preserves untouched order. */
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

/** Detect common ids that changed order between applied and pending sequences. */
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

/** Compute LIS indices to identify common ids that keep relative order across reorder operations. */
function getLisIndices(values: number[]): number[] {
    const n = values.length;
    if (n === 0) {
        return [];
    }

    const tailsValueIndices: number[] = [];
    const previousIndex = new Array<number>(n).fill(-1);

    for (let i = 0; i < n; i++) {
        const value = values[i];
        let left = 0;
        let right = tailsValueIndices.length;

        while (left < right) {
            const mid = (left + right) >> 1;
            if (values[tailsValueIndices[mid]] < value) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }

        if (left > 0) {
            previousIndex[i] = tailsValueIndices[left - 1];
        }

        if (left === tailsValueIndices.length) {
            tailsValueIndices.push(i);
        } else {
            tailsValueIndices[left] = i;
        }
    }

    const lisIndices: number[] = [];
    let cursor = tailsValueIndices[tailsValueIndices.length - 1];
    while (cursor != null && cursor >= 0) {
        lisIndices.push(cursor);
        cursor = previousIndex[cursor];
    }
    lisIndices.reverse();
    return lisIndices;
}

/** Merge touched ids into base order while keeping untouched ids stable during rebase. */
function mergeOrderedIdsWithTouched(base: string[], pending: string[], touched: Set<string>): string[] {
    if (!touched.size) {
        return [...base];
    }

    const result = base.filter((id) => !touched.has(id));
    const pendingTouchedIds = pending.filter((id) => touched.has(id));
    const pendingIndexById = new Map(pending.map((id, index) => [id, index] as const));

    for (const touchedId of pendingTouchedIds) {
        const existingIdx = result.indexOf(touchedId);
        if (existingIdx >= 0) {
            result.splice(existingIdx, 1);
        }

        const pendingIndex = pendingIndexById.get(touchedId);
        if (pendingIndex == null) {
            continue;
        }

        const resultIndexById = new Map(result.map((id, index) => [id, index] as const));
        let lowerBound = 0;
        for (let i = pendingIndex - 1; i >= 0; i--) {
            const candidate = pending[i];
            const candidateIndex = resultIndexById.get(candidate);
            if (candidateIndex != null && candidateIndex >= 0) {
                lowerBound = Math.max(lowerBound, candidateIndex + 1);
            }
        }

        let upperBound = result.length;
        for (let i = pendingIndex + 1; i < pending.length; i++) {
            const candidate = pending[i];
            const candidateIndex = resultIndexById.get(candidate);
            if (candidateIndex != null && candidateIndex >= 0) {
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

/** Compare ordered id arrays to detect deferred order changes. */
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
