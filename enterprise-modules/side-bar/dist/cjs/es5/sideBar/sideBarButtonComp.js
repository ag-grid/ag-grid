"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
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
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@ag-grid-community/core");
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
        this.eIconWrapper.insertAdjacentElement('afterbegin', core_1._.createIconNoSpan(this.toolPanelDef.iconKey, this.gridOptionsWrapper));
        this.addManagedListener(this.eToggleButton, 'click', this.onButtonPressed.bind(this));
    };
    SideBarButtonComp.prototype.createTemplate = function () {
        var translate = this.gridOptionsWrapper.getLocaleTextFunc();
        var def = this.toolPanelDef;
        var label = translate(def.labelKey, def.labelDefault);
        var res = /* html */ "<div class=\"ag-side-button\" role=\"presentation\">\n                <button type=\"button\" ref=\"eToggleButton\" tabindex=\"-1\" role=\"tab\" class=\"ag-side-button-button\">\n                    <div ref=\"eIconWrapper\" class=\"ag-side-button-icon-wrapper\" aria-hidden=\"true\"></div>\n                    <span class=\"ag-side-button-label\">" + label + "</span>\n                </button>\n            </div>";
        return res;
    };
    SideBarButtonComp.prototype.onButtonPressed = function () {
        this.dispatchEvent({ type: SideBarButtonComp.EVENT_TOGGLE_BUTTON_CLICKED });
    };
    SideBarButtonComp.prototype.setSelected = function (selected) {
        this.addOrRemoveCssClass('ag-selected', selected);
    };
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
    return SideBarButtonComp;
}(core_1.Component));
exports.SideBarButtonComp = SideBarButtonComp;
