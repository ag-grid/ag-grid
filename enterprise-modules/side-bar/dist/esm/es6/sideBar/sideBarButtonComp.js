var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Component, PostConstruct, RefSelector, _, } from "@ag-grid-community/core";
export class SideBarButtonComp extends Component {
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
        this.setLabel();
        this.setIcon();
        this.addManagedListener(this.eToggleButton, 'click', this.onButtonPressed.bind(this));
    }
    createTemplate() {
        const res = /* html */ `<div class="ag-side-button" role="presentation">
                <button type="button" ref="eToggleButton" tabindex="-1" role="tab" class="ag-side-button-button">
                    <div ref="eIconWrapper" class="ag-side-button-icon-wrapper" aria-hidden="true"></div>
                    <span ref ="eLabel" class="ag-side-button-label"></span>
                </button>
            </div>`;
        return res;
    }
    setLabel() {
        const translate = this.localeService.getLocaleTextFunc();
        const def = this.toolPanelDef;
        const label = translate(def.labelKey, def.labelDefault);
        this.eLabel.innerText = label;
    }
    setIcon() {
        this.eIconWrapper.insertAdjacentElement('afterbegin', _.createIconNoSpan(this.toolPanelDef.iconKey, this.gridOptionsService));
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
    RefSelector('eToggleButton')
], SideBarButtonComp.prototype, "eToggleButton", void 0);
__decorate([
    RefSelector('eIconWrapper')
], SideBarButtonComp.prototype, "eIconWrapper", void 0);
__decorate([
    RefSelector('eLabel')
], SideBarButtonComp.prototype, "eLabel", void 0);
__decorate([
    PostConstruct
], SideBarButtonComp.prototype, "postConstruct", null);
