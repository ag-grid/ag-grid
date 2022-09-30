"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@ag-grid-community/core");
class NameValueComp extends core_1.Component {
    constructor() {
        super(NameValueComp.TEMPLATE);
    }
    setLabel(key, defaultValue) {
        // we want to hide until the first value comes in
        this.setDisplayed(false);
        const localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        this.eLabel.innerHTML = localeTextFunc(key, defaultValue);
    }
    setValue(value) {
        this.eValue.innerHTML = value;
    }
}
NameValueComp.TEMPLATE = `<div class="ag-status-name-value">
            <span ref="eLabel"></span>:&nbsp;
            <span ref="eValue" class="ag-status-name-value-value"></span>
        </div>`;
__decorate([
    core_1.RefSelector('eLabel')
], NameValueComp.prototype, "eLabel", void 0);
__decorate([
    core_1.RefSelector('eValue')
], NameValueComp.prototype, "eValue", void 0);
exports.NameValueComp = NameValueComp;
