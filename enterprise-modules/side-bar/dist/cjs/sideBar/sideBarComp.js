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
        // initially hide side bar
        this.setDisplayed(false);
        var sideBar = this.gridOptionsWrapper.getSideBar();
        var sideBarExists = !!sideBar && !!sideBar.toolPanels;
        if (sideBarExists) {
            var shouldDisplaySideBar = sideBarExists && !sideBar.hiddenByDefault;
            this.setDisplayed(shouldDisplaySideBar);
            var toolPanelDefs = sideBar.toolPanels;
            this.sideBarButtonsComp.setToolPanelDefs(toolPanelDefs);
            this.setupToolPanels(toolPanelDefs);
            this.setSideBarPosition(sideBar.position);
            if (!sideBar.hiddenByDefault) {
                this.openToolPanel(sideBar.defaultToolPanel);
            }
        }
    };
    SideBarComp.prototype.setSideBarPosition = function (position) {
        if (!position) {
            position = 'right';
        }
        var isLeft = position === 'left';
        var resizerSide = isLeft ? 'right' : 'left';
        var eGui = this.getGui();
        core_1._.addOrRemoveCssClass(eGui, 'ag-side-bar-left', isLeft);
        core_1._.addOrRemoveCssClass(eGui, 'ag-side-bar-right', !isLeft);
        this.toolPanelWrappers.forEach(function (wrapper) {
            wrapper.setResizerSizerSide(resizerSide);
        });
        return this;
    };
    SideBarComp.prototype.setupToolPanels = function (defs) {
        var _this = this;
        defs.forEach(function (def) {
            if (def.id == null) {
                console.warn("ag-grid: please review all your toolPanel components, it seems like at least one of them doesn't have an id");
                return;
            }
            // helpers, in case user doesn't have the right module loaded
            if (def.toolPanel === 'agColumnsToolPanel') {
                var moduleMissing = !core_1.ModuleRegistry.assertRegistered(core_1.ModuleNames.ColumnToolPanelModule, 'Column Tool Panel');
                if (moduleMissing) {
                    return;
                }
            }
            if (def.toolPanel === 'agFiltersToolPanel') {
                var moduleMissing = !core_1.ModuleRegistry.assertRegistered(core_1.ModuleNames.FiltersToolPanelModule, 'Filters Tool Panel');
                if (moduleMissing) {
                    return;
                }
            }
            var wrapper = new toolPanelWrapper_1.ToolPanelWrapper();
            _this.getContext().createBean(wrapper);
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
    SideBarComp.prototype.getToolPanelInstance = function (key) {
        var toolPanelWrapper = this.toolPanelWrappers.filter(function (toolPanel) { return toolPanel.getToolPanelId() === key; })[0];
        if (!toolPanelWrapper) {
            console.warn("ag-grid: unable to lookup Tool Panel as invalid key supplied: " + key);
            return;
        }
        return toolPanelWrapper.getToolPanelInstance();
    };
    SideBarComp.prototype.raiseToolPanelVisibleEvent = function (key) {
        var event = {
            type: core_1.Events.EVENT_TOOL_PANEL_VISIBLE_CHANGED,
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
        var _this = this;
        this.toolPanelWrappers.forEach(function (wrapper) {
            core_1._.removeFromParent(wrapper.getGui());
            _this.destroyBean(wrapper);
        });
        this.toolPanelWrappers.length = 0;
    };
    SideBarComp.prototype.destroy = function () {
        this.destroyToolPanelWrappers();
        _super.prototype.destroy.call(this);
    };
    SideBarComp.TEMPLATE = "<div class=\"ag-side-bar ag-unselectable\">\n            <ag-side-bar-buttons ref=\"sideBarButtons\"></ag-side-bar-buttons>\n        </div>";
    __decorate([
        core_1.Autowired("gridOptionsWrapper")
    ], SideBarComp.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        core_1.RefSelector('sideBarButtons')
    ], SideBarComp.prototype, "sideBarButtonsComp", void 0);
    __decorate([
        core_1.PostConstruct
    ], SideBarComp.prototype, "postConstruct", null);
    return SideBarComp;
}(core_1.Component));
exports.SideBarComp = SideBarComp;
//# sourceMappingURL=sideBarComp.js.map