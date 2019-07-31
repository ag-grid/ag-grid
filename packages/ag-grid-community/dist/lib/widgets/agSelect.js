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
var agAbstractInputField_1 = require("./agAbstractInputField");
var AgSelect = /** @class */ (function (_super) {
    __extends(AgSelect, _super);
    function AgSelect() {
        var _this = _super.call(this) || this;
        _this.className = 'ag-select';
        _this.displayTag = 'select';
        _this.inputType = '';
        _this.setTemplate(_this.TEMPLATE.replace(/%displayField%/g, _this.displayTag));
        return _this;
    }
    AgSelect.prototype.addOptions = function (options) {
        var _this = this;
        options.forEach(function (option) { return _this.addOption(option); });
        return this;
    };
    AgSelect.prototype.addOption = function (option) {
        var optionEl = document.createElement('option');
        optionEl.value = option.value;
        optionEl.text = option.text || option.value;
        this.eInput.appendChild(optionEl);
        return this;
    };
    AgSelect.prototype.setValue = function (value, silent) {
        var ret = _super.prototype.setValue.call(this, value, silent);
        this.eInput.value = value;
        return ret;
    };
    return AgSelect;
}(agAbstractInputField_1.AgAbstractInputField));
exports.AgSelect = AgSelect;
