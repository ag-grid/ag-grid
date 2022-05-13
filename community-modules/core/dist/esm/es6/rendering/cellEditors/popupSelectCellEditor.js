/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v27.3.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
import { doOnce } from "../../utils/function";
import { SelectCellEditor } from "./selectCellEditor";
export class PopupSelectCellEditor extends SelectCellEditor {
    constructor() {
        super();
        doOnce(() => console.warn('AG Grid: The PopupSelectCellEditor (agPopupSelectCellEditor) is deprecated. Instead use {cellEditor: "agSelectCellEditor", cellEditorPopup: true} '), 'PopupSelectCellEditor.deprecated');
    }
    isPopup() {
        return true;
    }
}

//# sourceMappingURL=popupSelectCellEditor.js.map
