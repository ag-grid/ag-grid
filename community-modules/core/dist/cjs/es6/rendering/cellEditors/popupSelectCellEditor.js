/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v27.0.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const selectCellEditor_1 = require("./selectCellEditor");
class PopupSelectCellEditor extends selectCellEditor_1.SelectCellEditor {
    isPopup() {
        return true;
    }
}
exports.PopupSelectCellEditor = PopupSelectCellEditor;

//# sourceMappingURL=popupSelectCellEditor.js.map
