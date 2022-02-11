/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v27.0.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
import { TextCellEditor } from "./textCellEditor";
export class PopupTextCellEditor extends TextCellEditor {
    isPopup() {
        return true;
    }
}
