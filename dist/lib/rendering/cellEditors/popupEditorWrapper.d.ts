// Type definitions for ag-grid v4.2.5
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { Component } from "../../widgets/component";
import { ICellEditor } from "./iCellEditor";
export declare class PopupEditorWrapper extends Component implements ICellEditor {
    private cellEditor;
    private params;
    private getGuiCalledOnChild;
    constructor(cellEditor: ICellEditor);
    private onKeyDown(event);
    getGui(): HTMLElement;
    init(params: any): void;
    afterGuiAttached(): void;
    getValue(): any;
    isPopup(): boolean;
}
