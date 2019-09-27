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
var sideBarButtonsComp_1 = require("./sideBarButtonsComp");
var toolPanelWrapper_1 = require("./toolPanelWrapper");
var SideBarComp = /** @class */ (function (_super) {
    __extends(SideBarComp, _super);
    function SideBarComp() {
        var _this = _super.call(this, SideBarComp.TEMPLATE) || this;
        _this.toolPanelWrappers = [];
        return _this;
    }
    SideBarComp.prototype.postConstruct = function () {
        this.sideBarButtonsComp.addEventListener(sideBarButtonsComp_1.SideBarButtonsComp.EVENT_SIDE_BAR_BUTTON_CLICKED, this.onToolPanelButtonClicked.bind(this));
        this.setSideBarDef();
    };
    SideBarComp.prototype.onToolPanelButtonClicked = function (event) {
        var id = event.toolPanelId;
        var openedItem = this.openedItem();
        // if item was already open, we close it
        if (openedItem === id) {
            this.openToolPanel(undefined); // passing undefined closes
        }
        else {
            this.openToolPanel(id);
        }
    };
    SideBarComp.prototype.clearDownUi = function () {
        this.sideBarButtonsComp.clearButtons();
        this.destroyToolPanelWrappers();
    };
    SideBarComp.prototype.setSideBarDef = function () {
        var _this = this;
        var sideBar = this.gridOptionsWrapper.getSideBar();
        var sideBarExists = !!sideBar && !!sideBar.toolPanels;
        if (sideBarExists) {
            var toolPanelDefs = sideBar.toolPanels;
            this.sideBarButtonsComp.setToolPanelDefs(toolPanelDefs);
            this.setupToolPanels(toolPanelDefs);
            if (!sideBar.hiddenByDefault) {
                this.openToolPanel(sideBar.defaultToolPanel);
            }
        }
        var sideBarVisible = sideBarExists && !sideBar.hiddenByDefault;
        setTimeout(function () { return _this.setDisplayed(sideBarVisible); }, 0);
    };
    SideBarComp.prototype.setupToolPanels = function (defs) {
        var _this = this;
        defs.forEach(function (def) {
            if (def.id == null) {
                console.warn("ag-grid: please review all your toolPanel components, it seems like at least one of them doesn't have an id");
                return;
            }
            var wrapper = new toolPanelWrapper_1.ToolPanelWrapper();
            _this.getContext().wireBean(wrapper);
            wrapper.setToolPanelDef(def);
            wrapper.setDisplayed(false);
            _this.getGui().appendChild(wrapper.getGui());
            _this.toolPanelWrappers.push(wrapper);
        });
    };
    SideBarComp.prototype.refresh = function () {
        this.toolPanelWrappers.forEach(function (wrapper) { return wrapper.refresh(); });
    };
    SideBarComp.prototype.openToolPanel = function (key) {
        var currentlyOpenedKey = this.openedItem();
        if (currentlyOpenedKey === key) {
            return;
        }
        this.toolPanelWrappers.forEach(function (wrapper) {
            var show = key === wrapper.getToolPanelId();
            wrapper.setDisplayed(show);
        });
        var newlyOpenedKey = this.openedItem();
        var openToolPanelChanged = currentlyOpenedKey !== newlyOpenedKey;
        if (openToolPanelChanged) {
            this.sideBarButtonsComp.setActiveButton(key);
            this.raiseToolPanelVisibleEvent(key);
        }
    };
    SideBarComp.prototype.raiseToolPanelVisibleEvent = function (key) {
        var event = {
            type: ag_grid_community_1.Events.EVENT_TOOL_PANEL_VISIBLE_CHANGED,
            source: key,
            api: this.gridOptionsWrapper.getApi(),
            columnApi: this.gridOptionsWrapper.getColumnApi()
        };
        this.eventService.dispatchEvent(event);
    };
    SideBarComp.prototype.close = function () {
        this.openToolPanel(undefined);
    };
    SideBarComp.prototype.isToolPanelShowing = function () {
        return !!this.openedItem();
    };
    SideBarComp.prototype.openedItem = function () {
        var activeToolPanel = null;
        this.toolPanelWrappers.forEach(function (wrapper) {
            if (wrapper.isDisplayed()) {
                activeToolPanel = wrapper.getToolPanelId();
            }
        });
        return activeToolPanel;
    };
    // get called after user sets new sideBarDef via the API
    SideBarComp.prototype.reset = function () {
        this.clearDownUi();
        this.setSideBarDef();
    };
    SideBarComp.prototype.destroyToolPanelWrappers = function () {
        this.toolPanelWrappers.forEach(function (wrapper) {
            ag_grid_community_1._.removeFromParent(wrapper.getGui());
            wrapper.destroy();
        });
        this.toolPanelWrappers.length = 0;
    };
    SideBarComp.prototype.destroy = function () {
        this.destroyToolPanelWrappers();
        _super.prototype.destroy.call(this);
    };
    SideBarComp.TEMPLATE = "<div class=\"ag-side-bar ag-unselectable\">\n              <ag-side-bar-buttons ref=\"sideBarButtons\">\n          </div>";
    __decorate([
        ag_grid_community_1.Autowired("eventService"),
        __metadata("design:type", ag_grid_community_1.EventService)
    ], SideBarComp.prototype, "eventService", void 0);
    __decorate([
        ag_grid_community_1.Autowired("gridOptionsWrapper"),
        __metadata("design:type", ag_grid_community_1.GridOptionsWrapper)
    ], SideBarComp.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        ag_grid_community_1.RefSelector('sideBarButtons'),
        __metadata("design:type", sideBarButtonsComp_1.SideBarButtonsComp)
    ], SideBarComp.prototype, "sideBarButtonsComp", void 0);
    __decorate([
        ag_grid_community_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], SideBarComp.prototype, "postConstruct", null);
    return SideBarComp;
}(ag_grid_community_1.Component));
exports.SideBarComp = SideBarComp;
