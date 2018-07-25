// Type definitions for ag-grid v18.1.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Component } from "../../widgets/component";
import { ICellEditorComp, ICellEditorParams } from "./iCellEditor";
import { GridOptionsWrapper } from "../../gridOptionsWrapper";
export declare class PopupEditorWrapper extends Component implements ICellEditorComp {
    private cellEditor;
    private params;
    private getGuiCalledOnChild;
    static DOM_KEY_POPUP_EDITOR_WRAPPER: string;
    gridOptionsWrapper: GridOptionsWrapper;
    constructor(cellEditor: ICellEditorComp);
    private onKeyDown(event);
    getGui(): HTMLElement;
    init(params: ICellEditorParams): void;
    afterGuiAttached(): void;
    getValue(): any;
    isPopup(): boolean;
    isCancelBeforeStart(): boolean;
    isCancelAfterEnd(): boolean;
    focusIn(): void;
    focusOut(): void;
}
