import { _getDocument, _getWindow, _placeCaretAtEnd } from 'ag-stack';

import type {
    AgComponentSelectorType,
    AgEventTypeParams,
    AgGridCommon,
    BeanCollection,
    GridOptionsService,
    GridOptionsWithDefaults,
} from 'ag-grid-community';
import { AgContentEditableField, _createElement } from 'ag-grid-community';

import agAutocompleteCSS from '../advancedFilter/autocomplete/agAutocomplete.css';
import { getRefTokenMatches } from '../formula/refUtils';
import agFormulaInputFieldCSS from './agFormulaInputField.css';
import { FormulaInputAutocompleteFeature } from './formulaInputAutocompleteFeature';
import { FormulaInputRangeSyncFeature } from './formulaInputRangeSyncFeature';
import { TOKEN_INSERT_AFTER_CHARS, getPreviousNonSpaceChar } from './formulaInputTokenUtils';
import { getColorClassesForRef, getRefTokenMatchesForFormula } from './formulaRangeUtils';

const FORMULA_TOKEN_COLOR_COUNT = 7;
const DISPLAY_OPERATOR_LOOKUP: Record<string, string> = {
    '/': '÷',
    '*': '×',
};
const VALUE_OPERATOR_LOOKUP: Record<string, string> = {
    '÷': '/',
    '×': '*',
};
type RangeInsertAction = 'insert' | 'replace' | 'none';
type TokenMatch = { ref: string; start: number; end: number; index: number };
type TokenInsertResult = { previousRef?: string; tokenIndex?: number | null };

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
    // caret / token bookkeeping so range updates can re-render without losing position.
    private selectionCaretOffset: number | null = null;
    private lastTokenValueOffset: number | null = null;
    private lastTokenValueLength: number | null = null;
    private lastTokenCaretOffset: number | null = null;
    private lastTokenRef?: string;
    private rangeSyncFeature?: FormulaInputRangeSyncFeature;
    private autocompleteFeature?: FormulaInputAutocompleteFeature;
    // record mouse focus so we don't jump the caret to the end after a click.
    private focusFromMouseTime: number | null = null;
    // skip auto-caret placement when we are restoring a caret programmatically.
    private suppressNextFocusCaretPlacement = false;
    // fallback color assignment per ref when a token index is unavailable.

    private readonly formulaColorByRef = new Map<string, number>();

    constructor() {
        // keep renderValueToElement false so we fully control DOM rendering.
        super({ renderValueToElement: false, className: 'ag-formula-input-field' } as any);
        this.registerCSS(agFormulaInputFieldCSS);
        this.registerCSS(agAutocompleteCSS);
    }

    public override postConstruct(): void {
        super.postConstruct();

        this.rangeSyncFeature = this.createManagedBean(new FormulaInputRangeSyncFeature(this));
        this.autocompleteFeature = this.createManagedBean(new FormulaInputAutocompleteFeature(this));

        this.addManagedElementListeners(this.getContentElement(), {
            input: this.onContentInput.bind(this),
            focus: this.onContentFocus.bind(this),
            blur: this.onContentBlur.bind(this),
            mousedown: this.onContentMouseDown.bind(this),
        });
    }

    public override setValue(value?: string | null, silent?: boolean): this {
        const text = value == null ? '' : String(value);
        const { isFormula, hasFormulaPrefix } = this.getFormulaState(text);

        if (!isFormula) {
            // plain values: render as simple text with no token parsing or range syncing.
            this.applyPlainValue(text, { silent, dispatch: true });
            this.rangeSyncFeature?.onValueUpdated(text, hasFormulaPrefix);
            return this;
        }

        this.applyFormulaValue(text, { currentValue: this.getCurrentValue(), silent });
        this.rangeSyncFeature?.onValueUpdated(text, hasFormulaPrefix);
        return this;
    }

    public getCurrentValue(): string {
        // validation can run before our input handler updates `currentValue`, so always
        // re-serialise the DOM to stay in sync with what the user currently sees.
        const liveValue = serializeContent(this.getContentElement());

        if (liveValue !== this.currentValue) {
            this.setEditorValue(liveValue, true);
        }

        return this.currentValue;
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
        const caretOffset = getCaretOffset(this.beans, this.getContentElement(), this.getCurrentValue());
        this.selectionCaretOffset = caretOffset ?? this.currentValue.length;
    }

    private setEditorValue(value: string, silent: boolean = false): this {
        this.currentValue = value;
        super.setValue(value, silent);
        return this;
    }

    private renderFormula(params: { value: string; currentValue: string; caret?: number | null }): void {
        renderFormula({
            beans: this.beans,
            contentElement: this.getContentElement(),
            getColorIndexForToken: this.getColorIndexForToken.bind(this),
            ...params,
        });
    }

    private renderPlainValue(value: string, caret?: number | null): void {
        const contentElement = this.getContentElement();
        const caretOffset = caret ?? getCaretOffset(this.beans, contentElement, this.currentValue);
        contentElement.textContent = value ?? '';
        const targetCaret = caretOffset != null ? Math.min(caretOffset, value.length) : null;
        restoreCaret(this.beans, contentElement, targetCaret);
    }

    public withSelectionChangeHandlingSuppressed(action: () => void): void {
        if (!this.rangeSyncFeature) {
            action();
            return;
        }
        // proxy to the range sync feature so tab navigation doesn't rewrite formulas.
        this.rangeSyncFeature.withSelectionChangeHandlingSuppressed(action);
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

    public getColorIndexForToken(tokenIndex?: number | null): number | null {
        if (!shouldUseTokenColors(this.beans) || tokenIndex == null) {
            return null;
        }
        return tokenIndex % FORMULA_TOKEN_COLOR_COUNT;
    }

    public hasColorForRef(ref: string): boolean {
        return this.formulaColorByRef.has(ref);
    }

    public moveColorToRef(fromRef: string | undefined, toRef: string, fallback?: number): number | null {
        const colorIndex =
            fromRef && this.formulaColorByRef.has(fromRef)
                ? this.getColorIndexForRef(fromRef)
                : (fallback ?? this.formulaColorByRef.get(toRef) ?? this.getColorIndexForRef(toRef));

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

        const refsInOrder = getOrderedRefs(this.beans, value);
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
        const caret = getCaretOffset(this.beans, contentElement, currentValue);
        const serialized = serializeContent(contentElement);
        const { isFormula, hasFormulaPrefix } = this.getFormulaState(serialized);

        if (!isFormula) {
            this.applyPlainValue(serialized, { caret, dispatch: true });
            this.rangeSyncFeature?.onValueUpdated(serialized, hasFormulaPrefix);
            return;
        }

        this.applyFormulaValue(serialized, { currentValue, caret: caret ?? undefined, dispatch: true });
        this.rangeSyncFeature?.onValueUpdated(serialized, hasFormulaPrefix);
    }

    private onContentFocus(): void {
        this.rangeSyncFeature?.setEditorActive(true);
        // avoid overriding caret placement after token updates.
        if (this.suppressNextFocusCaretPlacement) {
            this.suppressNextFocusCaretPlacement = false;
            return;
        }
        const { focusFromMouseTime } = this;
        const focusFromMouse = focusFromMouseTime != null;
        this.focusFromMouseTime = null;
        if (focusFromMouse) {
            return;
        }
        // keyboard focus should land at the end for fast append editing.
        _placeCaretAtEnd(this.beans, this.getContentElement());
    }

    private onContentBlur(event: FocusEvent): void {
        this.focusFromMouseTime = null;
        const nextTarget = event.relatedTarget as HTMLElement | null;
        // only deactivate when moving to another cell editor inside the grid.
        const editorTarget = nextTarget?.closest('.ag-cell-editor');
        const cellTarget = nextTarget?.closest('.ag-cell');
        if (!nextTarget || this.getGui().contains(nextTarget) || !editorTarget || !cellTarget) {
            return;
        }
        this.rangeSyncFeature?.deactivateForFocusLoss();
    }

    private onContentMouseDown(): void {
        this.focusFromMouseTime = Date.now();
    }

    public insertOrReplaceToken(ref: string, isNew: boolean): TokenInsertResult {
        const offsets = this.getTokenInsertOffsets(isNew);

        if (!offsets) {
            return {};
        }

        const { caretOffset, valueOffset } = offsets;
        const replaceLen = isNew || this.lastTokenValueLength == null ? 0 : this.lastTokenValueLength;
        const value = this.getCurrentValue();
        const updatedValue = value.slice(0, valueOffset) + ref + value.slice(valueOffset + replaceLen);
        const tokenIndex = getTokenMatchAtOffset(this.beans, updatedValue, valueOffset)?.index ?? null;
        let previousRef: string | undefined;
        this.applyFormulaValueChange({
            currentValue: value,
            nextValue: updatedValue,
            caret: caretOffset + ref.length,
            updateTracking: () => {
                previousRef = this.updateLastTokenTracking(ref, caretOffset, valueOffset);
            },
        });

        return { previousRef, tokenIndex };
    }

    public removeTokenRef(ref: string, tokenIndex?: number | null): boolean {
        const value = this.getCurrentValue();
        const matches = getRefTokenMatchesForFormula(this.beans, value);
        let token: TokenMatch | undefined;

        if (tokenIndex != null) {
            token = matches.find((match) => match.index === tokenIndex);
            if (token && token.ref !== ref) {
                token = undefined;
            }
        }

        if (!token) {
            token = matches.find((match) => match.ref === ref);
        }

        if (!token) {
            return false;
        }

        const updated = value.slice(0, token.start) + value.slice(token.end);
        const caretBase = this.selectionCaretOffset ?? token.start;
        const caret = Math.min(caretBase, updated.length);
        this.applyFormulaValueChange({
            currentValue: value,
            nextValue: updated,
            caret,
            updateTracking: () => {
                this.lastTokenValueOffset = null;
                this.lastTokenValueLength = null;
                this.lastTokenCaretOffset = caret;
                this.lastTokenRef = undefined;
            },
        });

        return true;
    }

    public applyRangeInsert(ref: string): {
        action: RangeInsertAction;
        previousRef?: string;
        tokenIndex?: number | null;
    } {
        const value = this.getCurrentValue();
        const caretOffsets = this.getCaretOffsets(value);

        if (!caretOffsets) {
            // fall back to standard insert if we cannot resolve caret offsets.
            const { previousRef, tokenIndex } = this.insertOrReplaceToken(ref, true);
            return { action: 'insert', previousRef, tokenIndex };
        }

        const { valueOffset } = caretOffsets;
        // if the caret is inside/adjacent to a token, replace that token.
        const tokenMatch = getTokenMatchAtOffset(this.beans, value, valueOffset);

        if (tokenMatch) {
            const { end: tokenEnd, ref: tokenRef } = tokenMatch;
            // if the user is completing a partial range like "A1:", keep the range and insert the end ref.
            if (tokenRef.endsWith(':') && valueOffset === tokenEnd) {
                const { previousRef, tokenIndex } = this.insertOrReplaceToken(ref, true);
                return { action: 'insert', previousRef, tokenIndex };
            }
            const { previousRef, tokenIndex } = this.replaceTokenAtMatch(tokenMatch, ref);
            return { action: 'replace', previousRef, tokenIndex };
        }

        // allow replacement for A1-like refs even when they are invalid for the current grid state.
        const rawTokenMatch = getRawTokenMatchAtOffset(value, valueOffset);
        if (rawTokenMatch) {
            const updated = value.slice(0, rawTokenMatch.start) + ref + value.slice(rawTokenMatch.end);
            const tokenIndex = getTokenMatchAtOffset(this.beans, updated, rawTokenMatch.start)?.index ?? null;
            const { previousRef } = this.replaceTokenAtMatch(rawTokenMatch, ref, tokenIndex);
            return { action: 'replace', previousRef, tokenIndex };
        }

        // only insert new refs after operator-like chars; otherwise we end the edit on click.
        if (!shouldInsertTokenAtOffset(value, valueOffset)) {
            return { action: 'none' };
        }

        const { previousRef, tokenIndex } = this.insertOrReplaceToken(ref, true);
        return { action: 'insert', previousRef, tokenIndex };
    }

    public restoreCaretAfterToken(): void {
        const caretBase =
            this.lastTokenCaretOffset ??
            getCaretOffset(this.beans, this.getContentElement(), this.getCurrentValue()) ??
            this.currentValue.length;
        const caret = caretBase + (this.lastTokenValueLength ?? 0);
        this.selectionCaretOffset = null;
        // avoid onFocus forcing the caret to the end while we restore its position.
        this.suppressNextFocusCaretPlacement = true;

        setTimeout(() => {
            if (!this.isAlive()) {
                return;
            }
            this.getContentElement().focus({ preventScroll: true });
            if (_getDocument(this.beans).activeElement === this.getContentElement()) {
                this.suppressNextFocusCaretPlacement = false;
            }
            restoreCaret(this.beans, this.getContentElement(), caret);
        });
    }

    private replaceTokenAtMatch(
        token: TokenMatch,
        nextRef: string,
        tokenIndexOverride?: number | null
    ): TokenInsertResult {
        // replace the exact token span so we don't accidentally touch adjacent text.
        const value = this.getCurrentValue();
        const updated = value.slice(0, token.start) + nextRef + value.slice(token.end);

        this.applyFormulaValueChange({
            currentValue: value,
            nextValue: updated,
            caret: token.start + nextRef.length,
            updateTracking: () => {
                this.updateLastTokenTracking(nextRef, token.start, token.start);
            },
        });

        // preserve the caller's token index if it was recomputed for the updated value.
        return { previousRef: token.ref, tokenIndex: tokenIndexOverride ?? token.index };
    }

    private getValueOffsetFromCaret(caretOffset: number): number | null {
        // convert caret units (tokens count as 1) into value offsets (tokens count as their length).
        const container = this.getContentElement();
        let caretRemaining = caretOffset;
        let valueOffset = 0;

        for (const child of Array.from(container.childNodes)) {
            const caretLen = _getNodeTextLength(child);
            const valueLen = getNodeText(child).length;

            if (caretRemaining <= caretLen) {
                // tokens count as 1 caret unit but multiple value units.
                return valueOffset + (caretLen === valueLen ? caretRemaining : 0);
            }

            caretRemaining -= caretLen;
            valueOffset += valueLen;
        }

        return this.currentValue.length;
    }

    private getTokenInsertOffsets(isNew: boolean): { caretOffset: number; valueOffset: number } | null {
        // use cached offsets while dragging ranges so caret doesn't jump between events.
        return this.getCaretOffsets(this.getCurrentValue(), {
            useCachedCaret: true,
            useCachedValueOffset: !isNew,
        });
    }

    public getCaretOffsetsForAutocomplete(value: string): { caretOffset: number; valueOffset: number } | null {
        return this.getCaretOffsets(value);
    }

    private getCaretOffsets(
        value: string,
        options: { useCachedCaret: boolean; useCachedValueOffset: boolean } = {
            useCachedCaret: false,
            useCachedValueOffset: false,
        }
    ): { caretOffset: number; valueOffset: number } | null {
        // snapshot the caret position in both caret units and raw string offsets.
        const { beans } = this;
        const { useCachedCaret, useCachedValueOffset } = options;
        const contentElement = this.getContentElement();
        const caretOffset = useCachedCaret
            ? (this.selectionCaretOffset ?? getCaretOffset(beans, contentElement, value) ?? this.currentValue.length)
            : getCaretOffset(beans, contentElement, value);

        if (caretOffset == null) {
            return null;
        }

        const valueOffset =
            useCachedValueOffset && this.lastTokenValueOffset != null
                ? this.lastTokenValueOffset
                : this.getValueOffsetFromCaret(caretOffset);

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
        // keep "=" as a plain value for commit/validation, but still enable range selection
        // when it appears so clicking a cell can insert a token.
        const hasFormulaPrefix = text.trimStart().startsWith('=');
        const isFormula = this.beans.formula?.isFormula(text) ?? hasFormulaPrefix;
        return { isFormula, hasFormulaPrefix };
    }

    private dispatchValueChanged(): void {
        this.dispatchLocalEvent({ type: 'fieldValueChanged' as any });
    }

    private applyPlainValue(
        value: string,
        params: { caret?: number | null; silent?: boolean; dispatch?: boolean }
    ): void {
        this.formulaColorByRef.clear();
        this.renderPlainValue(value, params.caret);
        this.setEditorValue(value, params.silent);
        if (params.dispatch) {
            this.dispatchValueChanged();
        }
        this.autocompleteFeature?.onPlainValueUpdated();
    }

    private applyFormulaValue(
        value: string,
        params: { currentValue?: string; caret?: number | null; silent?: boolean; dispatch?: boolean }
    ): void {
        this.updateFormulaColorsFromValue(value);
        this.renderFormula({
            value,
            currentValue: params.currentValue ?? this.getCurrentValue(),
            caret: params.caret ?? undefined,
        });
        // we render tokens ourselves, so avoid the base class' setValue (which would re-render)
        // and delegate that task to setEditorValue to keep our cached value and the superclass in sync.
        this.setEditorValue(value, params.silent);
        if (params.dispatch) {
            this.dispatchValueChanged();
        }
        this.autocompleteFeature?.onFormulaValueUpdated();
    }

    public applyFormulaValueChange(params: {
        currentValue: string;
        nextValue: string;
        caret: number;
        updateTracking?: () => void;
    }): void {
        const { currentValue, nextValue, caret } = params;
        this.updateFormulaColorsFromValue(nextValue);

        params.updateTracking?.();

        this.setEditorValue(nextValue);
        this.renderFormula({
            currentValue,
            value: nextValue,
            caret,
        });
        this.dispatchValueChanged();
        this.autocompleteFeature?.onFormulaValueUpdated();
    }

    public replaceTokenRef(
        previousRef: string,
        nextRef: string,
        colorIndex?: number | null,
        tokenIndex?: number | null
    ): number | null {
        const contentElement = this.getContentElement();
        let token: HTMLElement | undefined;

        if (tokenIndex != null) {
            token =
                contentElement.querySelector<HTMLElement>(
                    `.ag-formula-token[data-formula-token-index="${tokenIndex}"]`
                ) ?? undefined;

            if (token && getTokenRef(token) !== previousRef) {
                token = undefined;
            }
        }

        if (!token) {
            token = Array.from(contentElement.querySelectorAll<HTMLElement>('.ag-formula-token')).find(
                (node) => getTokenRef(node) === previousRef
            );
        }

        if (!token) {
            return null;
        }

        const caretOffset = getOffsetBeforeNode(contentElement, token);
        const valueOffset = getOffsetBeforeNode(contentElement, token, true);

        if (caretOffset == null || valueOffset == null) {
            return null;
        }

        const value = this.getCurrentValue();
        if (colorIndex != null) {
            this.formulaColorByRef.set(nextRef, colorIndex);
        }
        const updated = value.slice(0, valueOffset) + nextRef + value.slice(valueOffset + previousRef.length);
        const resolvedIndex = getTokenIndex(token);
        this.applyFormulaValueChange({
            currentValue: value,
            nextValue: updated,
            caret: caretOffset + nextRef.length,
            updateTracking: () => {
                this.updateLastTokenTracking(nextRef, caretOffset, valueOffset);
            },
        });

        return resolvedIndex ?? tokenIndex ?? null;
    }
}

// Token/range color helpers
const shouldUseTokenColors = (beans: BeanCollection): boolean => {
    const { gos, rangeSvc } = beans;
    const canCreateRanges = !!rangeSvc && !!gos.get('cellSelection');

    return canCreateRanges;
};

// walk the formula left-to-right, capture the first occurrence of each distinct ref,
// and assign colors in encounter order so token colors stay stable every time the
// user re-enters the editor (A1 -> color1, next ref -> color2, etc.).
const getOrderedRefs = (beans: BeanCollection, value: string): string[] => {
    // collect unique refs in their first-seen order to keep colors stable across re-entry.
    const refsInOrder: string[] = [];
    const seen = new Set<string>();
    for (const match of getRefTokenMatchesForFormula(beans, value)) {
        const ref = match.ref;
        if (seen.has(ref)) {
            continue;
        }
        seen.add(ref);
        refsInOrder.push(ref);
    }
    return refsInOrder;
};

const getTokenMatchAtOffset = (beans: BeanCollection, value: string, offset: number): TokenMatch | null => {
    // locate the token (if any) that covers the given value offset.
    for (const match of getRefTokenMatchesForFormula(beans, value)) {
        if (offset >= match.start && offset <= match.end) {
            return { ref: match.ref, start: match.start, end: match.end, index: match.index };
        }
    }
    return null;
};

const getRawTokenMatchAtOffset = (value: string, offset: number): TokenMatch | null => {
    // match any A1-like token so invalid refs can still be replaced.
    for (const match of getRefTokenMatches(value)) {
        if (offset >= match.start && offset <= match.end) {
            return { ref: match.ref, start: match.start, end: match.end, index: match.index };
        }
    }
    return null;
};

const shouldInsertTokenAtOffset = (value: string, offset: number): boolean => {
    // insert only after an operator or at the beginning to avoid hijacking plain values.
    const previousChar = getPreviousNonSpaceChar(value, offset);
    return previousChar == null || TOKEN_INSERT_AFTER_CHARS.has(previousChar);
};

// Rendering & caret helpers
const tokenize = (
    beans: BeanCollection,
    value: string,
    getColorIndexForToken: (tokenIndex: number) => number | null
): Node[] => {
    // split the formula into text + token nodes while preserving operators for display.
    const nodes: Node[] = [];
    let lastIndex = 0;
    const matches = getRefTokenMatchesForFormula(beans, value);
    const doc = _getDocument(beans);

    for (const match of matches) {
        if (match.start > lastIndex) {
            nodes.push(doc.createTextNode(formatForDisplay(value.slice(lastIndex, match.start))));
        }

        const colorIndex = getColorIndexForToken(match.index);
        nodes.push(createReferenceNode(match.ref, colorIndex, colorIndex != null, match.index));
        lastIndex = match.end;
    }

    if (lastIndex < value.length) {
        nodes.push(doc.createTextNode(formatForDisplay(value.slice(lastIndex))));
    }

    if (!nodes.length) {
        nodes.push(doc.createTextNode(''));
    }

    return nodes;
};

const createReferenceNode = (
    ref: string,
    colorIndex: number | null,
    useTokenColors: boolean,
    tokenIndex: number
): HTMLElement => {
    const attrs: Record<string, string> = {
        'aria-label': ref,
        'data-formula-ref': ref,
        'data-formula-token-index': tokenIndex.toString(),
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
    beans: BeanCollection;
    contentElement: HTMLElement;
    currentValue: string;
    value: string;
    getColorIndexForToken: (tokenIndex: number) => number | null;
    caret?: number | null;
}): void => {
    // rebuild the DOM and restore the caret to the same logical position.
    const { beans, contentElement, currentValue, value, getColorIndexForToken, caret } = params;
    const caretOffset = caret ?? getCaretOffset(beans, contentElement, currentValue);
    const maxCaret = value.length;

    contentElement.textContent = '';

    for (const node of tokenize(beans, value, getColorIndexForToken)) {
        contentElement.append(node);
    }

    const targetCaret = caretOffset != null ? Math.min(caretOffset, maxCaret) : null;
    restoreCaret(beans, contentElement, targetCaret);
};

const getOffsetBeforeNode = (container: HTMLElement, node: Node, useValueLength: boolean = false): number | null => {
    // compute caret/value offsets before a specific node in the tokenised DOM.
    if (!container.contains(node)) {
        return null;
    }

    let offset = 0;
    for (const child of Array.from(container.childNodes)) {
        if (child === node) {
            return offset;
        }
        offset += useValueLength ? getNodeText(child).length : _getNodeTextLength(child);
    }

    return null;
};

// Serialisation helpers
const serializeContent = (contentElement: HTMLElement): string => {
    // read the tokenised DOM back into the raw formula text.
    let output = '';

    contentElement.childNodes.forEach((child) => {
        output += getNodeText(child);
    });

    return output;
};

const getNodeText = (node: Node): string => {
    // convert DOM nodes back into value text, undoing display-only operator substitutions.
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

const _getNodeTextLength = (node: Node): number => {
    // measure text length for caret math (tokens count as their displayed text).
    if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent?.length ?? 0;
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
        return Array.from(node.childNodes).reduce((sum, child) => sum + _getNodeTextLength(child), 0);
    }

    return 0;
};

const findNodeAtOffset = (root: Node, offset: number): { node: Node | null; localOffset: number } => {
    // walk the tokenised tree and return the node/offset for a logical caret position.
    let remaining = offset;

    for (let i = 0; i < root.childNodes.length; i++) {
        const child = root.childNodes[i];
        const length = _getNodeTextLength(child);

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

const restoreCaret = (beans: BeanCollection, contentElement: HTMLElement, offset: number | null): void => {
    // place the DOM caret at a logical offset within the tokenised content.
    if (offset == null) {
        return;
    }

    const win = _getWindow(beans);
    const doc = _getDocument(beans);
    const selection = win.getSelection();
    const range = doc.createRange();
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
        // ignore invalid ranges when the editor is detached from the document.
    }
};

const getCaretOffset = (beans: BeanCollection, contentElement: HTMLElement, currentValue: string): number | null => {
    // translate the DOM selection into a caret offset that counts tokens as one unit.
    const win = _getWindow(beans);
    const selection = win.getSelection();

    if (!selection || selection.rangeCount === 0) {
        return currentValue?.length ?? null;
    }

    const range = selection.getRangeAt(0);

    if (!contentElement.contains(range.startContainer)) {
        return currentValue?.length ?? null;
    }

    // if the caret is directly on the container (between child nodes), the range offset is a
    // child index, so convert it to caret units by summing preceding child lengths.
    if (range.startContainer === contentElement) {
        let offset = 0;
        for (let i = 0; i < range.startOffset; i++) {
            offset += _getNodeTextLength(contentElement.childNodes[i]);
        }
        return offset;
    }

    let offset = range.startOffset;
    let node: Node | null = range.startContainer;

    while (node && node !== contentElement) {
        let sibling = node.previousSibling;

        while (sibling) {
            offset += _getNodeTextLength(sibling);
            sibling = sibling.previousSibling;
        }

        node = node.parentNode;
    }

    return offset;
};

// Token helpers
const getTokenRef = (tokenEl: HTMLElement): string =>
    formatForValue(tokenEl.textContent ?? tokenEl.dataset.formulaRef ?? '');
const getTokenIndex = (tokenEl: HTMLElement): number | null => {
    const raw = tokenEl.dataset.formulaTokenIndex;
    if (!raw) {
        return null;
    }
    const parsed = parseInt(raw, 10);
    return Number.isFinite(parsed) ? parsed : null;
};

// text formatting helpers
const formatForDisplay = (text: string): string =>
    text.replace(/[/*]/g, (match) => DISPLAY_OPERATOR_LOOKUP[match] ?? match);

const formatForValue = (text: string): string =>
    text.replace(/[÷×]/g, (match) => VALUE_OPERATOR_LOOKUP[match] ?? match);
