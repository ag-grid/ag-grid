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
var component_1 = require("./component");
var utils_1 = require("../utils");
var PopupComponent = /** @class */ (function (_super) {
    __extends(PopupComponent, _super);
    function PopupComponent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PopupComponent.prototype.isPopup = function () {
        return true;
    };
    PopupComponent.prototype.setParentComponent = function (container) {
        utils_1._.addCssClass(container.getGui(), 'ag-has-popup');
        _super.prototype.setParentComponent.call(this, container);
    };
    PopupComponent.prototype.destroy = function () {
        var parentComp = this.parentComponent;
        var hasParent = parentComp && parentComp.isAlive();
        if (hasParent) {
            utils_1._.removeCssClass(parentComp.getGui(), 'ag-has-popup');
        }
        _super.prototype.destroy.call(this);
    };
    return PopupComponent;
}(component_1.Component));
exports.PopupComponent = PopupComponent;
