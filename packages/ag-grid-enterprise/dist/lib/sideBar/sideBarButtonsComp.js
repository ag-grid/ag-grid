// ag-grid-enterprise v21.2.2
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var ag_grid_community_1 = require("ag-grid-community");
var SideBarButtonsComp = /** @class */ (function (_super) {
    __extends(SideBarButtonsComp, _super);
    function SideBarButtonsComp() {
        var _this = _super.call(this, SideBarButtonsComp.TEMPLATE) || this;
        _this.buttonComps = [];
        return _this;
    }
    SideBarButtonsComp.prototype.setToolPanelDefs = function (toolPanelDefs) {
        toolPanelDefs.forEach(this.addButtonComp.bind(this));
    };
    SideBarButtonsComp.prototype.setActiveButton = function (id) {
        this.buttonComps.forEach(function (comp) {
            comp.setSelected(id === comp.getToolPanelId());
        });
    };
    SideBarButtonsComp.prototype.addButtonComp = function (def) {
        var _this = this;
        var buttonComp = new SideBarButtonComp(def);
        this.getContext().wireBean(buttonComp);
        this.buttonComps.push(buttonComp);
        this.getGui().appendChild(buttonComp.getGui());
        buttonComp.addEventListener(SideBarButtonComp.EVENT_TOGGLE_BUTTON_CLICKED, function () {
            _this.dispatchEvent({
                type: SideBarButtonsComp.EVENT_SIDE_BAR_BUTTON_CLICKED,
                toolPanelId: def.id
            });
        });
    };
    SideBarButtonsComp.prototype.clearButtons = function () {
        if (this.buttonComps) {
            this.buttonComps.forEach(function (comp) { return comp.destroy(); });
        }
        ag_grid_community_1._.clearElement(this.getGui());
        this.buttonComps.length = 0;
    };
    SideBarButtonsComp.prototype.destroy = function () {
        this.clearButtons();
        _super.prototype.destroy.call(this);
    };
    SideBarButtonsComp.EVENT_SIDE_BAR_BUTTON_CLICKED = 'sideBarButtonClicked';
    SideBarButtonsComp.TEMPLATE = "<div class=\"ag-side-buttons\"></div>";
    __decorate([
        ag_grid_community_1.Autowired("gridOptionsWrapper"),
        __metadata("design:type", ag_grid_community_1.GridOptionsWrapper)
    ], SideBarButtonsComp.prototype, "gridOptionsWrapper", void 0);
    return SideBarButtonsComp;
}(ag_grid_community_1.Component));
exports.SideBarButtonsComp = SideBarButtonsComp;
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
        var toggleButton = this.eToggleButton;
        var iconDiv = toggleButton.querySelector('div');
        iconDiv.insertAdjacentElement('afterbegin', ag_grid_community_1._.createIconNoSpan(this.toolPanelDef.iconKey, this.gridOptionsWrapper));
        this.addDestroyableEventListener(this.eToggleButton, 'click', this.onButtonPressed.bind(this));
    };
    SideBarButtonComp.prototype.createTemplate = function () {
        var translate = this.gridOptionsWrapper.getLocaleTextFunc();
        var def = this.toolPanelDef;
        var label = translate(def.labelKey, def.labelDefault);
        var res = "<div class=\"ag-side-button\">\n                <button type=\"button\" ref=\"eToggleButton\">\n                    <div></div>\n                    <span>" + label + "</span>\n                </button>\n            </div>";
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
        ag_grid_community_1.Autowired("gridOptionsWrapper"),
        __metadata("design:type", ag_grid_community_1.GridOptionsWrapper)
    ], SideBarButtonComp.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        ag_grid_community_1.RefSelector('eToggleButton'),
        __metadata("design:type", HTMLButtonElement)
    ], SideBarButtonComp.prototype, "eToggleButton", void 0);
    __decorate([
        ag_grid_community_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], SideBarButtonComp.prototype, "postConstruct", null);
    return SideBarButtonComp;
}(ag_grid_community_1.Component));
