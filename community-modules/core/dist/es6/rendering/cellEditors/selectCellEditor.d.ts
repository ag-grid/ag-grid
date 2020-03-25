// Type definitions for @ag-grid-community/core v23.0.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { ICellEditorComp, ICellEditorParams } from "../../interfaces/iCellEditor";
import { PopupComponent } from "../../widgets/popupComponent";
export interface ISelectCellEditorParams extends ICellEditorParams {
    values: any[];
}
export declare class SelectCellEditor extends PopupComponent implements ICellEditorComp {
    private focusAfterAttached;
    private gridOptionsWrapper;
    private valueFormatterService;
    private eSelect;
    constructor();
    init(params: ISelectCellEditorParams): void;
    afterGuiAttached(): void;
    focusIn(): void;
    getValue(): any;
    isPopup(): boolean;
}
