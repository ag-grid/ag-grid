"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@ag-grid-community/core");
class SideBarButtonComp extends core_1.Component {
    constructor(toolPanelDef) {
        super();
        this.toolPanelDef = toolPanelDef;
    }
    getToolPanelId() {
        return this.toolPanelDef.id;
    }
    postConstruct() {
        const template = this.createTemplate();
        this.setTemplate(template);
        this.eIconWrapper.insertAdjacentElement('afterbegin', core_1._.createIconNoSpan(this.toolPanelDef.iconKey, this.gridOptionsWrapper));
        this.addManagedListener(this.eToggleButton, 'click', this.onButtonPressed.bind(this));
    }
    createTemplate() {
        const translate = this.gridOptionsWrapper.getLocaleTextFunc();
        const def = this.toolPanelDef;
        const label = translate(def.labelKey, def.labelDefault);
        const res = /* html */ `<div class="ag-side-button" role="presentation">
                <button type="button" ref="eToggleButton" tabindex="-1" role="tab" class="ag-side-button-button">
                    <div ref="eIconWrapper" class="ag-side-button-icon-wrapper" aria-hidden="true"></div>
                    <span class="ag-side-button-label">${label}</span>
                </button>
            </div>`;
        return res;
    }
    onButtonPressed() {
        this.dispatchEvent({ type: SideBarButtonComp.EVENT_TOGGLE_BUTTON_CLICKED });
    }
    setSelected(selected) {
        this.addOrRemoveCssClass('ag-selected', selected);
    }
}
SideBarButtonComp.EVENT_TOGGLE_BUTTON_CLICKED = 'toggleButtonClicked';
__decorate([
    core_1.RefSelector('eToggleButton')
], SideBarButtonComp.prototype, "eToggleButton", void 0);
__decorate([
    core_1.RefSelector('eIconWrapper')
], SideBarButtonComp.prototype, "eIconWrapper", void 0);
__decorate([
    core_1.PostConstruct
], SideBarButtonComp.prototype, "postConstruct", null);
exports.SideBarButtonComp = SideBarButtonComp;
