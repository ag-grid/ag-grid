/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const agAbstractInputField_1 = require("./agAbstractInputField");
const generic_1 = require("../utils/generic");
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
        const ret = super.setValue(value, silent);
        if (this.eInput.value !== value) {
            this.eInput.value = generic_1.exists(value) ? value : '';
        }
        return ret;
    }
    preventDisallowedCharacters() {
        const pattern = new RegExp(`[${this.config.allowedCharPattern}]`);
        const preventDisallowedCharacters = (event) => {
            if (event.key && !pattern.test(event.key)) {
                event.preventDefault();
            }
        };
        this.addManagedListener(this.eInput, 'keypress', preventDisallowedCharacters);
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
