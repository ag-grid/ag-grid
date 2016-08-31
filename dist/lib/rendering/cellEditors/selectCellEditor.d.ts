// Type definitions for ag-grid v5.3.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { Component } from "../../widgets/component";
import { ICellEditor } from "./iCellEditor";
export declare class SelectCellEditor extends Component implements ICellEditor {
    constructor();
    init(params: any): void;
    afterGuiAttached(): void;
    getValue(): any;
}
