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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Bean } from "../context/context";
import { BeanStub } from "../context/beanStub";
var CellPositionUtils = /** @class */ (function (_super) {
    __extends(CellPositionUtils, _super);
    function CellPositionUtils() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CellPositionUtils.prototype.createId = function (cellPosition) {
        var rowIndex = cellPosition.rowIndex, rowPinned = cellPosition.rowPinned, column = cellPosition.column;
        return this.createIdFromValues(rowIndex, column, rowPinned);
    };
    CellPositionUtils.prototype.createIdFromValues = function (rowIndex, column, rowPinned) {
        return rowIndex + "." + (rowPinned == null ? 'null' : rowPinned) + "." + column.getId();
    };
    CellPositionUtils.prototype.equals = function (cellA, cellB) {
        var colsMatch = cellA.column === cellB.column;
        var floatingMatch = cellA.rowPinned === cellB.rowPinned;
        var indexMatch = cellA.rowIndex === cellB.rowIndex;
        return colsMatch && floatingMatch && indexMatch;
    };
    CellPositionUtils = __decorate([
        Bean('cellPositionUtils')
    ], CellPositionUtils);
    return CellPositionUtils;
}(BeanStub));
export { CellPositionUtils };
