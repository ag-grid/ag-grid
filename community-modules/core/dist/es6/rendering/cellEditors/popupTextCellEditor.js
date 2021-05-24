/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
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
import { TextCellEditor } from "./textCellEditor";
var PopupTextCellEditor = /** @class */ (function (_super) {
    __extends(PopupTextCellEditor, _super);
    function PopupTextCellEditor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PopupTextCellEditor.prototype.isPopup = function () {
        return true;
    };
    return PopupTextCellEditor;
}(TextCellEditor));
export { PopupTextCellEditor };
