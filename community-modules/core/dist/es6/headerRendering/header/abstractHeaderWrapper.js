/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v23.2.1
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
var AbstractHeaderWrapper = /** @class */ (function (_super) {
    __extends(AbstractHeaderWrapper, _super);
    function AbstractHeaderWrapper() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AbstractHeaderWrapper.prototype.getColumn = function () {
        return this.column;
    };
    AbstractHeaderWrapper.prototype.getPinned = function () {
        return this.pinned;
    };
    return AbstractHeaderWrapper;
}(ManagedFocusComponent));
export { AbstractHeaderWrapper };
