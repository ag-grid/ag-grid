import type { AgComponentPopupPositionParams, PopupPositionParams } from 'ag-grid-community';
import { BeanStub, KeyCode, _getDocument } from 'ag-grid-community';

import { AgAutocompleteList } from '../advancedFilter/autocomplete/agAutocompleteList';
import type { AutocompleteEntry } from '../advancedFilter/autocomplete/autocompleteParams';
import { isFormulaIdentChar, isFormulaIdentStart } from '../formula/refUtils';
import type { AgFormulaInputField } from './agFormulaInputField';
import { TOKEN_INSERT_AFTER_CHARS, getPreviousNonSpaceChar } from './formulaInputTokenUtils';

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

        const value = this.field.getCurrentValue();
        const hasFormulaPrefix = value.trimStart().startsWith('=');

        if (!hasFormulaPrefix) {
            this.closeFunctionAutocomplete();
            return;
        }

        const caretOffsets = this.field.getCaretOffsetsForAutocomplete(value);
        if (!caretOffsets) {
            this.closeFunctionAutocomplete();
            return;
        }

        const token = getFunctionTokenAtOffset(value, caretOffsets.valueOffset);
        if (!token) {
            this.closeFunctionAutocomplete();
            return;
        }

        const entries = this.getFunctionAutocompleteEntries();
        if (!entries.length) {
            this.closeFunctionAutocomplete();
            return;
        }

        const searchLower = token.prefix.toLocaleLowerCase();
        const hasMatch = entries.some((entry) => entry.key.toLocaleLowerCase().startsWith(searchLower));

        if (!hasMatch) {
            this.closeFunctionAutocomplete();
            return;
        }

        this.functionAutocompleteToken = token;
        this.openFunctionAutocomplete(entries);

        if (this.functionAutocompleteList && this.functionAutocompleteSearch !== token.prefix) {
            this.functionAutocompleteList.setSearch(token.prefix);
            this.functionAutocompleteSearch = token.prefix;
        }
    }

    private getFunctionAutocompleteEntries(): AutocompleteEntry[] {
        const formula = this.beans.formula;
        const names = formula?.active ? formula.getFunctionNames?.() ?? [] : [];

        if (!this.functionAutocompleteEntries || this.functionAutocompleteEntries.length !== names.length) {
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

        this.functionAutocompleteList = this.createManagedBean(
            new AgAutocompleteList({
                autocompleteEntries: entries,
                onConfirmed: () => this.confirmFunctionAutocomplete(),
                useStartsWithSearch: true,
                autoSizeList: true,
                maxVisibleItems: 10,
            })
        );

        const ePopupGui = this.functionAutocompleteList.getGui();

        const positionParams: AgComponentPopupPositionParams<PopupPositionParams> = {
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
            positionCallback: () => popupSvc.positionPopupByComponent(positionParams),
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

        const value = this.field.getCurrentValue();
        const functionName = selected.key;
        const baseValue = value.slice(0, token.start) + functionName + value.slice(token.end);
        const insertPos = token.start + functionName.length;
        const nextValue =
            baseValue[insertPos] === '(' ? baseValue : baseValue.slice(0, insertPos) + '(' + baseValue.slice(insertPos);

        this.field.getContentElement().focus({ preventScroll: true });
        this.field.applyFormulaValueChange({
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

const getFunctionTokenAtOffset = (value: string, caretOffset: number): FunctionTokenMatch | null => {
    // show functions only when the caret is at the end of a formula identifier.
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

    if (start === end || caretOffset !== end) {
        return null;
    }

    const token = value.slice(start, end);
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
        end,
        prefix: value.slice(start, caretOffset),
    };
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
