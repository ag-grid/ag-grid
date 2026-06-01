import { RefPlaceholder, _getAriaCheckboxStateName } from 'ag-stack';

import { AgCheckboxSelector } from '../../agWidgets/agCheckbox';
import type { ICellEditorParams } from '../../interfaces/iCellEditor';
import type { ElementParams } from '../../utils/element';
import type { GridCheckbox } from '../../widgets/gridWidgetTypes';
import { AgAbstractCellEditor } from './agAbstractCellEditor';

const CheckboxCellEditorElement: ElementParams = {
    tag: 'div',
    cls: 'ag-cell-wrapper ag-cell-edit-wrapper ag-checkbox-edit',
    children: [
        {
            tag: 'ag-checkbox',
            ref: 'eEditor',
            role: 'presentation',
        },
    ],
};
export class CheckboxCellEditor extends AgAbstractCellEditor<ICellEditorParams<any, boolean>, boolean> {
    constructor() {
        super(CheckboxCellEditorElement, [AgCheckboxSelector]);
    }

    protected readonly eEditor: GridCheckbox = RefPlaceholder;

    public initialiseEditor(params: ICellEditorParams<any, boolean>): void {
        this.agSetEditValue(params.value);

        const inputEl = this.eEditor.getInputElement();
        inputEl.setAttribute('tabindex', '-1');

        this.addManagedListeners(this.eEditor, {
            fieldValueChanged: (event: { selected?: boolean }) => this.setAriaLabel(event.selected),
        });
    }

    public override agSetEditValue(value: boolean | null | undefined): void {
        this.params.value = value;
        const isSelected = value ?? undefined;
        this.eEditor.setValue(isSelected, true);
        this.setAriaLabel(isSelected);
    }

    public getValue(): boolean | undefined {
        return this.eEditor.getValue();
    }

    public focusIn(): void {
        this.eEditor.getFocusableElement().focus();
    }

    public afterGuiAttached(): void {
        if (this.params.cellStartedEdit) {
            this.focusIn();
        }
    }

    public override isPopup() {
        return false;
    }

    private setAriaLabel(isSelected?: boolean): void {
        const translate = this.getLocaleTextFunc();
        const stateName = _getAriaCheckboxStateName(translate, isSelected);
        const ariaLabel = translate('ariaToggleCellValue', 'Press SPACE to toggle cell value');
        this.eEditor.setInputAriaLabel(`${ariaLabel} (${stateName})`);
    }

    public getValidationElement(tooltip: boolean): HTMLElement | HTMLInputElement {
        return tooltip ? this.params.eGridCell : this.eEditor.getInputElement();
    }

    public getValidationErrors() {
        const { params } = this;
        const { getValidationErrors } = params;
        const value = this.getValue();

        if (!getValidationErrors) {
            return null;
        }

        return getValidationErrors({
            value,
            internalErrors: null,
            cellEditorParams: params,
        });
    }
}
