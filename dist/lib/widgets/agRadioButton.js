/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.2.2
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
var agCheckbox_1 = require("./agCheckbox");
var AgRadioButton = /** @class */ (function (_super) {
    __extends(AgRadioButton, _super);
    function AgRadioButton() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.className = 'ag-radio-button';
        _this.inputType = 'radio';
        _this.iconMap = {
            selected: 'radioButtonOn',
            unselected: 'radioButtonOff'
        };
        return _this;
    }
    AgRadioButton.prototype.toggle = function () {
        var nextValue = this.getNextValue();
        this.setValue(nextValue);
    };
    AgRadioButton.prototype.getIconName = function () {
        var value = this.getValue();
        var prop = value ? 'selected' : 'unselected';
        var readOnlyStr = this.isReadOnly() ? 'ReadOnly' : '';
        return "" + this.iconMap[prop] + readOnlyStr;
    };
    return AgRadioButton;
}(agCheckbox_1.AgCheckbox));
exports.AgRadioButton = AgRadioButton;
