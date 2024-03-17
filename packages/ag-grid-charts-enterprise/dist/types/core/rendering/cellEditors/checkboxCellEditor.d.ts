import { PopupComponent } from "../../widgets/popupComponent";
import { ICellEditorComp, ICellEditorParams } from "../../interfaces/iCellEditor";
export declare class CheckboxCellEditor extends PopupComponent implements ICellEditorComp {
    constructor();
    private eCheckbox;
    private params;
    init(params: ICellEditorParams<any, boolean>): void;
    getValue(): boolean | undefined;
    focusIn(): void;
    afterGuiAttached(): void;
    isPopup(): boolean;
    private setAriaLabel;
}
