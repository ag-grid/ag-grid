// Type definitions for @ag-grid-community/core v31.0.0
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
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
