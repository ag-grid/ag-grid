import { PopupComponent } from "../../widgets/popupComponent";
import { ICellEditorParams } from "../../interfaces/iCellEditor";
export declare class PopupEditorWrapper extends PopupComponent {
    static DOM_KEY_POPUP_EDITOR_WRAPPER: string;
    constructor(params: ICellEditorParams);
    private postConstruct;
    private addKeyDownListener;
}
