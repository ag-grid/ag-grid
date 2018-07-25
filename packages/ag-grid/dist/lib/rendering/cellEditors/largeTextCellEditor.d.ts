// Type definitions for ag-grid v18.1.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { ICellEditorComp } from "./iCellEditor";
import { ICellEditorParams } from "./iCellEditor";
import { Component } from "../../widgets/component";
export interface ILargeTextEditorParams extends ICellEditorParams {
    maxLength: number;
    rows: number;
    cols: number;
}
export declare class LargeTextCellEditor extends Component implements ICellEditorComp {
    private static TEMPLATE;
    private params;
    private textarea;
    private focusAfterAttached;
    constructor();
    init(params: ILargeTextEditorParams): void;
    private onKeyDown(event);
    afterGuiAttached(): void;
    getValue(): any;
    isPopup(): boolean;
}
