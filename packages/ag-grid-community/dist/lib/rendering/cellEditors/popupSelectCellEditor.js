/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.1.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var selectCellEditor_1 = require("./selectCellEditor");
var PopupSelectCellEditor = /** @class */ (function (_super) {
    __extends(PopupSelectCellEditor, _super);
    function PopupSelectCellEditor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PopupSelectCellEditor.prototype.isPopup = function () {
        return true;
    };
    return PopupSelectCellEditor;
}(selectCellEditor_1.SelectCellEditor));
exports.PopupSelectCellEditor = PopupSelectCellEditor;
