import type {
    AgComponentSelectorType,
    AgEventTypeParams,
    AgGridCommon,
    BeanCollection,
    CellRange,
    CellSelectionChangedEvent,
    GridOptionsService,
    GridOptionsWithDefaults,
} from 'ag-grid-community';
import { AgContentEditableField, _createElement, _last } from 'ag-grid-community';

import { agFormulaInputFieldCSS } from './agFormulaInputField.css-GENERATED';

// Allow partial ranges (eg "A1:") so we keep typing within the same token until a breaking operator is entered.
const CELL_OR_RANGE_REGEX = /\$?[A-Za-z]+\$?[0-9]+(?::\$?[A-Za-z]+\$?[0-9]+)?:?/g;
const FORMULA_TOKEN_COLOR_COUNT = 6;
const DISPLAY_OPERATOR_LOOKUP: Record<string, string> = {
    '/': '÷',
    '*': '×',
};
const VALUE_OPERATOR_LOOKUP: Record<string, string> = {
    '÷': '/',
    '×': '*',
};

export class AgFormulaInputField extends AgContentEditableField<
    BeanCollection,
    GridOptionsWithDefaults,
    AgEventTypeParams,
    AgGridCommon<any, any>,
    GridOptionsService,
    AgComponentSelectorType,
    string
> {
    private currentValue: string = '';
    private editingCellRef?: string;
    // Caret / token bookkeeping so range updates can re-render without losing position.
    private selectionCaretOffset: number | null = null;
    private lastTokenValueOffset: number | null = null;
    private lastTokenValueLength: number | null = null;
    private lastTokenCaretOffset: number | null = null;
    private lastTokenRef?: string;
    // All ranges created by this editor (used to clean up on destroy).
    private readonly trackedRangeRefs = new Set<string>();
    private readonly trackedRanges = new Map<CellRange, string>();
    // Used to skip token logic when we dispatch synthetic refresh events.
    private ignoreNextRangeEvent = false;
    // Stops programmatic range updates from re-entering our range event handler.
    private suppressRangeEvents = false;
    // Stable color assignment per token/ref so resizes keep their original hue.
    private readonly formulaColorByRef = new Map<string, number>();

    constructor() {
        // Keep renderValueToElement false so we fully control DOM rendering.
        super({ renderValueToElement: false, className: 'ag-formula-input-field' } as any);
        this.registerCSS(agFormulaInputFieldCSS);
    }

    public override postConstruct(): void {
        super.postConstruct();

        this.addManagedElementListeners(this.getContentElement(), {
            input: this.onContentInput.bind(this),
        });

        this.addManagedEventListeners({
            cellSelectionChanged: this.cellSelectionChanged.bind(this),
        });
    }

    public override setValue(value?: string | null, silent?: boolean): this {
        const text = value ?? '';
        const colorsChanged = this.updateFormulaColorsFromValue(text);
        this.renderFormula({
            value: text,
            currentValue: this.getCurrentValue(),
        });
        // We render tokens ourselves, so avoid the base class' setValue (which would re-render)
        // and delegate that task to setEditorValue to keep our cached value and the superclass in sync.
        const res = this.setEditorValue(text, silent);
        this.syncRangesFromFormula(text);
        if (colorsChanged && this.trackedRangeRefs.size) {
            // Keep overlays in sync with any new ref→color mapping.
            this.refreshRangeStyling();
        }
        return res;
    }

    public override destroy(): void {
        super.destroy();
        // Remove any ranges we created while editing so they don't linger after the editor closes.
        this.trackedRangeRefs.forEach((ref) => this.removeRangeForRef(ref));
        this.trackedRangeRefs.clear();
        this.trackedRanges.clear();
    }

    public getCurrentValue(): string {
        // Validation can run before our input handler updates `currentValue`, so always
        // re-serialise the DOM to stay in sync with what the user currently sees.
        const liveValue = serializeContent(this.getContentElement());

        if (liveValue !== this.currentValue) {
            this.setEditorValue(liveValue, true);
        }

        return this.currentValue;
    }

    public placeCaretAtEnd(): void {
        const contentEl = this.getContentElement();
        const selection = window.getSelection();

        if (!selection) {
            return;
        }

        const range = document.createRange();
        range.selectNodeContents(contentEl);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
    }

    public setEditingCellRef(column: any, rowIndex: number | null | undefined): void {
        const colRef = column ? this.beans.formula?.getColRef(column as any) : undefined;

        if (!colRef || rowIndex == null || rowIndex === undefined) {
            this.editingCellRef = undefined;
            return;
        }

        this.editingCellRef = `${colRef}${rowIndex + 1}`;
    }

    private setEditorValue(value: string, silent: boolean = false): this {
        this.currentValue = value;
        super.setValue(value, silent);
        return this;
    }

    private renderFormula(params: { value: string; currentValue: string; caret?: number | null }): void {
        renderFormula({
            contentElement: this.getContentElement(),
            getColorIndexForRef: this.getColorIndexForRef.bind(this),
            ...params,
        });
    }

    private getColorIndexForRef(ref: string): number | null {
        if (!shouldUseTokenColors(this.beans)) {
            return null;
        }
        const existing = this.formulaColorByRef.get(ref);

        if (existing != null) {
            return existing;
        }

        const next = this.formulaColorByRef.size % FORMULA_TOKEN_COLOR_COUNT;
        this.formulaColorByRef.set(ref, next);
        return next;
    }

    private moveColorToRef(fromRef: string | undefined, toRef: string, fallback?: number): number | null {
        const colorIndex =
            fromRef && this.formulaColorByRef.has(fromRef)
                ? this.getColorIndexForRef(fromRef)
                : fallback ?? this.formulaColorByRef.get(toRef) ?? this.getColorIndexForRef(toRef);

        if (fromRef && fromRef !== toRef) {
            this.formulaColorByRef.delete(fromRef);
        }

        if (colorIndex == null) {
            return null;
        }

        this.formulaColorByRef.set(toRef, colorIndex);
        return colorIndex;
    }

    private updateFormulaColorsFromValue(value: string): boolean {
        if (!shouldUseTokenColors(this.beans)) {
            const hadColors = this.formulaColorByRef.size > 0;
            this.formulaColorByRef.clear();
            return hadColors;
        }

        // Walk the formula left-to-right, capture the first occurrence of each distinct ref,
        // and assign colors in encounter order so token colors stay stable every time the
        // user re-enters the editor (A1 -> color1, next ref -> color2, etc.).
        // If the order/size changes (tokens added/removed/reordered) we return `true` and
        // callers re-render tokens and re-style tracked ranges so overlays stay in sync.
        const refsInOrder: string[] = [];
        const seen = new Set<string>();
        CELL_OR_RANGE_REGEX.lastIndex = 0;
        let match: RegExpExecArray | null;
        while ((match = CELL_OR_RANGE_REGEX.exec(value)) != null) {
            const ref = match[0];
            if (seen.has(ref)) {
                continue;
            }
            seen.add(ref);
            refsInOrder.push(ref);
        }

        let changed = refsInOrder.length !== this.formulaColorByRef.size;
        const nextColors = new Map<string, number>();
        refsInOrder.forEach((ref, index) => {
            const colorIndex = index % FORMULA_TOKEN_COLOR_COUNT;
            nextColors.set(ref, colorIndex);
            if (this.formulaColorByRef.get(ref) !== colorIndex) {
                changed = true;
            }
        });

        if (changed) {
            this.formulaColorByRef.clear();
            nextColors.forEach((colorIndex, ref) => this.formulaColorByRef.set(ref, colorIndex));
        }

        return changed;
    }

    private onContentInput(): void {
        const contentElement = this.getContentElement();
        const currentValue = this.getCurrentValue();
        const caret = getCaretOffset(contentElement, currentValue);
        const serialized = serializeContent(contentElement);
        const colorsChanged = this.updateFormulaColorsFromValue(serialized);

        this.renderFormula({
            currentValue,
            value: serialized,
            caret: caret ?? undefined,
        });
        this.setEditorValue(serialized);
        this.syncRangesFromFormula(serialized);

        if (colorsChanged && this.trackedRangeRefs.size) {
            this.refreshRangeStyling();
        }
    }

    private cellSelectionChanged(event: CellSelectionChangedEvent): void {
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

        // If a tracked range was resized (e.g. via handle drag), update the existing token instead of adding a new one.
        if (this.updateTrackedRangeTokens()) {
            return;
        }

        const ref = getLatestRangeRef(this.beans);

        if (!ref || ref === this.editingCellRef) {
            return;
        }

        this.tagLatestRangeForRef(ref);

        if (event.started) {
            // Remember caret to reapply after range selection inserts a token.
            this.selectionCaretOffset =
                getCaretOffset(this.getContentElement(), this.getCurrentValue()) ?? this.currentValue.length;
        }

        if (event.started && event.finished) {
            this.insertOrReplaceToken(ref, true, true);
            this.restoreCaretAfterToken();
            return;
        }

        if (!event.started && !event.finished) {
            this.insertOrReplaceToken(ref, false, false);
            return;
        }

        if (event.finished) {
            this.restoreCaretAfterToken();
        }
    }

    private insertOrReplaceToken(ref: string, isNew: boolean, manageRanges: boolean): void {
        const offsets = this.getTokenInsertOffsets(isNew);

        if (!offsets) {
            return;
        }

        const { caretOffset, valueOffset } = offsets;
        const replaceLen = isNew || this.lastTokenValueLength == null ? 0 : this.lastTokenValueLength;
        const value = this.getCurrentValue();
        const updatedValue = value.slice(0, valueOffset) + ref + value.slice(valueOffset + replaceLen);

        const previousRef = this.updateLastTokenTracking(ref, caretOffset, valueOffset);

        const colorsChanged = this.updateFormulaColorsFromValue(updatedValue);
        this.setEditorValue(updatedValue);
        this.renderFormula({
            currentValue: value,
            value: updatedValue,
            caret: caretOffset + ref.length,
        });
        this.dispatchLocalEvent({ type: 'fieldValueChanged' as any });
        if (manageRanges) {
            if (!isNew && previousRef && previousRef !== ref) {
                this.removeRangeForRef(previousRef);
            }
            this.addRangeForRef(ref, true);
        } else {
            // When dragging a range, we only track the latest ref; ranges will be reconciled later.
            if (!isNew && previousRef && previousRef !== ref) {
                this.trackedRangeRefs.delete(previousRef);
            }
            this.trackedRangeRefs.add(ref);
        }

        if (colorsChanged && this.trackedRangeRefs.size) {
            this.refreshRangeStyling();
        }
    }

    private restoreCaretAfterToken(): void {
        const caretBase =
            this.lastTokenCaretOffset ??
            getCaretOffset(this.getContentElement(), this.getCurrentValue()) ??
            this.currentValue.length;
        const caret = caretBase + (this.lastTokenValueLength ?? 0);
        this.selectionCaretOffset = null;

        setTimeout(() => {
            if (!this.isAlive()) {
                return;
            }
            this.getContentElement().focus({ preventScroll: true });
            restoreCaret(this.getContentElement(), caret);
        });
    }

    private getValueOffsetFromCaret(caretOffset: number): number | null {
        const container = this.getContentElement();
        let caretRemaining = caretOffset;
        let valueOffset = 0;

        for (const child of Array.from(container.childNodes)) {
            const caretLen = getNodeTextLength(child);
            const valueLen = getNodeText(child).length;

            if (caretRemaining <= caretLen) {
                // Tokens count as 1 caret unit but multiple value units.
                return valueOffset + (caretLen === valueLen ? caretRemaining : 0);
            }

            caretRemaining -= caretLen;
            valueOffset += valueLen;
        }

        return this.currentValue.length;
    }

    private getTokenInsertOffsets(isNew: boolean): { caretOffset: number; valueOffset: number } | null {
        const contentElement = this.getContentElement();
        const caretOffset =
            this.selectionCaretOffset ??
            getCaretOffset(contentElement, this.getCurrentValue()) ??
            this.currentValue.length;
        const valueOffset =
            isNew || this.lastTokenValueOffset == null
                ? this.getValueOffsetFromCaret(caretOffset)
                : this.lastTokenValueOffset;

        if (valueOffset == null) {
            return null;
        }

        return { caretOffset, valueOffset };
    }

    private updateLastTokenTracking(ref: string, caretOffset: number, valueOffset: number): string | undefined {
        const previousRef = this.lastTokenRef;
        this.lastTokenValueOffset = valueOffset;
        this.lastTokenValueLength = ref.length;
        this.lastTokenCaretOffset = caretOffset;
        this.lastTokenRef = ref;
        return previousRef;
    }

    private addRangeForRef(ref: string, skipAddCellRange?: boolean): void {
        if (this.trackedRangeRefs.has(ref)) {
            const existing = this.beans.rangeSvc
                ?.getCellRanges()
                .find((range) => rangeToRef(this.beans, range) === ref);

            if (existing) {
                const colorIndex = this.getColorIndexForRef(ref) ?? undefined;
                tagRangeWithFormulaColor(existing, ref, colorIndex);
                this.refreshRangeStyling();
            }

            return;
        }

        const beans = this.beans;

        const params = getCellRangeParams(beans, ref);
        const rangeSvc = beans.rangeSvc;

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
                .find((range) => rangeToRef(beans, range) === ref && range.startRow != null && range.endRow != null);
        }

        if (created) {
            const colorIndex = this.getColorIndexForRef(ref);
            tagRangeWithFormulaColor(created, ref, colorIndex);
            this.trackedRangeRefs.add(ref);
            this.trackedRanges.set(created, ref);
            this.refreshRangeStyling();
        }
    }

    private tagLatestRangeForRef(ref: string): void {
        const latest = _last(this.beans.rangeSvc?.getCellRanges() ?? []);

        if (latest) {
            const colorIndex = this.getColorIndexForRef(ref);
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

            // Restore any known color index for the ref (from formulaColorByRef) or infer from the range's class
            // so overlays stay consistent even if the grid recreated range objects.
            const existingColorIndex = this.formulaColorByRef.get(ref);
            const inferredColorIndex = getColorIndexFromClass(range.colorClass);
            const colorIndex = existingColorIndex ?? inferredColorIndex ?? this.getColorIndexForRef(ref);
            const { rangeClass } = getFormulaColorClasses(ref, colorIndex);

            if (colorIndex == null) {
                continue;
            }

            this.formulaColorByRef.set(ref, colorIndex);

            if (range.colorClass !== rangeClass) {
                // Re-tag the range with the desired class when it doesn't match our mapping.
                tagRangeWithFormulaColor(range, ref, colorIndex);
                retagged = true;
            }

            if (!this.trackedRanges.has(range)) {
                // Keep the mapping between the current CellRange object and its ref so resize moves can update tokens.
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

        // Re-tag in case the range objects were replaced by the grid.
        // ensureTrackedRangeColors pulls color indices from formulaColorByRef (which updateFormulaColorsFromValue
        // rebuilds whenever the formula text changes) and reapplies the range classes so overlays track token colors.
        this.ensureTrackedRangeColors();
        this.ignoreNextRangeEvent = true;
        eventSvc.dispatchEvent({
            type: 'cellSelectionChanged',
            started: false,
            finished: false,
        });
    }

    private removeRangeForRef(ref: string | undefined): void {
        if (!ref || !this.trackedRangeRefs.has(ref)) {
            return;
        }

        const beans = this.beans;
        const { rangeSvc } = beans;

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

        const remaining = ranges.filter((range) => rangeToRef(beans, range) !== ref);

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

    private syncRangesFromFormula(value?: string | null): void {
        const text = value ?? this.getCurrentValue() ?? '';
        const refs = getRefsFromText(text);

        // Remove any tracked ranges whose refs were deleted from the formula text.
        const toRemove: string[] = [];
        for (const tracked of this.trackedRangeRefs) {
            if (!refs.has(tracked)) {
                toRemove.push(tracked);
            }
        }

        toRemove.forEach((ref) => this.removeRangeForRef(ref));

        // Ensure ranges exist (and are tracked) for all refs currently present in the formula text.
        refs.forEach((ref) => {
            if (ref !== this.editingCellRef) {
                this.addRangeForRef(ref);
            }
        });

        // Drop any range mappings that no longer exist after syncing (e.g. grid recreated range objects).
        for (const [range, storedRef] of this.trackedRanges.entries()) {
            const rangeWasReplaced = !this.beans.rangeSvc?.getCellRanges().includes(range);
            if (!this.trackedRangeRefs.has(storedRef) || rangeWasReplaced) {
                // Remove stale mapping when the ref was removed or the grid replaced the range object.
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

            // Convert the current range shape to a ref and update the token if it changed (e.g. drag handle).
            const nextRef = rangeToRef(this.beans, range);
            if (!nextRef || nextRef === previousRef || nextRef === this.editingCellRef) {
                continue;
            }

            // Keep the color with the moved ref, preferring any existing class-derived index.
            const colorIndex = this.moveColorToRef(
                previousRef,
                nextRef,
                getColorIndexFromClass(range.colorClass) ?? undefined
            );

            if (!this.replaceTokenRef(previousRef, nextRef, colorIndex)) {
                continue;
            }

            // Re-tag the range and update mappings so future events use the new ref.
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

    private replaceTokenRef(previousRef: string, nextRef: string, colorIndex?: number | null): boolean {
        const contentElement = this.getContentElement();
        const token = Array.from(contentElement.querySelectorAll<HTMLElement>('.ag-formula-token')).find(
            (node) => getTokenRef(node) === previousRef
        );

        if (!token) {
            return false;
        }

        const caretOffset = getOffsetBeforeNode(contentElement, token);
        const valueOffset = getOffsetBeforeNode(contentElement, token, true);

        if (caretOffset == null || valueOffset == null) {
            return false;
        }

        const value = this.getCurrentValue();
        if (colorIndex != null) {
            this.formulaColorByRef.set(nextRef, colorIndex);
        }
        const updated = value.slice(0, valueOffset) + nextRef + value.slice(valueOffset + previousRef.length);
        const colorsChanged = this.updateFormulaColorsFromValue(updated);
        this.setEditorValue(updated);
        this.renderFormula({
            currentValue: value,
            value: updated,
            caret: caretOffset + nextRef.length,
        });
        this.dispatchLocalEvent({ type: 'fieldValueChanged' });
        if (colorsChanged && this.trackedRangeRefs.size) {
            this.refreshRangeStyling();
        }

        return true;
    }
}

// Color helpers
const shouldUseTokenColors = (beans: BeanCollection): boolean => {
    const { editSvc, rangeSvc } = beans;
    const canCreateRanges = !!rangeSvc && !!editSvc?.isRangeSelectionEnabledWhileEditing?.();

    return canCreateRanges;
};

const getFormulaColorClasses = (
    ref: string,
    colorIndexOverride?: number | null
): { tokenClass: string; rangeClass: string; colorIndex: number } => {
    const index = (colorIndexOverride ?? 0) + 1;

    return {
        tokenClass: `ag-formula-token-color-${index}`,
        rangeClass: `ag-formula-range-color-${index}`,
        colorIndex: index - 1,
    };
};
const getColorIndexFromClass = (colorClass?: string | null): number | null => {
    if (!colorClass) {
        return null;
    }

    const match = /ag-formula-range-color-(\d+)/.exec(colorClass);

    if (!match) {
        return null;
    }

    const parsed = parseInt(match[1], 10);
    return Number.isFinite(parsed) ? parsed - 1 : null;
};

const tagRangeWithFormulaColor = (range: CellRange | undefined, ref: string, colorIndex?: number | null): void => {
    if (!range) {
        return;
    }

    const { rangeClass } = getFormulaColorClasses(ref, colorIndex);
    range.colorClass = rangeClass;
};

// Rendering & caret helpers
const tokenize = (value: string, getColorIndexForRef: (ref: string) => number | null): Node[] => {
    const nodes: Node[] = [];
    let lastIndex = 0;
    CELL_OR_RANGE_REGEX.lastIndex = 0;

    let match: RegExpExecArray | null;

    while ((match = CELL_OR_RANGE_REGEX.exec(value)) != null) {
        const [text] = match;
        const index = match.index ?? 0;

        if (index > lastIndex) {
            nodes.push(document.createTextNode(formatForDisplay(value.slice(lastIndex, index))));
        }

        const colorIndex = getColorIndexForRef(text) ?? null;
        nodes.push(createReferenceNode(text, colorIndex, colorIndex != null));
        lastIndex = index + text.length;
    }

    if (lastIndex < value.length) {
        nodes.push(document.createTextNode(formatForDisplay(value.slice(lastIndex))));
    }

    if (!nodes.length) {
        nodes.push(document.createTextNode(''));
    }

    return nodes;
};

const createReferenceNode = (ref: string, colorIndex: number | null, useTokenColors: boolean): HTMLElement => {
    const attrs: Record<string, string> = {
        'aria-label': ref,
        'data-formula-ref': ref,
    };
    let tokenClass: string | undefined;
    if (useTokenColors && colorIndex != null) {
        const classes = getFormulaColorClasses(ref, colorIndex);
        tokenClass = classes.tokenClass;
        attrs['data-formula-range-class'] = classes.rangeClass;
    }
    const node = _createElement({
        tag: 'span',
        cls: 'ag-formula-token',
        attrs,
        children: ref,
    });

    if (tokenClass) {
        node.classList.add(tokenClass);
    }

    return node;
};

const renderFormula = (params: {
    contentElement: HTMLElement;
    currentValue: string;
    value: string;
    getColorIndexForRef: (ref: string) => number | null;
    caret?: number | null;
}): void => {
    const { contentElement, currentValue, value, getColorIndexForRef, caret } = params;
    const caretOffset = caret ?? getCaretOffset(contentElement, currentValue);
    const maxCaret = value.length;

    contentElement.textContent = '';

    for (const node of tokenize(value, getColorIndexForRef)) {
        contentElement.append(node);
    }

    const targetCaret = caretOffset != null ? Math.min(caretOffset, maxCaret) : null;
    restoreCaret(contentElement, targetCaret);
};

const getCaretOffset = (contentElement: HTMLElement, currentValue: string): number | null => {
    const selection = window.getSelection();

    if (!selection || selection.rangeCount === 0) {
        return currentValue?.length ?? null;
    }

    const range = selection.getRangeAt(0);

    if (!contentElement.contains(range.startContainer)) {
        return currentValue?.length ?? null;
    }

    // If the caret is directly on the container (between child nodes), the range offset is a
    // child index, so convert it to caret units by summing preceding child lengths.
    if (range.startContainer === contentElement) {
        let offset = 0;
        for (let i = 0; i < range.startOffset; i++) {
            offset += getNodeTextLength(contentElement.childNodes[i]);
        }
        return offset;
    }

    let offset = range.startOffset;
    let node: Node | null = range.startContainer;

    while (node && node !== contentElement) {
        let sibling = node.previousSibling;

        while (sibling) {
            offset += getNodeTextLength(sibling);
            sibling = sibling.previousSibling;
        }

        node = node.parentNode;
    }

    return offset;
};

const restoreCaret = (contentElement: HTMLElement, offset: number | null): void => {
    if (offset == null) {
        return;
    }

    const selection = window.getSelection();
    const range = document.createRange();
    const { node, localOffset } = findNodeAtOffset(contentElement, offset);

    if (!node || !selection || !contentElement.isConnected || !node.isConnected) {
        return;
    }

    range.setStart(node, localOffset);
    range.collapse(true);
    selection.removeAllRanges();
    try {
        selection.addRange(range);
    } catch {
        // Ignore invalid ranges when the editor is detached from the document.
    }
};

const findNodeAtOffset = (root: Node, offset: number): { node: Node | null; localOffset: number } => {
    let remaining = offset;

    for (let i = 0; i < root.childNodes.length; i++) {
        const child = root.childNodes[i];
        const length = getNodeTextLength(child);

        if (remaining > length) {
            remaining -= length;
            continue;
        }

        if (child.nodeType === Node.TEXT_NODE) {
            return { node: child, localOffset: remaining };
        }

        return findNodeAtOffset(child, remaining);
    }

    return { node: root, localOffset: root.childNodes.length };
};

const getOffsetBeforeNode = (container: HTMLElement, node: Node, useValueLength: boolean = false): number | null => {
    if (!container.contains(node)) {
        return null;
    }

    let offset = 0;
    for (const child of Array.from(container.childNodes)) {
        if (child === node) {
            return offset;
        }
        offset += useValueLength ? getNodeText(child).length : getNodeTextLength(child);
    }

    return null;
};

// Serialization helpers
const serializeContent = (contentElement: HTMLElement): string => {
    let output = '';

    contentElement.childNodes.forEach((child) => {
        output += getNodeText(child);
    });

    return output;
};

const getNodeText = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) {
        return formatForValue(node.textContent ?? '');
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
        return Array.from(node.childNodes)
            .map((child) => getNodeText(child))
            .join('');
    }

    return '';
};

const getNodeTextLength = (node: Node): number => {
    if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent?.length ?? 0;
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
        return Array.from(node.childNodes).reduce((sum, child) => sum + getNodeTextLength(child), 0);
    }

    return 0;
};

// Range helpers
const getCellRangeParams = (beans: BeanCollection, ref: string) => {
    const match = /^\$?([A-Za-z]+)\$?(\d+)(?::\$?([A-Za-z]+)\$?(\d+))?$/.exec(ref);
    if (!match) {
        return null;
    }

    const { formula } = beans;

    const [, startColRef, startRowStr, endColRef, endRowStr] = match;
    const startCol = formula?.getColByRef(startColRef);
    const endCol = formula?.getColByRef(endColRef ?? startColRef);

    if (!startCol || !endCol) {
        return null;
    }

    const rowStartIndex = parseInt(startRowStr, 10) - 1;
    const rowEndIndex = endRowStr ? parseInt(endRowStr, 10) - 1 : rowStartIndex;

    return {
        rowStartIndex,
        rowEndIndex,
        columnStart: startCol,
        columnEnd: endCol,
    };
};

const getLatestRangeRef = (beans: BeanCollection): string | null => {
    const ranges = beans.rangeSvc?.getCellRanges();
    const latest = ranges?.length ? _last(ranges) : null;

    if (!latest) {
        return null;
    }

    return rangeToRef(beans, latest);
};

const rangeToRef = (beans: BeanCollection, range: CellRange): string | null => {
    const { rangeSvc, formula } = beans;

    if (!rangeSvc || !formula) {
        return null;
    }

    const startRow = rangeSvc.getRangeStartRow(range);
    const endRow = rangeSvc.getRangeEndRow(range);

    if (!startRow || !endRow || startRow.rowPinned || endRow.rowPinned) {
        return null;
    }

    const rowStartIndex = Math.min(startRow.rowIndex!, endRow.rowIndex!) + 1;
    const rowEndIndex = Math.max(startRow.rowIndex!, endRow.rowIndex!) + 1;

    const columns = range.columns;

    if (!columns?.length) {
        return null;
    }

    const sorted = [...columns];
    const startCol = sorted[0];
    const endCol = sorted[sorted.length - 1];

    const colStartRef = formula.getColRef(startCol as any);
    const colEndRef = formula.getColRef(endCol as any);

    if (!colStartRef || !colEndRef) {
        return null;
    }

    const sameCol = colStartRef === colEndRef;
    const sameRow = rowStartIndex === rowEndIndex;

    if (sameCol && sameRow) {
        return `${colStartRef}${rowStartIndex}`;
    }

    return `${colStartRef}${rowStartIndex}:${colEndRef}${rowEndIndex}`;
};

const getRefsFromText = (text: string): Set<string> => {
    // Extract all A1-style refs/ranges from raw text to keep grid ranges in sync.
    const refs = new Set<string>();
    let match: RegExpExecArray | null;
    CELL_OR_RANGE_REGEX.lastIndex = 0;
    while ((match = CELL_OR_RANGE_REGEX.exec(text)) != null) {
        refs.add(match[0]);
    }
    return refs;
};

// Token helpers
const getTokenRef = (tokenEl: HTMLElement): string =>
    formatForValue(tokenEl.textContent ?? tokenEl.dataset.formulaRef ?? '');

// Text formatting helpers
const formatForDisplay = (text: string): string =>
    text.replace(/[/*]/g, (match) => DISPLAY_OPERATOR_LOOKUP[match] ?? match);

const formatForValue = (text: string): string =>
    text.replace(/[÷×]/g, (match) => VALUE_OPERATOR_LOOKUP[match] ?? match);
