// Type definitions for ag-grid v18.1.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Component } from "../../widgets/component";
import { ICellEditorComp, ICellEditorParams } from "./iCellEditor";
export interface ISelectCellEditorParams extends ICellEditorParams {
    values: any[];
}
export declare class SelectCellEditor extends Component implements ICellEditorComp {
    private focusAfterAttached;
    private eSelect;
    private gridOptionsWrapper;
    private valueFormatterService;
    constructor();
    init(params: ISelectCellEditorParams): void;
    afterGuiAttached(): void;
    focusIn(): void;
    getValue(): any;
}
