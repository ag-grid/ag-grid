import type { ICellEditorParams } from 'ag-grid-community';
import { AgAbstractCellEditor, KeyCode, RefPlaceholder } from 'ag-grid-community';

import { AgFormulaInputField } from '../../widgets/agFormulaInputField';

export class FormulaCellEditor extends AgAbstractCellEditor<ICellEditorParams> {
    protected eEditor: AgFormulaInputField = RefPlaceholder;
    private rangeSelectionEnabled = false;

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
        this.updateRangeSelectionState(initialValue);
        this.eEditor.onValueChange((val) => this.updateRangeSelectionState(val ?? ''));
    }

    private getStartValue(params: ICellEditorParams): string | null | undefined {
        const { value } = params;
        return value?.toString() ?? value;
    }

    public override isPopup(): boolean {
        return false;
    }

    public afterGuiAttached(): void {
        this.focusIn();
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
        if (typeof rawValue === 'string' && this.beans.formula?.isFormula(rawValue)) {
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

        if (typeof value === 'string' && this.beans.formula?.isFormula(value)) {
            const normalised = this.beans.formula.normaliseFormula(value, true);

            if (!normalised) {
                internalErrors = [translate('invalidFormulaValidation', 'Invalid formula.')];
            }
        }

        if (getValidationErrors) {
            return getValidationErrors({ value, internalErrors, cellEditorParams: params });
        }

        return internalErrors;
    }

    private enableRangeSelectionWhileEditing(): boolean {
        if (this.rangeSelectionEnabled) {
            return false;
        }
        this.rangeSelectionEnabled = true;
        this.beans.editSvc?.enableRangeSelectionWhileEditing?.();
        this.addDestroyFunc(() => this.disableRangeSelectionWhileEditing());
        return true;
    }

    private disableRangeSelectionWhileEditing(): void {
        if (!this.rangeSelectionEnabled) {
            return;
        }
        this.rangeSelectionEnabled = false;
        this.beans.editSvc?.disableRangeSelectionWhileEditing?.();
        // Clear any tracked refs/ranges inside the field. If none were created, this is a no-op.
        this.eEditor.syncRangesFromFormula('');
    }

    private updateRangeSelectionState(value: string): void {
        const text = value == null ? '' : String(value);
        const isFormula = text.trimStart().startsWith('=');

        if (isFormula) {
            const newlyEnabled = this.enableRangeSelectionWhileEditing();
            // Re-render with colors and sync ranges now that range selection is on.
            if (newlyEnabled) {
                this.eEditor.setValue(text, true);
            }
            return;
        }

        this.disableRangeSelectionWhileEditing();
    }
}
