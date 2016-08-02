/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v5.0.7
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var selectCellEditor_1 = require("./selectCellEditor");
var PopupSelectCellEditor = (function (_super) {
    __extends(PopupSelectCellEditor, _super);
    function PopupSelectCellEditor() {
        _super.apply(this, arguments);
    }
    PopupSelectCellEditor.prototype.isPopup = function () {
        return true;
    };
    return PopupSelectCellEditor;
})(selectCellEditor_1.SelectCellEditor);
exports.PopupSelectCellEditor = PopupSelectCellEditor;
