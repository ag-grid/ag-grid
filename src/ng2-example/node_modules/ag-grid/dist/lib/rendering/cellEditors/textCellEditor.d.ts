// Type definitions for ag-grid v6.2.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { Component } from "../../widgets/component";
import { ICellEditor, ICellEditorParams } from "./iCellEditor";
export declare class TextCellEditor extends Component implements ICellEditor {
    private static TEMPLATE;
    private highlightAllOnFocus;
    private focusAfterAttached;
    constructor();
    init(params: ICellEditorParams): void;
    afterGuiAttached(): void;
    focusIn(): void;
    getValue(): any;
}
