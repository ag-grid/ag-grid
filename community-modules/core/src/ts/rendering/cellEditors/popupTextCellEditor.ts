import { doOnce } from "../../utils/function";
import { TextCellEditor } from "./textCellEditor";

export class PopupTextCellEditor extends TextCellEditor {

    constructor() {
        super();
        doOnce( ()=> console.warn('AG Grid: The PopupTextCellEditor (agPopupTextCellEditor) is deprecated. Instead use {cellEditor: "agTextCellEditor", cellEditorPopup: true} '), 'PopupTextCellEditor.deprecated');
    }

    public isPopup(): boolean {
        return true;
    }

}
