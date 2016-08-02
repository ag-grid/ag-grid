// Type definitions for ag-grid v5.0.7
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { Component } from "../../widgets/component";
import { ICellEditor, ICellEditorParams } from "./iCellEditor";
export declare class PopupEditorWrapper extends Component implements ICellEditor {
    private cellEditor;
    private params;
    private getGuiCalledOnChild;
    constructor(cellEditor: ICellEditor);
    private onKeyDown(event);
    getGui(): HTMLElement;
    init(params: ICellEditorParams): void;
    afterGuiAttached(): void;
    getValue(): any;
    isPopup(): boolean;
    isCancelBeforeStart(): boolean;
    isCancelAfterEnd(): boolean;
}
