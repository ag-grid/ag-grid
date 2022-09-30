/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { doOnce } from "../../utils/function";
import { SelectCellEditor } from "./selectCellEditor";
var PopupSelectCellEditor = /** @class */ (function (_super) {
    __extends(PopupSelectCellEditor, _super);
    function PopupSelectCellEditor() {
        var _this = _super.call(this) || this;
        doOnce(function () { return console.warn('AG Grid: The PopupSelectCellEditor (agPopupSelectCellEditor) is deprecated. Instead use {cellEditor: "agSelectCellEditor", cellEditorPopup: true} '); }, 'PopupSelectCellEditor.deprecated');
        return _this;
    }
    PopupSelectCellEditor.prototype.isPopup = function () {
        return true;
    };
    return PopupSelectCellEditor;
}(SelectCellEditor));
export { PopupSelectCellEditor };
