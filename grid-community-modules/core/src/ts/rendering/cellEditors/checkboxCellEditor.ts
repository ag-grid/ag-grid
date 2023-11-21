import { PopupComponent } from "../../widgets/popupComponent";
import { ICellEditorComp, ICellEditorParams } from "../../interfaces/iCellEditor";
import { RefSelector } from "../../widgets/componentAnnotations";
import { AgCheckbox } from "../../widgets/agCheckbox";
import { getAriaCheckboxStateName } from "../../utils/aria";
import { Events } from "../../eventKeys";

export class CheckboxCellEditor extends PopupComponent implements ICellEditorComp {
    constructor() {
        super(/* html */`
            <div class="ag-cell-wrapper ag-cell-edit-wrapper ag-checkbox-edit">
                <ag-checkbox role="presentation" ref="eCheckbox"></ag-checkbox>
            </div>`
        );
    }

    @RefSelector('eCheckbox') private eCheckbox: AgCheckbox;
    private params: ICellEditorParams<any, boolean>

    public init(params: ICellEditorParams<any, boolean>): void {
        this.params = params;
        const isSelected = params.value ?? undefined;

        this.eCheckbox.setValue(isSelected);

        const inputEl = this.eCheckbox.getInputElement();
        inputEl.setAttribute('tabindex', '-1');

        this.setAriaLabel(isSelected);

        this.addManagedListener(
            this.eCheckbox,
            Events.EVENT_FIELD_VALUE_CHANGED,
            (event: { selected?: boolean }) => this.setAriaLabel(event.selected)
        );
    }

    public getValue(): boolean | undefined {
        return this.eCheckbox.getValue();
    }

    public focusIn(): void {
        this.eCheckbox.getFocusableElement().focus();
    }

    public afterGuiAttached(): void {
        if (this.params.cellStartedEdit) {
            this.focusIn();
        }
    }

    public isPopup() {
        return false;
    }

    private setAriaLabel(isSelected?: boolean): void {
        const translate = this.localeService.getLocaleTextFunc();
        const stateName = getAriaCheckboxStateName(translate, isSelected);
        const ariaLabel = translate('ariaToggleCellValue', 'Press SPACE to toggle cell value');
        this.eCheckbox.setInputAriaLabel(`${ariaLabel} (${stateName})`);
    }
}
