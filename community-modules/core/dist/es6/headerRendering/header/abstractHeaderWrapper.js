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
import { ManagedFocusComponent } from "../../widgets/managedFocusComponent";
import { isUserSuppressingHeaderKeyboardEvent } from "../../utils/keyboard";
var AbstractHeaderWrapper = /** @class */ (function (_super) {
    __extends(AbstractHeaderWrapper, _super);
    function AbstractHeaderWrapper() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AbstractHeaderWrapper.prototype.shouldStopEventPropagation = function (e) {
        var _a = this.focusController.getFocusedHeader(), headerRowIndex = _a.headerRowIndex, column = _a.column;
        return isUserSuppressingHeaderKeyboardEvent(this.gridOptionsWrapper, e, headerRowIndex, column);
    };
    AbstractHeaderWrapper.prototype.getColumn = function () {
        return this.column;
    };
    AbstractHeaderWrapper.prototype.getPinned = function () {
        return this.pinned;
    };
    return AbstractHeaderWrapper;
}(ManagedFocusComponent));
export { AbstractHeaderWrapper };
