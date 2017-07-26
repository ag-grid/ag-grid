// Type definitions for ag-grid v12.0.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { Component } from "../../widgets/component";
import { ICellEditorComp } from "./iCellEditor";
export declare class SelectCellEditor extends Component implements ICellEditorComp {
    private focusAfterAttached;
    private eSelect;
    private gridOptionsWrapper;
    constructor();
    init(params: any): void;
    afterGuiAttached(): void;
    focusIn(): void;
    getValue(): any;
}
