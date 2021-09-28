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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var keyboard_1 = require("../../../utils/keyboard");
var component_1 = require("../../../widgets/component");
var context_1 = require("../../../context/context");
var AbstractHeaderCellComp = /** @class */ (function (_super) {
    __extends(AbstractHeaderCellComp, _super);
    function AbstractHeaderCellComp(template, ctrl) {
        var _this = _super.call(this, template) || this;
        _this.ctrl = ctrl;
        return _this;
    }
    /// temp - this is in the AbstractHeaderCellCtrl also, once all comps refactored, this can be removed
    AbstractHeaderCellComp.prototype.shouldStopEventPropagation = function (e) {
        var _a = this.focusService.getFocusedHeader(), headerRowIndex = _a.headerRowIndex, column = _a.column;
        return keyboard_1.isUserSuppressingHeaderKeyboardEvent(this.gridOptionsWrapper, e, headerRowIndex, column);
    };
    AbstractHeaderCellComp.prototype.getCtrl = function () {
        return this.ctrl;
    };
    __decorate([
        context_1.Autowired('focusService')
    ], AbstractHeaderCellComp.prototype, "focusService", void 0);
    return AbstractHeaderCellComp;
}(component_1.Component));
exports.AbstractHeaderCellComp = AbstractHeaderCellComp;

//# sourceMappingURL=abstractHeaderCellComp.js.map
