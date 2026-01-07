import type {
    AgComponentSelectorType,
    AgEventTypeParams,
    AgGridCommon,
    BeanCollection,
    GridOptionsService,
    GridOptionsWithDefaults,
} from 'ag-grid-community';
import { AgContentEditableField, _createElement } from 'ag-grid-community';

import { agFormulaInputFieldCSS } from './agFormulaInputField.css-GENERATED';
import { FormulaInputRangeSyncFeature } from './formulaInputRangeSyncFeature';
import { CELL_OR_RANGE_REGEX, getColorClassesForRef } from './formulaRangeUtils';

const FORMULA_TOKEN_COLOR_COUNT = 7;
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
    // Caret / token bookkeeping so range updates can re-render without losing position.
    private selectionCaretOffset: number | null = null;
    private lastTokenValueOffset: number | null = null;
    private lastTokenValueLength: number | null = null;
    private lastTokenCaretOffset: number | null = null;
    private lastTokenRef?: string;
    private rangeSyncFeature?: FormulaInputRangeSyncFeature;
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

        this.rangeSyncFeature = this.createManagedBean(new FormulaInputRangeSyncFeature(this));
    }

    public override setValue(value?: string | null, silent?: boolean): this {
        const text = value == null ? '' : String(value);
        const { isFormula, hasFormulaPrefix } = this.getFormulaState(text);

        if (!isFormula) {
            // Plain values: render as simple text with no token parsing or range syncing.
            this.formulaColorByRef.clear();
            this.renderPlainValue(text);
            const res = this.setEditorValue(text, silent);
            this.dispatchLocalEvent({ type: 'fieldValueChanged' as any });
            this.rangeSyncFeature?.onValueUpdated(text, hasFormulaPrefix);
            return res;
        }

        this.updateFormulaColorsFromValue(text);
        this.renderFormula({
            value: text,
            currentValue: this.getCurrentValue(),
        });
        // We render tokens ourselves, so avoid the base class' setValue (which would re-render)
        // and delegate that task to setEditorValue to keep our cached value and the superclass in sync.
        const res = this.setEditorValue(text, silent);
        this.rangeSyncFeature?.onValueUpdated(text, hasFormulaPrefix);
        return res;
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
        const editingCellRef =
            colRef && rowIndex != null && rowIndex !== undefined ? `${colRef}${rowIndex + 1}` : undefined;

        if (!editingCellRef) {
            this.rangeSyncFeature?.setEditingCellRef(undefined, undefined, undefined);
            return;
        }

        this.rangeSyncFeature?.setEditingCellRef(column, rowIndex, editingCellRef);
    }

    public rememberCaret(): void {
        const caretOffset = getCaretOffset(this.getContentElement(), this.getCurrentValue());
        this.selectionCaretOffset = caretOffset ?? this.currentValue.length;
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

    private renderPlainValue(value: string, caret?: number | null): void {
        const contentElement = this.getContentElement();
        const caretOffset = caret ?? getCaretOffset(contentElement, this.currentValue);
        contentElement.textContent = value ?? '';
        const targetCaret = caretOffset != null ? Math.min(caretOffset, value.length) : null;
        restoreCaret(contentElement, targetCaret);
    }

    public getColorIndexForRef(ref: string): number | null {
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

    public moveColorToRef(fromRef: string | undefined, toRef: string, fallback?: number): number | null {
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

    private updateFormulaColorsFromValue(value: string): void {
        value = value == null ? '' : String(value);
        if (!shouldUseTokenColors(this.beans)) {
            this.formulaColorByRef.clear();
            return;
        }

        const refsInOrder = getOrderedRefs(value);
        let changed = refsInOrder.length !== this.formulaColorByRef.size;
        const nextColors = new Map<string, number>();
        refsInOrder.forEach((ref, index) => {
            const colorIndex = index % FORMULA_TOKEN_COLOR_COUNT;
            nextColors.set(ref, colorIndex);
            if (this.formulaColorByRef.get(ref) !== colorIndex) {
                changed = true;
            }
        });

        if (!changed) {
            return;
        }

        this.formulaColorByRef.clear();
        nextColors.forEach((colorIndex, ref) => this.formulaColorByRef.set(ref, colorIndex));
    }

    private onContentInput(): void {
        const contentElement = this.getContentElement();
        const currentValue = this.getCurrentValue();
        const caret = getCaretOffset(contentElement, currentValue);
        const serialized = serializeContent(contentElement);
        const { isFormula, hasFormulaPrefix } = this.getFormulaState(serialized);

        if (!isFormula) {
            this.formulaColorByRef.clear();
            this.renderPlainValue(serialized, caret);
            this.setEditorValue(serialized);
            this.dispatchLocalEvent({ type: 'fieldValueChanged' as any });
            this.rangeSyncFeature?.onValueUpdated(serialized, hasFormulaPrefix);
            return;
        }

        this.updateFormulaColorsFromValue(serialized);
        this.renderFormula({
            currentValue,
            value: serialized,
            caret: caret ?? undefined,
        });
        this.setEditorValue(serialized);
        this.dispatchLocalEvent({ type: 'fieldValueChanged' as any });
        this.rangeSyncFeature?.onValueUpdated(serialized, hasFormulaPrefix);
    }

    public insertOrReplaceToken(ref: string, isNew: boolean): string | undefined {
        const offsets = this.getTokenInsertOffsets(isNew);

        if (!offsets) {
            return undefined;
        }

        const { caretOffset, valueOffset } = offsets;
        const replaceLen = isNew || this.lastTokenValueLength == null ? 0 : this.lastTokenValueLength;
        const value = this.getCurrentValue();
        const updatedValue = value.slice(0, valueOffset) + ref + value.slice(valueOffset + replaceLen);

        const previousRef = this.updateLastTokenTracking(ref, caretOffset, valueOffset);

        this.updateFormulaColorsFromValue(updatedValue);
        this.setEditorValue(updatedValue);
        this.renderFormula({
            currentValue: value,
            value: updatedValue,
            caret: caretOffset + ref.length,
        });
        this.dispatchLocalEvent({ type: 'fieldValueChanged' as any });

        return previousRef;
    }

    public restoreCaretAfterToken(): void {
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

    private getFormulaState(text: string): { isFormula: boolean; hasFormulaPrefix: boolean } {
        // Unlike formulaSvc.isFormula (requires length > 1), we treat bare "=" as formula input
        // so clicking a cell to insert a range doesn't close the editor.
        const hasFormulaPrefix = text.trimStart().startsWith('=');
        const isFormula = this.beans.formula?.isFormula(text) ?? hasFormulaPrefix;
        return { isFormula, hasFormulaPrefix };
    }

    public replaceTokenRef(previousRef: string, nextRef: string, colorIndex?: number | null): boolean {
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
        this.updateFormulaColorsFromValue(updated);
        this.updateLastTokenTracking(nextRef, caretOffset, valueOffset);
        this.setEditorValue(updated);
        this.renderFormula({
            currentValue: value,
            value: updated,
            caret: caretOffset + nextRef.length,
        });
        this.dispatchLocalEvent({ type: 'fieldValueChanged' });

        return true;
    }
}

// Token/range color helpers
const shouldUseTokenColors = (beans: BeanCollection): boolean => {
    const { editSvc, rangeSvc } = beans;
    const canCreateRanges = !!rangeSvc && !!editSvc?.isRangeSelectionEnabledWhileEditing?.();

    return canCreateRanges;
};

// Walk the formula left-to-right, capture the first occurrence of each distinct ref,
// and assign colors in encounter order so token colors stay stable every time the
// user re-enters the editor (A1 -> color1, next ref -> color2, etc.).
const getOrderedRefs = (value: string): string[] => {
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
    return refsInOrder;
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

        const colorIndex = getColorIndexForRef(text);
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
        const classes = getColorClassesForRef(ref, colorIndex);
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

// Token helpers
const getTokenRef = (tokenEl: HTMLElement): string =>
    formatForValue(tokenEl.textContent ?? tokenEl.dataset.formulaRef ?? '');

// Text formatting helpers
const formatForDisplay = (text: string): string =>
    text.replace(/[/*]/g, (match) => DISPLAY_OPERATOR_LOOKUP[match] ?? match);

const formatForValue = (text: string): string =>
    text.replace(/[÷×]/g, (match) => VALUE_OPERATOR_LOOKUP[match] ?? match);
