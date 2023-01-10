// Type definitions for @ag-grid-community/core v29.0.0
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { PopupComponent } from "../../widgets/popupComponent";
import { ICellEditorParams } from "../../interfaces/iCellEditor";
export declare class PopupEditorWrapper extends PopupComponent {
    private readonly params;
    static DOM_KEY_POPUP_EDITOR_WRAPPER: string;
    constructor(params: ICellEditorParams);
    private postConstruct;
    private addKeyDownListener;
}
