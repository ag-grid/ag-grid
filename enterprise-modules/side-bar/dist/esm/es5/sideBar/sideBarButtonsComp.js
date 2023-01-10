var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
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
import { Autowired, Component, PostConstruct, PreDestroy, _, KeyCode } from "@ag-grid-community/core";
import { SideBarButtonComp } from "./sideBarButtonComp";
var SideBarButtonsComp = /** @class */ (function (_super) {
    __extends(SideBarButtonsComp, _super);
    function SideBarButtonsComp() {
        var _this = _super.call(this, SideBarButtonsComp.TEMPLATE) || this;
        _this.buttonComps = [];
        return _this;
    }
    SideBarButtonsComp.prototype.postConstruct = function () {
        this.addManagedListener(this.getFocusableElement(), 'keydown', this.handleKeyDown.bind(this));
    };
    SideBarButtonsComp.prototype.handleKeyDown = function (e) {
        if (e.key !== KeyCode.TAB || !e.shiftKey) {
            return;
        }
        var lastColumn = _.last(this.columnModel.getAllDisplayedColumns());
        if (this.focusService.focusGridView(lastColumn, true)) {
            e.preventDefault();
        }
    };
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
        var buttonComp = this.createBean(new SideBarButtonComp(def));
        this.buttonComps.push(buttonComp);
        this.appendChild(buttonComp);
        buttonComp.addEventListener(SideBarButtonComp.EVENT_TOGGLE_BUTTON_CLICKED, function () {
            _this.dispatchEvent({
                type: SideBarButtonsComp.EVENT_SIDE_BAR_BUTTON_CLICKED,
                toolPanelId: def.id
            });
        });
    };
    SideBarButtonsComp.prototype.clearButtons = function () {
        this.buttonComps = this.destroyBeans(this.buttonComps);
        _.clearElement(this.getGui());
    };
    SideBarButtonsComp.EVENT_SIDE_BAR_BUTTON_CLICKED = 'sideBarButtonClicked';
    SideBarButtonsComp.TEMPLATE = "<div class=\"ag-side-buttons\" role=\"tablist\"></div>";
    __decorate([
        Autowired('focusService')
    ], SideBarButtonsComp.prototype, "focusService", void 0);
    __decorate([
        Autowired('columnModel')
    ], SideBarButtonsComp.prototype, "columnModel", void 0);
    __decorate([
        PostConstruct
    ], SideBarButtonsComp.prototype, "postConstruct", null);
    __decorate([
        PreDestroy
    ], SideBarButtonsComp.prototype, "clearButtons", null);
    return SideBarButtonsComp;
}(Component));
export { SideBarButtonsComp };
