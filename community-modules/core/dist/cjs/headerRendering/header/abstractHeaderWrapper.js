/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v26.0.0
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
var keyboard_1 = require("../../utils/keyboard");
var component_1 = require("../../widgets/component");
var context_1 = require("../../context/context");
var AbstractHeaderWrapper = /** @class */ (function (_super) {
    __extends(AbstractHeaderWrapper, _super);
    function AbstractHeaderWrapper() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AbstractHeaderWrapper.prototype.shouldStopEventPropagation = function (e) {
        var _a = this.focusService.getFocusedHeader(), headerRowIndex = _a.headerRowIndex, column = _a.column;
        return keyboard_1.isUserSuppressingHeaderKeyboardEvent(this.gridOptionsWrapper, e, headerRowIndex, column);
    };
    AbstractHeaderWrapper.prototype.getColumn = function () {
        return this.column;
    };
    AbstractHeaderWrapper.prototype.getPinned = function () {
        return this.pinned;
    };
    __decorate([
        context_1.Autowired('focusService')
    ], AbstractHeaderWrapper.prototype, "focusService", void 0);
    return AbstractHeaderWrapper;
}(component_1.Component));
exports.AbstractHeaderWrapper = AbstractHeaderWrapper;

//# sourceMappingURL=abstractHeaderWrapper.js.map
