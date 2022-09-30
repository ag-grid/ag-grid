/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const function_1 = require("../../utils/function");
const selectCellEditor_1 = require("./selectCellEditor");
class PopupSelectCellEditor extends selectCellEditor_1.SelectCellEditor {
    constructor() {
        super();
        function_1.doOnce(() => console.warn('AG Grid: The PopupSelectCellEditor (agPopupSelectCellEditor) is deprecated. Instead use {cellEditor: "agSelectCellEditor", cellEditorPopup: true} '), 'PopupSelectCellEditor.deprecated');
    }
    isPopup() {
        return true;
    }
}
exports.PopupSelectCellEditor = PopupSelectCellEditor;
