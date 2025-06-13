import type { ICellEditorParams } from '../../interfaces/iCellEditor';
import { _getAriaCheckboxStateName } from '../../utils/aria';
import type { ElementParams } from '../../utils/dom';
import { AgAbstractCellEditor } from '../../widgets/agAbstractCellEditor';
import type { AgCheckbox } from '../../widgets/agCheckbox';
import { AgCheckboxSelector } from '../../widgets/agCheckbox';
import { RefPlaceholder } from '../../widgets/component';

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

    protected readonly eEditor: AgCheckbox = RefPlaceholder;

    public initialiseEditor(params: ICellEditorParams<any, boolean>): void {
        const isSelected = params.value ?? undefined;
        const eEditor = this.eEditor;
        eEditor.setValue(isSelected);

        const inputEl = eEditor.getInputElement();
        inputEl.setAttribute('tabindex', '-1');

        this.setAriaLabel(isSelected);

        this.addManagedListeners(eEditor, {
            fieldValueChanged: (event: { selected?: boolean }) => this.setAriaLabel(event.selected),
        });
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

    public getValidationElement(): HTMLElement | HTMLInputElement {
        return this.eEditor.getInputElement();
    }

    public getErrors() {
        const { params } = this;
        const { getErrors } = params;
        const value = this.getValue();

        if (!getErrors) {
            return null;
        }

        return getErrors({
            value,
            internalErrors: null,
            cellEditorParams: params,
        });
    }
}
