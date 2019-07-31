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
var agAbstractLabel_1 = require("./agAbstractLabel");
var utils_1 = require("../utils");
var AgAbstractField = /** @class */ (function (_super) {
    __extends(AgAbstractField, _super);
    function AgAbstractField() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AgAbstractField.prototype.onValueChange = function (callbackFn) {
        var _this = this;
        this.addDestroyableEventListener(this, AgAbstractField.EVENT_CHANGED, function () {
            callbackFn(_this.getValue());
        });
        return this;
    };
    AgAbstractField.prototype.getWidth = function () {
        return this.getGui().clientWidth;
    };
    AgAbstractField.prototype.setWidth = function (width) {
        utils_1._.setFixedWidth(this.getGui(), width);
        return this;
    };
    AgAbstractField.prototype.getValue = function () {
        return this.value;
    };
    AgAbstractField.prototype.setValue = function (value, silent) {
        if (this.value === value) {
            return this;
        }
        this.value = value;
        if (!silent) {
            this.dispatchEvent({ type: AgAbstractField.EVENT_CHANGED });
        }
        return this;
    };
    AgAbstractField.EVENT_CHANGED = 'valueChange';
    return AgAbstractField;
}(agAbstractLabel_1.AgAbstractLabel));
exports.AgAbstractField = AgAbstractField;
