// ag-grid-enterprise v19.1.3
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
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
        _this.panelComps = {};
        return _this;
    }
    // this was deprecated in v19, we can drop in v20
    SideBarComp.prototype.getPreferredWidth = function () {
        return this.getGui().clientWidth;
    };
    SideBarComp.prototype.registerGridComp = function (gridPanel) {
        this.sideBarButtonsComp.registerGridComp(gridPanel);
    };
    SideBarComp.prototype.postConstruct = function () {
        var _this = this;
        this.instantiate(this.context);
        var sideBar = this.gridOptionsWrapper.getSideBar();
        if (sideBar == null) {
            this.getGui().removeChild(this.sideBarButtonsComp.getGui());
            return;
        }
        var allPromises = [];
        if (sideBar.toolPanels) {
            sideBar.toolPanels.forEach(function (toolPanel) {
                if (toolPanel.id == null) {
                    console.warn("ag-grid: please review all your toolPanel components, it seems like at least one of them doesn't have an id");
                    return;
                }
                var componentPromise = _this.componentResolver.createAgGridComponent(toolPanel, toolPanel.toolPanelParams, 'toolPanel', null);
                if (componentPromise == null) {
                    console.warn("ag-grid: error processing tool panel component " + toolPanel.id + ". You need to specify either 'toolPanel' or 'toolPanelFramework'");
                    return;
                }
                allPromises.push(componentPromise);
                componentPromise.then(function (component) {
                    var wrapper = _this.componentResolver.createInternalAgGridComponent(toolPanelWrapper_1.ToolPanelWrapper, {
                        innerComp: component
                    });
                    _this.panelComps[toolPanel.id] = wrapper;
                });
            });
        }
        ag_grid_community_1.Promise.all(allPromises).then(function (done) {
            Object.keys(_this.panelComps).forEach(function (key) {
                var currentComp = _this.panelComps[key];
                _this.getGui().appendChild(currentComp.getGui());
                _this.sideBarButtonsComp.registerPanelComp(key, currentComp);
                currentComp.setVisible(false);
            });
            if (ag_grid_community_1._.exists(_this.sideBarButtonsComp.defaultPanelKey) && _this.sideBarButtonsComp.defaultPanelKey) {
                _this.sideBarButtonsComp.setPanelVisibility(_this.sideBarButtonsComp.defaultPanelKey, true);
            }
        });
    };
    SideBarComp.prototype.refresh = function () {
        var _this = this;
        Object.keys(this.panelComps).forEach(function (key) {
            var currentComp = _this.panelComps[key];
            currentComp.refresh();
        });
    };
    SideBarComp.prototype.setVisible = function (show) {
        if (ag_grid_community_1._.get(this.gridOptionsWrapper.getSideBar(), 'toolPanels', []).length === 0)
            return;
        _super.prototype.setVisible.call(this, show);
        if (show) {
            var keyOfTabToShow = this.getActiveToolPanelItem();
            if (!keyOfTabToShow)
                return;
            keyOfTabToShow = keyOfTabToShow ? keyOfTabToShow : ag_grid_community_1._.get(this.gridOptionsWrapper.getSideBar(), 'defaultToolPanel', null);
            keyOfTabToShow = keyOfTabToShow ? keyOfTabToShow : this.gridOptionsWrapper.getSideBar().defaultToolPanel;
            var tabToShow = keyOfTabToShow ? this.panelComps[keyOfTabToShow] : null;
            if (!tabToShow) {
                console.warn("ag-grid: can't set the visibility of the tool panel item [" + keyOfTabToShow + "] since it can't be found");
                return;
            }
            tabToShow.setVisible(true);
        }
    };
    SideBarComp.prototype.openToolPanel = function (key) {
        var currentlyOpenedKey = this.getActiveToolPanelItem();
        if (currentlyOpenedKey === key)
            return;
        var tabToShow = this.panelComps[key];
        if (!tabToShow) {
            console.warn("ag-grid: invalid tab key [" + key + "] to open for the tool panel");
            return;
        }
        if (currentlyOpenedKey != null) {
            this.sideBarButtonsComp.setPanelVisibility(currentlyOpenedKey, false);
        }
        this.sideBarButtonsComp.setPanelVisibility(key, true);
    };
    SideBarComp.prototype.close = function () {
        var currentlyOpenedKey = this.getActiveToolPanelItem();
        if (!currentlyOpenedKey)
            return;
        this.sideBarButtonsComp.setPanelVisibility(currentlyOpenedKey, false);
    };
    SideBarComp.prototype.isToolPanelShowing = function () {
        return this.getActiveToolPanelItem() != null;
    };
    SideBarComp.prototype.getActiveToolPanelItem = function () {
        var _this = this;
        var activeToolPanel = null;
        Object.keys(this.panelComps).forEach(function (key) {
            var currentComp = _this.panelComps[key];
            if (currentComp.isVisible()) {
                activeToolPanel = key;
            }
        });
        return activeToolPanel;
    };
    SideBarComp.prototype.openedItem = function () {
        return this.getActiveToolPanelItem();
    };
    SideBarComp.prototype.reset = function () {
        this.sideBarButtonsComp.clear();
        this.panelComps = {};
        this.setTemplate(SideBarComp.TEMPLATE);
        this.postConstruct();
    };
    SideBarComp.TEMPLATE = "<div class=\"ag-side-bar\">\n              <ag-side-bar-buttons ref=\"sideBarButtons\">\n          </div>";
    __decorate([
        ag_grid_community_1.Autowired("context"),
        __metadata("design:type", ag_grid_community_1.Context)
    ], SideBarComp.prototype, "context", void 0);
    __decorate([
        ag_grid_community_1.Autowired("eventService"),
        __metadata("design:type", ag_grid_community_1.EventService)
    ], SideBarComp.prototype, "eventService", void 0);
    __decorate([
        ag_grid_community_1.Autowired("gridOptionsWrapper"),
        __metadata("design:type", ag_grid_community_1.GridOptionsWrapper)
    ], SideBarComp.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        ag_grid_community_1.Autowired("componentResolver"),
        __metadata("design:type", ag_grid_community_1.ComponentResolver)
    ], SideBarComp.prototype, "componentResolver", void 0);
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
