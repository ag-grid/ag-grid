/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.1
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const function_1 = require("../../utils/function");
const textCellEditor_1 = require("./textCellEditor");
class PopupTextCellEditor extends textCellEditor_1.TextCellEditor {
    constructor() {
        super();
        function_1.doOnce(() => console.warn('AG Grid: The PopupTextCellEditor (agPopupTextCellEditor) is deprecated. Instead use {cellEditor: "agTextCellEditor", cellEditorPopup: true} '), 'PopupTextCellEditor.deprecated');
    }
    isPopup() {
        return true;
    }
}
exports.PopupTextCellEditor = PopupTextCellEditor;
