// Type definitions for ag-grid-community v21.2.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { PopupComponent } from "../../widgets/popupComponent";
import { ICellEditorComp, ICellEditorParams } from "../../interfaces/iCellEditor";
export interface ISelectCellEditorParams extends ICellEditorParams {
    values: any[];
}
export declare class SelectCellEditor extends PopupComponent implements ICellEditorComp {
    private focusAfterAttached;
    private eSelect;
    private gridOptionsWrapper;
    private valueFormatterService;
    constructor();
    init(params: ISelectCellEditorParams): void;
    afterGuiAttached(): void;
    focusIn(): void;
    getValue(): any;
    isPopup(): boolean;
}
