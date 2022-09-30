var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Component, RefSelector } from '@ag-grid-community/core';
export class NameValueComp extends Component {
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
    RefSelector('eLabel')
], NameValueComp.prototype, "eLabel", void 0);
__decorate([
    RefSelector('eValue')
], NameValueComp.prototype, "eValue", void 0);
