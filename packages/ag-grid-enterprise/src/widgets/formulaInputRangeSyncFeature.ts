import { _last } from 'ag-stack';

import type { CellRange, CellSelectionChangedEvent, Column } from 'ag-grid-community';
import { BeanStub, isSpecialCol } from 'ag-grid-community';

import type { AgFormulaInputField } from './agFormulaInputField';
import {
    getCellRangeParams,
    getColorClassesForRef,
    getLatestRangeRef,
    getRangeColorIndexFromClass,
    getRefTokensFromText,
    rangeToRef,
    tagRangeWithFormulaColor,
    toDisplayRangeParams,
} from './formulaRangeUtils';

type TrackedRange = { ref: string; tokenIndex?: number | null };

export class FormulaInputRangeSyncFeature extends BeanStub {
    // local mirror of editSvc range selection state while formula editing is active.
    private rangeSelectionEnabled = false;
    private editingCellRef?: string;
    private editingColumn?: Column;
    private editingRowIndex?: number;

    // refs found in the formula that should have matching grid ranges (counts handle duplicates).
    private readonly trackedRangeRefs = new Map<string, number>();
    // ranges we are actively tracking and their current ref string.
    private readonly trackedRanges = new Map<CellRange, TrackedRange>();
    // prevents our own range changes from re-entering the selection handler.
    private suppressRangeEvents = false;
    // skips the synthetic refresh event we dispatch after re-tagging ranges.
    private ignoreNextRangeEvent = false;
    // avoids a value update loop when we re-render on enabling range selection.
    private skipNextValueUpdate = false;
    // suppress selection handling while keyboard navigation updates the focus range.
    private suppressSelectionChangeHandling = false;

    // keep a stable callback so the input manager can deactivate the previous editor.
    private readonly handleEditorDeactivated = () => {
        this.rangeSelectionEnabled = false;
        this.suppressRangeEvents = false;
        this.ignoreNextRangeEvent = false;
        this.skipNextValueUpdate = false;
        this.clearTrackedRanges(true);
    };

    constructor(private readonly field: AgFormulaInputField) {
        super();
    }

    public postConstruct(): void {
        this.addManagedEventListeners({
            cellSelectionChanged: this.onCellSelectionChanged.bind(this),
        });
        this.addDestroyFunc(() => this.disableRangeSelectionWhileEditing());
        this.addDestroyFunc(() => this.unregisterActiveEditor());
    }

    public onValueUpdated(value: string, hasFormulaPrefix: boolean): void {
        if (this.skipNextValueUpdate) {
            this.skipNextValueUpdate = false;
            return;
        }

        if (!this.isActiveEditor()) {
            return;
        }

        if (hasFormulaPrefix) {
            // enable range selection once the user is building a formula (even if it is just "=").
            const newlyEnabled = this.enableRangeSelectionWhileEditing();
            if (newlyEnabled) {
                // re-render with colors now that range selection is on.
                this.skipNextValueUpdate = true;
                this.field.setValue(value, true);
            }
            this.syncRangesFromFormula(value);
            return;
        }

        this.disableRangeSelectionWhileEditing();
    }

    public setEditingCellRef(column: Column | undefined, rowIndex: number | null | undefined, editingCellRef?: string) {
        this.editingColumn = column;
        this.editingRowIndex = rowIndex ?? undefined;
        this.editingCellRef = editingCellRef;
    }

    public setEditorActive(active: boolean): void {
        if (active) {
            // focus decides which editor owns range syncing when multiple editors are open.
            this.registerActiveEditor();
            return;
        }
        this.unregisterActiveEditor();
    }

    public withSelectionChangeHandlingSuppressed(action: () => void): void {
        // avoid re-writing the formula when the grid updates range selection during navigation.
        const previous = this.suppressSelectionChangeHandling;
        this.suppressSelectionChangeHandling = true;
        try {
            action();
        } finally {
            this.suppressSelectionChangeHandling = previous;
        }
    }

    public deactivateForFocusLoss(): void {
        if (!this.isActiveEditor()) {
            return;
        }
        // drop range sync when focus moves to a non-formula editor.
        this.handleEditorDeactivated();
        this.beans.editSvc?.disableRangeSelectionWhileEditing?.();
        this.unregisterActiveEditor();
    }

    private registerActiveEditor(): void {
        const fieldId = this.field.getCompId();
        const { formulaInputManager } = this.beans;

        if (!formulaInputManager) {
            return;
        }

        const becameActive = formulaInputManager.registerActiveEditor(fieldId, this.handleEditorDeactivated);

        if (!becameActive) {
            return;
        }

        // reset tracking so the new active editor rebuilds its range state cleanly.
        this.rangeSelectionEnabled = false;
        this.suppressRangeEvents = false;
        this.ignoreNextRangeEvent = false;
        this.skipNextValueUpdate = false;
        this.clearTrackedRanges(false);

        const value = this.field.getCurrentValue();
        const hasFormulaPrefix = value.trimStart().startsWith('=');
        this.onValueUpdated(value, hasFormulaPrefix);
    }

    private unregisterActiveEditor(): void {
        const fieldId = this.field.getCompId();
        const { formulaInputManager } = this.beans;

        if (!formulaInputManager) {
            return;
        }

        formulaInputManager.unregisterActiveEditor(fieldId, this.handleEditorDeactivated);
    }

    private isActiveEditor(): boolean {
        const fieldId = this.field.getCompId();
        const { formulaInputManager } = this.beans;

        return !!formulaInputManager && formulaInputManager.isActiveEditor(fieldId);
    }

    private getTrackedRefCount(ref: string): number {
        return this.trackedRangeRefs.get(ref) ?? 0;
    }

    private hasTrackedRef(ref: string): boolean {
        return this.getTrackedRefCount(ref) > 0;
    }

    private addTrackedRef(ref: string): void {
        this.trackedRangeRefs.set(ref, this.getTrackedRefCount(ref) + 1);
    }

    private removeTrackedRef(ref: string): void {
        const next = this.getTrackedRefCount(ref) - 1;
        if (next <= 0) {
            this.trackedRangeRefs.delete(ref);
            return;
        }
        this.trackedRangeRefs.set(ref, next);
    }

    private enableRangeSelectionWhileEditing(): boolean {
        if (this.rangeSelectionEnabled) {
            return false;
        }
        this.rangeSelectionEnabled = true;
        this.beans.editSvc?.enableRangeSelectionWhileEditing?.();
        return true;
    }

    private disableRangeSelectionWhileEditing(): void {
        if (!this.rangeSelectionEnabled && !this.trackedRangeRefs.size) {
            return;
        }
        this.rangeSelectionEnabled = false;
        this.beans.editSvc?.disableRangeSelectionWhileEditing?.();
        this.clearTrackedRanges(this.isActiveEditor());
    }

    private clearTrackedRanges(clearGridRanges: boolean = true): void {
        if (clearGridRanges) {
            const refs = Array.from(this.trackedRangeRefs.keys());
            refs.forEach((ref) => this.removeRangeForRef(ref));
        }
        this.trackedRangeRefs.clear();
        this.trackedRanges.clear();
    }

    private getLiveRanges(): CellRange[] {
        return this.beans.rangeSvc?.getCellRanges() ?? [];
    }

    private withSuppressedRangeEvents(action: () => void): void {
        this.suppressRangeEvents = true;
        action();
        this.suppressRangeEvents = false;
    }

    private setCellRangesSilently(ranges: CellRange[]): void {
        const rangeSvc = this.beans.rangeSvc;
        if (!rangeSvc) {
            return;
        }
        this.withSuppressedRangeEvents(() => rangeSvc.setCellRanges(ranges));
    }

    private getColorIndexForTokenOrRef(ref: string, tokenIndex?: number | null): number | null {
        return this.field.getColorIndexForToken(tokenIndex ?? null) ?? this.field.getColorIndexForRef(ref);
    }

    private normaliseRefForComparison(ref: string | null | undefined): string | null {
        if (!ref) {
            return null;
        }
        const trimmed = ref.endsWith(':') ? ref.slice(0, -1) : ref;
        return trimmed.replace(/\$/g, '').toUpperCase();
    }

    private tagRangeColor(range: CellRange, ref: string, colorIndex: number | null): boolean {
        const { rangeClass } = getColorClassesForRef(ref, colorIndex);
        if (range.colorClass === rangeClass) {
            return false;
        }
        tagRangeWithFormulaColor(range, ref, colorIndex);
        return true;
    }

    private trackRange(range: CellRange, ref: string, tokenIndex?: number | null): void {
        const existing = this.trackedRanges.get(range);
        const nextTokenIndex = tokenIndex !== undefined ? tokenIndex : (existing?.tokenIndex ?? null);

        if (!existing) {
            this.addTrackedRef(ref);
        } else if (existing.ref !== ref) {
            this.removeTrackedRef(existing.ref);
            this.addTrackedRef(ref);
        }

        this.trackedRanges.set(range, { ref, tokenIndex: nextTokenIndex });
    }

    private getUntrackedFormulaRangesByRef(): Map<string, CellRange[]> {
        const rangesByRef = new Map<string, CellRange[]>();
        const ranges = this.getLiveRanges();

        for (const range of ranges) {
            if (this.trackedRanges.has(range)) {
                continue;
            }

            if (getRangeColorIndexFromClass(range.colorClass) == null) {
                continue;
            }

            const ref = rangeToRef(this.beans, range);
            if (!ref || ref === this.editingCellRef) {
                continue;
            }

            const existing = rangesByRef.get(ref);
            if (existing) {
                existing.push(range);
            } else {
                rangesByRef.set(ref, [range]);
            }
        }

        return rangesByRef;
    }

    private syncRangesFromFormula(value?: string | null): void {
        // Keep grid ranges in sync with the current refs in the editor text.
        // This is the "source of truth" pass: it creates/removes ranges to match tokens,
        // assigns token indices, and applies the intended color for each token occurrence.
        // We intentionally duplicate some color tagging logic with ensureTrackedRangeColors
        // because this method mutates range membership, while ensureTrackedRangeColors only
        // repairs existing overlays after external range events.
        const text = value ?? this.field.getCurrentValue() ?? '';
        if (!this.rangeSelectionEnabled) {
            this.clearTrackedRanges();
            return;
        }

        const refTokens = getRefTokensFromText(this.beans, text);
        // group token indices by ref so duplicates map to distinct ranges.
        const desiredByRef = new Map<string, number[]>();

        for (const token of refTokens) {
            const { ref, index } = token;
            if (ref === this.editingCellRef) {
                continue;
            }

            const list = desiredByRef.get(ref) ?? [];
            list.push(index);
            desiredByRef.set(ref, list);
        }

        for (const ref of Array.from(this.trackedRangeRefs.keys())) {
            if (!desiredByRef.has(ref)) {
                this.removeRangeForRef(ref);
            }
        }

        const rangeSvc = this.beans.rangeSvc;
        if (!rangeSvc) {
            return;
        }

        const liveRanges = new Set(this.getLiveRanges());
        for (const [range, tracked] of this.trackedRanges.entries()) {
            if (!liveRanges.has(range)) {
                this.trackedRanges.delete(range);
                this.removeTrackedRef(tracked.ref);
            }
        }

        const untrackedFormulaRanges = this.getUntrackedFormulaRangesByRef();
        let reTagged = false;
        for (const [ref, tokenIndices] of desiredByRef.entries()) {
            const rangesForRef: CellRange[] = [];
            for (const [range, tracked] of this.trackedRanges.entries()) {
                if (tracked.ref === ref) {
                    rangesForRef.push(range);
                }
            }

            const reuseCandidates = untrackedFormulaRanges.get(ref);
            while (rangesForRef.length < tokenIndices.length && reuseCandidates?.length) {
                const candidate = reuseCandidates.shift();
                if (candidate) {
                    rangesForRef.push(candidate);
                }
            }

            while (rangesForRef.length > tokenIndices.length) {
                const range = rangesForRef.pop();
                if (range) {
                    this.removeTrackedRange(range);
                }
            }

            while (rangesForRef.length < tokenIndices.length) {
                const tokenIndex = tokenIndices[rangesForRef.length];
                const added = this.addRangeForRef(ref, false, tokenIndex);
                if (!added) {
                    break;
                }
                rangesForRef.push(added);
            }

            for (let i = 0; i < rangesForRef.length && i < tokenIndices.length; i++) {
                const range = rangesForRef[i];
                const tokenIndex = tokenIndices[i];
                this.trackRange(range, ref, tokenIndex);
                const colorIndex = this.getColorIndexForTokenOrRef(ref, tokenIndex);
                if (this.tagRangeColor(range, ref, colorIndex)) {
                    reTagged = true;
                }
            }
        }

        const unusedFormulaRanges: CellRange[] = [];
        for (const ranges of untrackedFormulaRanges.values()) {
            if (ranges.length) {
                unusedFormulaRanges.push(...ranges);
            }
        }

        if (unusedFormulaRanges.length) {
            const currentRanges = this.getLiveRanges();
            const remaining = currentRanges.filter((range) => !unusedFormulaRanges.includes(range));
            if (remaining.length !== currentRanges.length) {
                this.setCellRangesSilently(remaining);
                reTagged = true;
            }
        }

        if (reTagged) {
            this.refreshRangeStyling();
        }
    }

    private onCellSelectionChanged(event: CellSelectionChangedEvent): void {
        if (
            !this.isActiveEditor() ||
            !this.rangeSelectionEnabled ||
            !this.beans.editSvc?.isRangeSelectionEnabledWhileEditing?.()
        ) {
            return;
        }

        if (this.ignoreNextRangeEvent) {
            this.ignoreNextRangeEvent = false;
            return;
        }

        if (this.suppressSelectionChangeHandling) {
            return;
        }

        const { finished, started } = event;
        const liveRanges = this.getLiveRanges();
        // drop selection/row-number ranges while editing formulas as they can't map to refs
        const nonSpecialRanges = liveRanges.filter((range) => !this.isSpecialOnlyRange(range));

        if (nonSpecialRanges.length !== liveRanges.length) {
            this.setCellRangesSilently(nonSpecialRanges);
            this.refocusEditingCell();
            return;
        }

        const latestRange = liveRanges.length ? _last(liveRanges) : null;
        const latestRef = latestRange ? rangeToRef(this.beans, latestRange) : null;
        const hasInsertCandidate =
            !!latestRange && !this.trackedRanges.has(latestRange) && !!latestRef && latestRef !== this.editingCellRef;
        const shouldInsert = finished && (started || hasInsertCandidate);

        // re-tag ranges if their colors are out of sync with the formula tokens.
        const reTagged = this.ensureTrackedRangeColors();

        if (this.suppressRangeEvents) {
            if (reTagged) {
                this.refreshRangeStyling();
            }
            return;
        }

        if (started || hasInsertCandidate) {
            // remember caret so we can restore it after any selection-driven edits.
            this.field.rememberCaret();
        }

        if (!hasInsertCandidate && this.handleRemovedRangeTokens()) {
            this.field.restoreCaretAfterToken();
            this.refocusEditingCell();
            return;
        }

        // if an existing range was resized, update its token instead of inserting a new one.
        if (this.updateTrackedRangeTokens()) {
            return;
        }

        const ref = getLatestRangeRef(this.beans);

        if (!ref || ref === this.editingCellRef) {
            this.refocusEditingCell();
            return;
        }

        if (shouldInsert) {
            const { action, previousRef, tokenIndex } = this.field.applyRangeInsert(ref);

            if (action === 'none') {
                // range selection while editing appends ranges, so collapse to the latest selection
                // before stopping the edit to avoid leaving the previous cell highlighted.
                this.keepLatestSelectionOnly(latestRange);

                // treat the click as edit completion when we are not inserting a token.
                this.beans.editSvc?.stopEditing(undefined, { source: 'edit' });
                return;
            }

            if (action === 'replace' && previousRef === ref) {
                // clicking the same ref should not leave a duplicate range behind.
                this.discardLatestRangeForRef(ref);
                this.field.restoreCaretAfterToken();
                this.refocusEditingCell();
                return;
            }

            this.tagLatestRangeForRef(ref, tokenIndex);
            this.handleRangeTokenUpdate(previousRef, ref, true, action === 'insert', tokenIndex);
            // refresh token indices for existing ranges so their colors match the new token order.
            this.syncRangesFromFormula(this.field.getCurrentValue());
            this.field.restoreCaretAfterToken();
            this.refocusEditingCell();
            return;
        }

        if (!started && !finished) {
            // drag updates should rewrite the active token as the range grows/shrinks.
            const { previousRef, tokenIndex } = this.field.insertOrReplaceToken(ref, false);
            this.tagLatestRangeForRef(ref, tokenIndex);
            this.handleRangeTokenUpdate(previousRef, ref, false, false);
            this.refocusEditingCell();
            return;
        }

        this.tagLatestRangeForRef(ref);

        if (finished) {
            this.field.restoreCaretAfterToken();
            this.refocusEditingCell();
        }
    }

    private keepLatestSelectionOnly(latestRange: CellRange | null): void {
        if (!latestRange || this.getLiveRanges().length <= 1) {
            return;
        }

        this.setCellRangesSilently([latestRange]);
    }

    private isSpecialOnlyRange(range: CellRange): boolean {
        const columns = range.columns;
        return !!columns?.length && columns.every((col) => isSpecialCol(col));
    }

    private handleRangeTokenUpdate(
        previousRef: string | undefined,
        ref: string,
        manageRanges: boolean,
        isNew: boolean,
        tokenIndex?: number | null
    ): void {
        // manageRanges = update grid ranges now; otherwise we only track refs during drag.
        if (manageRanges) {
            if (!isNew && previousRef && previousRef !== ref) {
                this.removeRangeForRef(previousRef, tokenIndex);
            }
            this.addRangeForRef(ref, true, tokenIndex);
            return;
        }

        if (isNew || !previousRef) {
            this.addTrackedRef(ref);
            return;
        }

        if (previousRef !== ref) {
            this.removeTrackedRef(previousRef);
            this.addTrackedRef(ref);
        }
    }

    private addRangeForRef(ref: string, skipAddCellRange?: boolean, tokenIndex?: number | null): CellRange | undefined {
        // create or re-tag an existing range for the given ref.
        const rangeSvc = this.beans.rangeSvc;

        if (!rangeSvc) {
            return undefined;
        }

        let created: CellRange | undefined;

        if (!skipAddCellRange) {
            const params = getCellRangeParams(this.beans, ref);
            if (!params) {
                return undefined;
            }
            const displayParams = toDisplayRangeParams(this.beans, params);
            if (!displayParams) {
                return undefined;
            }
            this.withSuppressedRangeEvents(() => {
                created = rangeSvc.addCellRange(displayParams);
            });
        } else {
            created = this.findLatestRangeForRef(ref, true) ?? this.findLatestRangeForRef(ref, false);
        }

        if (created) {
            const colorIndex = this.getColorIndexForTokenOrRef(ref, tokenIndex);
            this.tagRangeColor(created, ref, colorIndex);
            this.trackRange(created, ref, tokenIndex);
            this.refreshRangeStyling();
        }

        return created;
    }

    private findLatestRangeForRef(ref: string, skipTracked: boolean): CellRange | undefined {
        const ranges = this.getLiveRanges();
        for (let i = ranges.length - 1; i >= 0; i--) {
            const range = ranges[i];
            if (rangeToRef(this.beans, range) !== ref) {
                continue;
            }
            if (skipTracked && this.trackedRanges.has(range)) {
                continue;
            }
            return range;
        }
        return undefined;
    }

    private tagLatestRangeForRef(ref: string, tokenIndex?: number | null): void {
        // the newest range is the one the user just clicked/dragged.

        const { trackedRanges } = this;
        const ranges = this.getLiveRanges();
        const latest = ranges.length ? _last(ranges) : null;

        if (!latest) {
            return;
        }

        const trackedIndex = trackedRanges.get(latest)?.tokenIndex ?? null;
        const colorIndex = this.getColorIndexForTokenOrRef(ref, tokenIndex ?? trackedIndex);
        this.tagRangeColor(latest, ref, colorIndex);
        this.refreshRangeStyling();
    }

    private discardLatestRangeForRef(ref: string): void {
        const ranges = this.getLiveRanges();
        if (!ranges.length) {
            return;
        }

        const latest = _last(ranges);
        if (rangeToRef(this.beans, latest) !== ref) {
            return;
        }

        if (this.trackedRanges.has(latest)) {
            this.removeTrackedRange(latest);
            return;
        }

        this.setCellRangesSilently(ranges.slice(0, -1));
    }

    private ensureTrackedRangeColors(): boolean {
        // Keep overlay colors aligned with the formula token colors.
        // This is a repair pass used during range events: it does not add/remove ranges,
        // it only re-tags colors for whatever ranges currently exist in the grid.
        // Some color logic mirrors syncRangesFromFormula on purpose to keep overlays
        // correct even when external range updates bypass the formula sync.
        const ranges = this.getLiveRanges();
        if (!ranges.length) {
            return false;
        }
        let reTagged = false;

        for (const range of ranges) {
            const tracked = this.trackedRanges.get(range);
            const ref = tracked?.ref ?? rangeToRef(this.beans, range);
            if (!ref || !this.hasTrackedRef(ref)) {
                continue;
            }

            const tokenIndex = tracked?.tokenIndex ?? null;
            const tokenColorIndex = this.field.getColorIndexForToken(tokenIndex);
            const inferredColorIndex = getRangeColorIndexFromClass(range.colorClass);
            const colorIndex =
                tokenColorIndex ??
                (this.field.hasColorForRef(ref)
                    ? this.field.getColorIndexForRef(ref)
                    : this.field.moveColorToRef(undefined, ref, inferredColorIndex ?? undefined));

            if (colorIndex == null) {
                continue;
            }

            if (this.tagRangeColor(range, ref, colorIndex)) {
                reTagged = true;
            }

            if (!this.trackedRanges.has(range)) {
                this.trackRange(range, ref, tokenIndex);
            }
        }

        return reTagged;
    }

    private handleRemovedRangeTokens(): boolean {
        // if a tracked range was removed via selection (e.g. Ctrl/Cmd click), drop its token.
        if (!this.beans.rangeSvc || this.trackedRanges.size === 0) {
            return false;
        }

        const value = this.field.getCurrentValue();
        const tokens = getRefTokensFromText(this.beans, value).filter(({ ref }) => ref !== this.editingCellRef);
        if (!tokens.length) {
            return false;
        }

        const liveRanges = this.getLiveRanges();
        const liveSet = new Set(liveRanges);
        const liveCounts = new Map<string, number>();

        for (const range of liveRanges) {
            const ref = rangeToRef(this.beans, range);
            if (!ref || ref === this.editingCellRef) {
                continue;
            }
            liveCounts.set(ref, (liveCounts.get(ref) ?? 0) + 1);
        }

        const pendingRemovals = new Map<string, number>();
        for (const token of tokens) {
            const { ref } = token;
            pendingRemovals.set(ref, (pendingRemovals.get(ref) ?? 0) + 1);
        }
        for (const [ref, tokenCount] of Array.from(pendingRemovals.entries())) {
            const liveCount = liveCounts.get(ref) ?? 0;
            const remaining = tokenCount - liveCount;
            if (remaining > 0) {
                pendingRemovals.set(ref, remaining);
            } else {
                pendingRemovals.delete(ref);
            }
        }

        if (!pendingRemovals.size) {
            return false;
        }

        const removals: Array<{ range: CellRange; tracked: TrackedRange }> = [];
        for (const [range, tracked] of Array.from(this.trackedRanges.entries())) {
            if (liveSet.has(range)) {
                continue;
            }
            const { ref } = tracked;
            const remaining = pendingRemovals.get(ref) ?? 0;
            if (remaining <= 0) {
                continue;
            }
            pendingRemovals.set(ref, remaining - 1);
            removals.push({ range, tracked });
        }

        if (!removals.length) {
            return false;
        }

        removals.sort((a, b) => (b.tracked.tokenIndex ?? -1) - (a.tracked.tokenIndex ?? -1));

        let removed = false;
        for (const { range, tracked } of removals) {
            const { ref, tokenIndex } = tracked;
            removed = this.field.removeTokenRef(ref, tokenIndex ?? null) || removed;
            this.trackedRanges.delete(range);
            this.removeTrackedRef(ref);
        }

        if (removed) {
            this.syncRangesFromFormula(this.field.getCurrentValue());
        }

        return removed;
    }

    private refreshRangeStyling(): void {
        // trigger a lightweight refresh so overlays pick up any updated classes.
        const { eventSvc } = this.beans;
        if (!eventSvc) {
            return;
        }

        this.ensureTrackedRangeColors();
        this.ignoreNextRangeEvent = true;
        eventSvc.dispatchEvent({
            type: 'cellSelectionChanged',
            started: false,
            finished: false,
        });
    }

    private refocusEditingCell(): void {
        // keep focus on the edited cell so keyboard editing continues.
        const { focusSvc } = this.beans;
        const { editingColumn, editingRowIndex } = this;
        if (!focusSvc || editingColumn == null || editingRowIndex == null) {
            return;
        }
        focusSvc.setFocusedCell({
            column: editingColumn,
            rowIndex: editingRowIndex,
            rowPinned: null,
            preventScrollOnBrowserFocus: true,
        });
    }

    private removeTrackedRange(range: CellRange): void {
        const tracked = this.trackedRanges.get(range);
        if (!tracked) {
            return;
        }

        const ranges = this.getLiveRanges();
        const remaining = ranges.filter((candidate) => candidate !== range);
        if (remaining.length !== ranges.length) {
            this.setCellRangesSilently(remaining);
        }

        this.trackedRanges.delete(range);
        this.removeTrackedRef(tracked.ref);
    }

    private removeRangeForRef(ref: string | undefined, tokenIndex?: number | null): void {
        // drop ranges that no longer exist in the formula and clean our tracking maps.
        if (!ref || !this.hasTrackedRef(ref)) {
            return;
        }

        if (tokenIndex != null) {
            let removed = false;
            for (const [range, tracked] of Array.from(this.trackedRanges.entries())) {
                const { ref: trackedRef, tokenIndex: trackedTokenIndex } = tracked;
                if (trackedRef !== ref || trackedTokenIndex !== tokenIndex) {
                    continue;
                }
                this.removeTrackedRange(range);
                removed = true;
                break;
            }

            if (!removed) {
                for (const [range, tracked] of Array.from(this.trackedRanges.entries())) {
                    if (tracked.ref === ref) {
                        this.removeTrackedRange(range);
                        break;
                    }
                }
            }

            return;
        }

        for (const [range, tracked] of Array.from(this.trackedRanges.entries())) {
            if (tracked.ref === ref) {
                this.removeTrackedRange(range);
            }
        }
    }

    private updateTrackedRangeTokens(): boolean {
        // when a tracked range changes, update the corresponding token text.
        if (!this.beans.rangeSvc) {
            return false;
        }

        const ranges = this.getLiveRanges();
        const editingRef = this.normaliseRefForComparison(this.editingCellRef);
        let updated = false;

        for (const range of ranges) {
            const tracked = this.trackedRanges.get(range);
            if (!tracked) {
                continue;
            }

            const { ref: previousRef, tokenIndex } = tracked;
            const nextRef = rangeToRef(this.beans, range);
            const normalisedPrevious = this.normaliseRefForComparison(previousRef);
            const normalisedNext = this.normaliseRefForComparison(nextRef);
            if (!nextRef || !normalisedNext || normalisedNext === normalisedPrevious || normalisedNext === editingRef) {
                continue;
            }

            const { colorClass } = range;
            const tokenColorIndex = this.field.getColorIndexForToken(tokenIndex ?? null);
            const colorIndex =
                tokenColorIndex ??
                this.field.moveColorToRef(previousRef, nextRef, getRangeColorIndexFromClass(colorClass) ?? undefined);

            const replacedIndex = this.field.replaceTokenRef(previousRef, nextRef, colorIndex, tokenIndex);
            if (replacedIndex == null) {
                continue;
            }

            this.tagRangeColor(range, nextRef, colorIndex);
            this.trackRange(range, nextRef, replacedIndex ?? tokenIndex ?? null);
            updated = true;
        }

        if (updated) {
            this.refreshRangeStyling();
        }

        return updated;
    }
}
