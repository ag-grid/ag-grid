var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { AgAbstractInputField } from './agAbstractInputField';
import { exists } from '../utils/generic';
import { isEventFromPrintableCharacter } from '../utils/keyboard';
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
        // update the input before we call super.setValue, so it's updated before the value changed event is fired
        if (this.eInput.value !== value) {
            this.eInput.value = exists(value) ? value : '';
        }
        return _super.prototype.setValue.call(this, value, silent);
    };
    /** Used to set an initial value into the input without necessarily setting `this.value` or triggering events (e.g. to set an invalid value) */
    AgInputTextField.prototype.setStartValue = function (value) {
        this.setValue(value, true);
    };
    AgInputTextField.prototype.preventDisallowedCharacters = function () {
        var pattern = new RegExp("[".concat(this.config.allowedCharPattern, "]"));
        var preventCharacters = function (event) {
            if (!isEventFromPrintableCharacter(event)) {
                return;
            }
            if (event.key && !pattern.test(event.key)) {
                event.preventDefault();
            }
        };
        this.addManagedListener(this.eInput, 'keydown', preventCharacters);
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
