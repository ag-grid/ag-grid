import { BeanStub } from 'ag-grid-community';
import type { CellRange, CellSelectionChangedEvent, Column } from 'ag-grid-community';

import type { AgFormulaInputField } from './agFormulaInputField';
import {
    getCellRangeParams,
    getColorClassesForRef,
    getLatestRangeRef,
    getRangeColorIndexFromClass,
    getRefsFromText,
    rangeToRef,
    tagRangeWithFormulaColor,
} from './formulaRangeUtils';

export class FormulaInputRangeSyncFeature extends BeanStub {
    private rangeSelectionEnabled = false;
    private editingCellRef?: string;
    private editingColumn?: Column;
    private editingRowIndex?: number;
    private readonly trackedRangeRefs = new Set<string>();
    private readonly trackedRanges = new Map<CellRange, string>();
    private suppressRangeEvents = false;
    private ignoreNextRangeEvent = false;
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
        const refs = Array.from(this.trackedRangeRefs);
        refs.forEach((ref) => this.removeRangeForRef(ref));
        this.trackedRangeRefs.clear();
        this.trackedRanges.clear();
    }

    private syncRangesFromFormula(value?: string | null): void {
        const text = value ?? this.field.getCurrentValue() ?? '';
        if (!this.rangeSelectionEnabled) {
            this.clearTrackedRanges();
            return;
        }

        const refs = getRefsFromText(text);

        const toRemove: string[] = [];
        for (const tracked of this.trackedRangeRefs) {
            if (!refs.has(tracked)) {
                toRemove.push(tracked);
            }
        }
        toRemove.forEach((ref) => this.removeRangeForRef(ref));

        refs.forEach((ref) => {
            if (ref !== this.editingCellRef) {
                this.addRangeForRef(ref);
            }
        });

        for (const [range, storedRef] of this.trackedRanges.entries()) {
            const rangeWasReplaced = !this.beans.rangeSvc?.getCellRanges().includes(range);
            if (!this.trackedRangeRefs.has(storedRef) || rangeWasReplaced) {
                this.trackedRanges.delete(range);
            }
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

        const retagged = this.ensureTrackedRangeColors();

        if (this.suppressRangeEvents) {
            if (retagged) {
                this.refreshRangeStyling();
            }
            return;
        }

        if (this.updateTrackedRangeTokens()) {
            return;
        }

        const ref = getLatestRangeRef(this.beans);

        if (!ref || ref === this.editingCellRef) {
            this.refocusEditingCell();
            return;
        }

        this.tagLatestRangeForRef(ref);

        if (event.started) {
            this.field.rememberCaret();
        }

        if (event.started && event.finished) {
            const previousRef = this.field.insertOrReplaceToken(ref, true);
            this.handleRangeTokenUpdate(previousRef, ref, true, true);
            this.field.restoreCaretAfterToken();
            this.refocusEditingCell();
            return;
        }

        if (!event.started && !event.finished) {
            const previousRef = this.field.insertOrReplaceToken(ref, false);
            this.handleRangeTokenUpdate(previousRef, ref, false, false);
            this.refocusEditingCell();
            return;
        }

        if (event.finished) {
            this.field.restoreCaretAfterToken();
            this.refocusEditingCell();
        }
    }

    private handleRangeTokenUpdate(
        previousRef: string | undefined,
        ref: string,
        manageRanges: boolean,
        isNew: boolean
    ): void {
        if (manageRanges) {
            if (!isNew && previousRef && previousRef !== ref) {
                this.removeRangeForRef(previousRef);
            }
            this.addRangeForRef(ref, true);
            return;
        }

        if (!isNew && previousRef && previousRef !== ref) {
            this.trackedRangeRefs.delete(previousRef);
        }
        this.trackedRangeRefs.add(ref);
    }

    private addRangeForRef(ref: string, skipAddCellRange?: boolean): void {
        if (this.trackedRangeRefs.has(ref)) {
            const existing = this.beans.rangeSvc
                ?.getCellRanges()
                .find((range) => rangeToRef(this.beans, range) === ref);

            if (existing) {
                const colorIndex = this.field.getColorIndexForRef(ref) ?? undefined;
                tagRangeWithFormulaColor(existing, ref, colorIndex);
                this.refreshRangeStyling();
            }

            return;
        }

        const params = getCellRangeParams(this.beans, ref);
        const rangeSvc = this.beans.rangeSvc;

        if (!params || !rangeSvc) {
            return;
        }

        let created: CellRange | undefined;

        if (!skipAddCellRange) {
            this.suppressRangeEvents = true;
            created = rangeSvc.addCellRange(params);
            this.suppressRangeEvents = false;
        } else {
            created = rangeSvc
                .getCellRanges()
                .find(
                    (range) => rangeToRef(this.beans, range) === ref && range.startRow != null && range.endRow != null
                );
        }

        if (created) {
            const colorIndex = this.field.getColorIndexForRef(ref);
            tagRangeWithFormulaColor(created, ref, colorIndex);
            this.trackedRangeRefs.add(ref);
            this.trackedRanges.set(created, ref);
            this.refreshRangeStyling();
        }
    }

    private tagLatestRangeForRef(ref: string): void {
        const ranges = this.beans.rangeSvc?.getCellRanges();
        const latest = ranges?.length ? ranges[ranges.length - 1] : null;

        if (latest) {
            const colorIndex = this.field.getColorIndexForRef(ref);
            tagRangeWithFormulaColor(latest, ref, colorIndex);
            this.refreshRangeStyling();
        }
    }

    private ensureTrackedRangeColors(): boolean {
        const rangeSvc = this.beans.rangeSvc;

        if (!rangeSvc) {
            return false;
        }

        const ranges = rangeSvc.getCellRanges();
        let retagged = false;

        for (const range of ranges) {
            const ref = rangeToRef(this.beans, range);
            if (!ref || !this.trackedRangeRefs.has(ref)) {
                continue;
            }

            const inferredColorIndex = getRangeColorIndexFromClass(range.colorClass);
            const colorIndex = this.field.moveColorToRef(undefined, ref, inferredColorIndex ?? undefined);

            if (colorIndex == null) {
                continue;
            }

            const { rangeClass } = getColorClassesForRef(ref, colorIndex);

            if (range.colorClass !== rangeClass) {
                tagRangeWithFormulaColor(range, ref, colorIndex);
                retagged = true;
            }

            if (!this.trackedRanges.has(range)) {
                this.trackedRanges.set(range, ref);
            }
        }

        return retagged;
    }

    private refreshRangeStyling(): void {
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

    private removeRangeForRef(ref: string | undefined): void {
        if (!ref || !this.trackedRangeRefs.has(ref)) {
            return;
        }

        const { rangeSvc } = this.beans;

        if (!rangeSvc) {
            this.trackedRangeRefs.delete(ref);
            return;
        }

        const ranges = rangeSvc.getCellRanges();
        if (!ranges?.length) {
            this.trackedRangeRefs.delete(ref);
            for (const [range, storedRef] of this.trackedRanges.entries()) {
                if (storedRef === ref) {
                    this.trackedRanges.delete(range);
                }
            }
            return;
        }

        const remaining = ranges.filter((range) => rangeToRef(this.beans, range) !== ref);

        if (remaining.length === ranges.length) {
            this.trackedRangeRefs.delete(ref);
            for (const [range, storedRef] of this.trackedRanges.entries()) {
                if (storedRef === ref) {
                    this.trackedRanges.delete(range);
                }
            }
            return;
        }

        this.suppressRangeEvents = true;
        rangeSvc.setCellRanges(remaining);
        this.suppressRangeEvents = false;
        this.trackedRangeRefs.delete(ref);
        for (const [range, storedRef] of this.trackedRanges.entries()) {
            if (storedRef === ref) {
                this.trackedRanges.delete(range);
            }
        }
    }

    private updateTrackedRangeTokens(): boolean {
        const rangeSvc = this.beans.rangeSvc;
        if (!rangeSvc) {
            return false;
        }

        const ranges = rangeSvc.getCellRanges();
        let updated = false;

        for (const range of ranges) {
            const previousRef = this.trackedRanges.get(range);
            if (!previousRef) {
                continue;
            }

            const nextRef = rangeToRef(this.beans, range);
            if (!nextRef || nextRef === previousRef || nextRef === this.editingCellRef) {
                continue;
            }

            const colorIndex = this.field.moveColorToRef(
                previousRef,
                nextRef,
                getRangeColorIndexFromClass(range.colorClass) ?? undefined
            );

            if (!this.field.replaceTokenRef(previousRef, nextRef, colorIndex)) {
                continue;
            }

            tagRangeWithFormulaColor(range, nextRef, colorIndex);
            this.trackedRanges.set(range, nextRef);
            this.trackedRangeRefs.delete(previousRef);
            this.trackedRangeRefs.add(nextRef);
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
