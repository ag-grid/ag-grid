"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgInputTextField = void 0;
const agAbstractInputField_1 = require("./agAbstractInputField");
const generic_1 = require("../utils/generic");
const keyboard_1 = require("../utils/keyboard");
class AgInputTextField extends agAbstractInputField_1.AgAbstractInputField {
    constructor(config, className = 'ag-text-field', inputType = 'text') {
        super(config, className, inputType);
    }
    postConstruct() {
        super.postConstruct();
        if (this.config.allowedCharPattern) {
            this.preventDisallowedCharacters();
        }
    }
    setValue(value, silent) {
        // update the input before we call super.setValue, so it's updated before the value changed event is fired
        if (this.eInput.value !== value) {
            this.eInput.value = (0, generic_1.exists)(value) ? value : '';
        }
        return super.setValue(value, silent);
    }
    /** Used to set an initial value into the input without necessarily setting `this.value` or triggering events (e.g. to set an invalid value) */
    setStartValue(value) {
        this.setValue(value, true);
    }
    preventDisallowedCharacters() {
        const pattern = new RegExp(`[${this.config.allowedCharPattern}]`);
        const preventCharacters = (event) => {
            if (!(0, keyboard_1.isEventFromPrintableCharacter)(event)) {
                return;
            }
            if (event.key && !pattern.test(event.key)) {
                event.preventDefault();
            }
        };
        this.addManagedListener(this.eInput, 'keydown', preventCharacters);
        this.addManagedListener(this.eInput, 'paste', (e) => {
            var _a;
            const text = (_a = e.clipboardData) === null || _a === void 0 ? void 0 : _a.getData('text');
            if (text && text.split('').some((c) => !pattern.test(c))) {
                e.preventDefault();
            }
        });
    }
}
exports.AgInputTextField = AgInputTextField;
