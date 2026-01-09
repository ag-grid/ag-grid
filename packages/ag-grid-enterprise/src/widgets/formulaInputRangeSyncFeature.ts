import { BeanStub, _last } from 'ag-grid-community';
import type { CellRange, CellSelectionChangedEvent, Column } from 'ag-grid-community';

import type { AgFormulaInputField } from './agFormulaInputField';
import {
    getCellRangeParams,
    getColorClassesForRef,
    getLatestRangeRef,
    getRangeColorIndexFromClass,
    getRefTokensFromText,
    rangeToRef,
    tagRangeWithFormulaColor,
} from './formulaRangeUtils';

type TrackedRange = { ref: string; tokenIndex?: number | null };

export class FormulaInputRangeSyncFeature extends BeanStub {
    // Local mirror of editSvc range selection state while formula editing is active.
    private rangeSelectionEnabled = false;
    private editingCellRef?: string;
    private editingColumn?: Column;
    private editingRowIndex?: number;
    // Refs found in the formula that should have matching grid ranges (counts handle duplicates).
    private readonly trackedRangeRefs = new Map<string, number>();
    // Ranges we are actively tracking and their current ref string.
    private readonly trackedRanges = new Map<CellRange, TrackedRange>();
    // Prevents our own range changes from re-entering the selection handler.
    private suppressRangeEvents = false;
    // Skips the synthetic refresh event we dispatch after re-tagging ranges.
    private ignoreNextRangeEvent = false;
    // Avoids a value update loop when we re-render on enabling range selection.
    private skipNextValueUpdate = false;

    constructor(private readonly field: AgFormulaInputField) {
        super();
    }

    public postConstruct(): void {
        this.addManagedEventListeners({
            cellSelectionChanged: this.onCellSelectionChanged.bind(this),
        });
        this.addDestroyFunc(() => this.disableRangeSelectionWhileEditing());
    }

    public onValueUpdated(value: string, hasFormulaPrefix: boolean): void {
        if (this.skipNextValueUpdate) {
            this.skipNextValueUpdate = false;
            return;
        }

        if (hasFormulaPrefix) {
            // Enable range selection once the user is building a formula (even if it is just "=").
            const newlyEnabled = this.enableRangeSelectionWhileEditing();
            if (newlyEnabled) {
                // Re-render with colors now that range selection is on.
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
        this.clearTrackedRanges();
    }

    private clearTrackedRanges(): void {
        const refs = Array.from(this.trackedRangeRefs.keys());
        refs.forEach((ref) => this.removeRangeForRef(ref));
        this.trackedRangeRefs.clear();
        this.trackedRanges.clear();
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

        const refTokens = getRefTokensFromText(text);
        // Group token indices by ref so duplicates map to distinct ranges.
        const desiredByRef = new Map<string, number[]>();

        for (const token of refTokens) {
            if (token.ref === this.editingCellRef) {
                continue;
            }
            const list = desiredByRef.get(token.ref) ?? [];
            list.push(token.index);
            desiredByRef.set(token.ref, list);
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

        const liveRanges = new Set(rangeSvc.getCellRanges() ?? []);
        for (const [range, tracked] of this.trackedRanges.entries()) {
            if (!liveRanges.has(range)) {
                this.trackedRanges.delete(range);
                this.removeTrackedRef(tracked.ref);
            }
        }

        let reTagged = false;
        for (const [ref, tokenIndices] of desiredByRef.entries()) {
            const rangesForRef: CellRange[] = [];
            for (const [range, tracked] of this.trackedRanges.entries()) {
                if (tracked.ref === ref) {
                    rangesForRef.push(range);
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
                const tracked = this.trackedRanges.get(range);
                if (!tracked || tracked.tokenIndex !== tokenIndex) {
                    this.trackedRanges.set(range, { ref, tokenIndex });
                }

                const colorIndex = this.field.getColorIndexForToken(tokenIndex) ?? this.field.getColorIndexForRef(ref);
                const { rangeClass } = getColorClassesForRef(ref, colorIndex);

                if (range.colorClass !== rangeClass) {
                    tagRangeWithFormulaColor(range, ref, colorIndex);
                    reTagged = true;
                }
            }
        }

        if (reTagged) {
            this.refreshRangeStyling();
        }
    }

    private onCellSelectionChanged(event: CellSelectionChangedEvent): void {
        if (!this.rangeSelectionEnabled || !this.beans.editSvc?.isRangeSelectionEnabledWhileEditing?.()) {
            return;
        }
        if (this.ignoreNextRangeEvent) {
            this.ignoreNextRangeEvent = false;
            return;
        }

        // Re-tag ranges if their colors are out of sync with the formula tokens.
        const reTagged = this.ensureTrackedRangeColors();

        if (this.suppressRangeEvents) {
            if (reTagged) {
                this.refreshRangeStyling();
            }
            return;
        }

        // If an existing range was resized, update its token instead of inserting a new one.
        if (this.updateTrackedRangeTokens()) {
            return;
        }

        const ref = getLatestRangeRef(this.beans);

        if (!ref || ref === this.editingCellRef) {
            this.refocusEditingCell();
            return;
        }

        if (event.started) {
            // Remember caret so we can restore it after inserting/replacing tokens.
            this.field.rememberCaret();
        }

        if (event.started && event.finished) {
            const { action, previousRef, tokenIndex } = this.field.applyRangeInsert(ref);

            if (action === 'none') {
                // Treat the click as an edit completion when not in a formula context.
                this.beans.editSvc?.stopEditing(undefined, { source: 'edit' });
                return;
            }

            if (action === 'replace' && previousRef === ref) {
                // Clicking the same ref should not leave a duplicate range behind.
                this.discardLatestRangeForRef(ref);
                this.field.restoreCaretAfterToken();
                this.refocusEditingCell();
                return;
            }

            this.tagLatestRangeForRef(ref, tokenIndex);
            this.handleRangeTokenUpdate(previousRef, ref, true, action === 'insert', tokenIndex);
            // Refresh token indices for existing ranges so their colors match the new token order.
            this.syncRangesFromFormula(this.field.getCurrentValue());
            this.field.restoreCaretAfterToken();
            this.refocusEditingCell();
            return;
        }

        if (!event.started && !event.finished) {
            // Drag updates should rewrite the active token as the range grows/shrinks.
            const { previousRef, tokenIndex } = this.field.insertOrReplaceToken(ref, false);
            this.tagLatestRangeForRef(ref, tokenIndex);
            this.handleRangeTokenUpdate(previousRef, ref, false, false);
            this.refocusEditingCell();
            return;
        }

        this.tagLatestRangeForRef(ref);

        if (event.finished) {
            this.field.restoreCaretAfterToken();
            this.refocusEditingCell();
        }
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

        if (isNew) {
            this.addTrackedRef(ref);
            return;
        }

        if (!previousRef) {
            this.addTrackedRef(ref);
            return;
        }

        if (previousRef !== ref) {
            this.removeTrackedRef(previousRef);
            this.addTrackedRef(ref);
        }
    }

    private addRangeForRef(ref: string, skipAddCellRange?: boolean, tokenIndex?: number | null): CellRange | undefined {
        // Create or re-tag an existing range for the given ref.
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
            this.suppressRangeEvents = true;
            created = rangeSvc.addCellRange(params);
            this.suppressRangeEvents = false;
        } else {
            created = this.findLatestRangeForRef(ref, true) ?? this.findLatestRangeForRef(ref, false);
        }

        if (created) {
            const colorIndex = this.field.getColorIndexForToken(tokenIndex) ?? this.field.getColorIndexForRef(ref);
            tagRangeWithFormulaColor(created, ref, colorIndex);

            const existing = this.trackedRanges.get(created);
            if (!existing) {
                this.addTrackedRef(ref);
            } else if (existing.ref !== ref) {
                this.removeTrackedRef(existing.ref);
                this.addTrackedRef(ref);
            }

            this.trackedRanges.set(created, { ref, tokenIndex: tokenIndex ?? existing?.tokenIndex ?? null });
            this.refreshRangeStyling();
        }

        return created;
    }

    private findLatestRangeForRef(ref: string, skipTracked: boolean): CellRange | undefined {
        const ranges = this.beans.rangeSvc?.getCellRanges() ?? [];
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
        // The newest range is the one the user just clicked/dragged.

        const { beans, field, trackedRanges } = this;
        const ranges = beans.rangeSvc?.getCellRanges();
        const latest = ranges?.length ? _last(ranges) : null;

        if (!latest) {
            return;
        }

        const trackedIndex = trackedRanges.get(latest)?.tokenIndex ?? null;
        const colorIndex = field.getColorIndexForToken(tokenIndex ?? trackedIndex) ?? field.getColorIndexForRef(ref);

        tagRangeWithFormulaColor(latest, ref, colorIndex);
        this.refreshRangeStyling();
    }

    private discardLatestRangeForRef(ref: string): void {
        const rangeSvc = this.beans.rangeSvc;
        if (!rangeSvc) {
            return;
        }

        const ranges = rangeSvc.getCellRanges() ?? [];
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

        this.suppressRangeEvents = true;
        rangeSvc.setCellRanges(ranges.slice(0, -1));
        this.suppressRangeEvents = false;
    }

    private ensureTrackedRangeColors(): boolean {
        // Keep overlay colors aligned with the formula token colors.
        // This is a repair pass used during range events: it does not add/remove ranges,
        // it only re-tags colors for whatever ranges currently exist in the grid.
        // Some color logic mirrors syncRangesFromFormula on purpose to keep overlays
        // correct even when external range updates bypass the formula sync.
        const rangeSvc = this.beans.rangeSvc;

        if (!rangeSvc) {
            return false;
        }

        const ranges = rangeSvc.getCellRanges();
        let reTagged = false;

        for (const range of ranges) {
            const tracked = this.trackedRanges.get(range);
            const ref = tracked?.ref ?? rangeToRef(this.beans, range);
            if (!ref || !this.hasTrackedRef(ref)) {
                continue;
            }

            const tokenColorIndex = this.field.getColorIndexForToken(tracked?.tokenIndex ?? null);
            const inferredColorIndex = getRangeColorIndexFromClass(range.colorClass);
            const colorIndex =
                tokenColorIndex ??
                (this.field.hasColorForRef(ref)
                    ? this.field.getColorIndexForRef(ref)
                    : this.field.moveColorToRef(undefined, ref, inferredColorIndex ?? undefined));

            if (colorIndex == null) {
                continue;
            }

            const { rangeClass } = getColorClassesForRef(ref, colorIndex);

            if (range.colorClass !== rangeClass) {
                tagRangeWithFormulaColor(range, ref, colorIndex);
                reTagged = true;
            }

            if (!this.trackedRanges.has(range)) {
                this.trackedRanges.set(range, { ref, tokenIndex: tracked?.tokenIndex ?? null });
                this.addTrackedRef(ref);
            }
        }

        return reTagged;
    }

    private refreshRangeStyling(): void {
        // Trigger a lightweight refresh so overlays pick up any updated classes.
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
        // Keep focus on the edited cell so keyboard editing continues.
        const { focusSvc } = this.beans;
        if (!focusSvc || this.editingColumn == null || this.editingRowIndex == null) {
            return;
        }
        focusSvc.setFocusedCell({
            column: this.editingColumn as any,
            rowIndex: this.editingRowIndex,
            rowPinned: null,
            preventScrollOnBrowserFocus: true,
        });
    }

    private removeTrackedRange(range: CellRange): void {
        const tracked = this.trackedRanges.get(range);
        if (!tracked) {
            return;
        }

        const { rangeSvc } = this.beans;
        if (rangeSvc) {
            const ranges = rangeSvc.getCellRanges() ?? [];
            const remaining = ranges.filter((candidate) => candidate !== range);
            if (remaining.length !== ranges.length) {
                this.suppressRangeEvents = true;
                rangeSvc.setCellRanges(remaining);
                this.suppressRangeEvents = false;
            }
        }

        this.trackedRanges.delete(range);
        this.removeTrackedRef(tracked.ref);
    }

    private removeRangeForRef(ref: string | undefined, tokenIndex?: number | null): void {
        // Drop ranges that no longer exist in the formula and clean our tracking maps.
        if (!ref || !this.hasTrackedRef(ref)) {
            return;
        }

        if (tokenIndex != null) {
            let removed = false;
            for (const [range, tracked] of Array.from(this.trackedRanges.entries())) {
                if (tracked.ref !== ref) {
                    continue;
                }
                if (tracked.tokenIndex !== tokenIndex) {
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
        // When a tracked range changes, update the corresponding token text.
        const rangeSvc = this.beans.rangeSvc;
        if (!rangeSvc) {
            return false;
        }

        const ranges = rangeSvc.getCellRanges();
        let updated = false;

        for (const range of ranges) {
            const tracked = this.trackedRanges.get(range);
            if (!tracked) {
                continue;
            }

            const previousRef = tracked.ref;
            const nextRef = rangeToRef(this.beans, range);
            if (!nextRef || nextRef === previousRef || nextRef === this.editingCellRef) {
                continue;
            }

            const tokenColorIndex = this.field.getColorIndexForToken(tracked.tokenIndex ?? null);
            const colorIndex =
                tokenColorIndex ??
                this.field.moveColorToRef(
                    previousRef,
                    nextRef,
                    getRangeColorIndexFromClass(range.colorClass) ?? undefined
                );

            const replacedIndex = this.field.replaceTokenRef(previousRef, nextRef, colorIndex, tracked.tokenIndex);
            if (replacedIndex == null) {
                continue;
            }

            tagRangeWithFormulaColor(range, nextRef, colorIndex);
            this.trackedRanges.set(range, { ref: nextRef, tokenIndex: replacedIndex ?? tracked.tokenIndex ?? null });
            this.removeTrackedRef(previousRef);
            this.addTrackedRef(nextRef);
            updated = true;
        }

        if (updated) {
            this.refreshRangeStyling();
        }

        return updated;
    }

    public override destroy(): void {
        this.clearTrackedRanges();
        super.destroy();
    }
}
