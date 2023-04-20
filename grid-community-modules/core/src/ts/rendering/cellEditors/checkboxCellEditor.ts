import { PopupComponent } from "../../widgets/popupComponent";
import { ICellEditorComp, ICellEditorParams } from "../../interfaces/iCellEditor";
import { RefSelector } from "../../widgets/componentAnnotations";
import { AgCheckbox } from "../../widgets/agCheckbox";

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
        this.eCheckbox.setValue(params.value ?? undefined);
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
}
