/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.1.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractHeaderCellComp = void 0;
var component_1 = require("../../../widgets/component");
var AbstractHeaderCellComp = /** @class */ (function (_super) {
    __extends(AbstractHeaderCellComp, _super);
    function AbstractHeaderCellComp(template, ctrl) {
        var _this = _super.call(this, template) || this;
        _this.ctrl = ctrl;
        return _this;
    }
    AbstractHeaderCellComp.prototype.getCtrl = function () {
        return this.ctrl;
    };
    return AbstractHeaderCellComp;
}(component_1.Component));
exports.AbstractHeaderCellComp = AbstractHeaderCellComp;
