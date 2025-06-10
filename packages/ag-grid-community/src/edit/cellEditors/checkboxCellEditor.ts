import type { ICellEditorComp, ICellEditorParams } from '../../interfaces/iCellEditor';
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
export class CheckboxCellEditor
    extends AgAbstractCellEditor<ICellEditorParams<any, boolean>>
    implements ICellEditorComp
{
    constructor() {
        super(CheckboxCellEditorElement, [AgCheckboxSelector]);
    }

    protected readonly eEditor: AgCheckbox = RefPlaceholder;
    protected params: ICellEditorParams<any, boolean>;

    public init(params: ICellEditorParams<any, boolean>): void {
        this.params = params;
        const isSelected = params.value ?? undefined;

        const eCheckbox = this.eEditor;
        eCheckbox.setValue(isSelected);

        const inputEl = eCheckbox.getInputElement();
        inputEl.setAttribute('tabindex', '-1');

        this.setAriaLabel(isSelected);

        this.addManagedListeners(eCheckbox, {
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

    protected getEditorElement(): HTMLElement | HTMLInputElement {
        return this.eEditor.getInputElement();
    }

    protected getErrors() {
        const { params } = this;
        const { validate } = params;
        const value = this.getValue();

        if (!validate) {
            return null;
        }

        return validate({
            value,
            internalErrors: null,
            cellEditorParams: params,
        });
    }
}
