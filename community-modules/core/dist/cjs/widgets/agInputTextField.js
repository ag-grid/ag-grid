/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
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
var array_1 = require("../utils/array");
var generic_1 = require("../utils/generic");
var AgInputTextField = /** @class */ (function (_super) {
    __extends(AgInputTextField, _super);
    function AgInputTextField(config, className, inputType) {
        if (className === void 0) { className = 'ag-text-field'; }
        if (inputType === void 0) { inputType = 'text'; }
        return _super.call(this, config, className, inputType) || this;
    }
    AgInputTextField.prototype.postConstruct = function () {
        _super.prototype.postConstruct.call(this);
        if (this.config.allowedCharPattern) {
            this.preventDisallowedCharacters();
        }
    };
    AgInputTextField.prototype.setValue = function (value, silent) {
        var ret = _super.prototype.setValue.call(this, value, silent);
        if (this.eInput.value !== value) {
            this.eInput.value = generic_1.exists(value) ? value : '';
        }
        return ret;
    };
    AgInputTextField.prototype.preventDisallowedCharacters = function () {
        var pattern = new RegExp("[" + this.config.allowedCharPattern + "]");
        var preventDisallowedCharacters = function (event) {
            if (event.key && !pattern.test(event.key)) {
                event.preventDefault();
            }
        };
        this.addManagedListener(this.eInput, 'keypress', preventDisallowedCharacters);
        this.addManagedListener(this.eInput, 'paste', function (e) {
            var text = e.clipboardData.getData('text');
            if (array_1.some(text, function (c) { return !pattern.test(c); })) {
                e.preventDefault();
            }
        });
    };
    return AgInputTextField;
}(agAbstractInputField_1.AgAbstractInputField));
exports.AgInputTextField = AgInputTextField;

//# sourceMappingURL=agInputTextField.js.map
