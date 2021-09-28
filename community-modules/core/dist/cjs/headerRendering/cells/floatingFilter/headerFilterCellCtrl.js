/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v26.1.0
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
var abstractHeaderCellCtrl_1 = require("../abstractCell/abstractHeaderCellCtrl");
var HeaderFilterCellCtrl = /** @class */ (function (_super) {
    __extends(HeaderFilterCellCtrl, _super);
    function HeaderFilterCellCtrl(column, parentRowCtrl) {
        return _super.call(this, column, parentRowCtrl) || this;
    }
    HeaderFilterCellCtrl.prototype.setComp = function (comp, eGui) {
        _super.prototype.setGui.call(this, eGui);
    };
    return HeaderFilterCellCtrl;
}(abstractHeaderCellCtrl_1.AbstractHeaderCellCtrl));
exports.HeaderFilterCellCtrl = HeaderFilterCellCtrl;

//# sourceMappingURL=headerFilterCellCtrl.js.map
