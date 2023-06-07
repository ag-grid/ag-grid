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
        this.eToggleButton.setAttribute('id', `ag-${this.getCompId()}-button`);
    }
    createTemplate() {
        const res = /* html */ `<div class="ag-side-button" role="presentation">
                <button type="button" ref="eToggleButton" tabindex="-1" role="tab" aria-expanded="false" class="ag-button ag-side-button-button">
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
        _.setAriaExpanded(this.eToggleButton, selected);
    }
    getButtonElement() {
        return this.eToggleButton;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2lkZUJhckJ1dHRvbkNvbXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc2lkZUJhci9zaWRlQmFyQnV0dG9uQ29tcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxPQUFPLEVBQ0gsU0FBUyxFQUNULGFBQWEsRUFDYixXQUFXLEVBRVgsQ0FBQyxHQUNKLE1BQU0seUJBQXlCLENBQUM7QUFFakMsTUFBTSxPQUFPLGlCQUFrQixTQUFRLFNBQVM7SUFVNUMsWUFBWSxZQUEwQjtRQUNsQyxLQUFLLEVBQUUsQ0FBQztRQUNSLElBQUksQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFDO0lBQ3JDLENBQUM7SUFFTSxjQUFjO1FBQ2pCLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUM7SUFDaEMsQ0FBQztJQUdPLGFBQWE7UUFDakIsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDM0IsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ2hCLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNmLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ3RGLElBQUksQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxNQUFNLElBQUksQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDM0UsQ0FBQztJQUVPLGNBQWM7UUFDbEIsTUFBTSxHQUFHLEdBQUcsVUFBVSxDQUNsQjs7Ozs7bUJBS08sQ0FBQztRQUNaLE9BQU8sR0FBRyxDQUFDO0lBQ2YsQ0FBQztJQUVPLFFBQVE7UUFDWixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDekQsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQztRQUM5QixNQUFNLEtBQUssR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7UUFFeEQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO0lBQ2xDLENBQUM7SUFFTyxPQUFPO1FBQ1gsSUFBSSxDQUFDLFlBQVksQ0FBQyxxQkFBcUIsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBRSxDQUFDLENBQUM7SUFDbkksQ0FBQztJQUVPLGVBQWU7UUFDbkIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFFLElBQUksRUFBRSxpQkFBaUIsQ0FBQywyQkFBMkIsRUFBRSxDQUFDLENBQUM7SUFDaEYsQ0FBQztJQUVNLFdBQVcsQ0FBQyxRQUFpQjtRQUNoQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsYUFBYSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ2xELENBQUMsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUNwRCxDQUFDO0lBRU0sZ0JBQWdCO1FBQ25CLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQztJQUM5QixDQUFDOztBQTdEYSw2Q0FBMkIsR0FBRyxxQkFBcUIsQ0FBQztBQUVwQztJQUE3QixXQUFXLENBQUMsZUFBZSxDQUFDO3dEQUFtRDtBQUNuRDtJQUE1QixXQUFXLENBQUMsY0FBYyxDQUFDO3VEQUE0QztBQUNqRDtJQUF0QixXQUFXLENBQUMsUUFBUSxDQUFDO2lEQUFzQztBQWM1RDtJQURDLGFBQWE7c0RBUWIifQ==