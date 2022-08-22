/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.1.1
 * @link https://www.ag-grid.com/
 * @license MIT
 */
import { doOnce } from "../../utils/function";
import { TextCellEditor } from "./textCellEditor";
export class PopupTextCellEditor extends TextCellEditor {
    constructor() {
        super();
        doOnce(() => console.warn('AG Grid: The PopupTextCellEditor (agPopupTextCellEditor) is deprecated. Instead use {cellEditor: "agTextCellEditor", cellEditorPopup: true} '), 'PopupTextCellEditor.deprecated');
    }
    isPopup() {
        return true;
    }
}
