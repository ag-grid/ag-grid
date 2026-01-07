import type { ICellEditorParams } from 'ag-grid-community';
import { AgAbstractCellEditor, KeyCode, RefPlaceholder, _isBrowserSafari } from 'ag-grid-community';

import { AgFormulaInputField } from '../../widgets/agFormulaInputField';

export class FormulaCellEditor extends AgAbstractCellEditor<ICellEditorParams> {
    protected eEditor: AgFormulaInputField = RefPlaceholder;
    private focusAfterAttached = false;

    constructor() {
        super({ tag: 'div', cls: 'ag-cell-edit-wrapper' });
    }

    public initialiseEditor(params: ICellEditorParams): void {
        const formulaInputField = this.createManagedBean(new AgFormulaInputField());

        this.eEditor = formulaInputField;
        formulaInputField.addCss('ag-cell-editor');
        this.appendChild(formulaInputField);

        const { eventKey, cellStartedEdit } = params;

        // Replicate the provided editors’ behavior: if we started from a printable key, seed with that;
        // backspace/delete clears; otherwise use the existing value.
        let startValue: string | null | undefined;
        if (cellStartedEdit) {
            this.focusAfterAttached = true;
            if (eventKey === KeyCode.BACKSPACE || eventKey === KeyCode.DELETE) {
                startValue = '';
            } else if (eventKey && eventKey.length === 1) {
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

    private getStartValue(params: ICellEditorParams): string | null | undefined {
        const { value } = params;
        return value?.toString() ?? value;
    }

    public override isPopup(): boolean {
        return false;
    }

    public afterGuiAttached(): void {
        if (!this.focusAfterAttached) {
            return;
        }

        if (!_isBrowserSafari()) {
            this.focusIn();
        }
        this.eEditor.placeCaretAtEnd();
    }

    public focusIn(): void {
        this.eEditor.getContentElement().focus({ preventScroll: true });
    }

    public getValue(): any {
        const rawValue = this.eEditor.getCurrentValue();
        const { value, parseValue } = this.params;

        // Preserve formulas exactly as typed; otherwise delegate to the column parser so numbers/strings
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
        const value = this.eEditor.getCurrentValue();
        const translate = this.getLocaleTextFunc();
        const { getValidationErrors } = params;

        let internalErrors: string[] | null = null;

        if (typeof value === 'string' && this.isFormulaText(value)) {
            const normalised = this.beans.formula?.normaliseFormula(value, true);

            if (!normalised) {
                internalErrors = [translate('invalidFormulaValidation', 'Invalid formula.')];
            }
        }

        if (getValidationErrors) {
            return getValidationErrors({ value, internalErrors, cellEditorParams: params });
        }

        return internalErrors;
    }

    private isFormulaText(value: string): boolean {
        const text = value == null ? '' : String(value);
        return this.beans.formula?.isFormula(text) ?? text.trimStart().startsWith('=');
    }
}
