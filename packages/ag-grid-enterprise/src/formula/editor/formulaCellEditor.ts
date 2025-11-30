import type { ICellEditorParams } from 'ag-grid-community';
import { AgAbstractCellEditor, RefPlaceholder } from 'ag-grid-community';

import { AgFormulaInputField } from '../../widgets/agFormulaInputField';

export class FormulaCellEditor extends AgAbstractCellEditor<ICellEditorParams> {
    protected eEditor: AgFormulaInputField = RefPlaceholder;

    constructor() {
        super({ tag: 'div', cls: 'ag-cell-edit-wrapper' });
    }

    public initialiseEditor(params: ICellEditorParams): void {
        const formulaInputField = this.createManagedBean(new AgFormulaInputField());

        this.eEditor = formulaInputField;
        formulaInputField.addCss('ag-cell-editor');
        this.appendChild(formulaInputField);

        const startValue = (params.value as string) ?? '';
        this.enableRangeSelectionWhileEditing();
        this.eEditor.setEditingCellRef(params.column, params.rowIndex);
        this.eEditor.setValue(startValue, true);
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

    public getValue(): string | null | undefined {
        return this.eEditor.getCurrentValue() ?? '';
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

    private enableRangeSelectionWhileEditing(): void {
        this.beans.editSvc?.enableRangeSelectionWhileEditing?.();
        this.addDestroyFunc(() => this.beans.editSvc?.disableRangeSelectionWhileEditing?.());
    }
}
