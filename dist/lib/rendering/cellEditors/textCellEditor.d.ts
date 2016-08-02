// Type definitions for ag-grid v5.0.7
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { Component } from "../../widgets/component";
import { ICellEditor } from "./iCellEditor";
export declare class TextCellEditor extends Component implements ICellEditor {
    private static TEMPLATE;
    private highlightAllOnFocus;
    private putCursorAtEndOnFocus;
    constructor();
    init(params: any): void;
    afterGuiAttached(): void;
    getValue(): any;
}
