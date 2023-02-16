/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.1.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
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
import { AgAbstractInputField } from './agAbstractInputField';
import { exists } from '../utils/generic';
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
            this.eInput.value = exists(value) ? value : '';
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
            var _a;
            var text = (_a = e.clipboardData) === null || _a === void 0 ? void 0 : _a.getData('text');
            if (text && text.split('').some(function (c) { return !pattern.test(c); })) {
                e.preventDefault();
            }
        });
    };
    return AgInputTextField;
}(AgAbstractInputField));
export { AgInputTextField };
