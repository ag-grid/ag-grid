import { AgAbstractCellEditor, KeyCode, RefPlaceholder, _isBrowserSafari, _placeCaretAtEnd } from 'ag-grid-community';
import type { IFormulaCellEditorParams } from 'ag-grid-community';

import { AgFormulaInputField } from '../../widgets/agFormulaInputField';
import { translateFormulaError } from '../i18n';

export class FormulaCellEditor<TData = any, TValue = any, TContext = any> extends AgAbstractCellEditor<
    IFormulaCellEditorParams<TData, TValue, TContext>,
    TValue,
    string
> {
    protected eEditor: AgFormulaInputField = RefPlaceholder;
    private focusAfterAttached = false;

    constructor() {
        super({ tag: 'div', cls: 'ag-cell-edit-wrapper' });
    }

    public initialiseEditor(params: IFormulaCellEditorParams): void {
        const formulaInputField = this.createManagedBean(new AgFormulaInputField());

        this.eEditor = formulaInputField;
        formulaInputField.addCss('ag-cell-editor');
        this.appendChild(formulaInputField);
        this.addManagedElementListeners(formulaInputField.getContentElement(), {
            keydown: (event: KeyboardEvent) => this.onFormulaInputKeyDown(event, params.onKeyDown),
        });

        const { eventKey, cellStartedEdit } = params;

        // replicate the provided editors’ behaviour: if we started from a printable key, seed with that;
        // backspace/delete clears; otherwise use the existing value.
        let startValue: string | null | undefined;
        if (cellStartedEdit) {
            this.focusAfterAttached = true;
            if (eventKey === KeyCode.BACKSPACE || eventKey === KeyCode.DELETE) {
                startValue = '';
            } else if (eventKey?.length === 1) {
                startValue = eventKey;
            } else {
                startValue = this.getStartValue(params);
            }
        } else {
            startValue = this.getStartValue(params);
        }

        const initialValue = startValue == null ? '' : String(startValue);
        this.eEditor.setEditingCellRef(params.column, params.rowIndex);
        this.eEditor.setValue(initialValue, true);
    }

    private onFormulaInputKeyDown(event: KeyboardEvent, onKeyDown: (event: KeyboardEvent) => void) {
        const { key } = event;
        if (key !== KeyCode.TAB || event.defaultPrevented) {
            return;
        }
        const { focusSvc } = this.beans;
        const prevFocus = focusSvc?.getFocusedCell();

        // prevent range sync from reacting to the focus change caused by tab navigation.
        this.eEditor.withSelectionChangeHandlingSuppressed(() => {
            onKeyDown?.(event);
        });

        const nextFocus = focusSvc?.getFocusedCell();
        let focusChanged = false;
        if (prevFocus && nextFocus) {
            const { rowIndex: prevRowIndex, rowPinned: prevRowPinned, column: prevColumn } = prevFocus;
            const { rowIndex: nextRowIndex, rowPinned: nextRowPinned, column: nextColumn } = nextFocus;
            focusChanged =
                prevRowIndex !== nextRowIndex || prevRowPinned !== nextRowPinned || prevColumn !== nextColumn;
        }

        const { defaultPrevented } = event;
        if (defaultPrevented || focusChanged) {
            // stop contenteditable from inserting a tab when the grid handled navigation.
            event.preventDefault();
        }

        event.stopPropagation();
    }

    private getStartValue(params: IFormulaCellEditorParams): string | null | undefined {
        const { value } = params;
        return value?.toString() ?? value;
    }

    public override agSetEditValue(value: any): void {
        this.params.value = value;
        const startValue = this.getStartValue(this.params);
        this.eEditor.setValue(startValue ?? '', true);
    }

    public override isPopup(): boolean {
        return false;
    }

    public afterGuiAttached(): void {
        if (!this.focusAfterAttached) {
            return;
        }

        const { beans, eEditor } = this;
        if (!_isBrowserSafari()) {
            this.focusIn();
        }
        _placeCaretAtEnd(beans, eEditor.getContentElement());
    }

    public focusIn(): void {
        this.eEditor.getContentElement().focus({ preventScroll: true });
    }

    public getValue(): any {
        const rawValue = this.eEditor.getCurrentValue();
        const { value, parseValue } = this.params;

        // preserve formulas exactly as typed; otherwise delegate to the column parser so numbers/strings
        // commit in their intended type.
        if (typeof rawValue === 'string' && this.isFormulaText(rawValue)) {
            return rawValue;
        }

        if (rawValue == null && value == null) {
            return value;
        }

        return parseValue(String(rawValue));
    }

    public getValidationElement(): HTMLElement | HTMLInputElement {
        return this.eEditor.getContentElement();
    }

    public getValidationErrors(): string[] | null {
        const { params } = this;
        const rawValue = this.eEditor.getCurrentValue();
        const translate = this.getLocaleTextFunc();
        const { getValidationErrors, validateFormulas } = params;

        let internalErrors: string[] | null = null;
        const shouldValidate = validateFormulas === true || !!getValidationErrors;

        if (shouldValidate && typeof rawValue === 'string' && this.isFormulaText(rawValue)) {
            const normalised = this.beans.formula?.normaliseFormula(rawValue, true);

            if (!normalised) {
                internalErrors = [translateFormulaError(translate, 1)];
            }
        }

        if (getValidationErrors) {
            return getValidationErrors({ value: this.getValue(), internalErrors, cellEditorParams: params });
        }

        return internalErrors;
    }

    private isFormulaText(value: string): boolean {
        const text = value == null ? '' : String(value);
        return this.beans.formula?.isFormula(text) ?? text.trimStart().startsWith('=');
    }
}
