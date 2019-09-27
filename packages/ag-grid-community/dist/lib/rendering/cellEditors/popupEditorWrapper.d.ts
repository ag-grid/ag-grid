// Type definitions for ag-grid-community v21.2.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { PopupComponent } from "../../widgets/popupComponent";
import { ICellEditorComp, ICellEditorParams } from "../../interfaces/iCellEditor";
import { GridOptionsWrapper } from "../../gridOptionsWrapper";
export declare class PopupEditorWrapper extends PopupComponent implements ICellEditorComp {
    private cellEditor;
    private params;
    private getGuiCalledOnChild;
    static DOM_KEY_POPUP_EDITOR_WRAPPER: string;
    gridOptionsWrapper: GridOptionsWrapper;
    constructor(cellEditor: ICellEditorComp);
    private onKeyDown;
    getGui(): HTMLElement;
    init(params: ICellEditorParams): void;
    afterGuiAttached(): void;
    getValue(): any;
    isCancelBeforeStart(): boolean;
    isCancelAfterEnd(): boolean;
    focusIn(): void;
    focusOut(): void;
}
