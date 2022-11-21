import { doOnce } from "../../utils/function";
import { TextCellEditor } from "./textCellEditor";

/**
 * @deprecated Since v27.1 The PopupTextCellEditor (agPopupTextCellEditor) is deprecated. Instead use {cellEditor: "agTextCellEditor", cellEditorPopup: true} ')
 */
export class PopupTextCellEditor extends TextCellEditor {

    constructor() {
        super();
        doOnce( ()=> console.warn('AG Grid: The PopupTextCellEditor (agPopupTextCellEditor) is deprecated. Instead use {cellEditor: "agTextCellEditor", cellEditorPopup: true} '), 'PopupTextCellEditor.deprecated');
    }

    public isPopup(): boolean {
        return true;
    }

}
