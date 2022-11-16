import { doOnce } from "../../utils/function";
import { SelectCellEditor } from "./selectCellEditor";

/**
 * @deprecated Since v27.1 The PopupSelectCellEditor (agPopupSelectCellEditor) is deprecated. Instead use {cellEditor: "agSelectCellEditor", cellEditorPopup: true}
 */
export class PopupSelectCellEditor extends SelectCellEditor {

    constructor() {
        super();
        doOnce(() => console.warn('AG Grid: The PopupSelectCellEditor (agPopupSelectCellEditor) is deprecated. Instead use {cellEditor: "agSelectCellEditor", cellEditorPopup: true} '), 'PopupSelectCellEditor.deprecated');
    }

    public isPopup(): boolean {
        return true;
    }

}
