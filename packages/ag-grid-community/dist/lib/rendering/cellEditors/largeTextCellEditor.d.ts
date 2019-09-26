// Type definitions for ag-grid-community v21.2.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { PopupComponent } from "../../widgets/popupComponent";
import { ICellEditorComp, ICellEditorParams } from "../../interfaces/iCellEditor";
export interface ILargeTextEditorParams extends ICellEditorParams {
    maxLength: number;
    rows: number;
    cols: number;
}
export declare class LargeTextCellEditor extends PopupComponent implements ICellEditorComp {
    private static TEMPLATE;
    private params;
    private textarea;
    private focusAfterAttached;
    constructor();
    init(params: ILargeTextEditorParams): void;
    private onKeyDown;
    afterGuiAttached(): void;
    getValue(): any;
}
