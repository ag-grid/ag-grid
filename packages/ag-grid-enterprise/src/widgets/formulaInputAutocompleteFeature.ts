import type { AgComponentPopupPositionParams } from 'ag-stack';
import { _getDocument } from 'ag-stack';

import type { BeanCollection, IFormulaService, PopupPositionParams } from 'ag-grid-community';
import { BeanStub, KeyCode } from 'ag-grid-community';

import { AgAutocompleteList } from '../advancedFilter/autocomplete/agAutocompleteList';
import type { AutocompleteEntry } from '../advancedFilter/autocomplete/autocompleteParams';
import { isFormulaIdentChar, isFormulaIdentStart, parseA1Ref } from '../formula/refUtils';
import type { AgFormulaInputField } from './agFormulaInputField';
import { TOKEN_INSERT_AFTER_CHARS, getPreviousNonSpaceChar } from './formulaInputTokenUtils';
import { getRefTokenMatchesForFormula } from './formulaRangeUtils';

type FunctionTokenMatch = { start: number; end: number; prefix: string };

export class FormulaInputAutocompleteFeature extends BeanStub {
    private functionAutocompleteList: AgAutocompleteList | null = null;
    private functionAutocompleteHidePopup?: () => void;
    private functionAutocompleteToken: FunctionTokenMatch | null = null;
    private functionAutocompleteEntries: AutocompleteEntry[] | null = null;
    private functionAutocompleteSearch: string | null = null;

    constructor(private readonly field: AgFormulaInputField) {
        super();
    }

    public postConstruct(): void {
        this.addManagedElementListeners(this.field.getContentElement(), {
            keydown: this.onContentKeyDown.bind(this),
            mouseup: this.updateFunctionAutocomplete.bind(this),
            focusin: this.updateFunctionAutocomplete.bind(this),
            focusout: this.closeFunctionAutocomplete.bind(this),
        });
        this.addDestroyFunc(() => this.closeFunctionAutocomplete());
    }

    public onPlainValueUpdated(): void {
        this.closeFunctionAutocomplete();
    }

    public onFormulaValueUpdated(): void {
        this.updateFunctionAutocomplete();
    }

    private onContentKeyDown(event: KeyboardEvent): void {
        if (this.functionAutocompleteList) {
            switch (event.key) {
                case KeyCode.ENTER:
                case KeyCode.TAB:
                    event.preventDefault();
                    event.stopPropagation();
                    this.confirmFunctionAutocomplete();
                    return;
                case KeyCode.ESCAPE:
                    event.preventDefault();
                    event.stopPropagation();
                    this.closeFunctionAutocomplete();
                    return;
                case KeyCode.UP:
                case KeyCode.DOWN:
                    this.functionAutocompleteList.onNavigationKeyDown(event, event.key);
                    return;
            }
        }

        switch (event.key) {
            case KeyCode.LEFT:
            case KeyCode.RIGHT:
            case KeyCode.PAGE_HOME:
            case KeyCode.PAGE_END:
                this.scheduleFunctionAutocompleteUpdate();
                break;
        }
    }

    private scheduleFunctionAutocompleteUpdate(): void {
        setTimeout(() => {
            if (!this.isAlive()) {
                return;
            }
            this.updateFunctionAutocomplete();
        });
    }

    private updateFunctionAutocomplete(): void {
        if (!this.isContentFocused()) {
            this.closeFunctionAutocomplete();
            return;
        }

        const { field, beans } = this;

        const value = field.getCurrentValue();
        const hasFormulaPrefix = value.trimStart().startsWith('=');

        if (!hasFormulaPrefix) {
            this.closeFunctionAutocomplete();
            return;
        }

        const caretOffsets = field.getCaretOffsetsForAutocomplete(value);
        if (!caretOffsets) {
            this.closeFunctionAutocomplete();
            return;
        }

        if (isCaretInsideRefToken(beans, value, caretOffsets.valueOffset)) {
            this.closeFunctionAutocomplete();
            return;
        }

        const token = getFunctionTokenAtOffset(value, caretOffsets.valueOffset, beans.formula ?? null);
        if (!token) {
            this.closeFunctionAutocomplete();
            return;
        }

        const { prefix } = token;

        if (!prefix.length) {
            this.closeFunctionAutocomplete();
            return;
        }

        const entries = this.getFunctionAutocompleteEntries();
        if (!entries.length) {
            this.closeFunctionAutocomplete();
            return;
        }

        const searchLower = prefix.toLocaleLowerCase();
        const hasMatch = entries.some(({ key }) => key.toLocaleLowerCase().startsWith(searchLower));

        if (!hasMatch) {
            this.closeFunctionAutocomplete();
            return;
        }

        this.functionAutocompleteToken = token;
        this.openFunctionAutocomplete(entries);

        if (this.functionAutocompleteList && this.functionAutocompleteSearch !== prefix) {
            this.functionAutocompleteList.setSearch(prefix);
            this.functionAutocompleteSearch = prefix;
        }
    }

    private getFunctionAutocompleteEntries(): AutocompleteEntry[] {
        const formula = this.beans.formula;
        const names = formula?.active ? (formula.getFunctionNames?.() ?? []) : [];

        if (this.functionAutocompleteEntries?.length !== names.length) {
            this.functionAutocompleteEntries = names.map((name) => ({ key: name }));
        }

        return this.functionAutocompleteEntries;
    }

    private openFunctionAutocomplete(entries: AutocompleteEntry[]): void {
        if (this.functionAutocompleteList || !entries.length) {
            return;
        }

        const popupSvc = this.beans.popupSvc;
        if (!popupSvc) {
            return;
        }

        let positionParams: AgComponentPopupPositionParams<PopupPositionParams> | null = null;
        const repositionList = () => {
            if (this.functionAutocompleteList && positionParams) {
                popupSvc.positionPopupByComponent(positionParams);
            }
        };

        this.functionAutocompleteList = this.createManagedBean(
            new AgAutocompleteList({
                autocompleteEntries: entries,
                onConfirmed: () => this.confirmFunctionAutocomplete(),
                useStartsWithSearch: true,
                autoSizeList: true,
                maxVisibleItems: 10,
                onListHeightChanged: repositionList,
            })
        );

        const ePopupGui = this.functionAutocompleteList.getGui();

        positionParams = {
            ePopup: ePopupGui,
            type: 'autocomplete',
            eventSource: this.field.getGui(),
            position: 'under',
            alignSide: this.gos.get('enableRtl') ? 'right' : 'left',
            keepWithinBounds: true,
        };

        const addPopupRes = popupSvc.addPopup({
            eChild: ePopupGui,
            anchorToElement: this.field.getGui(),
            positionCallback: repositionList,
            ariaLabel: 'Formula functions',
        });

        this.functionAutocompleteHidePopup = addPopupRes.hideFunc;
        this.functionAutocompleteList.afterGuiAttached();
    }

    private closeFunctionAutocomplete(): void {
        this.functionAutocompleteToken = null;
        this.functionAutocompleteSearch = null;

        if (!this.functionAutocompleteList) {
            return;
        }

        this.functionAutocompleteHidePopup?.();
        this.functionAutocompleteHidePopup = undefined;
        this.destroyBean(this.functionAutocompleteList);
        this.functionAutocompleteList = null;
    }

    private confirmFunctionAutocomplete(): void {
        const token = this.functionAutocompleteToken;
        const selected = this.functionAutocompleteList?.getSelectedValue();

        if (!token || !selected) {
            this.closeFunctionAutocomplete();
            return;
        }

        const { field } = this;
        const value = field.getCurrentValue();
        const functionName = selected.key;
        const baseValue = value.slice(0, token.start) + functionName + value.slice(token.end);
        const insertPos = token.start + functionName.length;
        const nextValue =
            baseValue[insertPos] === '(' ? baseValue : baseValue.slice(0, insertPos) + '(' + baseValue.slice(insertPos);

        field.getContentElement().focus({ preventScroll: true });
        field.applyFormulaValueChange({
            currentValue: value,
            nextValue,
            caret: insertPos + 1,
        });

        this.closeFunctionAutocomplete();
    }

    private isContentFocused(): boolean {
        return _getDocument(this.beans).activeElement === this.field.getContentElement();
    }
}

const getFunctionTokenAtOffset = (
    value: string,
    caretOffset: number,
    formula: IFormulaService | null
): FunctionTokenMatch | null => {
    // show functions when the caret is within a formula identifier.
    if (caretOffset < 0 || caretOffset > value.length || isInsideStringLiteral(value, caretOffset)) {
        return null;
    }

    let start = caretOffset;
    while (start > 0 && isFormulaIdentChar(value[start - 1])) {
        start--;
    }

    let end = caretOffset;
    while (end < value.length && isFormulaIdentChar(value[end])) {
        end++;
    }

    if (start === end) {
        return null;
    }

    let tokenEnd = end;
    if (caretOffset !== end) {
        // allow typing a function name immediately before an existing ref (e.g. "*COUNT|C2").
        const suffix = value.slice(caretOffset, end);
        const parsed = parseA1Ref(suffix);
        const isRefSuffix = !!parsed && (!formula || !!formula.getColByRef(parsed.startCol));
        if (isRefSuffix) {
            tokenEnd = caretOffset;
        }
    }

    const token = value.slice(start, tokenEnd);
    if (!token || !isFormulaIdentStart(token[0])) {
        return null;
    }

    if (value[start - 1] === '$') {
        return null;
    }

    const previousChar = getPreviousNonSpaceChar(value, start);
    if (previousChar != null && !TOKEN_INSERT_AFTER_CHARS.has(previousChar)) {
        return null;
    }

    return {
        start,
        end: tokenEnd,
        prefix: value.slice(start, caretOffset),
    };
};

const isCaretInsideRefToken = (beans: BeanCollection, value: string, caretOffset: number): boolean => {
    for (const match of getRefTokenMatchesForFormula(beans, value)) {
        if (caretOffset >= match.start && caretOffset <= match.end) {
            return true;
        }
    }
    return false;
};

const isInsideStringLiteral = (value: string, offset: number): boolean => {
    // treat doubled quotes as escaped quotes when scanning.
    let inString = false;
    for (let i = 0; i < offset && i < value.length; i++) {
        if (value[i] !== '"') {
            continue;
        }
        if (value[i + 1] === '"') {
            i++;
            continue;
        }
        inString = !inString;
    }
    return inString;
};
