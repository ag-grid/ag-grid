/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v27.0.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const textCellEditor_1 = require("./textCellEditor");
class PopupTextCellEditor extends textCellEditor_1.TextCellEditor {
    isPopup() {
        return true;
    }
}
exports.PopupTextCellEditor = PopupTextCellEditor;

//# sourceMappingURL=popupTextCellEditor.js.map
