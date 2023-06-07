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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Component, PostConstruct, RefSelector, _, } from "@ag-grid-community/core";
var SideBarButtonComp = /** @class */ (function (_super) {
    __extends(SideBarButtonComp, _super);
    function SideBarButtonComp(toolPanelDef) {
        var _this = _super.call(this) || this;
        _this.toolPanelDef = toolPanelDef;
        return _this;
    }
    SideBarButtonComp.prototype.getToolPanelId = function () {
        return this.toolPanelDef.id;
    };
    SideBarButtonComp.prototype.postConstruct = function () {
        var template = this.createTemplate();
        this.setTemplate(template);
        this.setLabel();
        this.setIcon();
        this.addManagedListener(this.eToggleButton, 'click', this.onButtonPressed.bind(this));
        this.eToggleButton.setAttribute('id', "ag-" + this.getCompId() + "-button");
    };
    SideBarButtonComp.prototype.createTemplate = function () {
        var res = /* html */ "<div class=\"ag-side-button\" role=\"presentation\">\n                <button type=\"button\" ref=\"eToggleButton\" tabindex=\"-1\" role=\"tab\" aria-expanded=\"false\" class=\"ag-button ag-side-button-button\">\n                    <div ref=\"eIconWrapper\" class=\"ag-side-button-icon-wrapper\" aria-hidden=\"true\"></div>\n                    <span ref =\"eLabel\" class=\"ag-side-button-label\"></span>\n                </button>\n            </div>";
        return res;
    };
    SideBarButtonComp.prototype.setLabel = function () {
        var translate = this.localeService.getLocaleTextFunc();
        var def = this.toolPanelDef;
        var label = translate(def.labelKey, def.labelDefault);
        this.eLabel.innerText = label;
    };
    SideBarButtonComp.prototype.setIcon = function () {
        this.eIconWrapper.insertAdjacentElement('afterbegin', _.createIconNoSpan(this.toolPanelDef.iconKey, this.gridOptionsService));
    };
    SideBarButtonComp.prototype.onButtonPressed = function () {
        this.dispatchEvent({ type: SideBarButtonComp.EVENT_TOGGLE_BUTTON_CLICKED });
    };
    SideBarButtonComp.prototype.setSelected = function (selected) {
        this.addOrRemoveCssClass('ag-selected', selected);
        _.setAriaExpanded(this.eToggleButton, selected);
    };
    SideBarButtonComp.prototype.getButtonElement = function () {
        return this.eToggleButton;
    };
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
    return SideBarButtonComp;
}(Component));
export { SideBarButtonComp };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2lkZUJhckJ1dHRvbkNvbXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc2lkZUJhci9zaWRlQmFyQnV0dG9uQ29tcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxPQUFPLEVBQ0gsU0FBUyxFQUNULGFBQWEsRUFDYixXQUFXLEVBRVgsQ0FBQyxHQUNKLE1BQU0seUJBQXlCLENBQUM7QUFFakM7SUFBdUMscUNBQVM7SUFVNUMsMkJBQVksWUFBMEI7UUFBdEMsWUFDSSxpQkFBTyxTQUVWO1FBREcsS0FBSSxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUM7O0lBQ3JDLENBQUM7SUFFTSwwQ0FBYyxHQUFyQjtRQUNJLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUM7SUFDaEMsQ0FBQztJQUdPLHlDQUFhLEdBQXJCO1FBQ0ksSUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDM0IsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ2hCLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNmLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ3RGLElBQUksQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxRQUFNLElBQUksQ0FBQyxTQUFTLEVBQUUsWUFBUyxDQUFDLENBQUM7SUFDM0UsQ0FBQztJQUVPLDBDQUFjLEdBQXRCO1FBQ0ksSUFBTSxHQUFHLEdBQUcsVUFBVSxDQUNsQix1Y0FLTyxDQUFDO1FBQ1osT0FBTyxHQUFHLENBQUM7SUFDZixDQUFDO0lBRU8sb0NBQVEsR0FBaEI7UUFDSSxJQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDekQsSUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQztRQUM5QixJQUFNLEtBQUssR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7UUFFeEQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO0lBQ2xDLENBQUM7SUFFTyxtQ0FBTyxHQUFmO1FBQ0ksSUFBSSxDQUFDLFlBQVksQ0FBQyxxQkFBcUIsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBRSxDQUFDLENBQUM7SUFDbkksQ0FBQztJQUVPLDJDQUFlLEdBQXZCO1FBQ0ksSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFFLElBQUksRUFBRSxpQkFBaUIsQ0FBQywyQkFBMkIsRUFBRSxDQUFDLENBQUM7SUFDaEYsQ0FBQztJQUVNLHVDQUFXLEdBQWxCLFVBQW1CLFFBQWlCO1FBQ2hDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxhQUFhLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDbEQsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ3BELENBQUM7SUFFTSw0Q0FBZ0IsR0FBdkI7UUFDSSxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUM7SUFDOUIsQ0FBQztJQTdEYSw2Q0FBMkIsR0FBRyxxQkFBcUIsQ0FBQztJQUVwQztRQUE3QixXQUFXLENBQUMsZUFBZSxDQUFDOzREQUFtRDtJQUNuRDtRQUE1QixXQUFXLENBQUMsY0FBYyxDQUFDOzJEQUE0QztJQUNqRDtRQUF0QixXQUFXLENBQUMsUUFBUSxDQUFDO3FEQUFzQztJQWM1RDtRQURDLGFBQWE7MERBUWI7SUFxQ0wsd0JBQUM7Q0FBQSxBQWhFRCxDQUF1QyxTQUFTLEdBZ0UvQztTQWhFWSxpQkFBaUIifQ==